import React, { useEffect, useState } from 'react';
import { api } from '../../lib/db';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.getAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.adminDeleteUser(id);
      showToast('User deleted', 'success');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser({ name: '', email: '', role: 'user' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser.name || !editingUser.email) return;

    setIsSaving(true);
    try {
      if (editingUser.id) {
        // Update
        await api.updateUserProfile(editingUser.id, {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role
        });
        showToast('User updated successfully', 'success');
      } else {
        // Create
        await api.createUserProfile(editingUser);
        showToast('User created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) {
      showToast('Failed to save user', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif">Users</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">Add User</Button>
      </div>

      {/* Mobile Card View (Visible on small screens) */}
      <div className="md:hidden space-y-4">
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
             <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.role}
                </span>
             </div>
             <div className="mt-4 pt-3 border-t flex justify-end gap-3">
                <button onClick={() => handleOpenModal(user)} className="text-sm font-medium text-brand-green hover:underline">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
             </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-bold">
                       {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                   <button onClick={() => handleOpenModal(user)} className="text-brand-green hover:text-brand-dark">Edit</button>
                   <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">{editingUser.id ? 'Edit User' : 'Create User'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={editingUser.name || ''} 
                      onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={editingUser.email || ''} 
                      onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select 
                      value={editingUser.role || 'user'}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
                      className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white"
                    >
                       <option value="user">User</option>
                       <option value="admin">Admin</option>
                    </select>
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" isLoading={isSaving}>Save</Button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};