import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { verifyAuth } from '@/lib/api/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/responses';

/**
 * GET /api/user/profile
 * Protected route - requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.isValid || !auth.userId) {
      return auth.error;
    }

    // Connect to database
    await connectToDatabase();

    // Find user by ID
    const user = await User.findById(auth.userId);

    if (!user) {
      return notFoundResponse('User not found');
    }

    // Return user profile
    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      'Profile retrieved successfully'
    );
  } catch (error) {
    console.error('Get profile error:', error);

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
}

/**
 * PUT /api/user/profile
 * Protected route - requires authentication
 * Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.isValid || !auth.userId) {
      return auth.error;
    }

    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();

    // Update only allowed fields
    const updateData: any = {};
    if (body.name) {
      if (body.name.length < 2) {
        return errorResponse('Name must be at least 2 characters long', 400);
      }
      if (body.name.length > 50) {
        return errorResponse('Name must not exceed 50 characters', 400);
      }
      updateData.name = body.name;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      auth.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return notFoundResponse('User not found');
    }

    // Return updated user profile
    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      'Profile updated successfully'
    );
  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
}
