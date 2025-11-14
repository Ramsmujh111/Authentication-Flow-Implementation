import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/responses';
import { generateToken } from '@/lib/api/jwt';
import { sendWelcomeEmail } from '@/lib/services/email';
import { isTokenExpired } from '@/lib/utils/token';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return errorResponse('Verification token is required', 400);
    }

    // Find user with the verification token
    const user = await User.findOne({
      verificationToken: token,
    }).select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      return errorResponse('Invalid verification token', 400);
    }

    // Check if token has expired
    if (isTokenExpired(user.verificationTokenExpiry)) {
      return errorResponse(
        'Verification token has expired. Please request a new one.',
        400
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return errorResponse('Email already verified. Please login.', 400);
    }

    // Mark email as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Generate JWT token for automatic login
    const jwtToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return success response
    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
        token: jwtToken,
      },
      'Email verified successfully. You are now logged in.'
    );
  } catch (error) {
    console.error('Email verification error:', error);

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    return errorResponse('Internal server error', 500);
  }
}

/**
 * GET endpoint to verify email via link click
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get token from query parameters
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Verification token is required', 400);
    }

    // Find user with the verification token
    const user = await User.findOne({
      verificationToken: token,
    }).select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      return errorResponse('Invalid verification token', 400);
    }

    // Check if token has expired
    if (isTokenExpired(user.verificationTokenExpiry)) {
      return errorResponse(
        'Verification token has expired. Please request a new one.',
        400
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return new Response(
        `<html><body><h1>Already Verified</h1><p>Your email is already verified. <a href="/login">Login here</a></p></body></html>`,
        { status: 200, headers: { 'content-type': 'text/html' } }
      );
    }

    // Mark email as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Generate JWT token for automatic login
    const jwtToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return HTML with token and redirect
    const redirectUrl = `/verify-email?token=${jwtToken}&verified=true&email=${encodeURIComponent(
      user.email
    )}`;

    return new Response(
      `
      <html>
      <head>
        <title>Email Verified</title>
        <script>
          window.location.href = '${redirectUrl}';
        </script>
      </head>
      <body>
        <p>Email verified! Redirecting...</p>
      </body>
      </html>
      `,
      { status: 200, headers: { 'content-type': 'text/html' } }
    );
  } catch (error) {
    console.error('Email verification error:', error);

    return new Response(
      `<html><body><h1>Error</h1><p>An error occurred during verification.</p></body></html>`,
      { status: 500, headers: { 'content-type': 'text/html' } }
    );
  }
}
