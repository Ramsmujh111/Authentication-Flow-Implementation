'use client';

import React from 'react';
import { MdInventory2 } from 'react-icons/md';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = 'Welcome Back!',
  subtitle = 'Please enter log in details below',
}) => {
  return (
    <div>
      <div className="mb-10 flex items-center gap-3">
        <div className="p-2 bg-teal-100 rounded-lg">
          <MdInventory2 size={32} className="text-teal-800" />
        </div>
        <span className="text-2xl font-bold text-slate-800">DAILY</span>
      </div>

      <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
      <p className="text-slate-500 mt-2 mb-8">{subtitle}</p>
    </div>
  );
};
