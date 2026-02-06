import React from 'react';
import { useApp } from '../../context/AppContext';
import { OptimizedImage } from '../ui/OptimizedImage';

interface AuthorBioProps {
  authorName: string;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({ authorName }) => {
  const { settings } = useApp();
  const isFounder = authorName === settings.founderName;

  return (
    <div className="my-16 py-10 border-t border-b border-slate-100 flex flex-col sm:flex-row items-center gap-8 bg-slate-50/50 rounded-2xl p-8">
      {isFounder && settings.founderImage ? (
        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 shadow-lg">
          <OptimizedImage 
            src={settings.founderImage}
            alt={settings.founderName}
            width={100}
            height={100}
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-brand-dark text-white flex items-center justify-center font-serif font-bold text-2xl flex-shrink-0">
          {authorName?.[0] || 'J'}
        </div>
      )}
      
      <div className="text-center sm:text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Written By</p>
        <h4 className="text-xl font-bold font-serif text-brand-dark mb-2">{authorName}</h4>
        <p className="text-sm text-slate-500 font-light leading-relaxed">
          {isFounder ? settings.founderBio?.split(' ').slice(0, 30).join(' ') + '...' : 'A contributor to the Jambo Apparels faith journal.'}
        </p>
      </div>
    </div>
  );
};
