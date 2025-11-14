import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { registerFormSchema } from '@/lib/schemas/validationSchemas';
import { createdResponse, errorResponse, validationErrorResponse } from '@/lib/api/responses';
import { sendVerificationEmail } from '@/lib/services/email';
import { generateSecureToken } from '@/lib/utils/token';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = registerFormSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return errorResponse('Email already registered', 400);
    }

    // Generate verification token
    const { token: verificationToken, expiry: tokenExpiry } = generateSecureToken();

    // Create new user with verification token
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
      isVerified: false,
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    if (!emailSent) {
      // If email fails, delete the user and return error
      await User.deleteOne({ _id: user._id });
      return errorResponse(
        'Failed to send verification email. Please try again.',
        500
      );
    }

    // Return success response
    return createdResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
        message: 'Verification email sent. Please check your inbox.',
      },
      'User registered successfully. Please verify your email.'
    );
  } catch (error) {
    console.error('Signup error:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      return validationErrorResponse(errors);
    }

    // Handle MongoDB duplicate key error
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return errorResponse('Email already registered', 400);
    }

    // Handle other errors
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
}
