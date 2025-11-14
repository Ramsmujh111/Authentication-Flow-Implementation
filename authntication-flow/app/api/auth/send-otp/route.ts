import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { otpFormSchema } from '@/lib/schemas/validationSchemas';
import { errorResponse, successResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/api/responses';
import { sendOtpEmail } from '@/lib/services/email';
import { ZodError } from 'zod';

/**
 * Generate a random 4-digit OTP
 */
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = otpFormSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });

    if (!user) {
      // Don't reveal if email exists for security
      return successResponse(
        { email: validatedData.email },
        'If an account exists with this email, an OTP has been sent.'
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      return errorResponse(
        'Please verify your email before logging in. Check your inbox for the verification link.',
        403
      );
    }

    // Generate 4-digit OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    console.log('Generating OTP for:', validatedData.email);
    console.log('OTP Code:', otp);
    console.log('OTP Expiry time:', otpExpiry);
    console.log('Expiry in ms:', otpExpiry.getTime());

    // Update user with OTP
    user.otpCode = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    console.log('OTP saved to database');

    // Send OTP email
    const emailSent = await sendOtpEmail(user.email, user.name, otp);

    if (!emailSent) {
      // Clear OTP if email fails
      user.otpCode = undefined;
      user.otpExpiry = undefined;
      await user.save();

      return errorResponse(
        'Failed to send OTP. Please try again.',
        500
      );
    }

    // Return success response
    return successResponse(
      { email: validatedData.email },
      'A 4-digit OTP has been sent to your email. It will expire in 10 minutes.'
    );
  } catch (error) {
    console.error('Send OTP error:', error);

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
