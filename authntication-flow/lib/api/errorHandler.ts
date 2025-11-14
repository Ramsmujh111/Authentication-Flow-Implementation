import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { validationErrorResponse, errorResponse, serverErrorResponse } from './responses';

/**
 * Async handler wrapper to catch errors in API routes
 */
export async function asyncHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Central error handler
 */
export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors: Record<string, string> = {};
    error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      errors[path] = issue.message;
    });
    return validationErrorResponse(errors, 'Validation failed');
  }

  // Handle MongoDB duplicate key error
  if (error instanceof Error && 'code' in error && error.code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    return errorResponse(
      `${field} already exists`,
      400
    );
  }

  // Handle MongoDB validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    const errors: Record<string, string> = {};
    const mongoErrors = (error as any).errors;
    Object.keys(mongoErrors).forEach((key) => {
      errors[key] = mongoErrors[key].message;
    });
    return validationErrorResponse(errors, 'Validation failed');
  }

  // Handle MongoDB cast errors
  if (error instanceof Error && error.name === 'CastError') {
    return errorResponse('Invalid ID format', 400);
  }

  // Handle generic errors
  if (error instanceof Error) {
    return errorResponse(error.message, 400);
  }

  // Fallback for unknown errors
  return serverErrorResponse();
}

/**
 * Wrapper for API route handlers with error handling and database connection
 */
export async function withDatabaseConnection(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const connectToDatabase = (await import('../db/mongodb').then(m => m.default)) as any;
    await connectToDatabase();
    return await asyncHandler(handler);
  } catch (error) {
    console.error('Database connection error:', error);
    return serverErrorResponse('Database connection failed');
  }
}
