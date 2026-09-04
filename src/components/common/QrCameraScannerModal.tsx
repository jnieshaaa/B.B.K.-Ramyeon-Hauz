import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import type { Html5QrcodeCameraScanConfig } from 'html5-qrcode';

interface QrCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QrCameraScannerModal({
  isOpen,
  onClose,
  onScanSuccess
}: QrCameraScannerModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 pleasant high beep
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // AudioContext blocked or not allowed
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const scannerId = 'pos-qr-reader-view';

    const startScanner = async () => {
      setErrorMessage(null);
      setIsScanning(true);

      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const config: Html5QrcodeCameraScanConfig = {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrEdge = Math.max(180, Math.floor(minEdge * 0.72));
            return { width: qrEdge, height: qrEdge };
          },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            playBeep();
            if (navigator.vibrate) {
              try {
                navigator.vibrate([80, 40, 80]);
              } catch {}
            }

            // Stop scanner and notify parent
            html5QrCode.stop().then(() => {
              html5QrCode.clear();
              scannerRef.current = null;
              onScanSuccess(decodedText);
              onClose();
            }).catch(() => {
              onScanSuccess(decodedText);
              onClose();
            });
          },
          () => {
            // Frame scan in progress, ignore routine non-detection ticks
          }
        );

        // Check if torch is supported
        try {
          // @ts-ignore
          const capabilities = html5QrCode.getRunningTrackCameraCapabilities?.();
          if (capabilities && capabilities.torchFeature?.().isSupported()) {
            setHasTorch(true);
          }
        } catch {}
      } catch (err: any) {
        console.error('Camera QR Scan start error:', err);
        if (isMounted) {
          setIsScanning(false);
          const msg = err?.message || String(err);
          if (msg.includes('NotAllowedError') || msg.includes('Permission denied')) {
            setErrorMessage('Camera access was denied. Please allow camera permissions in your browser settings, or use the file upload option below.');
          } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
            setErrorMessage('No camera found on this device. You can upload an image of the receipt instead.');
          } else {
            setErrorMessage(`Could not open camera (${msg}). Try using the upload image option below.`);
          }
        }
      }
    };

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          }).catch(() => {
            scannerRef.current = null;
          });
        } catch {
          scannerRef.current = null;
        }
      }
    };
  }, [isOpen]);

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextState = !isTorchOn;
      // @ts-ignore
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as any]
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('pos-qr-file-dummy');
      const decodedText = await html5QrCode.scanFile(file, true);
      playBeep();
      onScanSuccess(decodedText);
      onClose();
    } catch (err) {
      alert('Could not detect a valid QR code in that image. Please make sure the QR code is clearly visible and well-lit.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D65113] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-black m-0 leading-tight">Live Camera QR Scanner</h3>
              <p className="text-[11px] text-slate-300 m-0 leading-tight">Point camera at customer receipt</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl border-none cursor-pointer transition-colors ${
                  isTorchOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title="Toggle Flashlight"
              >
                🔦
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-transparent border-none p-1 text-xl font-bold cursor-pointer transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Viewfinder Container */}
        <div className="p-4 flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden min-h-[300px]">
          
          {/* Target Box Overlay */}
          <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
            <div id="pos-qr-reader-view" className="w-full h-full [&_video]:object-cover" />
            
            {/* Animated Laser Scanning Line */}
            {isScanning && !errorMessage && (
              <div className="pointer-events-none absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#D65113] to-transparent shadow-[0_0_12px_#D65113] animate-pulse" />
            )}
          </div>

          {/* Error / Permission Fallback */}
          {errorMessage && (
            <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center gap-3 z-20">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
                ⚠️
              </div>
              <h4 className="text-sm font-bold text-white m-0">Camera Unavailable</h4>
              <p className="text-xs text-slate-300 m-0 leading-relaxed max-w-xs">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Hidden dummy element for image decoding */}
        <div id="pos-qr-file-dummy" className="hidden" />

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2.5">
          <p className="text-center text-[11px] text-slate-400 font-semibold m-0">
            Center the receipt QR code in frame • Auto-detects instantly
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors border-none cursor-pointer text-center"
            >
              Close
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

      </div>
    </div>
  );
}
