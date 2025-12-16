'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Book } from '@/types';
import { playSuccessSound } from '@/utils/sound';

interface BookListProps {
  onBookSelect?: (book: Book) => void;
}

export default function BookList({ onBookSelect }: BookListProps) {
  const { books } = useInventory();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const handleBookClick = (book: Book) => {
    setSelectedBookId(book.id);
    if (onBookSelect) {
      onBookSelect(book);
      playSuccessSound(); // Play success sound when book is added
    }
    // Reset selection after animation
    setTimeout(() => {
      setSelectedBookId(null);
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Available Books ({books.length})
      </h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => handleBookClick(book)}
            className={`flex items-center justify-between p-3 border rounded-md transition-all cursor-pointer ${
              selectedBookId === book.id
                ? 'border-green-500 bg-green-50 shadow-md scale-[1.02]'
                : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'
            }`}
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {book.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Barcode: {book.barcode}
              </p>
            </div>
            <div className="ml-4 flex items-center gap-3">
              <p className="text-sm font-medium text-gray-900">
                ${book.price.toFixed(2)}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookClick(book);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedBookId === book.id
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {selectedBookId === book.id ? '✓ Added' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500 text-center">
        Click on any book or use the "Add to Cart" button to add it to your cart
      </p>
    </div>
  );
}

