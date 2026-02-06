import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../lib/db';
import { useToast } from '../../../../context/ToastContext';
import { Order, Product } from '../../../../types';
import { LoadingSpinner } from '../../../ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../../lib/utils';

interface ProductOverviewTabProps {
    productId: string;
    product: Partial<Product>;
}

export const ProductOverviewTab: React.FC<ProductOverviewTabProps> = ({ productId, product }) => {
    const { showToast } = useToast();
    const [stats, setStats] = useState({ revenue: 0, unitsSold: 0, orderCount: 0 });
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const { stats: fetchedStats, recentOrders } = await api.getAdminProductStats(productId);
            const finalUnitsSold = Math.max(fetchedStats.unitsSold, product.totalSales || 0);
            setStats({ ...fetchedStats, unitsSold: finalUnitsSold });
            setOrders(recentOrders);
        } catch (e) {
            console.error("Failed to load product stats", e);
            showToast("Could not load sales data.", "error");
        } finally {
            setLoading(false);
        }
    }, [productId, product.totalSales, showToast]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return <div className="py-20"><LoadingSpinner /></div>;
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-3xl font-serif font-bold text-brand-dark">{formatCurrency(stats.revenue)}</p>
                    <p className="text-[10px] text-green-600 mt-1 font-bold">from {stats.orderCount} orders</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sold</p>
                    <p className="text-3xl font-serif font-bold text-slate-900">{stats.unitsSold}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Lifetime units</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Stock</p>
                    <p className={`text-3xl font-serif font-bold ${ (product.stockQuantity || 0) <= (product.lowStockThreshold || 5) ? 'text-red-500' : 'text-slate-900'}`}>{product.stockQuantity || 0}</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${ (product.stockQuantity || 0) <= (product.lowStockThreshold || 5) ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(100, ((product.stockQuantity || 0) / 100) * 100)}%`}}></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                    <p className="text-3xl font-serif font-bold text-brand-hope">{stats.unitsSold > 0 ? 'Hot' : 'Quiet'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Based on recent activity</p>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Recent Customers</h3>
                    <span className="text-xs text-slate-500">Last 5 orders containing this item</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Size/Color</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Order Value</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500 italic">No recent sales found for this item.</td></tr>
                            ) : (
                                orders.map(order => {
                                    const lineItem = order.products.find(p => p.productId === productId);
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">{formatDate(order.createdAt)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-slate-900">{order.customerName || 'Guest'}</div><div className="text-xs text-slate-400">{order.customerEmail}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">{lineItem?.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{lineItem?.size} {lineItem?.selectedColor ? `/ ${lineItem.selectedColor}` : ''}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-brand-dark font-mono">{formatCurrency(order.total)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right"><a href={`/#/admin/orders/${order.id}`} target="_blank" className="text-brand-green hover:underline text-xs font-bold" rel="noreferrer">View Order</a></td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
