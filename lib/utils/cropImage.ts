export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string, crossOrigin?: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Crops `src` to the pixel rectangle `crop` and returns the result as a File,
 * ready to hand straight to the existing upload flow (which needs a named
 * File, not a bare Blob — see app/api/upload/route.ts's `if (!file.name)`).
 */
export async function cropImageToFile(
  src: string,
  crop: PixelCrop,
  fileName: string,
  mimeType: string = "image/jpeg",
  crossOrigin: boolean = false
): Promise<File> {
  const image = await loadImage(src, crossOrigin);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, canvas.width, canvas.height
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas is empty"))),
      mimeType,
      0.92
    );
  });

  return new File([blob], fileName, { type: mimeType });
}
