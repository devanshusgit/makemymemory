"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X, ZoomIn } from "lucide-react";
import { cropImageToFile, type PixelCrop } from "@/lib/utils/cropImage";

interface Props {
  src: string;
  fileName: string;
  mimeType?: string;
  /** Set when `src` is a remote URL (e.g. an already-uploaded Cloudinary
   *  image) rather than a local blob: URL, so the crop canvas doesn't taint. */
  crossOrigin?: boolean;
  /** Original, uncropped file — offered as a one-click "skip crop" option. */
  originalFile?: File;
  /** Set while the caller is still doing something (e.g. uploading the
   *  cropped result) after onCropped fires — keeps the modal open + disabled. */
  busy?: boolean;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

export default function ImageCropModal({
  src, fileName, mimeType = "image/jpeg", crossOrigin, originalFile, busy, onCancel, onCropped,
}: Props) {
  const [crop, setCrop]     = useState({ x: 0, y: 0 });
  const [zoom, setZoom]     = useState(1);
  const [area, setArea]     = useState<PixelCrop | null>(null);
  const [working, setWorking] = useState(false);
  const isBusy = working || !!busy;

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    setWorking(true);
    try {
      const file = await cropImageToFile(src, area, fileName, mimeType, crossOrigin);
      onCropped(file);
    } catch {
      alert("Couldn't crop that image — try again.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-serif font-semibold text-stone-800">Crop image (1:1)</h3>
          <button type="button" onClick={onCancel} aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 text-stone-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative w-full h-80 bg-stone-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            objectFit="contain"
            mediaProps={crossOrigin ? { crossOrigin: "anonymous" } : {}}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="range" min={1} max={3} step={0.01} value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#C9A84C]"
              aria-label="Zoom"
            />
          </div>
          <p className="text-xs text-stone-400">Drag to reposition, use the slider to zoom. This becomes the square image customers see.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-500 hover:bg-stone-100 transition-colors">
              Cancel
            </button>
            {originalFile && (
              <button type="button" onClick={() => onCropped(originalFile)} disabled={isBusy}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-500 hover:bg-stone-100 transition-colors disabled:opacity-50">
                Use original
              </button>
            )}
            <button type="button" onClick={handleConfirm} disabled={isBusy || !area}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "#C9A84C" }}>
              {isBusy ? "Saving…" : "Use this crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
