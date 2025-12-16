'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import BarcodeScanner from '@/components/BarcodeScanner';
import Cart from '@/components/Cart';
import ErrorMessage from '@/components/ErrorMessage';
import BookList from '@/components/BookList';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function BookStoreContent() {
  const { findBookByBarcode } = useInventory();
  const { addToCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState(false);

  const handleScan = (barcode: string) => {
    const book = findBookByBarcode(barcode);
    if (book) {
      addToCart(book);
      setError(null);
    } else {
      setError(`Book with barcode "${barcode}" not found in inventory.`);
    }
  };

  const handleScannerError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Book Store Inventory
            </h1>
            <div className="flex items-center gap-3">
              <Link
                href="/manual"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Manual Entry
              </Link>
              <button
                onClick={() => setShowInventory(!showInventory)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {showInventory ? 'Hide' : 'Show'} Inventory
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Scanner and Inventory */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <ErrorBoundary>
              <BarcodeScanner
                onScan={handleScan}
                onError={handleScannerError}
              />
            </ErrorBoundary>
            {showInventory && <BookList />}
          </div>

          {/* Right Column - Cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 sm:top-6">
              <Cart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return <BookStoreContent />;
}
