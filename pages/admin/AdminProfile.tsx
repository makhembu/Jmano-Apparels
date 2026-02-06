import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/db';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AdminProfile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({ name: '', email: '', avatarUrl: '' });
  const [passForm, setPassForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
        setForm({ name: user.name, email: user.email, avatarUrl: user.avatarUrl || '' });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await api.updateUserProfile(user.id, { name: form.name, email: form.email, avatarUrl: form.avatarUrl });
      await refreshProfile(); 
      showToast('Profile details updated successfully', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setPassLoading(true);
    try {
      await api.updateUserPassword(passForm.newPassword);
      showToast('Password changed successfully', 'success');
      setPassForm({ newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      showToast(e.message || 'Failed to update password', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      setForm(prev => ({ ...prev, avatarUrl: url }));
      showToast('Avatar updated', 'success');
    } catch (error: any) {
      showToast(error.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <h1 className="text-2xl font-bold font-serif text-brand-dark mb-6">My Admin Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
             <div className="h-12 w-12 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-xl overflow-hidden">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
             </div>
             <div>
                <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                <p className="text-xs text-gray-500">Manage your administrative identity</p>
             </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                required 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                disabled 
                value={form.email}
                className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md p-2 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={form.avatarUrl}
                  onChange={e => setForm({...form, avatarUrl: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green"
                />
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  <Button type="button" variant="outline" isLoading={uploading} className="h-full">Upload</Button>
                </div>
              </div>
            </div>

            <div className="pt-2">
               <Button type="submit" isLoading={loading} className="w-full">Update Profile</Button>
            </div>
          </form>
        </div>

        <div id="section-change-password" className="bg-white shadow rounded-lg p-6 border border-gray-200 transition-all">
          <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
             <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <div>
                <h2 className="text-lg font-bold text-gray-900">Security</h2>
                <p className="text-xs text-gray-500">Update your access credentials</p>
             </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input 
                id="input-new-password"
                type="password" 
                required 
                value={passForm.newPassword} 
                onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input 
                type="password" 
                required 
                value={passForm.confirmPassword} 
                onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:ring-brand-green"
                placeholder="••••••••"
              />
            </div>
            <div className="pt-2">
               <Button type="submit" variant="secondary" isLoading={passLoading} className="w-full">Change Password</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
