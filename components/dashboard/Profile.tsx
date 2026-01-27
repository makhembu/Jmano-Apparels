
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
  
  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [saving, setSaving] = useState(false);

  // Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passForm, setPassForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passSaving, setPassSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
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

    setPassSaving(true);
    try {
        await api.updateUserPassword(passForm.newPassword);
        showToast('Password updated successfully', 'success');
        setIsChangingPassword(false);
        setPassForm({ newPassword: '', confirmPassword: '' });
    } catch (e: any) {
        showToast(e.message || 'Failed to update password', 'error');
    } finally {
        setPassSaving(false);
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
             <form onSubmit={handleUpdateProfile} className="space-y-4">
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

      {/* Security Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Security</h3>
          {!isChangingPassword && (
            <button onClick={() => setIsChangingPassword(true)} className="text-xs font-bold text-brand-green hover:underline">Change Password</button>
          )}
        </div>

        {isChangingPassword ? (
            <form onSubmit={handleUpdatePassword} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                        <input 
                            type="password" required value={passForm.newPassword} 
                            onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-brand-green outline-none"
                            placeholder="Min 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password</label>
                        <input 
                            type="password" required value={passForm.confirmPassword} 
                            onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-brand-green outline-none"
                            placeholder="Re-enter password"
                        />
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => { setIsChangingPassword(false); setPassForm({newPassword:'', confirmPassword:''}); }} className="h-8 py-0">Cancel</Button>
                    <Button type="submit" isLoading={passSaving} className="h-8 py-0">Update Password</Button>
                </div>
            </form>
        ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                    <p className="text-sm font-bold text-gray-800">Password</p>
                    <p className="text-xs text-gray-500">********</p>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">Secure</span>
            </div>
        )}
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
