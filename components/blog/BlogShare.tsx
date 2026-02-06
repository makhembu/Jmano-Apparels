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
    { name: 'Twitter', url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareTitle}`, icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg> },
    { name: 'Email', url: `mailto:?subject=${shareTitle}&body=Check out this article from Jambo Apparels:%0A%0A${encodedUrl}`, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> }
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