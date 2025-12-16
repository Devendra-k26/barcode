# ngrok Setup for iOS Testing

This guide will help you expose your local Next.js development server over HTTPS using ngrok, which is required for camera access on iOS devices.

## Quick Start

### Option 1: Manual Setup (Recommended)

1. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`

2. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL:**
   - ngrok will display a forwarding URL like: `https://abc123.ngrok-free.app`
   - Copy this HTTPS URL (not the HTTP one)

4. **Access on iOS:**
   - Open Safari on your iOS device
   - Navigate to the HTTPS ngrok URL
   - Grant camera permissions when prompted
   - Test the barcode scanner

### Option 2: Using ngrok with Custom Domain (Optional)

If you have an ngrok account, you can use a custom domain:

```bash
ngrok http 3000 --domain=your-custom-domain.ngrok-free.app
```

## Important Notes

- **HTTPS Required**: iOS Safari requires HTTPS for camera access
- **Keep Both Running**: Keep both `npm run dev` and `ngrok` running while testing
- **URL Changes**: Free ngrok URLs change each time you restart ngrok (unless using a paid plan)
- **Safari Only**: Use Safari on iOS, not Chrome or other browsers

## Troubleshooting

### Camera Still Not Working?

1. **Check ngrok URL**: Make sure you're using the HTTPS URL (starts with `https://`)
2. **Clear Safari Cache**: Settings > Safari > Clear History and Website Data
3. **Check Permissions**: Settings > Safari > Camera (should be enabled)
4. **Restart ngrok**: Stop and restart ngrok if the connection seems stale

### ngrok Not Starting?

- Make sure port 3000 is not already in use
- Check if you have an ngrok account (free accounts work fine)
- Try: `ngrok http 3000 --log=stdout` for detailed logs

## Alternative: Use ngrok Dashboard

1. Visit: https://dashboard.ngrok.com/
2. Get your authtoken
3. Run: `ngrok config add-authtoken YOUR_TOKEN`
4. Then run: `ngrok http 3000`

