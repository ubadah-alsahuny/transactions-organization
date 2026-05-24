import React, { forwardRef } from 'react';

type SelectOption = { value: string; label: string; disabled?: boolean };

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-[var(--color-text)]">
          {label}
        </label>
        <select
          ref={ref}
          className={[
            'w-full rounded-2xl border px-4 py-2 transition-colors focus:outline-none focus:ring-2 bg-[var(--color-primary)] text-[var(--color-text)]',
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
              : 'border-[var(--color-outine)] focus:ring-[var(--color-action)]',
          ].join(' ')}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
