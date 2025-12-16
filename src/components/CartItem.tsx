'use client';

import React from 'react';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const subtotal = item.book.price * item.quantity;

  const handleDecrease = () => {
    updateQuantity(item.book.id, item.quantity - 1);
  };

  const handleIncrease = () => {
    updateQuantity(item.book.id, item.quantity + 1);
  };

  const handleRemove = () => {
    removeFromCart(item.book.id);
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-3 sm:py-4 px-2 sm:px-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0 pr-2">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
          {item.book.name}
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          ${item.book.price.toFixed(2)} each
        </p>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 ml-2">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={handleDecrease}
            className="px-2 sm:px-3 py-1 text-base sm:text-lg font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium text-gray-900 min-w-[2.5rem] sm:min-w-[3rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="px-2 sm:px-3 py-1 text-base sm:text-lg font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        
        <div className="text-right min-w-[4rem] sm:min-w-[5rem]">
          <p className="text-xs sm:text-sm font-semibold text-gray-900">
            ${subtotal.toFixed(2)}
          </p>
        </div>
        
        <button
          onClick={handleRemove}
          className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors touch-manipulation"
          aria-label="Remove item"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

