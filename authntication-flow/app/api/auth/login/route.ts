import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { loginFormSchema } from '@/lib/schemas/validationSchemas';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/api/responses';
import { generateToken } from '@/lib/api/jwt';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validatedData = loginFormSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email }).select('+password');

    if (!user) {
      return unauthorizedResponse('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isVerified) {
      return errorResponse(
        'Please verify your email before logging in. Check your inbox for the verification link.',
        403
      );
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(validatedData.password);
    if (!isPasswordValid) {
      return unauthorizedResponse('Invalid email or password');
    }

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
          accessToken: token,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);

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
