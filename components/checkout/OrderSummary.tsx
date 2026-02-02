
import React from 'react';
import { CartItem, ShippingAddress, DiscountCode } from '../../types';

interface OrderSummaryProps {
  cart: CartItem[];
  cartTotal: number;
  shippingCost: number;
  discountAmount: number;
  taxAmount: number;
  taxRate: number;
  finalTotal: number;
  activeDiscount: DiscountCode | null;
  address: ShippingAddress;
  orderNotes: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  cartTotal,
  shippingCost,
  discountAmount,
  taxAmount,
  taxRate,
  finalTotal,
  activeDiscount,
  address,
  orderNotes
}) => {
  return (
    <>
      <h2 className="text-2xl font-serif font-bold text-brand-dark mb-6">Order Summary</h2>
      
      {/* Items List */}
      <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar mb-6">
        <ul className="divide-y divide-gray-100">
          {cart.map(item => (
            <li key={`${item.id}-${item.selectedSize}`} className="py-4 flex gap-4">
              <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-50">
                <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-grow flex flex-col justify-center">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">Size: {item.selectedSize} {item.selectedColor ? `| ${item.selectedColor}` : ''}</p>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-xs font-medium text-gray-400">Qty: {item.quantity}</span>
                  <span className="text-sm font-bold text-brand-dark">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Live Preview Block */}
      {(address.address1 || address.city || orderNotes) && (
        <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200 mb-6 animate-fade-in transition-all">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Shipping To
          </h3>
          
          {address.address1 ? (
            <div className="text-sm text-slate-700 font-medium leading-snug">
              <p>{address.address1}</p>
              {address.address2 && <p>{address.address2}</p>}
              <p>{[address.city, address.postcode].filter(Boolean).join(', ')}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-1 font-bold">{address.country}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Enter address details...</p>
          )}

          {orderNotes && (
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instruction</p>
              <p className="text-xs text-slate-600 italic leading-relaxed">"{orderNotes}"</p>
            </div>
          )}
        </div>
      )}

      {/* Financials */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex justify-between text-gray-600 font-light">
          <span>Subtotal</span>
          <span>£{cartTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600 font-light items-center">
          <span className="flex items-center gap-1.5">
            Shipping
            {shippingCost === 0 && <span className="bg-green-50 text-green-700 text-[10px] font-bold px-1.5 rounded-full">FREE</span>}
          </span>
          <span>{shippingCost === 0 ? '£0.00' : `£${shippingCost.toFixed(2)}`}</span>
        </div>

        {activeDiscount && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount ({activeDiscount.code})</span>
            <span>-£{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-400 font-light">
          <span>Estimated Tax ({(taxRate * 100).toFixed(0)}%)</span>
          <span>£{taxAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-xl font-bold text-brand-dark pt-4 border-t border-gray-100 mt-4">
          <span>Total</span>
          <span>£{finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
};
