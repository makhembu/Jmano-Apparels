import React, { useState } from 'react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { api } from '../../lib/db';
import { useToast } from '../../context/ToastContext';
import { AddressManager } from './AddressManager';

interface ProfileProps {
  user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateUserProfile(user.id, form);
      showToast('Personal info updated', 'success');
      setIsEditing(false);
    } catch (e) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-3xl">
      {/* Basic Info */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-brand-green hover:underline">Edit</button>
          )}
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
           {isEditing ? (
             <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                     <input 
                       type="text" required value={form.name} 
                       onChange={e => setForm({...form, name: e.target.value})}
                       className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-brand-green outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                     <input 
                       type="email" disabled value={form.email}
                       className="w-full border border-gray-200 bg-gray-50 rounded p-2 text-sm text-gray-500 cursor-not-allowed"
                     />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                   <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="h-8 py-0">Cancel</Button>
                   <Button type="submit" isLoading={saving} className="h-8 py-0">Save</Button>
                </div>
             </form>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                   <p className="font-medium text-gray-900">{user.name}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                   <p className="font-medium text-gray-900">{user.email}</p>
                </div>
             </div>
           )}
        </div>
      </section>

      {/* Address Management */}
      <section>
        <AddressManager userId={user.id} />
      </section>

      {/* Account Security Callout */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between">
         <div>
            <h4 className="text-sm font-bold text-gray-900">Privacy & Data</h4>
            <p className="text-xs text-gray-500">Your data is securely stored.</p>
         </div>
         <button className="text-xs text-gray-500 hover:text-gray-900 underline" onClick={() => window.open('mailto:privacy@jamboapparels.com')}>
            Contact Privacy Team
         </button>
      </div>
    </div>
  );
};