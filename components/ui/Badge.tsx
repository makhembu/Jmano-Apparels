
import React from 'react';
import { cn } from '../../lib/utils';
import { COLORS } from '../../constants/design';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
  const styles = COLORS.status[variant];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
      styles.bg,
      styles.text,
      styles.border,
      className
    )}>
      {children}
    </span>
  );
};
