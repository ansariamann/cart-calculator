import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannedItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onItemScanned: (item: ScannedItem) => void;
}

export const CameraScanner = ({ isOpen, onClose, onItemScanned }: CameraScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stopScanner = async () => {
    if (scannerRef.current && (scannerRef.current.isScanning || isScanning)) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore stop errors, it might have already been stopped
      }
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  useEffect(() => {
    let mounted = true;

    const startBarcodeScanner = async () => {
      if (!isOpen || scannerRef.current) return;

      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!mounted || !isOpen) return;

      try {
        const scanner = new Html5Qrcode('barcode-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          async (decodedText) => {
            if (isLoading) return;

            setIsLoading(true);
            toast.success(`Barcode found: ${decodedText}`);
            
            // Stop scanning immediately
            await stopScanner();

            try {
              const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
              const data = await response.json();

              if (data.status === 1 && data.product) {
                const product = data.product;
                onItemScanned({
                  name: product.product_name || `Product ${decodedText.slice(-6)}`,
                  price: 1, // Default price
                  quantity: 1,
                  category: product.categories?.split(',')[0]?.trim() || 'Scanned',
                });
                toast.success(`Added: ${product.product_name}`);
              } else {
                toast.error('Product not found in database.');
                onItemScanned({
                  name: `Product ${decodedText.slice(-6)}`,
                  price: 1,
                  quantity: 1,
                  category: 'Scanned',
                });
              }
            } catch (apiError) {
              console.error('API error:', apiError);
              toast.error('Failed to fetch product data.');
            } finally {
              handleClose();
            }
          },
          () => {} // Ignore scan failures
        );
        
        if (mounted) {
          setIsScanning(true);
        }
      } catch (error) {
        console.error('Barcode scanner error:', error);
        toast.error('Could not access camera. Please allow camera permission.');
        if (mounted) {
          handleClose();
        }
      }
    };

    if (isOpen) {
      startBarcodeScanner();
    }

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-6"
      style={{ zIndex: 99999 }}
    >
      <div className="relative w-full max-w-sm">
        <button
          type="button"
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-20"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="relative w-full rounded-2xl overflow-hidden">
          <div id="barcode-reader" className="w-full" />
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
              <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
              <p className="text-white font-semibold">Fetching product data...</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-white/70 text-sm">
        Point camera at a barcode
      </p>
    </div>,
    document.body
  );
};
