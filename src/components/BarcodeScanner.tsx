'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { debounce } from '@/utils/debounce';
import { playBeep } from '@/utils/sound';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>('');
  const scannerIdRef = useRef<string>('qr-reader');
  const isMountedRef = useRef<boolean>(true);
  const errorHandlerRef = useRef<((event: ErrorEvent) => void) | null>(null);

  // Set up global error handlers to suppress removeChild errors from html5-qrcode
  useEffect(() => {
    // Handle synchronous errors
    errorHandlerRef.current = (event: ErrorEvent) => {
      // Suppress removeChild errors from html5-qrcode cleanup
      if (
        event.error?.name === 'NotFoundError' &&
        (event.error?.message?.includes('removeChild') ||
          event.message?.includes('removeChild'))
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Handle unhandled promise rejections
    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (
        error?.name === 'NotFoundError' &&
        (error?.message?.includes('removeChild') ||
          String(error)?.includes('removeChild'))
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', errorHandlerRef.current, true);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    // Patch Node.removeChild to suppress errors temporarily
    const originalRemoveChild = Node.prototype.removeChild;
    // Cast prototype to any to avoid TypeScript signature mismatch
    (Node.prototype as any).removeChild = function (this: Node, child: Node) {
      try {
        return originalRemoveChild.call(this, child);
      } catch (error: any) {
        if (
          error?.name === 'NotFoundError' &&
          error?.message?.includes('not a child')
        ) {
          // Silently ignore - node was already removed
          return child;
        }
        throw error;
      }
    };

    return () => {
      if (errorHandlerRef.current) {
        window.removeEventListener('error', errorHandlerRef.current, true);
      }
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      // Restore original removeChild
      Node.prototype.removeChild = originalRemoveChild;
    };
  }, []);

  // Debounced scan handler to prevent duplicate scans
  const debouncedScan = useRef(
    debounce((barcode: string) => {
      if (barcode !== lastScannedRef.current) {
        lastScannedRef.current = barcode;
        playBeep(); // Play beep sound on successful scan
        onScan(barcode);
        // Reset after 2 seconds to allow re-scanning the same barcode
        setTimeout(() => {
          lastScannedRef.current = '';
        }, 2000);
      }
    }, 500)
  ).current;

  // Detect iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode(scannerIdRef.current);
      scannerRef.current = scanner;

      if (isIOS()) {
        // iOS-specific approach: Use simpler configuration
        // Try multiple methods to get camera working on iOS
        
        // Method 1: Try with deviceId enumeration
        let cameraId: string | null = null;
        try {
          // Request permission first to get device labels
          const tempStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          const devices = await navigator.mediaDevices.enumerateDevices();
          tempStream.getTracks().forEach((track) => track.stop());
          
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          
          if (videoDevices.length > 1) {
            // Use the last device (usually back camera on iOS)
            cameraId = videoDevices[videoDevices.length - 1].deviceId;
          } else if (videoDevices.length === 1) {
            cameraId = videoDevices[0].deviceId;
          }
        } catch (e) {
          console.debug('Device enumeration failed:', e);
        }

        // Try starting with deviceId if available, otherwise use facingMode
        try {
          if (cameraId && cameraId !== 'default') {
            await scanner.start(
              cameraId,
              {
                fps: 5, // Lower FPS for iOS
                qrbox: function(viewfinderWidth, viewfinderHeight) {
                  // Use percentage-based sizing for iOS
                  const minEdgePercentage = 0.7;
                  const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                  const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
                  return {
                    width: qrboxSize,
                    height: qrboxSize
                  };
                },
                aspectRatio: 1.0,
                disableFlip: false,
              },
              (decodedText) => {
                debouncedScan(decodedText);
              },
              (errorMessage) => {
                // Ignore not found errors
              }
            );
          } else {
            // Fallback to facingMode
            await scanner.start(
              { facingMode: 'environment' },
              {
                fps: 5,
                qrbox: function(viewfinderWidth, viewfinderHeight) {
                  const minEdgePercentage = 0.7;
                  const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                  const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
                  return {
                    width: qrboxSize,
                    height: qrboxSize
                  };
                },
                aspectRatio: 1.0,
                disableFlip: false,
              },
              (decodedText) => {
                debouncedScan(decodedText);
              },
              (errorMessage) => {
                // Ignore not found errors
              }
            );
          }
          setHasPermission(true);
          setIsScanning(true);
          
          // iOS: Verify video element was created after a short delay
          setTimeout(() => {
            const element = document.getElementById(scannerIdRef.current);
            const video = element?.querySelector('video');
            if (!video && isIOS()) {
              console.warn('Video element not found after start on iOS - camera may not be visible');
            }
          }, 1000);
          
          return;
        } catch (iosError: any) {
          console.error('iOS camera start failed:', iosError);
          // Try one more time with absolute simplest config
          try {
            await scanner.start(
              { facingMode: 'environment' },
              {
                fps: 2,
                qrbox: { width: 250, height: 250 },
                disableFlip: false,
              },
              (decodedText) => {
                debouncedScan(decodedText);
              },
              () => {}
            );
            setHasPermission(true);
            setIsScanning(true);
            
            // Check again after fallback attempt
            setTimeout(() => {
              const element = document.getElementById(scannerIdRef.current);
              const video = element?.querySelector('video');
              if (!video && isIOS()) {
                console.warn('Video element still not found after fallback on iOS');
              }
            }, 1000);
            
            return;
          } catch (finalError: any) {
            throw finalError;
          }
        }
      }

      // Non-iOS: Use standard configuration
      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true });
      permissionStream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          debouncedScan(decodedText);
        },
        (errorMessage) => {
          // Ignore not found errors, they're expected
        }
      );

      setIsScanning(true);
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      setHasPermission(false);
      
      // Provide iOS-specific error messages
      let errorMessage = error.message || 'Failed to start camera. Please check permissions.';
      if (isIOS()) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in Safari settings (Settings > Safari > Camera).';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (error.message?.includes('HTTPS') || error.message?.includes('secure context')) {
          errorMessage = 'Camera requires HTTPS. Please access this site over HTTPS (not HTTP).';
        } else if (error.message?.includes('could not start') || error.message?.includes('NotReadableError')) {
          errorMessage = 'Could not start camera. Try: 1) Close other apps using camera 2) Refresh page 3) Restart Safari';
        } else {
          errorMessage = `Camera error on iOS: ${error.message || error.name}. Try refreshing the page.`;
        }
      }
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) {
      if (isMountedRef.current) {
        setIsScanning(false);
      }
      return;
    }

    const scanner = scannerRef.current;
    scannerRef.current = null; // Clear ref first to prevent re-entry

    // Use a flag to track if we should attempt cleanup
    let shouldCleanup = false;
    try {
      // Check if the DOM element still exists before stopping
      const element = document.getElementById(scannerIdRef.current);
      if (element && element.parentNode) {
        shouldCleanup = true;
      }
    } catch (e) {
      // Element doesn't exist or is being removed
      shouldCleanup = false;
    }

    if (shouldCleanup) {
      try {
        // Only call stop() - clear() causes DOM issues with React
        // Wrap in Promise to catch any synchronous errors too
        await Promise.resolve().then(() => scanner.stop());
      } catch (stopError: any) {
        // Completely ignore all stop errors - they're expected during cleanup
        // The error might be from internal DOM manipulation in html5-qrcode
      }
    }

    // Don't call clear() - it causes removeChild errors with React
    // The DOM will be cleaned up by React automatically

    if (isMountedRef.current) {
      setIsScanning(false);
    }
    lastScannedRef.current = '';
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scannerRef.current = null;
        
        // Use requestIdleCallback or setTimeout to defer cleanup
        // This ensures React has finished its DOM cleanup first
        const cleanup = () => {
          try {
            const element = document.getElementById(scannerIdRef.current);
            if (element && element.parentNode) {
              scanner.stop().catch(() => {
                // Silently ignore all errors
              });
            }
          } catch (e) {
            // Silently ignore all cleanup errors
          }
        };
        
        // Defer cleanup to next event loop tick
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(cleanup, { timeout: 100 });
        } else {
          setTimeout(cleanup, 0);
        }
      }
    };
  }, []);

  const handleToggle = () => {
    if (isScanning) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Barcode Scanner</h2>
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isScanning
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isScanning ? 'Stop Scanner' : 'Start Scanner'}
        </button>
      </div>

      {hasPermission === false && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Camera permission denied. Please allow camera access to scan barcodes.
          </p>
        </div>
      )}

      <div
        id={scannerIdRef.current}
        className={`w-full rounded-lg overflow-hidden ${
          isScanning ? 'min-h-[250px] sm:min-h-[300px] bg-gray-100' : 'min-h-[250px] sm:min-h-[300px] bg-gray-200 flex items-center justify-center'
        }`}
        style={isScanning && isIOS() ? { 
          position: 'relative',
          minHeight: '300px',
          backgroundColor: '#000'
        } : undefined}
      >
        {!isScanning && (
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
        )}
      </div>

      {isScanning && (
        <p className="mt-4 text-sm text-gray-600 text-center">
          Point your camera at a barcode to scan
        </p>
      )}
    </div>
  );
}

