export interface Book {
  id: string;
  name: string;
  price: number;
  barcode: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface InventoryContextType {
  books: Book[];
  findBookByBarcode: (barcode: string) => Book | undefined;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (book: Book) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  removeFromCart: (bookId: string) => void;
  getCartTotal: () => number;
  clearCart: () => void;
}

