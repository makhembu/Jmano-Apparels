import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/db';
import { BlogPost, BlogCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { BlogCategoriesSection } from '../../components/admin/settings/BlogCategoriesSection';

type Tab = 'posts' | 'categories';

export const AdminBlog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  
  const activeTab = (searchParams.get('tab') as Tab) || 'posts';

  const fetchData = async () => {
    setLoading(true);
    try {
        const [fetchedPosts, fetchedCats] = await Promise.all([
            api.getBlogPosts(),
            api.getBlogCategories()
        ]);
        setPosts(fetchedPosts);
        setCategories(fetchedCats);
    } catch (e) {
        console.error(e);
        showToast('Failed to load data', 'error');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    setSearchParams({ tab });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this post?")) {
      try {
        await api.adminDeleteBlogPost(id);
        showToast('Post deleted', 'success');
        fetchData();
      } catch (e) {
        showToast('Failed to delete', 'error');
      }
    }
  };

  if (loading && activeTab === 'posts') return <LoadingSpinner />;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold font-serif text-brand-dark">Blog Management</h1>
        <div className="flex gap-2">
            <Link to="/admin/blog/new">
                <Button variant="primary" className="shadow-lg shadow-brand-green/20">+ Write New Post</Button>
            </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'posts' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          onClick={() => handleTabChange('posts')}
        >
          Journal Entries
        </button>
        <button
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'categories' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          onClick={() => handleTabChange('categories')}
        >
          Categories
        </button>
      </div>

      {activeTab === 'posts' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.length === 0 ? (
                 <tr><td colSpan={7} className="text-center py-10 text-gray-500 text-sm">No journal entries found.</td></tr>
              ) : posts.map(post => {
                const category = categories.find(c => c.id === post.categoryId);
                return (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{post.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                {category.name}
                            </span>
                        ) : (
                            <span className="text-gray-300">-</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.status === 'draft' && post.scheduledFor && new Date(post.scheduledFor) > new Date() ? (
                        <div className="flex flex-col">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Scheduled
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1">
                                {new Date(post.scheduledFor).toLocaleDateString()}
                            </span>
                        </div>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {post.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.viewCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link to={`/admin/blog/${post.id}`} className="text-brand-green hover:underline">Edit</Link>
                      <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="animate-fade-in">
           <BlogCategoriesSection />
        </div>
      )}
    </div>
  );
};
