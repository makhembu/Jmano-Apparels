import React from 'react';
import { useApp } from '../context/AppContext';

export const Blog: React.FC = () => {
  const { blogPosts } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif mb-8 text-center">Journal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
            <img src={post.thumbnail} alt={post.title} className="h-48 w-full object-cover" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-sm text-brand-green mb-2">{new Date(post.createdAt).toLocaleDateString()}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-gray-600 flex-1">{post.summary}</p>
              <button className="mt-4 text-brand-dark font-medium hover:underline self-start">Read more</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};