import React from 'react';

export const ProductDetailsSection: React.FC = () => {
  return (
    <div className="mt-16 border-t border-slate-100 pt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div className="flex items-start gap-4 p-4 rounded-3xl bg-brand-light/20 border border-brand-green/5">
         <div className="text-brand-green bg-white p-2 rounded-xl shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
         </div>
         <div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Ethically Threaded</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter opacity-70">Premium materials, made with integrity.</p>
         </div>
      </div>
      <div className="flex items-start gap-4 p-4 rounded-3xl bg-brand-light/20 border border-brand-green/5">
         <div className="text-brand-green bg-white p-2 rounded-xl shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
         </div>
         <div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Divinely Inspired</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter opacity-70">Every design rooted in the scriptures.</p>
         </div>
      </div>
    </div>
  );
};
