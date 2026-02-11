
import React, { useMemo } from 'react';
import { Order, AppSettings } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface InvoiceTemplateProps {
  order: Order;
  settings: AppSettings;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, settings }) => {
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Safety: Calculate subtotal from items if the order record is missing it
  const derivedSubtotal = useMemo(() => {
    if (order.subtotal !== undefined && order.subtotal !== null) return order.subtotal;
    if (!order.products) return 0;
    return order.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [order]);

  const shipping = order.shippingCost || 0;
  const containerId = `invoice-${order.id || 'preview'}`;
  const taxRate = settings.taxRate || 0.20;

  // Determine status color/text
  const isPaid = order.paymentStatus === 'paid';
  const statusLabel = isPaid ? 'PAID' : (order.status === 'Cancelled' ? 'VOID' : 'DUE');
  const statusColor = isPaid ? 'border-green-600 text-green-600' : (order.status === 'Cancelled' ? 'border-slate-400 text-slate-400' : 'border-red-600 text-red-600');

  // Simple QR placeholder (In prod use a real QR lib, here using API)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://jamboapparels.com/order/${order.id}`)}`;

  return (
    <div 
      id={containerId} 
      className="invoice-container hidden print:flex flex-col bg-white text-slate-900 p-[10mm] font-sans max-w-[210mm] min-h-[297mm] mx-auto relative"
      aria-label={`Invoice for order ${order.orderNumber}`}
    >
      {/* 1. Header Section */}
      <header className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
         <div className="w-1/2 pr-8">
            {settings.logoImage ? (
                <img 
                    src={settings.logoImage} 
                    alt={settings.slogan || "Jambo Apparels Logo"} 
                    className="h-16 w-auto object-contain mb-4" 
                />
            ) : (
                <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">Jambo Apparels</h1>
            )}
            
            <div className="text-xs text-gray-600 leading-relaxed font-medium mt-4">
                <p className="font-bold text-slate-900">{settings.companyName || 'Jambo Apparels'}</p>
                <p className="whitespace-pre-line">{settings.contactAddress || '123 Scripture Lane, London, UK'}</p>
                <p>{settings.contactEmail || 'support@jamboapparels.com'}</p>
                <p>{settings.contactPhone}</p>
                {settings.registrationNumber && <p className="mt-1">Reg No: {settings.registrationNumber}</p>}
                {settings.vatNumber && <p>VAT No: {settings.vatNumber}</p>}
            </div>
         </div>

         <div className="w-1/2 text-right flex flex-col items-end">
            <h1 className="text-5xl font-black text-slate-200 tracking-tight mb-4 uppercase">Invoice</h1>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right text-sm">
                <span className="text-slate-500 font-bold">Invoice No:</span>
                <span className="font-mono font-bold text-slate-900">#{order.orderNumber}</span>
                
                <span className="text-slate-500 font-bold">Date:</span>
                <span className="text-slate-900">{invoiceDate}</span>
                
                <span className="text-slate-500 font-bold">Status:</span>
                <span className={`font-black uppercase ${isPaid ? 'text-green-700' : 'text-red-600'}`}>{order.paymentStatus || 'Pending'}</span>
            </div>

            {/* Payment Status Stamp */}
            <div className={`mt-6 border-4 ${statusColor} rounded-lg px-4 py-1 transform -rotate-12 opacity-80 select-none`}>
                <span className={`text-2xl font-black uppercase tracking-widest ${statusColor}`}>{statusLabel}</span>
            </div>
         </div>
      </header>

      {/* 2. Bill To / Ship To Grid */}
      <section className="grid grid-cols-2 gap-12 mb-12">
         <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">Bill To</h3>
            <div className="text-sm text-slate-800 leading-snug">
                <p className="font-bold text-base mb-1">{order.customerName || 'Guest Customer'}</p>
                {order.customerEmail && <p className="mb-1">{order.customerEmail}</p>}
                <p>{order.shippingAddress?.phone}</p>
            </div>
         </div>
         <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">Ship To</h3>
            <div className="text-sm text-slate-800 leading-snug">
                {order.shippingAddress ? (
                    <>
                        <p>{order.shippingAddress.address1}</p>
                        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                        <p>{[order.shippingAddress.city, order.shippingAddress.postcode].filter(Boolean).join(', ')}</p>
                        <p className="font-bold">{order.shippingAddress.country}</p>
                    </>
                ) : (
                    <p className="italic text-slate-400">Same as billing</p>
                )}
            </div>
         </div>
      </section>

      {/* 3. Items Table */}
      <section className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 bg-slate-50">
              <th className="py-3 pl-2 text-xs font-black uppercase tracking-widest text-slate-700 w-1/2">Description</th>
              <th className="py-3 text-xs font-black uppercase tracking-widest text-slate-700 w-1/6">SKU / Size</th>
              <th className="py-3 text-center text-xs font-black uppercase tracking-widest text-slate-700 w-1/6">Qty</th>
              <th className="py-3 pr-2 text-right text-xs font-black uppercase tracking-widest text-slate-700 w-1/6">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.products?.map((item, idx) => (
              <tr key={`${item.productId}-${idx}`}>
                <td className="py-3 pl-2 pr-4">
                  <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                </td>
                <td className="py-3 text-xs text-slate-600">
                    <span className="block font-mono text-[10px]">{item.productId.slice(0,8).toUpperCase()}</span>
                    <span className="block">{item.size} {item.selectedColor ? `/ ${item.selectedColor}` : ''}</span>
                </td>
                <td className="py-3 text-center text-slate-800 font-medium">{item.quantity}</td>
                <td className="py-3 pr-2 text-right text-slate-900 font-bold font-mono">
                    {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 4. Totals & Payment Info */}
      <section className="flex flex-row justify-between mb-8">
        {/* Left: Notes & Bank Info */}
        <div className="w-1/2 pr-8">
            <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">Payment Instructions</h4>
                {settings.paymentInstructions ? (
                    <div className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-200 font-mono">
                        {settings.paymentInstructions}
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 italic">Please pay via the online portal.</p>
                )}
                {settings.paymentTerms && (
                    <p className="text-xs font-bold text-slate-700 mt-2">Terms: {settings.paymentTerms}</p>
                )}
            </div>
            
            {order.notes && (
                <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase mb-1">Notes</h4>
                    <p className="text-xs text-slate-600 italic">"{order.notes}"</p>
                </div>
            )}
        </div>

        {/* Right: Totals */}
        <div className="w-5/12">
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Subtotal</span>
                <span className="font-mono text-slate-900 font-bold">{formatCurrency(derivedSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Shipping</span>
                <span className="font-mono text-slate-900">{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
            </div>
            {order.discountAmount ? (
                <div className="flex justify-between text-sm py-2 border-b border-slate-100 text-green-700">
                <span className="font-medium">Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                <span className="font-mono font-bold">-{formatCurrency(order.discountAmount)}</span>
                </div>
            ) : null}
            
            <div className="flex justify-between text-xs py-2 text-slate-400">
                <span>Includes VAT ({Math.round(taxRate * 100)}%)</span>
                <span>{formatCurrency(order.taxAmount || 0)}</span>
            </div>

            <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t-2 border-slate-800 mt-2">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
            </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto pt-8 border-t border-slate-200 flex items-center justify-between">
         <div className="text-xs text-slate-500 max-w-sm">
            <p className="font-bold text-slate-700 mb-1">Thank you for your business!</p>
            <p>For inquiries, please contact {settings.contactEmail} or call {settings.contactPhone}.</p>
            {settings.slogan && <p className="italic mt-1">"{settings.slogan}"</p>}
         </div>
         
         <div className="flex items-center gap-4">
             <div className="text-right text-[10px] text-slate-400 uppercase tracking-wider">
                 <p>Scan to view</p>
                 <p>order online</p>
             </div>
             <img src={qrUrl} alt="Order QR" className="w-16 h-16 border border-slate-200 p-1" />
         </div>
      </footer>
    </div>
  );
};
