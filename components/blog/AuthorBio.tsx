import React from 'react';
import { useShop } from '../../context/ShopContext';
import { OptimizedImage } from '../ui/OptimizedImage';

interface AuthorBioProps {
  authorName: string;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({ authorName }) => {
  const { settings, users } = useShop();
  const isFounder = authorName === settings.founderName;
  const author = users.find(u => u.name === authorName);

  let authorImage = null;
  if (isFounder && settings.founderImage) {
    authorImage = settings.founderImage;
  } else if (author && author.avatarUrl) {
    authorImage = author.avatarUrl;
  }

  return (
    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center text-center">
      {authorImage ? (
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 shadow-lg mb-4">
          <OptimizedImage 
            src={authorImage}
            alt={authorName}
            width={100}
            height={100}
          />
        </div>
      ) : (
        <div className="w-16 h-16 mb-4 rounded-full bg-brand-dark text-white flex items-center justify-center font-serif font-bold text-2xl flex-shrink-0">
          {authorName?.[0] || 'J'}
        </div>
      )}
      
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Written By</p>
        <h4 className="text-xl font-bold font-serif text-brand-dark mb-2">{authorName}</h4>
        <p className="text-sm text-slate-500 font-light leading-relaxed">
          {isFounder ? settings.founderBio?.split(' ').slice(0, 30).join(' ') + '...' : 'A contributor to the Jambo Apparels faith journal.'}
        </p>
      </div>
    </div>
  );
};
