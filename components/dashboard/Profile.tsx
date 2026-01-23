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
    <div className="space-y-12 animate-fade-in">
      {/* Basic Info */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="font-bold text-brand-dark">Account Identity</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-brand-green hover:underline uppercase">Edit Info</button>
          )}
        </div>
        <div className="p-8">
           {isEditing ? (
             <form onSubmit={handleUpdate} className="space-y-6 max-w-md">
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                   <input 
                     type="text" required value={form.name} 
                     onChange={e => setForm({...form, name: e.target.value})}
                     className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-green/20 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address (Read Only)</label>
                   <input 
                     type="email" disabled value={form.email}
                     className="w-full border border-gray-100 bg-gray-50 rounded-xl p-3 text-gray-400 cursor-not-allowed"
                   />
                </div>
                <div className="flex gap-3">
                   <Button type="submit" isLoading={saving}>Save Changes</Button>
                   <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
             </form>
           ) : (
             <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-brand-light flex items-center justify-center text-3xl font-bold text-brand-green border-2 border-white shadow-sm">
                   {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                   <p className="text-2xl font-serif font-bold text-gray-900">{user.name}</p>
                   <p className="text-gray-500 font-light">{user.email}</p>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-2 py-0.5 bg-gray-50 rounded w-fit">{user.role} Status</p>
                </div>
             </div>
           )}
        </div>
      </section>

      {/* Address Management */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <AddressManager userId={user.id} />
      </section>

      {/* Account Security Callout */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div>
            <h4 className="font-bold text-gray-900">Security & Privacy</h4>
            <p className="text-sm text-gray-500">Your personal data is threaded securely and never shared with 3rd parties.</p>
         </div>
         <Button variant="outline" className="whitespace-nowrap" onClick={() => window.open('mailto:privacy@jamboapparels.com')}>Contact Privacy Officer</Button>
      </div>
    </div>
  );
};