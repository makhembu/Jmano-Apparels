
import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  disabled, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  className = '', 
  icon,
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";
  
  const variants = {
    primary: "border border-transparent text-white bg-brand-green hover:bg-brand-dark focus:ring-brand-green shadow-lg shadow-brand-green/20",
    secondary: "border border-transparent text-brand-dark bg-brand-hope hover:bg-yellow-400 focus:ring-brand-hope shadow-lg shadow-brand-hope/20",
    danger: "border border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-600/20",
    outline: "border-2 border-slate-200 text-slate-700 bg-white hover:border-brand-green hover:text-brand-green focus:ring-brand-green",
    ghost: "text-slate-500 hover:text-brand-green hover:bg-slate-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
