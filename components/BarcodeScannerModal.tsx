
import React, { useEffect, useRef, useState } from 'react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    let detectionInterval: number | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Feature detection for BarcodeDetector
        if ('BarcodeDetector' in window) {
          // @ts-ignore
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'code_128', 'code_39']
          });

          const detect = async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  onScan(barcodes[0].rawValue);
                  stopCamera();
                  onClose();
                }
              } catch (e) {
                console.error("Detection error", e);
              }
            }
          };

          detectionInterval = window.setInterval(detect, 500);
        } else {
          setIsSupported(false);
          setError("BarcodeDetector API غير مدعوم في هذا المتصفح. يرجى إدخال الكود يدوياً.");
        }
      } catch (err) {
        setError("تعذر الوصول إلى الكاميرا. يرجى التحقق من الأذونات.");
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };

    startCamera();

    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
          <h3 className="text-lg font-bold">مسح الباركود</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="relative aspect-square bg-black overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-2 border-dashed border-blue-400 opacity-50 m-12 pointer-events-none"></div>
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white p-6 text-center">
              <div>
                <i className="fas fa-exclamation-triangle text-4xl mb-4 text-yellow-400"></i>
                <p>{error}</p>
                <button 
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-blue-600 rounded-full font-bold"
                >
                  حسناً
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 text-center">
          <p className="text-gray-600 text-sm">قم بتوجيه الكاميرا نحو الباركود بشكل مباشر</p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
