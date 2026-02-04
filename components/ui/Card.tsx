
import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-b border-slate-100", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-bold text-slate-900 font-serif", className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 bg-slate-50 border-t border-slate-100", className)} {...props}>
    {children}
  </div>
);
