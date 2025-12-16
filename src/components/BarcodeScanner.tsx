'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BarcodeScanner } from 'react-barcode-scanner';
import 'react-barcode-scanner/polyfill';
import { playSuccessSound, playErrorSound } from '@/utils/sound';
import { debounce } from '@/utils/debounce';

interface BarcodeScannerProps {
  onScan: (barcode: string) => boolean; // Returns true if book found, false if not found
  onError?: (error: string) => void;
}

export default function BarcodeScannerComponent({ onScan, onError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false); // Start as false to match server render
  const [isMounted, setIsMounted] = useState(false); // Track if component is mounted
  const lastScannedRef = useRef<string>('');
  const scannerStartTimeRef = useRef<number>(0);
  const SCANNER_WARMUP_DELAY = 2000; // 2 seconds before accepting scans

  // Detect iOS - only on client side after mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && navigator) {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOSDevice(ios);
    }
  }, []);

  // Helper function for iOS detection (only used in callbacks, not render)
  const isIOS = useCallback(() => {
    return isIOSDevice;
  }, [isIOSDevice]);

  // Debounced scan handler to prevent duplicate scans
  const debouncedScan = useRef(
    debounce((barcode: string) => {
      // Ignore scans that happen too quickly after starting (likely false positives)
      const timeSinceStart = Date.now() - scannerStartTimeRef.current;
      if (timeSinceStart < SCANNER_WARMUP_DELAY) {
        console.log(`Ignoring early scan (${timeSinceStart}ms after start):`, barcode);
        return;
      }

      if (barcode !== lastScannedRef.current) {
        lastScannedRef.current = barcode;
        
        // Check if book exists (onScan returns true if found, false if not)
        const isValid = onScan(barcode);
        
        // Show visual feedback
        setScanResult(isValid ? 'success' : 'error');
        
        // Play appropriate sound
        if (isValid) {
          playSuccessSound();
        } else {
          playErrorSound();
        }
        
        // Reset scan result after 2 seconds
        setTimeout(() => {
          setScanResult(null);
          lastScannedRef.current = '';
        }, 2000);
      }
    }, 500)
  ).current;

  const handleCapture = useCallback((barcodes: any[]) => {
    console.log('Barcode detection event:', barcodes);
    if (barcodes && barcodes.length > 0) {
      // Get the first detected barcode
      const barcode = barcodes[0];
      console.log('Detected barcode object:', barcode);
      if (barcode) {
        // Try multiple possible properties for barcode value
        const barcodeValue = barcode.rawValue || barcode.value || barcode.data || barcode.code;
        console.log('Extracted barcode value:', barcodeValue);
        if (barcodeValue) {
          debouncedScan(barcodeValue);
        } else {
          console.warn('Barcode detected but no value found:', barcode);
        }
      }
    }
  }, [debouncedScan]);

  // Handle video errors
  const handleVideoError = useCallback((error: any) => {
    console.error('Barcode scanner video error:', error);
    setIsScanning(false);
    setHasPermission(false);
    
    let errorMessage = 'Failed to start camera. Please check permissions.';
    if (isIOS()) {
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Tap the "AA" icon in Safari address bar > Website Settings > Camera > Allow, then refresh the page.';
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Please ensure your device has a camera.';
      } else if (error?.message?.includes('HTTPS') || error?.message?.includes('secure context')) {
        errorMessage = 'Camera requires HTTPS. Make sure you are accessing via ngrok HTTPS URL (not HTTP).';
      } else if (error?.message?.includes('NotReadableError') || error?.message?.includes('could not start')) {
        errorMessage = 'Camera is in use by another app. Close other apps using the camera and try again.';
      } else {
        errorMessage = `Camera error: ${error?.message || error?.name || 'Unknown error'}. Try refreshing the page.`;
      }
    }
    
    setCameraError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  }, [isIOS, onError]);

  const handleToggle = useCallback(() => {
    if (isScanning) {
      setIsScanning(false);
      setHasPermission(null);
      setCameraError(null);
    } else {
      if (typeof window === 'undefined' || !navigator?.mediaDevices) {
        const errorMsg = 'Camera API not available. Please use a modern browser.';
        setCameraError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
        return;
      }
      
      scannerStartTimeRef.current = Date.now();
      setIsScanning(true);
      setHasPermission(null);
      setCameraError(null);
    }
  }, [isScanning, onError]);

  // Check Barcode Detection API support
  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
      // Check if BarcodeDetector API is available
      const hasBarcodeDetector = 'BarcodeDetector' in window;
      console.log('BarcodeDetector API available:', hasBarcodeDetector);
      
      if (isIOSDevice && !hasBarcodeDetector) {
        console.warn('iOS: BarcodeDetector API not available, relying on polyfill');
      }
      
      // Log supported formats if available
      if (hasBarcodeDetector && (window as any).BarcodeDetector) {
        (window as any).BarcodeDetector.getSupportedFormats?.().then((formats: string[]) => {
          console.log('Supported barcode formats:', formats);
        }).catch((err: any) => {
          console.log('Could not get supported formats:', err);
        });
      }
    }
  }, [isMounted, isIOSDevice]);

  // Monitor video element to detect successful camera start
  useEffect(() => {
    if (!isScanning) return;

    let checkInterval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    // Check for video element
    const checkVideo = () => {
      const video = document.querySelector('video');
      if (video) {
        // Video element exists
        if (video.readyState >= 2) {
          // Video is loaded and playing
          setHasPermission(true);
          setCameraError(null);
          if (checkInterval) clearInterval(checkInterval);
          if (timeout) clearTimeout(timeout);
          console.log('Camera video stream active');
        } else {
          // Wait for video to load
          video.addEventListener('loadedmetadata', () => {
            setHasPermission(true);
            setCameraError(null);
            if (checkInterval) clearInterval(checkInterval);
            if (timeout) clearTimeout(timeout);
            console.log('Camera video metadata loaded');
          }, { once: true });
        }
      }
    };

    // Start checking after a short delay
    checkInterval = setInterval(checkVideo, 200);
    
    // Timeout after 5 seconds
    timeout = setTimeout(() => {
      if (checkInterval) clearInterval(checkInterval);
      if (hasPermission === null) {
        // Still no video after 5 seconds - might be permission issue
        console.warn('Video element not found after 5 seconds');
      }
    }, 5000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isScanning, hasPermission]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Barcode Scanner</h2>
        <button
          onClick={handleToggle}
          disabled={hasPermission === false}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isScanning
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${hasPermission === false ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isScanning ? 'Stop Scanner' : 'Start Scanner'}
        </button>
      </div>

      {cameraError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{cameraError}</p>
        </div>
      )}

      {hasPermission === false && !cameraError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            {isIOSDevice 
              ? 'Camera permission denied. Go to Settings > Safari > Camera and allow access, then refresh the page.'
              : 'Camera permission denied. Please allow camera access to scan barcodes.'}
          </p>
        </div>
      )}

      {isMounted && isIOSDevice && !isScanning && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>iOS Device Detected:</strong> Make sure you're using Safari and the site is accessed over HTTPS (ngrok).
          </p>
        </div>
      )}
      
      {isMounted && isIOSDevice && isScanning && hasPermission && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>iOS Scanning Tips:</strong>
            <br />• Hold device steady, 6-12 inches from barcode
            <br />• Ensure good lighting (avoid glare)
            <br />• Align barcode within the green viewfinder box
            <br />• If not detecting, check browser console (Safari {'>'} Develop {'>'} Show JavaScript Console)
          </p>
        </div>
      )}

      <div className="w-full rounded-lg overflow-hidden min-h-[250px] sm:min-h-[300px] bg-black relative">
        {!isScanning ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <svg
                className="mx-auto h-16 w-16 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <p className="text-sm">Click "Start Scanner" to begin</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[250px] sm:min-h-[300px] relative">
            <BarcodeScanner
              onCapture={handleCapture}
              onError={handleVideoError}
              options={{
                formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'codabar', 'itf', 'qr_code'],
                // iOS-specific: Enable more aggressive detection
                ...(isIOSDevice && {
                  // Try to improve detection on iOS
                  tryHarder: true,
                }),
              }}
              trackConstraints={isIOSDevice ? {
                facingMode: { ideal: 'environment' },
                // iOS works better with lower resolution for faster processing
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
              } : {
                facingMode: 'environment',
              }}
              paused={false}
              className="w-full h-full object-cover"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                minHeight: '250px'
              }}
            />
            
            {/* Viewfinder Overlay Box */}
            {hasPermission && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className={`relative w-64 h-40 sm:w-80 sm:h-48 border-4 rounded-lg transition-all duration-300 ${
                    scanResult === 'success' 
                      ? 'border-green-500 bg-green-500 bg-opacity-20 shadow-lg shadow-green-500/50' 
                      : scanResult === 'error'
                      ? 'border-red-500 bg-red-500 bg-opacity-20 shadow-lg shadow-red-500/50'
                      : 'border-green-400 bg-transparent'
                  }`}
                  style={{
                    boxShadow: scanResult === 'success' 
                      ? '0 0 0 4px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.5)' 
                      : scanResult === 'error'
                      ? '0 0 0 4px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.5)'
                      : '0 0 0 4px rgba(74, 222, 128, 0.2)'
                  }}
                >
                  {/* Corner indicators */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  
                  {/* Success/Error Indicator */}
                  {scanResult && (
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      scanResult === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <div className={`bg-white rounded-full p-4 shadow-2xl transform transition-all duration-300 ${
                        scanResult === 'success' ? 'scale-100 animate-pulse' : 'scale-100 animate-bounce'
                      }`}>
                        {scanResult === 'success' ? (
                          <svg 
                            className="w-12 h-12 sm:w-16 sm:h-16" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={3} 
                              d="M5 13l4 4L19 7" 
                            />
                          </svg>
                        ) : (
                          <svg 
                            className="w-12 h-12 sm:w-16 sm:h-16" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={3} 
                              d="M6 18L18 6M6 6l12 12" 
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Starting camera...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isScanning && hasPermission && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600 text-center">
            Point your camera at a barcode to scan
          </p>
          {isMounted && isIOSDevice && (
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Hold steady, ensure good lighting, and align barcode within the green box
            </p>
          )}
        </div>
      )}
      
      {/* Debug info for iOS (only in development) */}
      {isMounted && process.env.NODE_ENV === 'development' && isScanning && isIOSDevice && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <p>iOS Debug: Scanner active | Permission: {hasPermission ? 'Granted' : 'Pending'}</p>
          <p>Check browser console for detection logs</p>
        </div>
      )}
    </div>
  );
}
