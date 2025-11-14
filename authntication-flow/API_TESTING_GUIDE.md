# API Testing & Integration Guide

This guide provides examples of how to use the authentication API with various tools and frameworks.

## Table of Contents
1. [cURL Examples](#curl-examples)
2. [JavaScript Fetch](#javascript-fetch)
3. [Axios](#axios)
4. [Postman](#postman)
5. [React Integration](#react-integration)

## cURL Examples

### Signup Request

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "agreeToTerms": true
  }'
```

### Login Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "rememberMe": false
  }'
```

### Get User Profile (Protected)

```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User Profile

```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Jane Doe"
  }'
```

## JavaScript Fetch

### Signup

```javascript
async function signup(data) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error:', result.errors || result.error);
      return null;
    }

    // Store token
    localStorage.setItem('authToken', result.data.token);
    return result.data.user;
  } catch (error) {
    console.error('Signup failed:', error);
  }
}

// Usage
signup({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  agreeToTerms: true,
});
```

### Login

```javascript
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        rememberMe: false,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error:', result.error);
      return null;
    }

    // Store token in localStorage or httpOnly cookie
    localStorage.setItem('authToken', result.data.token);
    return result.data.user;
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Usage
login('john@example.com', 'SecurePass123!');
```

### Get Profile

```javascript
async function getProfile() {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch('/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error:', result.error);
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return null;
    }

    return result.data.user;
  } catch (error) {
    console.error('Get profile failed:', error);
  }
}
```

## Axios

### Setup Axios with Token

```javascript
import axios from 'axios';

// Create Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Signup

```javascript
import apiClient from './apiClient';

async function signup(data) {
  try {
    const response = await apiClient.post('/api/auth/signup', data);
    localStorage.setItem('authToken', response.data.data.token);
    return response.data.data.user;
  } catch (error) {
    console.error('Signup error:', error.response?.data);
    throw error;
  }
}
```

### Login

```javascript
async function login(email, password) {
  try {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
      rememberMe: false,
    });
    localStorage.setItem('authToken', response.data.data.token);
    return response.data.data.user;
  } catch (error) {
    console.error('Login error:', error.response?.data);
    throw error;
  }
}
```

### Get Profile

```javascript
async function getProfile() {
  try {
    const response = await apiClient.get('/api/user/profile');
    return response.data.data.user;
  } catch (error) {
    console.error('Get profile error:', error.response?.data);
    throw error;
  }
}
```

## Postman

### Setup Postman Collection

1. **Create a new collection**: "Authentication Flow"

2. **Set up environment variables**:
   - `base_url`: `http://localhost:3000`
   - `token`: (leave empty, will be set by scripts)

3. **Create requests**:

#### Signup Request
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/signup`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "agreeToTerms": true
}
```
- **Tests** (save token):
```javascript
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("token", response.data.token);
}
```

#### Login Request
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```
- **Tests** (save token):
```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("token", response.data.token);
}
```

#### Get Profile Request
- **Method**: GET
- **URL**: `{{base_url}}/api/user/profile`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

## React Integration

### Create API Service

```typescript
// lib/api/client.ts
import { successResponse, errorResponse } from './responses';

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authApi = {
  async signup(data: SignupData) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async login(data: LoginData) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getProfile() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
```

### Create Auth Hook

```typescript
// hooks/useAuth.ts
import { useState, useCallback } from 'react';
import { authApi } from '@/lib/api/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Record<string, string> | null>(null);

  const signup = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.signup(data);
      if (result.success) {
        setUser(result.data.user);
        localStorage.setItem('authToken', result.data.token);
        return result.data.user;
      } else {
        setError(result.errors || { form: result.message });
        return null;
      }
    } catch (err) {
      setError({ form: 'An error occurred' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login({ email, password });
      if (result.success) {
        setUser(result.data.user);
        localStorage.setItem('authToken', result.data.token);
        return result.data.user;
      } else {
        setError(result.errors || { form: result.message });
        return null;
      }
    } catch (err) {
      setError({ form: 'An error occurred' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authToken');
  }, []);

  return { user, loading, error, signup, login, logout };
}
```

### Use in Component

```typescript
// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error?.form && <p style={{ color: 'red' }}>{error.form}</p>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Error Handling Examples

### Handle Validation Errors

```javascript
async function handleSignup(data) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Display validation errors
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, message]) => {
          console.log(`${field}: ${message}`);
        });
      } else {
        console.error(result.message);
      }
      return;
    }

    console.log('Signup successful:', result.data);
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

## Security Best Practices

✅ Store tokens in localStorage or httpOnly cookies
✅ Include token in Authorization header
✅ Handle 401 responses (expired token)
✅ Validate all inputs on both client and server
✅ Use HTTPS in production
✅ Implement token refresh logic
✅ Clear tokens on logout
✅ Handle network errors gracefully

## Troubleshooting

### Database Connection Errors
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`
- Verify network connectivity to MongoDB

### Authentication Errors
- Verify JWT_SECRET is set in `.env.local`
- Check token expiration
- Ensure token is included in Authorization header

### Validation Errors
- Check email format
- Ensure password meets requirements
- Verify all required fields are provided

### CORS Errors
- Configure CORS in API routes if needed
- Ensure requests are sent with correct headers
