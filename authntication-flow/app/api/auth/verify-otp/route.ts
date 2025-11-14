import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { z } from 'zod';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { generateToken } from '@/lib/api/jwt';
import { ZodError } from 'zod';

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = verifyOtpSchema.parse(body);

    // Find user by email with OTP fields
    const user = await User.findOne({ email: validatedData.email }).select('+otpCode +otpExpiry');

    if (!user) {
      return errorResponse('Invalid email or OTP', 401);
    }

    console.log('User found:', user.email);
    console.log('OTP Code stored:', user.otpCode);
    console.log('OTP Expiry stored:', user.otpExpiry);

    // Check if OTP exists and is not expired
    if (!user.otpCode || !user.otpExpiry) {
      console.log('OTP missing - Code:', !!user.otpCode, 'Expiry:', !!user.otpExpiry);
      return errorResponse('OTP has expired. Please request a new one.', 400);
    }

    // Convert both to timestamps for accurate comparison
    const currentTime = Date.now();
    const otpExpiryTime = new Date(user.otpExpiry).getTime();
    
    console.log('Current time (ms):', currentTime);
    console.log('OTP expiry time (ms):', otpExpiryTime);
    console.log('Time difference (seconds):', (otpExpiryTime - currentTime) / 1000);
    console.log('OTP is valid:', currentTime <= otpExpiryTime);
    
    if (currentTime > otpExpiryTime) {
      // Clear expired OTP
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      await user.save();

      console.log('OTP expired - cleared from database');
      return errorResponse('OTP has expired. Please request a new one.', 400);
    }

    // Verify OTP
    if (user.otpCode !== validatedData.otp) {
      return errorResponse('Invalid OTP. Please try again.', 401);
    }

    // Clear OTP after successful verification
    user.otpCode = undefined;
    user.otpExpiry = undefined;

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    user.accessToken = token;
    await user.save();


    // Return success response
    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          accessToken: token,
        },
        token,
      },
      'OTP verified successfully. Logged in!'
    );
  } catch (error) {
    console.error('Verify OTP error:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      return validationErrorResponse(errors);
    }

    // Handle other errors
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
}
