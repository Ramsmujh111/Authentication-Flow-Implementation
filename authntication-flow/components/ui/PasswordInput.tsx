'use client';

import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

interface PasswordInputProps {
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder = 'Enter your password',
  name = '',
  value = '',
  onChange,
  label,
  required = false,
  className = '',
  error,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-3 pr-10 rounded-lg border bg-slate-50 text-slate-800 text-sm 
            focus:ring-2 focus:outline-none transition-all
            ${error ? 'border-red-500 focus:ring-red-600' : 'border-slate-200 focus:ring-teal-600'}
            ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {isVisible ? (
            <AiOutlineEyeInvisible size={20} />
          ) : (
            <AiOutlineEye size={20} />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
