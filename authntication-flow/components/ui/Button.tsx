import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled = false,
}) => {
  const baseStyles =
    'py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-teal-800 hover:bg-teal-900 text-white focus:ring-teal-600',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-500',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-800 focus:ring-slate-400',
  };

  const widthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
};
