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
        className={`w-full px-4 py-3 rounded-lg border bg-slate-50 text-sm 
          focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all
          ${className}`}
      />
    </div>
  );
};
