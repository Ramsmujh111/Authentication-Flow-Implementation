import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { unauthorizedResponse } from './responses';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  email?: string;
}

/**
 * Middleware to verify JWT token from Authorization header or cookies
 */
export async function verifyAuth(request: NextRequest): Promise<{
  isValid: boolean;
  userId?: string;
  email?: string;
  error?: NextResponse;
}> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7); // Remove 'Bearer ' prefix
    }

    // If no token in header, try to get from cookies
    if (!token) {
      token = request.cookies.get('authToken')?.value || null;
    }

    if (!token) {
      return {
        isValid: false,
        error: unauthorizedResponse('No authentication token provided'),
      };
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return {
        isValid: false,
        error: unauthorizedResponse('Invalid or expired token'),
      };
    }

    return {
      isValid: true,
      userId: payload.userId,
      email: payload.email,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      isValid: false,
      error: unauthorizedResponse('Authentication failed'),
    };
  }
}

/**
 * HOC for protecting API routes
 */
export async function withAuth(
  handler: (request: NextRequest, userId: string, email: string) => Promise<NextResponse>
): Promise<(request: NextRequest) => Promise<NextResponse>> {
  return async (request: NextRequest) => {
    const auth = await verifyAuth(request);

    if (!auth.isValid || !auth.userId || !auth.email) {
      return auth.error || unauthorizedResponse();
    }

    return handler(request, auth.userId, auth.email);
  };
}

/**
 * Extract token from request
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return request.cookies.get('authToken')?.value || null;
}
