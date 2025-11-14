# API Best Practices Setup Guide

This document outlines the best practices implemented in this authentication flow application with Next.js, MongoDB, and Mongoose.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Database Connection](#database-connection)
3. [Models & Schemas](#models--schemas)
4. [API Routes](#api-routes)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)
7. [Validation](#validation)
8. [Environment Configuration](#environment-configuration)

## Project Structure

```
app/
├── api/
│   └── auth/
│       ├── login/
│       │   └── route.ts
│       ├── signup/
│       │   └── route.ts
│       └── logout/
│           └── route.ts
├── page.tsx
└── layout.tsx

lib/
├── api/
│   ├── errorHandler.ts       # Error handling utilities
│   ├── jwt.ts               # JWT token utilities
│   ├── responses.ts         # API response formatters
│   └── jwt.ts               # JWT utilities
├── db/
│   └── mongodb.ts           # MongoDB connection
├── models/
│   └── User.ts              # User model with Mongoose
└── schemas/
    └── validationSchemas.ts # Zod validation schemas
```

## Database Connection

### Features Implemented:
- ✅ Connection pooling (5-10 connections)
- ✅ Connection caching in development
- ✅ Automatic reconnection on failure
- ✅ Proper error handling
- ✅ Global type-safe connection management

### Usage:

```typescript
import connectToDatabase from '@/lib/db/mongodb';

export async function POST(request: NextRequest) {
  await connectToDatabase();
  // Your route handler code
}
```

### Configuration:
Set `MONGODB_URI` in `.env.local`:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
```

## Models & Schemas

### User Model Features:
- Email validation and uniquification
- Automatic password hashing with bcryptjs
- Timestamps (createdAt, updatedAt)
- Type-safe Mongoose schema
- Password comparison methods
- Automatic password exclusion in JSON responses

### Usage:

```typescript
import { User } from '@/lib/models/User';

// Create new user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securePassword123!',
});

// Find user
const user = await User.findOne({ email: 'john@example.com' });

// Verify password
const isValid = await user.isPasswordCorrect('password');
```

## API Routes

### Route Structure Best Practices:

1. **Separate Concerns**: Each route handles a single responsibility
2. **Input Validation**: All inputs validated with Zod before processing
3. **Database Connection**: Connected before any database operation
4. **Error Handling**: Centralized error handling with proper HTTP status codes
5. **Response Format**: Consistent response format for all endpoints

### Signup Route (`/api/auth/signup`)

```typescript
POST /api/auth/signup

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "agreeToTerms": true
}

Success Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login Route (`/api/auth/login`)

```typescript
POST /api/auth/login

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}

Success Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

Error Response (401):
{
  "success": false,
  "message": "Invalid email or password",
  "error": "Invalid email or password"
}
```

## Error Handling

### Error Response Format:

```typescript
// Validation Error (422)
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email address",
    "password": "Password must be at least 8 characters"
  }
}

// Unauthorized (401)
{
  "success": false,
  "message": "Unauthorized",
  "error": "Unauthorized"
}

// Server Error (500)
{
  "success": false,
  "message": "Internal server error",
  "error": "Internal server error"
}
```

### Error Types Handled:
- ✅ Zod validation errors
- ✅ MongoDB duplicate key errors
- ✅ MongoDB validation errors
- ✅ MongoDB cast errors
- ✅ Generic application errors
- ✅ Unhandled server errors

## Authentication

### JWT Implementation:

- **Token Generation**: Automatic on successful login/signup
- **Token Verification**: Built-in verification utilities
- **Token Expiration**: Configurable expiration time (default: 7 days)
- **Secure Storage**: Should be stored in httpOnly cookies or secure storage

### JWT Configuration:

```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE_IN=7d
```

### Usage:

```typescript
import { generateToken, verifyToken } from '@/lib/api/jwt';

// Generate token
const token = generateToken({
  userId: user._id.toString(),
  email: user.email,
});

// Verify token
const payload = verifyToken(token);
if (payload) {
  console.log('Token is valid', payload);
}
```

## Validation

### Zod Schemas:

All API inputs are validated using Zod schemas defined in `lib/schemas/validationSchemas.ts`:

- ✅ Email validation
- ✅ Password strength requirements
- ✅ Password confirmation matching
- ✅ Terms agreement validation
- ✅ Custom field validation

### Password Requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Usage:

```typescript
import { loginFormSchema } from '@/lib/schemas/validationSchemas';

const validatedData = loginFormSchema.parse(body);
```

## Environment Configuration

### Required Environment Variables:

```env
# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret
JWT_EXPIRE_IN=7d

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### Setup Steps:

1. Copy `.env.example` to `.env.local`
2. Update values with your configuration
3. Never commit `.env.local` to version control
4. Use `.env.example` as a template for required variables

## Security Best Practices

✅ Password hashing with bcryptjs (10 salt rounds)
✅ JWT-based authentication
✅ Environment variable protection
✅ Duplicate email prevention
✅ Type-safe TypeScript implementation
✅ Centralized error handling
✅ Input validation with Zod
✅ Secure password exclusion from responses
✅ Connection pooling for database efficiency
✅ Proper HTTP status codes

## Performance Best Practices

✅ Connection pooling (5-10 connections)
✅ Connection caching in development
✅ Indexed email field in User model
✅ Lazy password selection in queries
✅ Efficient error handling
✅ Response optimization

## Next Steps

1. **Create Forgot Password Route**: `/api/auth/forgot-password`
2. **Create Change Password Route**: `/api/auth/change-password`
3. **Create Profile Routes**: `/api/user/profile`
4. **Add Authentication Middleware**: Route protection
5. **Add Rate Limiting**: Prevent brute force attacks
6. **Add Email Verification**: Account confirmation
7. **Add Refresh Token Logic**: Token renewal
8. **Add CORS Configuration**: Cross-origin requests
