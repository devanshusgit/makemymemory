/**
 * Products added while the admin form had two uploaders kept their photos in
 * `descriptionAttachments` — which only ever rendered low down the product
 * page — and left `images`, the cover and gallery the shop actually uses,
 * empty.
 *
 * These helpers let the storefront and the admin list agree on which photos a
 * product really has, so the admin never shows an empty box for a product the
 * shop is displaying fine. They are pure so both the server components and the
 * admin client bundle can share one implementation.
 *
 * This is a read-time rescue, not a migration: the database still holds the
 * photos in the old place until the product is saved from Admin.
 */

export interface PhotoAttachment {
  url?: string;
  type?: string;
  name?: string;
}

export interface ProductPhotoSource {
  images?: string[];
  descriptionAttachments?: PhotoAttachment[];
}

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

/** Photos sitting in descriptionAttachments on a product whose gallery is empty. */
export function strandedPhotos(p: ProductPhotoSource | null | undefined): string[] {
  if (!p || p.images?.length) return [];
  return (p.descriptionAttachments ?? [])
    .filter((a) => !!a?.url && (a.type === "image" || (!a.type && IMAGE_EXTENSION.test(a.url!))))
    .map((a) => a.url as string);
}

/** The product's gallery: its own photos, else the stranded ones, else nothing. */
export function resolveProductImages(p: ProductPhotoSource | null | undefined): string[] {
  if (p?.images?.length) return p.images;
  return strandedPhotos(p);
}

/** Attachments minus any photo now being shown as the gallery, so nothing renders twice. */
export function remainingAttachments(p: ProductPhotoSource | null | undefined): PhotoAttachment[] {
  const rescued = strandedPhotos(p);
  const all = p?.descriptionAttachments ?? [];
  return rescued.length ? all.filter((a) => !rescued.includes(a?.url as string)) : all;
}

/** True when this product's photos still need moving into the gallery field. */
export function needsPhotoMigration(p: ProductPhotoSource | null | undefined): boolean {
  return strandedPhotos(p).length > 0;
}
