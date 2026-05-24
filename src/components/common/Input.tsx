import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-[var(--color-text)]">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full rounded-2xl border px-4 py-2 transition-colors focus:outline-none focus:ring-2 bg-[var(--color-primary)] text-[var(--color-text)] ${
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
              : 'border-[var(--color-outine)] focus:ring-[var(--color-action)]'
          }`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
