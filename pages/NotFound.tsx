
import React from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { SEO } from '../components/SEO';

export const NotFound: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-[60vh] flex flex-col justify-center items-center p-4">
      <SEO title="Page Not Found | Jambo Apparels" noindex={true} />
      <EmptyState 
        title="404 - Page Not Found"
        description="The thread you are looking for has unraveled or moved."
        actionLabel="Return Home"
        actionLink="/"
        icon={
          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
};
