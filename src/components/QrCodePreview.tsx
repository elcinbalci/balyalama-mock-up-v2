import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function QrCodePreview({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!value) return;
    QRCode.toCanvas(canvasRef.current, value, { width: 120, margin: 1 }).catch(() => {});
  }, [value]);

  if (!value) return null;

  return <canvas ref={canvasRef} className="qr-code-canvas" />;
}

export default QrCodePreview;
