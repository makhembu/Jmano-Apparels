
import React, { useState } from 'react';
import { BlogPost, BlogCategory } from '../../../types';
import { Button } from '../../ui/Button';
import { api } from '../../../lib/db';
import { useToast } from '../../../context/ToastContext';

interface BlogEditorSidebarProps {
  formData: Partial<BlogPost>;
  categories: BlogCategory[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>, field: 'featuredImage' | 'thumbnail') => void;
  onImageClear: (field: 'featuredImage' | 'thumbnail') => void;
  onQuickCategoryAdd: () => void; // Trigger refresh in parent
  loading: boolean;
  uploading: boolean;
  id?: string;
}

type ImageInputType = 'url' | 'upload';

export const BlogEditorSidebar: React.FC<BlogEditorSidebarProps> = ({ 
  formData, categories, onChange, onImageChange, onImageClear, onQuickCategoryAdd, loading, uploading, id 
}) => {
  const { showToast } = useToast();
  const [featImageType, setFeatImageType] = useState<ImageInputType>('url');
  const [thumbImageType, setThumbImageType] = useState<ImageInputType>('url');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleQuickAddCategory = async () => {
    if(!newCatName) return;
    try {
      const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await api.createBlogCategory({ name: newCatName, slug });
      showToast('Category added', 'success');
      setNewCatName('');
      setIsAddingCat(false);
      onQuickCategoryAdd();
    } catch(e) {
      showToast('Failed to add category', 'error');
    }
  };

  const renderImageInput = (label: string, field: 'featuredImage' | 'thumbnail', typeState: ImageInputType, setTypeState: (t: ImageInputType) => void) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2 mb-2">
         <button type="button" onClick={() => setTypeState('url')} className={`text-xs px-2 py-1 rounded ${typeState === 'url' ? 'bg-brand-dark text-white' : 'bg-gray-100'}`}>Link URL</button>
         <button type="button" onClick={() => setTypeState('upload')} className={`text-xs px-2 py-1 rounded ${typeState === 'upload' ? 'bg-brand-dark text-white' : 'bg-gray-100'}`}>Upload File</button>
      </div>
      
      {typeState === 'url' ? (
        <input 
          type="text" 
          name={field} 
          value={formData[field] || ''} 
          onChange={onChange} 
          placeholder="https://..."
          className="block w-full border border-gray-300 rounded p-2 bg-white text-gray-900 text-sm" 
        />
      ) : (
        <div className="flex items-center gap-2">
           <input 
             type="file" 
             accept="image/*" 
             onChange={(e) => onImageChange(e, field)}
             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-brand-green hover:file:bg-green-100"
           />
           {uploading && <span className="text-xs text-brand-green animate-pulse">Uploading...</span>}
        </div>
      )}
      
      {formData[field] && (
        <div className="mt-2 relative group w-32 h-20 rounded overflow-hidden border border-gray-200">
           <img src={formData[field]} alt="Preview" className="w-full h-full object-cover" />
           <button 
             type="button" 
             onClick={() => onImageClear(field)}
             className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs opacity-0 group-hover:opacity-100 transition"
           >
             ✕
           </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 shadow rounded-lg space-y-4">
          <h3 className="font-bold text-gray-900">Publishing</h3>
          <div>
             <label className="block text-sm font-medium text-gray-700">Status</label>
             <select name="status" value={formData.status} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Author</label>
             <input type="text" name="author" value={formData.author} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Read Time (mins)</label>
             <input type="number" name="readingTime" value={formData.readingTime || 0} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-50 text-gray-500" readOnly />
             <p className="text-xs text-gray-400 mt-1">Auto-calculated based on word count.</p>
          </div>
          <div className="pt-2">
             <Button type="submit" variant="primary" fullWidth isLoading={loading}>
                {id ? 'Update Post' : 'Publish Post'}
             </Button>
          </div>
       </div>

       <div className="bg-white p-6 shadow rounded-lg space-y-4">
          <h3 className="font-bold text-gray-900">Category</h3>
          <div>
             <select name="categoryId" value={formData.categoryId || ''} onChange={onChange} className="block w-full border border-gray-300 rounded p-2 bg-white text-gray-900">
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          
          {isAddingCat ? (
             <div className="flex gap-2 items-center mt-2">
                <input 
                  type="text" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  placeholder="New category name"
                  className="border rounded px-2 py-1 text-sm flex-1"
                />
                <button type="button" onClick={handleQuickAddCategory} className="text-green-600 font-bold px-2">✓</button>
                <button type="button" onClick={() => setIsAddingCat(false)} className="text-red-500 px-1">✕</button>
             </div>
          ) : (
             <button type="button" onClick={() => setIsAddingCat(true)} className="text-sm text-brand-green hover:underline flex items-center gap-1 mt-2">
                + Add New Category
             </button>
          )}
       </div>

       <div className="bg-white p-6 shadow rounded-lg space-y-4">
          <h3 className="font-bold text-gray-900">Media</h3>
          {renderImageInput('Featured Image (Hero)', 'featuredImage', featImageType, setFeatImageType)}
          {renderImageInput('Thumbnail (Grid)', 'thumbnail', thumbImageType, setThumbImageType)}
       </div>

       <div className="bg-white p-6 shadow rounded-lg space-y-4">
          <h3 className="font-bold text-gray-900">Excerpt</h3>
          <textarea 
            name="summary" 
            rows={4} 
            value={formData.summary} 
            onChange={onChange} 
            className="block w-full border border-gray-300 rounded p-2 bg-white text-gray-900 text-sm" 
            placeholder="Short summary for the blog grid..."
          />
       </div>
    </div>
  );
};
