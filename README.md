# Book Store Inventory System - Barcode Scanner POC

A Proof of Concept (POC) for a Book Store Inventory system with camera-based barcode scanning functionality.

## Features

- 📷 **Camera-based Barcode Scanning** - Scan book barcodes using your device's camera
- 🛒 **Shopping Cart** - Automatically add scanned books to cart
- ➕➖ **Quantity Controls** - Manual increment/decrement buttons for cart items
- 📱 **Mobile-Friendly** - Responsive design optimized for mobile devices
- 🔊 **Audio Feedback** - Beep sound on successful scan
- ⚡ **Debounce Protection** - Prevents duplicate scans of the same barcode
- 🚨 **Error Handling** - Clear error messages for invalid barcodes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Barcode Scanning**: html5-qrcode
- **State Management**: React Context API

## Project Structure

```
barcode/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── BarcodeScanner.tsx  # Camera scanner component
│   │   ├── Cart.tsx            # Shopping cart container
│   │   ├── CartItem.tsx        # Individual cart item
│   │   ├── BookList.tsx        # Inventory display
│   │   └── ErrorMessage.tsx    # Error notification
│   ├── context/
│   │   ├── InventoryContext.tsx # Inventory state management
│   │   └── CartContext.tsx     # Cart state management
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── data/
│   │   └── inventory.json      # Sample book inventory
│   └── utils/
│       ├── debounce.ts         # Debounce utility
│       └── sound.ts            # Beep sound utility
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18.20.8 or higher
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd barcode
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Scanning Barcodes

1. Click the **"Start Scanner"** button
2. Allow camera permissions when prompted
3. Point your camera at a book's barcode
4. The system will automatically:
   - Detect the barcode
   - Look up the book in inventory
   - Add it to the cart (or increment quantity if already in cart)
   - Play a beep sound on success

### Managing Cart

- **Increase Quantity**: Click the **+** button on any cart item
- **Decrease Quantity**: Click the **-** button on any cart item
- **Remove Item**: Click the trash icon on any cart item
- **Clear Cart**: Click the "Clear" button in the cart header

### Viewing Inventory

- Click the **"Show Inventory"** button in the header to view all available books
- This is useful for reference and debugging

## Sample Inventory

The system comes with 15 sample books pre-loaded. Each book has:
- Unique ID
- Name
- Price
- Barcode (ISBN-13 format)

To add your own books, edit `src/data/inventory.json`.

## Testing with Real Barcodes

### Option 1: Use Barcode Generator
- Use an online barcode generator to create barcodes for the ISBNs in the inventory
- Print or display on another device
- Scan with the app

### Option 2: Use Barcode Scanner Apps
- Install a barcode scanner app on your phone
- Generate barcodes for the ISBNs in inventory
- Scan them using the app

### Option 3: Test with Real Books
- Use actual book barcodes (if they match the ISBNs in inventory)

## Important Notes

### Camera Access
- **HTTPS Required**: Camera access requires HTTPS in production
- **Localhost Exception**: HTTP works on localhost for development
- **Permissions**: Users must grant camera permissions

### Browser Compatibility
- Works best on modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers are fully supported
- Some older browsers may not support camera access

### Mobile Testing
- For mobile testing, you can:
  - Use `ngrok` or similar tool to expose localhost over HTTPS
  - Deploy to a hosting service (Vercel, Netlify, etc.)
  - Use your local network IP address (may have limitations)

## Troubleshooting

### Camera Not Working
- Ensure you've granted camera permissions
- Check if another application is using the camera
- Try refreshing the page
- Check browser console for errors

### Barcode Not Found
- Verify the barcode matches an ISBN in `src/data/inventory.json`
- Ensure the barcode is clearly visible and well-lit
- Try scanning from different angles

### Build Errors
- Ensure Node.js version is 18.20.8 or higher
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check TypeScript errors in the console

## Future Enhancements

Potential improvements for production:
- Backend API integration
- Database for inventory management
- User authentication
- Payment processing
- Order history
- Inventory management dashboard
- Multiple barcode format support
- Batch scanning mode

## License

This is a POC project for demonstration purposes.
