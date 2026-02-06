import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types';
import { OptimizedImage } from '../ui/OptimizedImage';

interface NextPostProps {
  post: BlogPost;
}

export const NextPost: React.FC<NextPostProps> = ({ post }) => {
  return (
    <section className="bg-slate-50 border-t border-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Up Next</h4>
        <Link to={`/blog/${post.slug}`} className="group block max-w-2xl mx-auto">
          <div className="aspect-[16/9] rounded-xl overflow-hidden shadow-xl mb-6">
            <OptimizedImage 
              src={post.thumbnail}
              alt={post.title}
              width={800}
              height={450}
              className="group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark group-hover:text-brand-green transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{post.summary}</p>
        </Link>
      </div>
    </section>
  );
};
