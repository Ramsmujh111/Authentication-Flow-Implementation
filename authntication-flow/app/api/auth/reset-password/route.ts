import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { z } from 'zod';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { isTokenExpired } from '@/lib/utils/token';
import { ZodError } from 'zod';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = resetPasswordSchema.parse(body);

    // Find user with reset token
    const user = await User.findOne({
      resetPasswordToken: validatedData.token,
    }).select('+resetPasswordToken +resetPasswordTokenExpiry');

    if (!user) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    // Check if token has expired
    if (!user.resetPasswordTokenExpiry || isTokenExpired(user.resetPasswordTokenExpiry)) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();

      return errorResponse(
        'Password reset link has expired. Please request a new one.',
        400
      );
    }

    // Update password
    user.password = validatedData.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    return successResponse(
      {
        email: user.email,
      },
      'Password has been reset successfully. You can now log in with your new password.'
    );
  } catch (error) {
    console.error('Reset password error:', error);

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
