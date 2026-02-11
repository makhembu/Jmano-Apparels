
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/db';
import { BlogPost, BlogCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { BlogCategoriesSection } from '../../components/admin/settings/BlogCategoriesSection';
import { Input } from '../../components/ui/Input';

type Tab = 'posts' | 'categories';

export const AdminBlog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // --- Bulk Actions ---
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map(p => p.id));
    }
  };

  const handleBulkUpdate = async (updates: Partial<BlogPost>) => {
    if (!window.confirm(`Are you sure you want to update ${selectedIds.length} posts?`)) return;
    setIsBulkProcessing(true);
    try {
        await api.adminBulkUpdateBlogPosts(selectedIds, updates);
        const statusMessage = updates.status ? `status to '${updates.status}'` : '';
        showToast(`${selectedIds.length} posts updated ${statusMessage}`, 'success');
        setSelectedIds([]);
        await fetchData(); // Re-fetch data
    } catch (e) {
        showToast('Bulk update failed', 'error');
    } finally {
        setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
      if (!window.confirm(`Permanently delete ${selectedIds.length} posts? This cannot be undone.`)) return;
      setIsBulkProcessing(true);
      try {
          await api.adminBulkDeleteBlogPosts(selectedIds);
          showToast(`${selectedIds.length} posts deleted`, 'success');
          setSelectedIds([]);
          await fetchData(); // Re-fetch data
      } catch (e) {
          showToast('Bulk delete failed', 'error');
      } finally {
          setIsBulkProcessing(false);
      }
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && activeTab === 'posts') return <LoadingSpinner />;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold font-serif text-brand-dark">Blog Management</h1>
        <div className="flex gap-2">
            <Link to="/admin/blog/new" data-copilot-id="btn-new-post">
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
        <>
        <div className="mb-6 max-w-md">
            <Input 
                placeholder="Search posts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
            />
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedIds.length > 0 && (
            <div className="mb-4 p-3 bg-brand-dark text-white rounded-xl flex justify-between items-center shadow-lg animate-fade-in">
                <span className="text-sm font-bold">{selectedIds.length} selected</span>
                <div className="flex gap-4 items-center">
                    <span className="text-xs font-bold uppercase">Change Status:</span>
                    <button onClick={() => handleBulkUpdate({ status: 'published' })} disabled={isBulkProcessing} className="text-xs font-bold text-brand-green hover:underline disabled:opacity-50">Publish</button>
                    <button onClick={() => handleBulkUpdate({ status: 'draft' })} disabled={isBulkProcessing} className="text-xs font-bold text-slate-300 hover:underline disabled:opacity-50">Draft</button>
                    <div className="w-px h-4 bg-slate-600"></div>
                    <button onClick={handleBulkDelete} disabled={isBulkProcessing} className="text-xs font-bold text-red-400 hover:underline disabled:opacity-50">Delete</button>
                </div>
            </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={filteredPosts.length > 0 && selectedIds.length === filteredPosts.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-brand-green rounded border-gray-300 focus:ring-brand-green"
                  />
                </th>
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
              {filteredPosts.length === 0 ? (
                 <tr><td colSpan={8} className="text-center py-10 text-gray-500 text-sm">No journal entries found.</td></tr>
              ) : filteredPosts.map(post => {
                const category = categories.find(c => c.id === post.categoryId);
                const isSelected = selectedIds.includes(post.id);
                return (
                  <tr key={post.id} className={`transition-colors ${isSelected ? 'bg-brand-light/30' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(post.id)}
                        className="h-4 w-4 text-brand-green rounded border-gray-300 focus:ring-brand-green"
                      />
                    </td>
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
        </>
      )}

      {activeTab === 'categories' && (
        <div className="animate-fade-in">
           <BlogCategoriesSection />
        </div>
      )}
    </div>
  );
};
