'use client'
import React from 'react';

interface AuthFooterProps {
  message?: string;
  linkText?: string;
  linkHref?: string;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  message = "Don't have an account?",
  linkText = 'Sign Up',
  linkHref = '/signup',
}) => {
  return (
    <p className="text-center mt-6 text-sm text-slate-600">
      {message}{' '}
      <a href={linkHref} className="text-teal-700 font-medium hover:text-teal-800">
        {linkText}
      </a>
    </p>
  );
};
