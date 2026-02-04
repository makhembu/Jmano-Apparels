
import React from 'react';
import { cn } from '../../lib/utils';

export const Table = ({ children, className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("min-w-full divide-y divide-gray-200", className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("bg-gray-50", className)} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("bg-white divide-y divide-gray-200", className)} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("hover:bg-slate-50 transition-colors", className)} {...props}>
    {children}
  </tr>
);

export const TableHeader = ({ children, className, align = 'left', ...props }: React.ThHTMLAttributes<HTMLTableHeaderCellElement> & { align?: 'left' | 'center' | 'right' }) => (
  <th 
    scope="col" 
    className={cn(
      "px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap", 
      `text-${align}`,
      className
    )} 
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className, align = 'left', ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right' }) => (
  <td className={cn("px-6 py-4 whitespace-nowrap text-sm", `text-${align}`, className)} {...props}>
    {children}
  </td>
);
