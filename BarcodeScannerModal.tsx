
import React, { useEffect, useRef, useState } from 'react';

interface Props { isOpen: boolean; onClose: () => void; onScan: (barcode: string) => void; }

const BarcodeScannerModal: React.FC<Props> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let stream: MediaStream | null = null;
    let interval: any = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        
        // @ts-ignore
        if ('BarcodeDetector' in window) {
          // @ts-ignore
          const detector = new window.BarcodeDetector({ formats: ['ean_13', 'code_128', 'qr_code', 'upc_a'] });
          interval = setInterval(async () => {
            if (videoRef.current) {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                onScan(barcodes[0].rawValue);
                onClose();
              }
            }
          }, 400);
        } else {
          setError("ماسح الباركود السريع غير مدعوم في هذا المتصفح. استخدم البحث اليدوي.");
        }
      } catch (e) { setError("فشل في تشغيل الكاميرا. يرجى إعطاء الإذن."); }
    };
    
    start();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-md">
      <div className="bg-white rounded-[40px] overflow-hidden w-full max-w-md shadow-2xl border border-white/20">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center font-black">
          <span className="flex items-center gap-2"><i className="fas fa-barcode text-blue-500"></i> ماسح الباركود</span>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl"><i className="fas fa-times"></i></button>
        </div>
        <div className="aspect-square bg-slate-950 relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-[40px] border-slate-950/60 pointer-events-none">
             <div className="w-full h-full border-2 border-blue-500 rounded-2xl relative shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 animate-pulse"></div>
             </div>
          </div>
        </div>
        {error && <p className="p-8 text-center text-rose-500 font-bold text-sm bg-rose-50">{error}</p>}
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
