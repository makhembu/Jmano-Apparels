
import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { OptimizedImage } from '../ui/OptimizedImage';
import { api } from '../../lib/db';
import { User } from '../../types';

interface AuthorBioProps {
  authorName: string;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({ authorName }) => {
  const { settings } = useShop();
  // Store fetched author data locally since it's no longer in global context
  const [author, setAuthor] = useState<Partial<User> | undefined>(undefined);

  const isFounder = authorName === settings.founderName;

  useEffect(() => {
    // Only fetch if it's not the founder (founder data is in settings) and we have a name
    if (!isFounder && authorName) {
      api.getPublicUsers().then((users) => {
        const found = users.find((u) => u.name === authorName);
        setAuthor(found);
      }).catch(() => {
        // Silently fail if user lookup fails
      });
    }
  }, [authorName, isFounder]);

  let authorImage = null;
  if (isFounder && settings.founderImage) {
    authorImage = settings.founderImage;
  } else if (author && author.avatarUrl) {
    authorImage = author.avatarUrl;
  }

  const bioText = isFounder 
    ? (settings.founderBio?.split(' ').slice(0, 30).join(' ') + '...') 
    : (author?.bio || 'A contributor to the Jambo Apparels faith journal.');

  return (
    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center text-center">
      {authorImage ? (
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 shadow-lg mb-4 bg-gray-200 border border-white">
          <OptimizedImage 
            src={authorImage}
            alt={authorName}
            width={100}
            height={100}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 mb-4 rounded-full bg-brand-dark text-white flex items-center justify-center font-serif font-bold text-2xl flex-shrink-0 border border-white shadow-md">
          {authorName?.[0] || 'J'}
        </div>
      )}
      
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Written By</p>
        <h4 className="text-xl font-bold font-serif text-brand-dark mb-2">{authorName}</h4>
        <p className="text-sm text-slate-500 font-light leading-relaxed">
          {bioText}
        </p>
      </div>
    </div>
  );
};
