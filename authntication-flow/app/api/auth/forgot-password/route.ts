import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { forgotPasswordSchema } from '@/lib/schemas/validationSchemas';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { sendPasswordResetEmail } from '@/lib/services/email';
import { generateSecureToken } from '@/lib/utils/token';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });

    if (!user) {
      // Don't reveal if email exists for security
      return successResponse(
        { email: validatedData.email },
        'If an account exists with this email, a password reset link has been sent.'
      );
    }

    // Generate reset token
    const { token: resetToken, expiry: tokenExpiry } = generateSecureToken();

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = tokenExpiry;
    await user.save();

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    if (!emailSent) {
      // Clear token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();

      return errorResponse(
        'Failed to send password reset email. Please try again.',
        500
      );
    }

    // Return success response
    return successResponse(
      { email: validatedData.email },
      'If an account exists with this email, a password reset link has been sent.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);

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
