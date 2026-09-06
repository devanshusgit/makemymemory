/**
 * Cloudinary URLs are stored raw in the DB with no transformation
 * parameters, so full-resolution originals ship to every visitor. This
 * inserts f_auto (best format for the browser), q_auto (auto quality),
 * a max width, and dpr_auto (device pixel ratio) right after "/upload/".
 */
export function optimizeCloudinaryUrl(url: string | undefined | null, width = 600): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},dpr_auto/`);
}
