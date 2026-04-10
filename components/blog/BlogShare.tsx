import React from 'react';
import { BlogPost } from '../../types';

// FIX: Define the props interface for the component.
interface BlogShareProps {
  post: BlogPost;
}

export const BlogShare: React.FC<BlogShareProps> = ({ post }) => {
  const pageUrl = `https://jamboapparels.com/blog/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);
  const encodedUrl = encodeURIComponent(pageUrl);

  const shareOptions = [
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg> },
    { name: 'Instagram', url: `https://www.instagram.com/`, icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.646.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.646-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.667-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.948C21.726 2.69 19.302.274 14.948.073 13.667.014 13.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg> },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Share This Post</h4>
      <div className="flex justify-center space-x-4">
        {shareOptions.map(option => (
          <a
            key={option.name}
            href={option.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-brand-green transition-colors"
            title={`Share on ${option.name}`}
          >
            <span className="sr-only">{option.name}</span>
            {option.icon}
          </a>
        ))}
      </div>
    </div>
  );
};