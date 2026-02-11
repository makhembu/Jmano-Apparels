
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order, AppSettings, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useOrders } from '../../context/OrderContext';
import { useShop } from '../../context/ShopContext';
import { formatDate, formatCurrency } from '../../lib/utils';
import { InvoiceTemplate } from '../../components/print/InvoiceTemplate';

export const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshOrders } = useOrders();
  const { settings, refreshData } = useShop();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Management States
  const [trackingInput, setTrackingInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = () => {
    setLoading(true);
    api.getOrderById(id!).then(async (o) => {
      if (o) {
        setOrder(o);
        setTrackingInput(o.trackingNumber || '');
      }
    }).catch(() => {
      showToast("Error loading order", "error");
    }).finally(() => setLoading(false));
  };

  // --- ACTIONS ---

  const updateStatus = async (newStatus: string) => {
      if (!id) return;
      setIsUpdating(true);
      
      try {
          let notesUpdate = undefined;

          // If marking delivered, check for proof
          if (newStatus === 'Delivered' && order?.status !== 'Delivered' && proofFile) {
               try {
                  const url = await api.uploadImage(proofFile);
                  const currentNotes = order?.notes || '';
                  notesUpdate = `${currentNotes}\n\n[Proof]: ${url}`.trim();
               } catch (e) {
                   throw new Error("Failed to upload proof image.");
               }
          }

          await api.adminUpdateOrder(id, { 
              status: newStatus,
              trackingNumber: trackingInput,
              notes: notesUpdate
          });

          await refreshOrders();
          await refreshData();
          showToast(`Order marked as ${newStatus}`, 'success');
          fetchDetails();
      } catch (e: any) {
          showToast(e.message || "Failed to update", "error");
      } finally {
          setIsUpdating(false);
      }
  };

  const markProcessing = () => updateStatus('Processing');
  const markShipped = () => {
      if (!trackingInput) return showToast("Please enter a Tracking Number first.", "error");
      updateStatus('Shipped');
  };
  const markDelivered = () => {
      if (!proofFile && order?.status !== 'Delivered') return showToast("Please upload a proof of delivery image.", "error");
      updateStatus('Delivered');
  };

  const handleRefund = async () => {
    if (!id || !window.confirm("Are you sure? This will issue a FULL refund via PayPal and cancel the order.")) return;
    setIsRefunding(true);
    try {
      await api.issueFullRefund(id);
      showToast("Refund issued and order cancelled.", "success");
      fetchDetails();
    } catch (e: any) {
      showToast(e.message || "Refund failed", "error");
    } finally {
      setIsRefunding(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="p-20 text-center text-lg">Order not found.</div>;

  const isPaid = order.paymentStatus === 'paid';
  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status) === -1 ? 0 : steps.indexOf(order.status);
  
  // Extract proof from notes
  const proofUrlMatch = order.notes?.match(/\[Proof\]: (https?:\/\/[^\s]+)/);
  const existingProofUrl = proofUrlMatch ? proofUrlMatch[1] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative">
      <InvoiceTemplate order={order} settings={settings} />

      {/* 1. Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
         <div>
            <button onClick={() => navigate('/admin/orders')} className="text-sm font-bold text-slate-500 hover:text-brand-dark flex items-center gap-2 mb-2">
                &larr; Back to Order Registry
            </button>
            <h1 className="text-4xl font-serif font-bold text-slate-900">Order #{order.orderNumber}</h1>
            <p className="text-slate-500 text-sm mt-1">Placed on {formatDate(order.createdAt)} at {new Date(order.createdAt).toLocaleTimeString()}</p>
         </div>
         <div className="flex gap-3">
             {order.status !== 'Cancelled' && order.status !== 'Refunded' && (
                 <Button variant="outline" onClick={() => window.print()} className="bg-white border-slate-300">
                    Print Invoice / Receipt
                 </Button>
             )}
             {(order.status === 'Cancelled' || order.status === 'Refunded') && (
                 <span className="bg-red-100 text-red-800 px-6 py-2 rounded-xl font-bold border border-red-200">
                    ORDER IS {order.status.toUpperCase()}
                 </span>
             )}
         </div>
      </div>

      {/* 2. Visual Progress Stepper */}
      {order.status !== 'Cancelled' && order.status !== 'Refunded' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm no-print">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Order Progress</h3>
            <div className="relative flex justify-between items-center">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-green -z-0 transition-all duration-500" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>

                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-colors ${
                                isCompleted ? 'bg-brand-green border-brand-green text-white' : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                                {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span className={`text-xs font-bold ${isCurrent ? 'text-brand-dark' : 'text-slate-400'}`}>{step}</span>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        
        {/* LEFT COLUMN: Main Order Info */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* NEXT ACTION CARD (Dynamic) */}
            {order.status !== 'Cancelled' && order.status !== 'Refunded' && (
                <div className="bg-brand-light/20 border-2 border-brand-green/20 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        What to do next?
                    </h2>
                    
                    {order.status === 'Pending' && (
                        <div className="flex flex-col gap-3">
                            <p className="text-slate-600">This order is new. Review the items and confirm stock availability.</p>
                            <Button onClick={markProcessing} isLoading={isUpdating} className="w-full h-12 text-base shadow-xl">
                                Confirm & Mark as Processing
                            </Button>
                        </div>
                    )}

                    {order.status === 'Processing' && (
                        <div className="flex flex-col gap-4">
                            <p className="text-slate-600">The order is packed. Please arrange shipping and enter the tracking number below.</p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tracking Number</label>
                                <input 
                                    type="text" 
                                    value={trackingInput} 
                                    onChange={(e) => setTrackingInput(e.target.value)} 
                                    placeholder="e.g. GB123456789" 
                                    className="w-full border-2 border-slate-300 rounded-xl p-3 font-mono text-lg text-slate-900 focus:border-brand-green outline-none"
                                />
                            </div>
                            <Button onClick={markShipped} isLoading={isUpdating} className="w-full h-12 text-base shadow-xl" disabled={!trackingInput}>
                                Mark as Shipped
                            </Button>
                        </div>
                    )}

                    {order.status === 'Shipped' && (
                        <div className="flex flex-col gap-4">
                            <p className="text-slate-600">The order is with the courier. Once delivered, upload proof here.</p>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Delivery Proof</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-light file:text-brand-dark hover:file:bg-brand-green/20"
                                />
                            </div>
                            <Button onClick={markDelivered} isLoading={isUpdating} className="w-full h-12 text-base shadow-xl" disabled={!proofFile}>
                                Mark as Delivered
                            </Button>
                        </div>
                    )}

                    {order.status === 'Delivered' && (
                         <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="font-bold">Order completed successfully.</span>
                         </div>
                    )}
                </div>
            )}

            {/* ORDER ITEMS CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Items Ordered</h3>
                <div className="space-y-6">
                    {order.products.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                                <div className="flex gap-4 mt-1 text-sm text-slate-500">
                                    <span>Size: <strong className="text-slate-800">{item.size}</strong></span>
                                    <span>Color: <strong className="text-slate-800">{item.selectedColor || 'N/A'}</strong></span>
                                    <span>Qty: <strong className="text-slate-800">{item.quantity}</strong></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-slate-900">£{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2 text-right">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>£{(order.subtotal || order.total).toFixed(2)}</span>
                    </div>
                    {order.shippingCost ? (
                        <div className="flex justify-between text-slate-500">
                            <span>Shipping</span>
                            <span>£{order.shippingCost.toFixed(2)}</span>
                        </div>
                    ) : null}
                    <div className="flex justify-between text-xl font-bold text-slate-900 mt-2">
                        <span>Total</span>
                        <span>£{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN: Customer & Meta Info */}
        <div className="space-y-8">
            
            {/* PAYMENT STATUS CARD */}
            <div className={`rounded-2xl p-6 border-2 ${isPaid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${isPaid ? 'text-green-800' : 'text-red-800'}`}>Payment Status</h3>
                <div className="flex items-center gap-3">
                    <span className={`text-3xl font-black ${isPaid ? 'text-green-700' : 'text-red-700'}`}>
                        {isPaid ? 'PAID' : 'UNPAID'}
                    </span>
                    {isPaid && (
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                </div>
                <p className="text-sm mt-2 opacity-80">
                    Method: {order.paymentIntentId ? 'PayPal' : 'Manual / Other'}
                </p>
                {isPaid && !['Cancelled', 'Refunded'].includes(order.status) && (
                    <button 
                        onClick={handleRefund} 
                        disabled={isRefunding}
                        className="mt-4 w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50"
                    >
                        {isRefunding ? 'Processing Refund...' : 'Refund & Cancel Order'}
                    </button>
                )}
            </div>

            {/* CUSTOMER DETAILS CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Customer Info</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Name</p>
                        <p className="text-base font-medium text-slate-900">{order.customerName || 'Guest'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                        <a href={`mailto:${order.customerEmail}`} className="text-base font-medium text-brand-green hover:underline break-all">{order.customerEmail}</a>
                    </div>
                    {order.shippingAddress?.phone && (
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                            <p className="text-base font-medium text-slate-900">{order.shippingAddress.phone}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DELIVERY ADDRESS CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Delivery Address</h3>
                {order.shippingAddress ? (
                    <div className="text-base text-slate-700 leading-relaxed">
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{order.shippingAddress.city}</p>
                        <p>{order.shippingAddress.postcode}</p>
                        <p className="font-bold mt-2">{order.shippingAddress.country}</p>
                    </div>
                ) : (
                    <p className="text-slate-400 italic">No address provided.</p>
                )}
                
                {/* Proof Display if Delivered */}
                {existingProofUrl && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-green-600 uppercase mb-2">Delivery Proof</p>
                        <a href={existingProofUrl} target="_blank" rel="noreferrer">
                            <img src={existingProofUrl} alt="Proof" className="w-full h-auto rounded-lg border border-slate-200 hover:opacity-90 transition-opacity" />
                        </a>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};
