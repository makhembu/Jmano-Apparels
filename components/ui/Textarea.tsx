
import React from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "", className)}>
        {label && (
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "block w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all",
            "focus:border-brand-green focus:outline-none focus:ring-0",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            error ? "border-red-300 focus:border-red-500" : ""
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
