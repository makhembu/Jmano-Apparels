import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../../../ui/Button';

interface ImageEditorModalProps {
  src: string;
  onSave: (blob: Blob) => void;
  onClose: () => void;
}

type CropMode = 'original' | '1:1' | '4:5' | '16:9';

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ src, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState<CropMode>('original');
  const [isSaving, setIsSaving] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set display size for canvas
    const container = canvas.parentElement;
    if(!container) return;
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    
    const imageAspect = image.naturalWidth / image.naturalHeight;
    let canvasWidth = containerWidth;
    let canvasHeight = containerWidth / imageAspect;

    if (canvasHeight > containerHeight) {
        canvasHeight = containerHeight;
        canvasWidth = canvasHeight * imageAspect;
    }
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();

    // Draw crop overlay
    if (cropMode !== 'original') {
        let targetAspect: number;
        if (cropMode === '1:1') targetAspect = 1;
        else if (cropMode === '4:5') targetAspect = 4 / 5;
        else targetAspect = 16 / 9;

        const canvasAspect = canvas.width / canvas.height;
        let cropWidth, cropHeight, cropX, cropY;

        if (canvasAspect > targetAspect) {
            cropHeight = canvas.height;
            cropWidth = cropHeight * targetAspect;
            cropY = 0;
            cropX = (canvas.width - cropWidth) / 2;
        } else {
            cropWidth = canvas.width;
            cropHeight = cropWidth / targetAspect;
            cropX = 0;
            cropY = (canvas.height - cropHeight) / 2;
        }

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    }

  }, [rotation, cropMode]);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = src;
    image.onload = () => {
      imageRef.current = image;
      draw();
    };
  }, [src, draw]);
  
  useEffect(() => {
    draw();
  }, [rotation, cropMode, draw]);

  const handleSave = async () => {
    if (!imageRef.current) return;
    setIsSaving(true);
    
    const image = imageRef.current;
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) return;

    let sx = 0, sy = 0, sWidth = image.naturalWidth, sHeight = image.naturalHeight;

    if (cropMode !== 'original') {
        const originalAspect = image.naturalWidth / image.naturalHeight;
        let targetAspect: number;
        if (cropMode === '1:1') targetAspect = 1;
        else if (cropMode === '4:5') targetAspect = 4 / 5;
        else targetAspect = 16 / 9;

        if (originalAspect > targetAspect) {
            sHeight = image.naturalHeight;
            sWidth = sHeight * targetAspect;
            sx = (image.naturalWidth - sWidth) / 2;
        } else {
            sWidth = image.naturalWidth;
            sHeight = sWidth / targetAspect;
            sy = (image.naturalHeight - sHeight) / 2;
        }
    }

    const rotated = rotation === 90 || rotation === 270;
    offscreenCanvas.width = rotated ? sHeight : sWidth;
    offscreenCanvas.height = rotated ? sWidth : sHeight;

    offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
    offscreenCtx.rotate(rotation * Math.PI / 180);

    const drawWidth = rotated ? sHeight : sWidth;
    const drawHeight = rotated ? sWidth : sHeight;
    
    offscreenCtx.drawImage(
        image,
        sx, sy, sWidth, sHeight,
        -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight
    );

    offscreenCanvas.toBlob((blob) => {
        if (blob) onSave(blob);
        setIsSaving(false);
    }, 'image/jpeg', 0.9);
  };

  const CropButton: React.FC<{ mode: CropMode, children: React.ReactNode }> = ({ mode, children }) => (
    <button
        onClick={() => setCropMode(mode)}
        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${cropMode === mode ? 'bg-brand-dark text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
    >{children}</button>
  );

  return (
    <div className="fixed inset-0 bg-brand-dark/80 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 font-serif text-lg">Edit Image</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">&times;</button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
                <div className="flex-1 bg-slate-100 flex items-center justify-center p-4 relative">
                    <canvas ref={canvasRef} className="max-w-full max-h-full" />
                </div>

                <div className="w-full md:w-64 border-l border-slate-200 p-6 space-y-8 overflow-y-auto">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Rotate</h4>
                        <div className="flex gap-2">
                           <Button variant="outline" onClick={() => setRotation(r => (r - 90 + 360) % 360)} className="flex-1">Left</Button>
                           <Button variant="outline" onClick={() => setRotation(r => (r + 90) % 360)} className="flex-1">Right</Button>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Crop Aspect</h4>
                        <div className="grid grid-cols-2 gap-2">
                           <CropButton mode="original">Original</CropButton>
                           <CropButton mode="1:1">Square</CropButton>
                           <CropButton mode="4:5">4:5</CropButton>
                           <CropButton mode="16:9">16:9</CropButton>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} isLoading={isSaving} className="shadow-lg shadow-brand-green/20">Apply & Save</Button>
            </div>
        </div>
    </div>
  );
};
