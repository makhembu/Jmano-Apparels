import React, { useEffect, useState } from 'react';
import { api } from '../../lib/db';
import { User, UserRole } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  
  // Form States
  const [form, setForm] = useState({ name: '', email: '', role: 'user' as UserRole });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      showToast('Failed to load ambassadors registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setForm({ name: '', email: '', role: 'user' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setActiveUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      showToast('Name is required', 'error');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (isEditModalOpen && activeUser) {
        await api.updateUserProfile(activeUser.id, form);
        showToast('Ambassador profile updated', 'success');
      } else {
        await api.createUserProfile(form);
        showToast('New Ambassador successfully added to registry', 'success');
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (e: any) {
      showToast(e.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("This will permanently revoke this Ambassador's access. Proceed?")) return;
    try {
      await api.adminDeleteUser(id);
      showToast('Ambassador removed from registry', 'success');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      showToast('Failed to delete user', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.4em] mb-2">Ambassador Registry</p>
          <h1 className="text-4xl font-serif font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Oversee {users.length} registered customers and administrators.</p>
        </div>
        <Button 
          onClick={handleOpenAdd} 
          className="rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-green/20 hover:scale-105 active:scale-95 transition-all"
        >
          + Add Ambassador
        </Button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row items-center gap-4">
         <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-green/10 outline-none transition-all text-sm font-medium"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
         </div>
         <div className="flex items-center gap-4 px-2">
            <div className="text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admins</p>
               <p className="text-lg font-bold text-slate-900">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Standard</p>
               <p className="text-lg font-bold text-slate-900">{users.filter(u => u.role === 'user').length}</p>
            </div>
         </div>
      </div>

      {/* Table Registry */}
      <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Customer Info</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Access Tier</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Registry Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark font-black text-base border-2 border-white shadow-sm ring-1 ring-slate-100">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4 overflow-hidden">
                        <div className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                      user.role === 'admin' 
                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-xs text-slate-400 font-bold uppercase tracking-tighter">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleOpenEdit(user)} 
                          className="bg-brand-light text-brand-green p-2 rounded-xl hover:bg-brand-green hover:text-white transition-all shadow-sm"
                          title="Edit Profile"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Revoke Access"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                     </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <p className="text-slate-400 font-serif italic text-lg">No matching ambassadors found.</p>
                      <button onClick={() => setSearchTerm('')} className="text-brand-green text-xs font-black uppercase mt-2 hover:underline">Clear Search</button>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100">
              <button 
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors p-2"
              >
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="p-10">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
                    {isEditModalOpen ? 'Edit Profile' : 'Add Ambassador'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Registry ID: {isEditModalOpen ? activeUser?.id.slice(0, 8) : 'NEW_ENTRY'}</p>
                </div>
                
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Identity</label>
                     <input 
                       type="text" required value={form.name} 
                       onChange={e => setForm({...form, name: e.target.value})}
                       className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                       placeholder="e.g. Simon Peter"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Digital Mail (Email)</label>
                     <input 
                       type="email" required value={form.email} 
                       onChange={e => setForm({...form, email: e.target.value})}
                       className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                       placeholder="ambassador@jambo.com"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Governance Role</label>
                     <select 
                       value={form.role}
                       onChange={e => setForm({...form, role: e.target.value as UserRole})}
                       className="w-full border border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-brand-green/5 outline-none transition-all appearance-none cursor-pointer"
                     >
                        <option value="user">Standard Ambassador (Customer)</option>
                        <option value="admin">High Guardian (Admin)</option>
                     </select>
                  </div>
                  
                  <div className="pt-6 flex flex-col gap-3">
                     <Button 
                        type="submit" 
                        isLoading={isSaving} 
                        fullWidth 
                        className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-green/20"
                     >
                        {isEditModalOpen ? 'Save Changes' : 'Create Profile'}
                     </Button>
                     <button 
                        type="button" 
                        onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} 
                        className="w-full h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                     >
                        Discard Entry
                     </button>
                  </div>
                </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};