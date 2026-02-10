import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { User, UserRole, Order, UserAddress, AnalyticsEvent } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Card, CardContent } from '../../components/ui/Card';

// --- Detail Panel Component ---
const UserDetailPanel: React.FC<{ user: User, onUserUpdate: () => void, onClose: () => void }> = ({ user, onUserUpdate, onClose }) => {
    const [details, setDetails] = useState<{ orders: Order[], addresses: UserAddress[], activity: AnalyticsEvent[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'activity'>('overview');
    const { showToast } = useToast();

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [orders, addresses, activity] = await Promise.all([
                    api.getOrders(user.id),
                    api.getUserAddresses(user.id),
                    api.getUserActivity(user.id, 50)
                ]);
                setDetails({ orders, addresses, activity });
            } catch (e) {
                showToast("Failed to load user details", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [user.id, showToast]);

    const stats = useMemo(() => {
        if (!details) return { totalSpent: 0, orderCount: 0 };
        const orderCount = details.orders.length;
        const paidOrders = details.orders.filter(o => 
            o.paymentStatus === 'paid' && 
            !['Cancelled', 'Refunded'].includes(o.status)
        );
        const totalSpent = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        return { totalSpent, orderCount };
    }, [details]);
    
    const handleSendReset = async () => {
        if (window.confirm(`Send a password reset email to ${user.email}?`)) {
            try {
                await api.adminSendPasswordReset(user.email);
                showToast('Password reset email sent.', 'success');
            } catch (e) {
                showToast('Failed to send email.', 'error');
            }
        }
    };
    
    const handleDeleteUser = async () => {
        if (window.confirm(`PERMANENTLY DELETE ${user.name}? This cannot be undone.`)) {
            try {
                await api.adminDeleteUser(user.id);
                showToast('User has been deleted.', 'success');
                onUserUpdate(); // Triggers refresh in parent
            } catch (e) {
                showToast('Failed to delete user.', 'error');
            }
        }
    };

    const TabButton: React.FC<{ tab: string, label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab as any)} className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'border-b-2 border-brand-green text-brand-green' : 'text-slate-500 hover:text-slate-800'}`}>
            {label}
        </button>
    );

    return (
        <Card className="shadow-xl shadow-slate-200/50 sticky top-24">
            <CardContent className="p-0">
                {loading ? <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div> : (
                    <>
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-2xl font-serif">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 font-serif">{user.name}</h2>
                                        <p className="text-sm text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-800">&times;</button>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Total Spent</p>
                                    <p className="text-xl font-bold text-brand-dark">{formatCurrency(stats.totalSpent)}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Orders</p>
                                    <p className="text-xl font-bold text-slate-800">{stats.orderCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pt-4 flex gap-6 border-b border-slate-100">
                            <TabButton tab="overview" label="Overview" />
                            <TabButton tab="orders" label="Orders" />
                            <TabButton tab="activity" label="Activity" />
                        </div>
                        
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h4 className="font-bold text-sm mb-2">Details</h4>
                                        <p className="text-xs"><strong className="text-slate-500">Role:</strong> {user.role}</p>
                                        <p className="text-xs"><strong className="text-slate-500">Joined:</strong> {formatDate(user.createdAt)}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-2">Addresses</h4>
                                        {details?.addresses.length === 0 ? <p className="text-xs text-slate-400 italic">No saved addresses.</p> : details?.addresses.map(addr => (
                                            <div key={addr.id} className="text-xs border-b border-slate-50 pb-2 mb-2">
                                                <p className="font-bold text-slate-600">{addr.label} {addr.isDefault && <span className="text-brand-green">(Default)</span>}</p>
                                                <p>{addr.address1}, {addr.city}, {addr.postcode}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 space-y-2">
                                        <Button variant="outline" size="sm" fullWidth onClick={handleSendReset}>Send Password Reset</Button>
                                        <Button variant="danger" size="sm" fullWidth onClick={handleDeleteUser}>Delete User</Button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'orders' && (
                                <div className="animate-fade-in">
                                  {details?.orders.length === 0 ? <p className="text-xs text-slate-400 italic">No orders found.</p> : (
                                    <table className="w-full text-xs">
                                        <thead className="text-left text-slate-400 uppercase"><tr><th className="pb-2">Order</th><th className="pb-2">Status</th><th className="pb-2 text-right">Total</th></tr></thead>
                                        <tbody>
                                            {details.orders.map(o => (
                                                <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="py-3"><Link to={`/admin/orders/${o.id}`} className="font-bold text-brand-green hover:underline">#{o.orderNumber}</Link><br/><span className="text-slate-400">{formatDate(o.createdAt)}</span></td>
                                                    <td><Badge variant={o.status === 'Delivered' ? 'success' : 'warning'}>{o.status}</Badge></td>
                                                    <td className="text-right font-mono font-bold">{formatCurrency(o.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                  )}
                                </div>
                            )}
                            {activeTab === 'activity' && (
                                <div className="space-y-3 animate-fade-in">
                                    {details?.activity.map(act => (
                                        <div key={act.id} className="flex gap-3 text-xs border-b border-slate-50 pb-2">
                                            <span className="text-slate-400 font-mono flex-shrink-0">{new Date(act.created_at).toLocaleTimeString()}</span>
                                            <span className="font-bold text-slate-600">{act.eventType.replace(/_/g, ' ')}</span>
                                            <span className="text-slate-500 truncate">{act.path}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// --- Main Page Component ---
export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchUsers = useCallback(async (pageNum: number, search: string) => {
        setLoading(true);
        try {
            const result = await api.getPaginatedUsers(pageNum, 15, search);
            setUsers(result.data);
            setTotalPages(result.totalPages);
        } catch (e) {
            showToast('Failed to load the users', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchUsers(1, searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchUsers]);

    useEffect(() => {
        fetchUsers(page, searchTerm);
    }, [page, fetchUsers]);
    
    const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);

    return (
        <div className="animate-fade-in pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold font-serif text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500">Select a user to view their complete profile and activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-5 lg:col-span-4">
                    <Card>
                        <CardContent className="p-4">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm mb-4"
                            />
                            {loading ? <LoadingSpinner /> : (
                                <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                                    {users.map((user, index) => (
                                        <button 
                                            key={user.id} 
                                            onClick={() => setSelectedUserId(user.id)} 
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedUserId === user.id ? 'bg-brand-light' : 'hover:bg-slate-50'}`}
                                            data-copilot-id={index === 0 ? 'user-list-top-row' : undefined}
                                        >
                                            <div className="h-9 w-9 rounded-full bg-brand-dark text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                            {user.role === 'admin' && <Badge variant="info">Admin</Badge>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={loading} />
                    </Card>
                </div>

                <div className="md:col-span-7 lg:col-span-8">
                    {selectedUser ? (
                        <UserDetailPanel 
                            user={selectedUser} 
                            key={selectedUser.id} 
                            onUserUpdate={() => fetchUsers(page, searchTerm)}
                            onClose={() => setSelectedUserId(null)} 
                        />
                    ) : (
                        <div className="text-center py-24 px-8 bg-white rounded-xl border-2 border-dashed border-slate-200 h-full flex flex-col justify-center items-center">
                            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <h3 className="text-lg font-serif font-bold text-slate-700">Select a Customer</h3>
                            <p className="text-sm text-slate-400 mt-1">Choose a user from the list to view their details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};