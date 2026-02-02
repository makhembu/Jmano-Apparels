
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, actionLink, icon }) => {
  return (
    <div className="text-center py-16 px-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
      {icon ? (
        <div className="mx-auto h-16 w-16 text-slate-300 mb-6 flex items-center justify-center bg-slate-50 rounded-2xl">
          {icon}
        </div>
      ) : (
        <svg className="mx-auto h-16 w-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
      <h3 className="mt-2 text-xl font-bold text-brand-dark font-serif">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && actionLink && (
        <div className="mt-8">
          <Link to={actionLink}>
            <Button variant="primary" className="shadow-xl shadow-brand-green/20">{actionLabel}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
