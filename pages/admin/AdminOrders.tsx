
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

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-serif text-slate-900">Orders Registry</h1>
        <Link to="/admin/orders/new">
            <Button variant="primary" size="sm" icon={<span>+</span>}>New Order</Button>
        </Link>
      </div>
      
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
    </div>
  );
};
