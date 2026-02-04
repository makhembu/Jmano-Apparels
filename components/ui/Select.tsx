
import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, fullWidth = true, className, children, options, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "", className)}>
        {label && (
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "block w-full appearance-none rounded-xl border-2 border-slate-200 bg-white p-3 pr-10 text-sm font-medium text-slate-900 transition-all",
              "focus:border-brand-green focus:outline-none focus:ring-0",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
              error ? "border-red-300 focus:border-red-500" : ""
            )}
            {...props}
          >
            {options 
              ? options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
              : children
            }
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
