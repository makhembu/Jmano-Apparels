
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  disabled, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // Updated rounded-lg to rounded-2xl for consistency
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border text-sm font-black uppercase tracking-widest rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform active:scale-95";
  
  const variants = {
    primary: "border-transparent text-white bg-brand-green hover:bg-brand-dark focus:ring-brand-green shadow-lg shadow-brand-green/20",
    secondary: "border-transparent text-brand-dark bg-brand-hope hover:bg-yellow-400 focus:ring-brand-hope shadow-lg shadow-brand-hope/20",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-600/20",
    outline: "border-2 border-slate-200 text-slate-700 bg-white hover:border-brand-green hover:text-brand-green focus:ring-brand-green"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${(disabled || isLoading) ? 'opacity-60 cursor-not-allowed transform-none shadow-none' : ''} 
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
