'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';

export default function BookList() {
  const { books } = useInventory();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Available Books ({books.length})
      </h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {books.map((book) => (
          <div
            key={book.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {book.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Barcode: {book.barcode}
              </p>
            </div>
            <div className="ml-4 text-right">
              <p className="text-sm font-medium text-gray-900">
                ${book.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

