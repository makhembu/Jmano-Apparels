
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface BackButtonProps {
  to?: string;
  className?: string;
  variant?: 'default' | 'glass' | 'outline';
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  className = '', 
  variant = 'default',
  label = 'Back'
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  const baseStyles = "inline-flex items-center transition-all duration-300 group";
  
  const variants = {
    default: "text-sm font-medium text-gray-500 hover:text-brand-green",
    glass: "text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/10 px-6 py-3 rounded-full shadow-lg backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95",
    outline: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 bg-white border-2 border-slate-200 px-6 py-3 rounded-full hover:border-brand-green hover:text-brand-green active:scale-95 shadow-sm"
  };

  const iconStyles = {
    default: "w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1",
    glass: "w-4 h-4 mr-3 transition-transform group-hover:-translate-x-1",
    outline: "w-4 h-4 mr-3 transition-transform group-hover:-translate-x-1"
  };

  return (
    <button 
      onClick={handleClick} 
      className={cn(baseStyles, variants[variant], className)}
    >
      <svg 
        className={cn(iconStyles[variant])} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={variant === 'default' ? 2 : 2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label}
    </button>
  );
};
