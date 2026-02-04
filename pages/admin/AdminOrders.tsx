
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order } from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    api.getAllOrders(100).then(setOrders).finally(() => setLoading(false));
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Cancelled': return 'error';
      case 'Processing': return 'info';
      default: return 'warning';
    }
  };

  if (loading) return <LoadingSpinner />;

  // Fix: Explicitly type component as React.FC to allow 'key' prop
  const MobileOrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <Link to={`/admin/orders/${order.id}`} className="block bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3">
        <div className="flex justify-between items-start mb-2">
            <div>
                <span className="font-bold text-slate-900 text-sm">#{order.orderNumber || order.id?.slice(0, 8)}</span>
                <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
            </div>
            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
        </div>
        <div className="flex justify-between items-end border-t border-slate-50 pt-2 mt-2">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                <p className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{order.customerName || order.userId?.slice(0, 8) || 'Guest'}</p>
            </div>
            <div className="text-right">
                <p className="text-lg font-bold text-slate-900">{formatCurrency(order.total || 0)}</p>
            </div>
        </div>
    </Link>
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-serif text-slate-900">Orders Registry</h1>
        <Link to="/admin/orders/new">
            <Button variant="primary" size="sm" icon={<span>+</span>}>{isMobile ? 'New' : 'New Order'}</Button>
        </Link>
      </div>
      
      {isMobile ? (
        <div className="space-y-1">
            {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">No orders found.</div>
            ) : (
                orders.map(order => <MobileOrderCard key={order.id} order={order} />)
            )}
        </div>
      ) : (
        <Card className="overflow-hidden">
            <Table>
            <TableHead>
                <TableRow>
                <TableHeader>Order #</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader align="right">Total</TableHeader>
                <TableHeader align="right">Action</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {orders.map(order => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium text-brand-dark">
                    <Link to={`/admin/orders/${order.id}`}>
                        #{order.orderNumber || order.id?.slice(0, 8)}
                    </Link>
                    </TableCell>
                    <TableCell className="text-slate-500">
                    {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-slate-500 max-w-[200px] truncate">
                    {order.customerName || order.userId?.slice(0, 8) || 'Guest'}
                    </TableCell>
                    <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                    </Badge>
                    </TableCell>
                    <TableCell align="right" className="font-bold text-slate-900">
                    {formatCurrency(order.total || 0)}
                    </TableCell>
                    <TableCell align="right">
                    <Link to={`/admin/orders/${order.id}`} className="text-brand-green hover:underline font-bold text-xs">
                        View
                    </Link>
                    </TableCell>
                </TableRow>
                ))}
                {orders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} align="center" className="py-12 text-slate-400 italic">
                    No orders found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </Card>
      )}
    </div>
  );
};
