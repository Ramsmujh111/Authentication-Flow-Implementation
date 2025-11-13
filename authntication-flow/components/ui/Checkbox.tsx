
import React from 'react';

interface CheckboxProps {
  label?: string;
  name?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name = '',
  checked = false,
  onChange,
  className = '',
}) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-teal-600 rounded cursor-pointer focus:ring-2 focus:ring-teal-600"
      />
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
};
