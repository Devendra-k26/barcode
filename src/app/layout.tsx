import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { InventoryProvider } from "@/context/InventoryContext";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Book Store Inventory - Barcode Scanner",
  description: "POC for Book Store Inventory system with barcode scanning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <InventoryProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </InventoryProvider>
      </body>
    </html>
  );
}
