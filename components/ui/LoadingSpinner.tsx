
import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "", fullScreen = false }) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      <p className="text-brand-dark font-medium text-sm animate-pulse">Divinely Threading Your Experience...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 z-[100] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="py-12 flex justify-center w-full">{spinner}</div>;
};
