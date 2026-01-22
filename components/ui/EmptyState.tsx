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
    <div className="text-center py-12 px-4 bg-white rounded-lg border border-gray-100 shadow-sm">
      {icon ? (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
      <h3 className="mt-2 text-lg font-medium text-gray-900 font-serif">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      {actionLabel && actionLink && (
        <div className="mt-6">
          <Link to={actionLink}>
            <Button variant="primary">{actionLabel}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};