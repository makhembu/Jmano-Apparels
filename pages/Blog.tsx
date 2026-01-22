import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Blog: React.FC = () => {
  const { blogPosts } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif mb-8 text-center">Journal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
          >
            <Link to={`/blog/${post.slug}`} className="block relative overflow-hidden group">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="h-48 w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-sm text-brand-green mb-2">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <Link to={`/blog/${post.slug}`} className="block">
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-brand-green transition-colors">
                  {post.title}
                </h3>
              </Link>
              <p className="text-gray-600 flex-1 mb-4">{post.summary}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="text-brand-dark font-medium hover:text-brand-green hover:underline self-start inline-flex items-center gap-1"
              >
                Read more <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
