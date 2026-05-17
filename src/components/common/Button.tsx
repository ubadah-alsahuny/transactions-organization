import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading, disabled, ...props }) => {
  return (
    <button
      disabled={isLoading || disabled}
      className="w-full flex justify-center items-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      {...props}
    >
      {isLoading ? <span className="mr-2 flex items-center gap-2"><LoadingSpinner /> Loading...</span> : children}
    </button>
  );
};
