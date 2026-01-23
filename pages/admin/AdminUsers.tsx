
import React, { useEffect, useState } from 'react';
import { api } from '../../lib/db';
import { User, UserRole, Order, UserAddress } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'user'>('all');
  const { showToast } = useToast();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // Detail Data
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [detailTab, setDetailTab] = useState<'profile' | 'orders' | 'addresses' | 'security'>('profile');
  const [detailLoading, setDetailLoading] = useState(false);

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
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = (role: UserRole) => {
    setForm({ name: '', email: '', role: role });
    setModalMode('add');
    setSelectedUser(null);
    setDetailTab('profile');
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (user: User) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setModalMode('edit');
    setDetailTab('profile');
    setIsModalOpen(true);
    
    // Fetch detailed data
    setDetailLoading(true);
    try {
        const [orders, addresses] = await Promise.all([
            api.getOrders(user.id),
            api.getUserAddresses(user.id)
        ]);
        setUserOrders(orders);
        setUserAddresses(addresses);
    } catch (e) {
        console.error("Failed to fetch user details");
    } finally {
        setDetailLoading(false);
    }
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
      if (modalMode === 'edit' && selectedUser) {
        await api.updateUserProfile(selectedUser.id, form);
        showToast('User profile updated', 'success');
        // Update local state immediately
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...form } : u));
      } else {
        const newUser = await api.createUserProfile(form);
        showToast('New user added successfully', 'success');
        setUsers(prev => [newUser, ...prev]);
      }
      setIsModalOpen(false);
    } catch (e: any) {
      showToast(e.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await api.adminDeleteUser(selectedUser.id);
      showToast('User deleted', 'success');
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setIsModalOpen(false);
    } catch (e) {
      showToast('Failed to delete user', 'error');
    }
  };

  const handlePasswordReset = async () => {
      if(!selectedUser) return;
      if(!window.confirm(`Send password reset email to ${selectedUser.email}?`)) return;
      try {
          await api.adminSendPasswordReset(selectedUser.email);
          showToast('Password reset email sent', 'success');
      } catch(e) {
          showToast('Failed to send reset email', 'error');
      }
  };

  const handleMagicLink = async () => {
      if(!selectedUser) return;
      if(!window.confirm(`Send magic login link to ${selectedUser.email}?`)) return;
      try {
          await api.adminSendMagicLink(selectedUser.email);
          showToast('Magic link sent to user', 'success');
      } catch(e) {
          showToast('Failed to send magic link', 'error');
      }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const customerCount = users.filter(u => u.role === 'user').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Manage customers, admins, and permissions.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleOpenAdd('user')} variant="outline" className="bg-white hover:bg-gray-50">
            + Add Customer
          </Button>
          <Button onClick={() => handleOpenAdd('admin')} variant="primary" className="shadow-lg shadow-brand-green/20">
            + Add Admin
          </Button>
        </div>
      </div>

      {/* Toolbar & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
         {/* Filter Tabs */}
         <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
            <button 
                onClick={() => setActiveTab('all')} 
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${activeTab === 'all' ? 'bg-white shadow text-brand-dark' : 'text-gray-500 hover:text-gray-700'}`}
            >
                All
            </button>
            <button 
                onClick={() => setActiveTab('admin')} 
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${activeTab === 'admin' ? 'bg-white shadow text-brand-dark' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Admins <span className="ml-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[9px]">{adminCount}</span>
            </button>
            <button 
                onClick={() => setActiveTab('user')} 
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${activeTab === 'user' ? 'bg-white shadow text-brand-dark' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Customers <span className="ml-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[9px]">{customerCount}</span>
            </button>
         </div>

         {/* Search Input */}
         <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-sm bg-white"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">User Identity</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Access Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleOpenEdit(user)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-brand-light text-brand-dark rounded-full flex items-center justify-center font-bold border border-brand-green/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-[10px] font-black uppercase tracking-wider rounded-md ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleOpenEdit(user); }}
                     className="text-brand-green hover:text-brand-dark font-bold hover:underline"
                   >
                     View & Edit
                   </button>
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 bg-gray-50">
                    No users found matching your filters.
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Details & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              
              {/* Modal Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 font-serif">
                  {modalMode === 'add' ? 'Create New User' : selectedUser?.name}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Tabs (Only for Edit Mode) */}
              {modalMode === 'edit' && (
                  <div className="bg-white border-b border-gray-200 px-6 flex gap-6 overflow-x-auto no-scrollbar">
                      {['profile', 'orders', 'addresses', 'security'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setDetailTab(tab as any)}
                            className={`py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${detailTab === tab ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                          >
                              {tab}
                          </button>
                      ))}
                  </div>
              )}
              
              <div className="bg-white px-6 py-6">
                
                {/* PROFILE TAB (Also used for ADD mode) */}
                {(modalMode === 'add' || detailTab === 'profile') && (
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                                <input 
                                    type="text" required value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full border border-gray-300 bg-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                                <input 
                                    type="email" required value={form.email} 
                                    onChange={e => setForm({...form, email: e.target.value})}
                                    className="w-full border border-gray-300 bg-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">System Role</label>
                            <select 
                                value={form.role}
                                onChange={e => setForm({...form, role: e.target.value as UserRole})}
                                className="w-full border border-gray-300 bg-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none"
                            >
                                <option value="user">User (Customer)</option>
                                <option value="admin">Admin (Full Access)</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Admins have full access to the dashboard and settings.</p>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="submit" isLoading={isSaving} fullWidth className="shadow-lg shadow-brand-green/10">
                                {modalMode === 'edit' ? 'Save Changes' : 'Create Account'}
                            </Button>
                            {modalMode === 'edit' && (
                                <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-bold px-4">
                                    Delete User
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {/* ORDERS TAB */}
                {modalMode === 'edit' && detailTab === 'orders' && (
                    <div className="space-y-4">
                        {detailLoading ? <LoadingSpinner /> : userOrders.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">No orders found for this user.</div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {userOrders.map(order => (
                                    <div key={order.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div>
                                            <Link to={`/admin/orders/${order.id}`} className="font-bold text-brand-dark hover:underline">#{order.orderNumber}</Link>
                                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">£{order.total.toFixed(2)}</p>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>{order.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ADDRESSES TAB */}
                {modalMode === 'edit' && detailTab === 'addresses' && (
                    <div className="space-y-4">
                        {detailLoading ? <LoadingSpinner /> : userAddresses.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">No saved addresses.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {userAddresses.map(addr => (
                                    <div key={addr.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-xs uppercase">{addr.label}</span>
                                            {addr.isDefault && <span className="text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">DEFAULT</span>}
                                        </div>
                                        <p className="text-sm text-gray-700">{addr.address1}</p>
                                        <p className="text-sm text-gray-700">{addr.city}, {addr.postcode}</p>
                                        <p className="text-xs text-gray-500 mt-1">{addr.country}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* SECURITY TAB */}
                {modalMode === 'edit' && detailTab === 'security' && (
                    <div className="space-y-6">
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <h4 className="font-bold text-yellow-800 text-sm mb-2">Authentication Management</h4>
                            <p className="text-xs text-yellow-700 mb-4">
                                You can help the user recover their account by sending a reset email or a magic login link. 
                                For security reasons, you cannot directly set their password to a specific value without an admin API key environment.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={handlePasswordReset} className="w-full sm:w-auto bg-white border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-100 transition-colors text-left flex items-center justify-between group">
                                    <span>Send Password Reset Email</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                                <button onClick={handleMagicLink} className="w-full sm:w-auto bg-white border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-100 transition-colors text-left flex items-center justify-between group">
                                    <span>Send Magic Login Link</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Manual Password Override</label>
                            <div className="flex gap-2">
                                <input type="password" disabled placeholder="Direct edit unavailable (Use Reset Email)" className="flex-1 bg-gray-100 border border-gray-200 rounded-lg p-3 text-sm text-gray-400 cursor-not-allowed" />
                                <Button disabled variant="secondary" className="opacity-50 cursor-not-allowed">Update</Button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">To ensure security compliance, please use the reset email flow.</p>
                        </div>
                    </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
