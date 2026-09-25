import { MAX_UPLOAD_BYTES } from "@/lib/utils/apiErrorMessage";

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Longest side of an uploaded product photo. The storefront never renders one
 * larger than ~1200px (and asks Cloudinary for smaller still), so anything
 * beyond this is bytes nobody sees.
 */
const MAX_DIMENSION = 1600;

/**
 * Target for the encoded file, kept under the route's own cap so a slightly
 * larger-than-expected encode still gets through.
 */
const BUDGET_BYTES = Math.floor(MAX_UPLOAD_BYTES * 0.8);

const JPEG_QUALITIES = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];

function loadImage(src: string, crossOrigin?: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = src;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas is empty"))),
      "image/jpeg",
      quality
    );
  });
}

function jpegName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") + ".jpg";
}

/**
 * Draws `source` into a canvas no larger than MAX_DIMENSION on its longest
 * side, on a white background.
 *
 * White matters: canvases start transparent, and JPEG has no alpha channel,
 * so a transparent PNG would otherwise come out with a black background.
 */
function drawScaled(
  source: CanvasImageSource,
  sx: number, sy: number, sw: number, sh: number
): HTMLCanvasElement {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return canvas;
}

/**
 * Encodes at the best quality that fits the budget, shrinking the canvas as a
 * last resort. Uploads used to fail outright here: the canvas was written at
 * the crop's full pixel size in the SOURCE file's type, and `quality` is
 * ignored for PNG because PNG is lossless — so cropping a phone or AI-
 * generated PNG produced a 10MB+ file and every upload was rejected as "too
 * large".
 */
async function encodeWithinBudget(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  let current = canvas;

  for (let attempt = 0; attempt < 4; attempt++) {
    for (const quality of JPEG_QUALITIES) {
      const blob = await toBlob(current, quality);
      if (blob.size <= BUDGET_BYTES) {
        return new File([blob], jpegName(fileName), { type: "image/jpeg" });
      }
    }

    // Still too big even at the lowest quality — halve the pixels and retry.
    const smaller = document.createElement("canvas");
    smaller.width = Math.max(1, Math.round(current.width * 0.7));
    smaller.height = Math.max(1, Math.round(current.height * 0.7));
    const ctx = smaller.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, smaller.width, smaller.height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(current, 0, 0, smaller.width, smaller.height);
    current = smaller;
  }

  const blob = await toBlob(current, 0.5);
  return new File([blob], jpegName(fileName), { type: "image/jpeg" });
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
  _mimeType: string = "image/jpeg",
  crossOrigin: boolean = false
): Promise<File> {
  const image = await loadImage(src, crossOrigin);
  const canvas = drawScaled(image, crop.x, crop.y, crop.width, crop.height);
  return encodeWithinBudget(canvas, fileName);
}

/**
 * Same treatment for a file the admin chose not to crop. Without this, "Use
 * original" handed the untouched file to the uploader and a large photo was
 * rejected by the server.
 */
/**
 * Get any photo ready for /api/upload. Option photos (frame type, layout,
 * font...) used to go up untouched, so an original phone photo (4-8MB) was
 * rejected as too large while a small WhatsApp-forwarded copy worked — which is
 * why the error hit one admin and not another.
 *
 * If the browser can't decode the file (an iPhone HEIC on Windows Chrome), the
 * original is sent as long as it fits; Cloudinary reads HEIC itself.
 */
export async function prepareImageForUpload(input: File): Promise<File> {
  // Windows often reports no type for .heic, and the upload route refuses untyped files.
  const file = !input.type && /\.(heic|heif)$/i.test(input.name)
    ? new File([input], input.name, { type: "image/heic" })
    : input;
  try {
    return await compressImageFile(file);
  } catch {
    if (file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error(
      `${file.name} is ${(file.size / (1024 * 1024)).toFixed(1)}MB and couldn't be shrunk in this browser. ` +
      `Save it as a JPG (or send it to yourself on WhatsApp) and upload that.`
    );
  }
}

export async function compressImageFile(file: File): Promise<File> {
  // Nothing to gain from re-encoding something already small enough.
  if (file.size <= BUDGET_BYTES && !/\.png$/i.test(file.name)) return file;

  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const canvas = drawScaled(image, 0, 0, image.naturalWidth, image.naturalHeight);
    const out = await encodeWithinBudget(canvas, file.name);
    // If re-encoding somehow made it bigger and the original already fits, keep the original.
    return out.size < file.size || file.size > BUDGET_BYTES ? out : file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
