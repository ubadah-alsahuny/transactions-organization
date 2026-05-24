import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading, disabled, ...props }) => {
  return (
    <button
      disabled={isLoading || disabled}
      className="w-full flex justify-center items-center rounded-2xl bg-[var(--color-action)] px-5 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      {...props}
    >
      {isLoading ? <span className="flex items-center gap-2"><LoadingSpinner /> جارٍ التحميل...</span> : children}
    </button>
  );
};
