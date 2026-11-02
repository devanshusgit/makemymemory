/**
 * What we actually hand the courier.
 *
 * Delhivery bills on whichever is greater: the weight on its scale, or the
 * volumetric weight of the box (L x W x H / 5000). Whatever we declare here is
 * only a quote — Delhivery re-measures after pickup and raises the difference
 * against us. So these numbers existing is not the point; them being true is.
 *
 * Weights were measured on 2 Nov 2026: a packed final frame is 1.44kg and an
 * imprint kit is about 500g. Both are approximate, so re-weigh a few parcels
 * and correct them here if the discrepancy charges continue.
 *
 * Dimensions are not filled in yet. They are left undefined deliberately:
 * sending a wrong box size would be worse than sending none, because Delhivery
 * would quote against the wrong figure and still bill the real one. Measure the
 * outer carton for each and put the numbers in — that is the half of this that
 * actually stops the surprise charges, since a frame carton is light for its
 * size and volumetric weight is usually what wins.
 */

export interface BoxSpec {
  /** Weight of one unit, packed, in kg. */
  weightKg: number;
  /** Outer carton for a single unit, in cm. Undefined until measured. */
  dimensionsCm?: { length: number; width: number; height: number };
}

export const IMPRINT_KIT: BoxSpec = {
  weightKg: 0.5,
  // dimensionsCm: { length: ?, width: ?, height: ? },
};

export const FINAL_FRAME: BoxSpec = {
  weightKg: 1.44,
  // dimensionsCm: { length: ?, width: ?, height: ? },
};

/**
 * Weight for a parcel holding `quantity` units.
 *
 * The old code declared a flat 0.5kg for every kit and 1.5kg for every frame
 * no matter how many were in the order, so a four-frame parcel was declared at
 * the weight of one. Delhivery weighed the real thing and billed the gap.
 */
export function parcelWeightKg(spec: BoxSpec, quantity: number): number {
  const units = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
  return Math.round(spec.weightKg * units * 1000) / 1000;
}

/**
 * Box for `quantity` units. Multiple units are assumed to stack, so height
 * grows and the footprint stays put — closer to the truth than repeating the
 * single-unit box, though a real multi-unit carton should be measured and
 * added here if those orders become common.
 */
export function parcelDimensionsCm(spec: BoxSpec, quantity: number) {
  if (!spec.dimensionsCm) return undefined;
  const units = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
  return {
    length: spec.dimensionsCm.length,
    width: spec.dimensionsCm.width,
    height: Math.round(spec.dimensionsCm.height * units * 10) / 10,
  };
}
