
import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button
              variant="outline"
              disabled={currentPage === 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="rounded-l-md rounded-r-none border-gray-300 text-gray-500 hover:bg-gray-50 h-8 px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="rounded-r-md rounded-l-none border-gray-300 text-gray-500 hover:bg-gray-50 h-8 px-3"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
      <div className="flex items-center justify-between sm:hidden w-full">
         <Button
            variant="outline"
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            size="sm"
         >
            Prev
         </Button>
         <span className="text-xs text-gray-500">Page {currentPage} / {totalPages}</span>
         <Button
            variant="outline"
            disabled={currentPage === totalPages || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            size="sm"
         >
            Next
         </Button>
      </div>
    </div>
  );
};
