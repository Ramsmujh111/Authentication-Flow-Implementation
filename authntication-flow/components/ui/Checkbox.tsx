import React from 'react';

interface CheckboxProps {
  label?: string;
  name?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name = '',
  checked = false,
  onChange,
  className = '',
  error,
}) => {
  return (
    <div>
      <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className={`h-4 w-4 rounded cursor-pointer focus:ring-2 
            ${error ? 'bg-red-50 border-red-500 text-red-600 focus:ring-red-600' : 'text-teal-600 focus:ring-teal-600'}`}
        />
        {label && <span className="text-sm text-slate-700">{label}</span>}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
