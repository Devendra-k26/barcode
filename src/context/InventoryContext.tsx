'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { Book, InventoryContextType } from '@/types';
import inventoryData from '@/data/inventory.json';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const books = useMemo(() => inventoryData as Book[], []);

  const findBookByBarcode = (barcode: string): Book | undefined => {
    return books.find((book) => book.barcode === barcode);
  };

  const value: InventoryContextType = {
    books,
    findBookByBarcode,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

