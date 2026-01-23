import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart, user } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (!user) {
      showToast("Please sign in to proceed to checkout", 'info');
      // Pass the intended destination (Checkout) so Login page can redirect back
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
        <EmptyState 
          title="Your cart is empty"
          description="Looks like you haven't added any items to your cart yet."
          actionLabel="Start Shopping"
          actionLink="/shop"
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif mb-8">Shopping Cart</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {cart.map((item) => (
            <li key={`${item.id}-${item.selectedSize}-${item.selectedColor || 'none'}`} className="px-4 py-4 sm:px-6 flex items-center animate-fade-in">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover object-center" />
              </div>
              <div className="ml-4 flex-1 flex flex-col sm:flex-row sm:justify-between">
                <div>
                   <h3 className="text-lg font-medium text-gray-900 hover:text-brand-green transition"><Link to={`/product/${item.id}`}>{item.title}</Link></h3>
                   <div className="text-sm text-gray-500 mt-1 space-x-2">
                     <span>Size: {item.selectedSize}</span>
                     {item.selectedColor && (
                        <>
                          <span>|</span>
                          <span>Color: {item.selectedColor}</span>
                        </>
                     )}
                     <span>|</span>
                     <span>Qty: {item.quantity}</span>
                   </div>
                </div>
                <div className="mt-2 sm:mt-0 flex flex-col items-end">
                   <p className="text-lg font-medium text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                   <button 
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    className="text-sm text-red-600 hover:text-red-800 mt-1 focus:outline-none underline"
                   >
                     Remove
                   </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 gap-4">
           <button onClick={clearCart} className="text-sm text-gray-600 hover:text-gray-900 underline focus:outline-none">Clear Cart</button>
           <div className="text-right w-full sm:w-auto">
              <p className="text-lg font-bold mb-4">Subtotal: £{subtotal.toFixed(2)}</p>
              <Button onClick={handleCheckout} variant="primary">
                Proceed to Checkout
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};