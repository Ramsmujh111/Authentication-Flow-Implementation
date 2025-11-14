import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  name = '',
  value = '',
  onChange,
  label,
  required = false,
  className = '',
  error,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 rounded-lg border bg-slate-50 text-slate-800 text-sm 
          focus:ring-2 focus:outline-none transition-all
          ${error ? 'border-red-500 focus:ring-red-600' : 'border-slate-200 focus:ring-teal-600'}
          ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
