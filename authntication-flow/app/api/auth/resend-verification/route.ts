import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { errorResponse, successResponse } from '@/lib/api/responses';
import { sendVerificationEmail } from '@/lib/services/email';
import { generateSecureToken } from '@/lib/utils/token';

/**
 * POST /api/auth/resend-verification
 * Resend verification email if the previous one expired
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if already verified
    if (user.isVerified) {
      return errorResponse('Email already verified. Please login.', 400);
    }

    // Generate new verification token
    const { token: verificationToken, expiry: tokenExpiry } = generateSecureToken();

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = tokenExpiry;
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    if (!emailSent) {
      return errorResponse(
        'Failed to send verification email. Please try again.',
        500
      );
    }

    // Return success response
    return successResponse(
      {
        message: 'Verification email sent successfully',
        email: user.email,
      },
      'Check your email for the verification link'
    );
  } catch (error) {
    console.error('Resend verification error:', error);

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
}
