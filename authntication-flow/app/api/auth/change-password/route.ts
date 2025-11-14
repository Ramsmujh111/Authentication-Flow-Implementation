import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { changePasswordSchema } from '@/lib/schemas/validationSchemas';
import { errorResponse, successResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/api/responses';
import { verifyToken } from '@/lib/api/jwt';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get authorization token from headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return unauthorizedResponse('Authorization token required');
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return unauthorizedResponse('Invalid or expired token');
    }

    const userId = decoded.userId;
    if (!userId) {
      return unauthorizedResponse('Invalid token payload');
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = changePasswordSchema.parse(body);

    // Find user by ID
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(validatedData.currentPassword);
    if (!isPasswordCorrect) {
      return errorResponse('Current password is incorrect', 400);
    }

    // Update password
    user.password = validatedData.newPassword;
    await user.save();

    return successResponse(
      {
        email: user.email,
      },
      'Password has been changed successfully.'
    );
  } catch (error) {
    console.error('Change password error:', error);

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
