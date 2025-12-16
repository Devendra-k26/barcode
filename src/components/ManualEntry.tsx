'use client';

import React, { useState, FormEvent } from 'react';

interface ManualEntryProps {
  onScan: (barcode: string) => void;
}

export default function ManualEntry({ onScan }: ManualEntryProps) {
  const [barcode, setBarcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedBarcode = barcode.trim();
    
    if (!trimmedBarcode) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      onScan(trimmedBarcode);
      setBarcode('');
      setIsSubmitting(false);
    }, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Manual Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="barcode-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter Barcode / ISBN
          </label>
          <div className="flex gap-2">
            <input
              id="barcode-input"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g., 9780743273565"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!barcode.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Book'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Enter the barcode or ISBN number to add the book to your cart
          </p>
        </div>
      </form>
    </div>
  );
}

