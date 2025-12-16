'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import CartItem from './CartItem';

export default function Cart() {
  const { cart, getCartTotal, clearCart } = useCart();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Shopping Cart</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Your cart is empty</p>
            <p className="text-xs text-gray-400 mt-1">
              Scan a barcode to add items
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col max-h-[calc(100vh-8rem)] sm:max-h-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Shopping Cart</h2>
        <button
          onClick={clearCart}
          className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
        >
          Clear
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 min-h-0">
        <div className="space-y-0">
          {cart.map((item) => (
            <CartItem key={item.book.id} item={item} />
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 text-right">
          {cart.length} item{cart.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

