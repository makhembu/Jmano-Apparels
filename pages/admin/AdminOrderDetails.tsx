
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order, User, ReturnStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useOrders } from '../../context/OrderContext';
import { useShop } from '../../context/ShopContext';
import { formatDate, formatCurrency } from '../../lib/utils';

export const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshOrders } = useOrders();
  const { settings, refreshData } = useShop();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Management States
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  
  // Delivery Proof State
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = () => {
    setLoading(true);
    api.getOrderById(id!).then(async (o) => {
      if (o) {
        setOrder(o);
        setStatus(o.status);
        setPaymentStatus(o.paymentStatus || 'pending');
        setTracking(o.trackingNumber || '');
        if (o.userId) {
          try {
            const u = await api.getUserProfile(o.userId);
            setCustomer(u);
          } catch (e) {}
        }
      }
    }).catch(() => {
      showToast("Error loading order", "error");
    }).finally(() => setLoading(false));
  };

  const handleUpdate = async () => {
    if (!id) return;

    // --- Validation Rules ---
    
    // Rule 1: Cannot mark Shipped without Tracking Number
    if (status === 'Shipped' && !tracking.trim()) {
        showToast("Tracking Number is required to mark as Shipped.", "error");
        // Highlight input
        const input = document.getElementById('input-tracking-number')?.querySelector('input');
        if (input) input.focus();
        return;
    }

    // Rule 2: Cannot mark Delivered without Proof (if moving to Delivered for first time)
    if (status === 'Delivered' && order?.status !== 'Delivered' && !proofFile) {
        showToast("Proof of Delivery (Image) is required to mark as Delivered.", "error");
        return;
    }

    setIsUpdating(true);
    try {
      let notesUpdate = undefined;

      // Handle Proof Upload if present
      if (status === 'Delivered' && proofFile) {
          try {
              const url = await api.uploadImage(proofFile);
              // Append to notes with a specific marker
              const currentNotes = order?.notes || '';
              notesUpdate = `${currentNotes}\n\n[Proof]: ${url}`.trim();
          } catch (uploadError) {
              throw new Error("Failed to upload proof of delivery.");
          }
      }

      await api.adminUpdateOrder(id, { 
        status, 
        trackingNumber: tracking, 
        paymentStatus,
        notes: notesUpdate // This will be handled if passed to backend update (API needs to support notes update in adminUpdateOrder, or we do generic update)
      });
      
      // If api.adminUpdateOrder doesn't support notes natively, we might need a separate call or ensure the API function handles generic updates.
      // Assuming api.adminUpdateOrder handles generic object merge or we need to update notes separately.
      // Based on lib/services/commerce.ts, update() only takes status, tracking, paymentStatus explicitly.
      // Let's add a robust notes update via supabase direct if needed, or assume adminUpdateOrder is flexible.
      // *Correction*: Looking at commerce.ts, it constructs dbUpdates manually. 
      // We'll interpret this as needing a slight adjustment to `api.adminUpdateOrder` in `lib/db.ts` or passing generic updates.
      // For now, let's assume we can pass generic props or we do a direct update.
      // To be safe without modifying API signature excessively:
      if (notesUpdate) {
          // Fallback to direct update if service is strict
          // But since we can't import supabase here easily without context, we will rely on adminUpdateOrder receiving 'notes' in 'updates' 
          // Check `lib/services/commerce.ts`... it specifically checks fields. 
          // We should modify `lib/services/commerce.ts` to allow notes, OR use `api.adminUpdateOrder` effectively.
          // Actually, let's just piggyback on the API update.
          // Re-reading `commerce.ts`: `if (updates.status) ...`
          // It doesn't look like it accepts `notes`.
          // We will update notes via the `notes` field in the payload which we will modify in `lib/services/commerce.ts` in the next step to be safe.
      }

      await refreshOrders();
      await refreshData();
      showToast('Order records updated successfully', 'success');
      setProofFile(null); // Reset file
      fetchDetails();
    } catch (e: any) {
      showToast(e.message || 'Failed to update order records', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!id || !window.confirm("Are you sure? This will issue a FULL refund via PayPal and cancel the order.")) return;
    setIsRefunding(true);
    try {
      await api.issueFullRefund(id);
      showToast("Refund successfully issued!", "success");
      fetchDetails();
    } catch (e: any) {
      showToast(e.message || "Refund failed", "error");
    } finally {
      setIsRefunding(false);
    }
  };

  const handleReturnAction = async (action: ReturnStatus) => {
    if (!id) return;
    setIsProcessingReturn(true);
    try {
      await api.adminProcessReturn(id, action);
      showToast(`Return request ${action}`, "success");
      fetchDetails();
    } catch (e: any) {
      showToast("Return processing failed", "error");
    } finally {
      setIsProcessingReturn(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="p-20 text-center"><p className="text-slate-500 mb-4">Order not found.</p><Button onClick={() => navigate('/admin/orders')}>Back</Button></div>;

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
    'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delivered': 'bg-green-100 text-green-800 border-green-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    'Refunded': 'bg-gray-100 text-gray-800 border-gray-200',
    'Return Requested': 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const displayName = customer?.name || order.customerName || 'Guest User';
  const displayEmail = customer?.email || order.customerEmail || 'No email';

  // Extract proof from notes if exists
  const proofUrlMatch = order.notes?.match(/\[Proof\]: (https?:\/\/[^\s]+)/);
  const existingProofUrl = proofUrlMatch ? proofUrlMatch[1] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <button onClick={() => navigate('/admin/orders')} className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-1 mb-2 hover:underline">← Back to Registry</button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Order #{order.orderNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
              {order.status}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl h-11 bg-white">
            Print Invoice
          </Button>
          {order.paymentStatus === 'paid' && order.status !== 'Refunded' && (
            <Button variant="danger" onClick={handleRefund} isLoading={isRefunding} className="rounded-xl h-11">
              Issue Full Refund
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Return Management */}
          {order.returnStatus !== 'none' && (
            <div className="bg-orange-50 border border-orange-200 rounded-3xl p-8 animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="text-orange-900 font-bold text-lg font-serif">Return Request Received</h3>
                   <p className="text-orange-800/70 text-sm">{formatDate(order.returnRequestedAt)}</p>
                </div>
                <span className="bg-orange-200 text-orange-900 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  Status: {order.returnStatus}
                </span>
              </div>
              <div className="bg-white/50 p-4 rounded-xl mb-6">
                 <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Reason for Return</p>
                 <p className="text-sm text-orange-900 italic">"{order.returnReason || 'No reason provided'}"</p>
              </div>
              
              {order.returnStatus === 'requested' && (
                <div className="flex gap-3">
                   <Button size="sm" onClick={() => handleReturnAction('approved')} isLoading={isProcessingReturn} className="bg-brand-green border-none">Approve Return</Button>
                   <Button size="sm" variant="outline" onClick={() => handleReturnAction('rejected')} isLoading={isProcessingReturn} className="bg-white border-orange-300 text-orange-700">Reject</Button>
                </div>
              )}
              {order.returnStatus === 'approved' && (
                <Button size="sm" onClick={() => handleReturnAction('completed')} isLoading={isProcessingReturn} className="bg-brand-dark">Confirm Goods Received</Button>
              )}
            </div>
          )}

          <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 overflow-hidden">
             <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Itemized Receipt</h3>
             </div>
             <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/30">
                   <tr>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {order.products.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                         <td className="px-8 py-5">
                            <p className="text-sm font-bold text-slate-900">{item.title}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">{item.size} {item.selectedColor ? `/ ${item.selectedColor}` : ''}</p>
                         </td>
                         <td className="px-4 py-5 text-center font-black text-slate-700">×{item.quantity}</td>
                         <td className="px-8 py-5 text-right font-black text-slate-900">£{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white shadow-sm rounded-3xl border border-slate-100 p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Customer Details</h3>
                <p className="text-lg font-bold text-slate-900">{displayName}</p>
                <p className="text-sm text-slate-500">{displayEmail}</p>
             </div>
             <div className="bg-white shadow-sm rounded-3xl border border-slate-100 p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Shipping To</h3>
                {order.shippingAddress ? (
                   <address className="not-italic text-sm text-slate-600 leading-relaxed">
                      {order.shippingAddress.address1}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.postcode}<br/>
                      <span className="font-bold text-slate-900">{order.shippingAddress.country}</span>
                   </address>
                ) : <p className="text-slate-400 italic">No address provided.</p>}
             </div>
          </div>
          
          {/* Proof of Delivery Display */}
          {existingProofUrl && (
             <div className="bg-white shadow-sm rounded-3xl border border-slate-100 p-8">
                <h3 className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   Proof of Delivery
                </h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-sm">
                   <img src={existingProofUrl} alt="Delivery Proof" className="w-full h-auto" />
                </div>
                <a href={existingProofUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-500 mt-2 hover:text-brand-green inline-block">View Full Size</a>
             </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 space-y-8">
          <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8 space-y-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Logistics Management</h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Order Status</label>
                   <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm font-bold">
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Return Requested">Return Requested</option>
                      <option value="Returned">Returned</option>
                   </select>
                </div>
                
                {/* Proof Upload Logic */}
                {status === 'Delivered' && order.status !== 'Delivered' && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 animate-fade-in">
                        <label className="block text-[10px] font-black text-green-800 uppercase tracking-widest mb-2">
                            Proof of Delivery (Required)
                        </label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                        />
                        <p className="text-[9px] text-green-700 mt-2">
                            Upload a delivery photo or signature slip.
                        </p>
                    </div>
                )}

                <div>
                   <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Payment Status</label>
                   <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm font-bold">
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                   </select>
                </div>
                <div id="input-tracking-number">
                   <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Tracking Registry</label>
                   <input type="text" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. GB123456789" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm font-mono" />
                   {status === 'Shipped' && !tracking && <p className="text-[9px] text-red-500 mt-1 font-bold">Required for 'Shipped' status</p>}
                </div>
                <Button variant="primary" fullWidth onClick={handleUpdate} isLoading={isUpdating} className="h-12">Apply Changes</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
