import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Send a successful API response
 */
export function successResponse<T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * Send a successful creation response
 */
export function createdResponse<T>(
  data: T,
  message: string = 'Created successfully'
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: 201 }
  );
}

/**
 * Send an error API response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: Record<string, string>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: message,
      ...(errors && { errors }),
    },
    { status }
  );
}

/**
 * Send validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string>,
  message: string = 'Validation failed'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status: 422 }
  );
}

/**
 * Send unauthorized response
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: message,
    },
    { status: 401 }
  );
}

/**
 * Send forbidden response
 */
export function forbiddenResponse(
  message: string = 'Forbidden'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: message,
    },
    { status: 403 }
  );
}

/**
 * Send not found response
 */
export function notFoundResponse(
  message: string = 'Resource not found'
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: message,
    },
    { status: 404 }
  );
}

/**
 * Send server error response
 */
export function serverErrorResponse(
  message: string = 'Internal server error'
): NextResponse<ApiResponse> {
  console.error('Server error:', message);
  return NextResponse.json(
    {
      success: false,
      message,
      error: message,
    },
    { status: 500 }
  );
}
