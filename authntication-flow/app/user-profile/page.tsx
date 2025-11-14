'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Simple JWT decoder (doesn't verify signature, just decodes)
const decodeJWT = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    return decoded as DecodedToken;
  } catch {
    return null;
  }
};

export default function UserProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      setError('Not authenticated. Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    try {
      setToken(authToken);
      const decoded = decodeJWT(authToken);
      if (!decoded) {
        throw new Error('Invalid token format');
      }
      setDecodedToken(decoded);
    } catch (err) {
      setError('Invalid token. Please login again.');
      localStorage.removeItem('authToken');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    router.push('/login');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTokenStatus = () => {
    if (!decodedToken) return 'Unknown';
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decodedToken.exp - now;
    
    if (expiresIn < 0) return 'Expired';
    if (expiresIn < 3600) return `Expires in ${Math.floor(expiresIn / 60)} minutes`;
    if (expiresIn < 86400) return `Expires in ${Math.floor(expiresIn / 3600)} hours`;
    return `Expires in ${Math.floor(expiresIn / 86400)} days`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Error</h1>
          <p className="text-zinc-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">User Profile</h1>
              <p className="text-zinc-600 mt-1">Manage your authentication token and profile</p>
            </div>
            <Button onClick={handleLogout} variant="primary">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">User Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-2">Email</label>
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
                <p className="text-zinc-900 font-medium break-all">{decodedToken?.email}</p>
              </div>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-2">User ID</label>
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
                <p className="text-zinc-900 font-medium break-all font-mono text-sm">{decodedToken?.userId}</p>
              </div>
            </div>

            {/* Token Created */}
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-2">Token Created</label>
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
                <p className="text-zinc-900 font-medium text-sm">{decodedToken && formatDate(decodedToken.iat)}</p>
              </div>
            </div>

            {/* Token Expires */}
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-2">Token Expires</label>
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
                <p className="text-zinc-900 font-medium text-sm">{decodedToken && formatDate(decodedToken.exp)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Token Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Access Token</h2>
              <p className="text-sm text-zinc-600 mt-1">Use this token for API authentication</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              getTokenStatus().includes('Expired') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {getTokenStatus()}
            </div>
          </div>

          {/* Token Display */}
          <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 mb-4">
            <code className="text-zinc-900 text-xs break-all font-mono leading-relaxed">
              {token}
            </code>
          </div>

          {/* Copy Button */}
          <Button
            onClick={handleCopyToken}
            variant={copied ? 'primary' : 'primary'}
            fullWidth
            className={copied ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {copied ? '✓ Copied to Clipboard' : 'Copy Token'}
          </Button>
        </div>

      </div>
    </div>
  );
}
