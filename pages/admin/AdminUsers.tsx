
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { User, UserRole, Order, UserAddress, EmailTemplate } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { Pagination } from '../../components/ui/Pagination';

export const AdminUsers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { showToast } = useToast();
  const { settings } = useApp();

  // Modal & Edit States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user' as UserRole, password: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
        setPage(1); // Reset to page 1 on new search
        fetchUsers(1, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Page Change Effect
  useEffect(() => {
    fetchUsers(page, searchTerm);
  }, [page]);

  const fetchUsers = async (pageNum: number, search: string) => {
    setLoading(true);
    try {
      const result = await api.getPaginatedUsers(pageNum, 20, search);
      setUsers(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (e) {
      console.error(e);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setForm({ name: '', email: '', role: 'user', password: '' });
    setModalMode('add');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === 'edit' && selectedUser) {
        await api.updateUserProfile(selectedUser.id, { name: form.name, email: form.email, role: form.role });
        showToast('User updated', 'success');
      } else {
        await api.createUserProfile(form);
        showToast('User created', 'success');
      }
      setIsModalOpen(false);
      fetchUsers(page, searchTerm);
    } catch (e: any) {
      showToast(e.message || 'Error saving user', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Manage customers and permissions. Total: {total}</p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary">
            + Add User
        </Button>
      </div>

      <div className="mb-6">
        <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full md:w-96 border border-gray-300 rounded-lg p-2.5 text-sm"
        />
      </div>

      <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleOpenEdit(user)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-xs mr-3">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-brand-green hover:text-brand-dark font-bold">Edit</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={loading} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add User' : 'Edit User'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select value={form.role} onChange={e => setForm({...form, role: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white">
                            <option value="user">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {modalMode === 'add' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" isLoading={isSaving}>Save</Button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};
