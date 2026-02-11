
import React from 'react';
import { Order, AppSettings } from '../../types';

interface InvoiceTemplateProps {
  order: Order;
  settings: AppSettings;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, settings }) => {
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div id="invoice-container" className="hidden print:flex flex-col bg-white text-slate-900 p-12 font-sans max-w-[210mm] mx-auto min-h-screen relative">
      <header className="flex justify-between items-start mb-16">
        <div className="w-1/2">
           {settings.logoImage ? (
             <img 
               src={settings.logoImage} 
               alt="Jambo Apparels" 
               className="h-20 w-auto object-contain mb-6" 
             />
           ) : (
             <h1 className="text-2xl font-serif font-bold text-brand-dark mb-6">Jambo Apparels</h1>
           )}
           <div className="text-sm text-gray-500 leading-relaxed font-medium pl-1">
              <p>{settings.contactAddress || '123 Scripture Lane, London, UK'}</p>
              <p>{settings.contactEmail || 'support@jamboapparels.com'}</p>
              <p>{settings.contactPhone}</p>
           </div>
        </div>
        <div className="w-1/2 text-right">
           <h1 className="text-4xl font-light text-gray-300 uppercase tracking-[0.2em] mb-4">Invoice</h1>
           <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900"><span className="text-gray-400 font-normal mr-2">Order ID:</span>#{order.orderNumber || order.id.slice(0, 8)}</p>
              <p className="text-sm font-bold text-gray-900"><span className="text-gray-400 font-normal mr-2">Date:</span>{invoiceDate}</p>
           </div>
        </div>
      </header>

      <section className="mb-12">
         <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Bill To</h2>
         <div className="text-base text-gray-800 leading-relaxed">
            <p className="font-bold text-lg mb-1">{order.customerName || 'Guest Customer'}</p>
            {order.shippingAddress ? (
              <>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{[order.shippingAddress.city, order.shippingAddress.postcode].filter(Boolean).join(', ')}</p>
                <p className="font-semibold mt-1">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.phone}</p>}
              </>
            ) : (
              <p className="text-gray-400 italic">No shipping address provided</p>
            )}
            {order.customerEmail && <p className="text-sm text-gray-500 mt-2">{order.customerEmail}</p>}
         </div>
      </section>

      <section className="mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-900 w-1/2">Item</th>
              <th className="py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-900">Qty</th>
              <th className="py-4 text-right text-xs font-bold uppercase tracking-widest text-gray-900">Price</th>
              <th className="py-4 text-right text-xs font-bold uppercase tracking-widest text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.products.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 pr-4">
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Size: {item.size} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''}</p>
                </td>
                <td className="py-4 text-center text-gray-700 font-medium">{item.quantity}</td>
                <td className="py-4 text-right text-gray-700 font-mono text-sm">£{item.price.toFixed(2)}</td>
                <td className="py-4 text-right text-gray-900 font-bold font-mono text-sm">£{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex justify-end mb-8">
        <div className="w-full max-w-sm space-y-3">
          <div className="flex justify-between text-sm py-2 border-b border-gray-100">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="font-mono text-gray-900 font-bold">£{(order.subtotal || order.total - (order.shippingCost || 0)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-100">
            <span className="text-gray-500 font-medium">Shipping</span>
            <span className="font-mono text-gray-900 font-bold">£{(order.shippingCost || 0).toFixed(2)}</span>
          </div>
          {order.discountAmount ? (
            <div className="flex justify-between text-sm py-2 border-b border-gray-100 text-green-700">
              <span className="font-medium">Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
              <span className="font-mono font-bold">-£{order.discountAmount.toFixed(2)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-sm py-2 border-b border-gray-100">
             <span className="text-gray-500 font-medium">Tax (Included)</span>
             <span className="font-mono text-gray-900 font-bold">£{(order.taxAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t-2 border-gray-900 mt-2">
            <span>Total</span>
            <span className="font-mono">£{order.total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <div className="flex-grow"></div>

      <footer className="text-center text-xs text-gray-400 border-t border-gray-100 pt-8 pb-12 mt-auto w-full">
        <p className="font-medium text-gray-500 mb-2">Thank you for your support!</p>
        <p>If you have any questions about this invoice, please contact {settings.contactEmail}.</p>
        {settings.slogan && <p className="mt-2 font-serif italic text-gray-300">"{settings.slogan}"</p>}
      </footer>
    </div>
  );
};
