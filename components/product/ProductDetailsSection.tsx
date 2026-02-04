
import React from 'react';

export const ProductDetailsSection: React.FC = () => {
  return (
    <div className="mt-12 grid grid-cols-2 gap-4">
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-900 mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
         </div>
         <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Ethical</p>
         <p className="text-[10px] text-gray-500 leading-relaxed">Sourced with integrity, crafted with care.</p>
      </div>
      
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-900 mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
         </div>
         <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Inspired</p>
         <p className="text-[10px] text-gray-500 leading-relaxed">Every thread rooted in scripture.</p>
      </div>
    </div>
  );
};
