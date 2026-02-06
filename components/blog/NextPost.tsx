import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types';
import { OptimizedImage } from '../ui/OptimizedImage';

interface NextPostProps {
  post: BlogPost;
}

export const NextPost: React.FC<NextPostProps> = ({ post }) => {
  return (
    <section className="bg-slate-50 border-t border-slate-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">
          Up Next
        </h4>

        <Link
          to={`/blog/${post.slug}`}
          className="group flex items-center gap-4 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition"
        >
          <div className="w-28 h-20 flex-shrink-0 rounded-md overflow-hidden">
            <OptimizedImage
              src={post.thumbnail}
              alt={post.title}
              width={224}
              height={160}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="text-left">
            <h3 className="text-base font-serif font-bold text-brand-dark group-hover:text-brand-green leading-snug line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {post.summary}
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
};
