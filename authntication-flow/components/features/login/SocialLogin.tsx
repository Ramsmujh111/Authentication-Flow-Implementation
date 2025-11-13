'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { Button } from '@/components/ui';

export const SocialLogin: React.FC = () => {
  return (
    <>
      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-slate-300" />
        <span className="text-sm text-slate-500">Or</span>
        <div className="h-px flex-1 bg-slate-300" />
      </div>

      <div className="flex gap-4">
        <Button variant="outline" fullWidth className="flex items-center justify-center">
          <FcGoogle size={20} />
          <span className="ml-2">Google</span>
        </Button>

        <Button variant="outline" fullWidth className="flex items-center justify-center">
          <FaFacebook size={20} className="text-blue-600" />
          <span className="ml-2">Facebook</span>
        </Button>
      </div>
    </>
  );
};
