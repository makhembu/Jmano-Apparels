
import React from 'react';

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export const Switch: React.FC<SwitchProps> = ({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false,
  className = '',
  name
}) => {
  return (
    <div 
      className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
        checked 
          ? 'bg-brand-light/10 border-brand-green/20' 
          : 'bg-white border-slate-200 hover:border-brand-green/30'
      } ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''} ${className}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="flex-1 pr-4">
        <label className={`block text-sm font-bold cursor-pointer select-none ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>
          {label}
        </label>
        {description && (
          <p className={`text-xs mt-1 leading-relaxed select-none ${disabled ? 'text-slate-300' : 'text-slate-500'}`}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        name={name}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-green/20 ${
          checked ? 'bg-brand-green' : 'bg-slate-200 group-hover:bg-slate-300'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
