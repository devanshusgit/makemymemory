import { Category } from "@/lib/db/models/Category";
import { Product } from "@/lib/db/models/Product";

/**
 * Categories as the storefront and Admin should see them.
 *
 * A product's category is a string on the product ("foil-imprints"), and its
 * optional subcategory another one ("baby"). The Category collection only adds
 * titles, descriptions, nesting (parentId) and a "coming soon" flag on top.
 *
 * The shop's category tree lives in DEFAULT_CATEGORIES below, so it shows even
 * before anyone saves a record in Admin. A saved record with the same id
 * overrides its default; editing a default in Admin saves it. Any category a
 * product uses that is neither saved nor a default is still listed (derived),
 * so a category can never disappear just because nobody created its record.
 */

export interface CategoryView {
  _id?: string;
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  parentId: string;
  comingSoon: boolean;
  derived?: boolean;
  productCount?: number;
}

/**
 * The owner's shop structure:
 *   Foil Imprints Frame -> Baby, Pet, Family, Ashirwad, Devotional
 *   3D Casting Kit (coming soon)
 *   DIY Baby Imprints Frame (coming soon)
 */
export const DEFAULT_CATEGORIES: Omit<CategoryView, "productCount" | "derived">[] = [
  { id: "foil-imprints",     title: "Foil Imprints Frame",     description: "Gold foil handprint and footprint frames, made from your own imprints.", sortOrder: 1, parentId: "", comingSoon: false },
  { id: "baby",              title: "Baby",                    description: "", sortOrder: 1, parentId: "foil-imprints", comingSoon: false },
  { id: "pet",               title: "Pet",                     description: "", sortOrder: 2, parentId: "foil-imprints", comingSoon: false },
  { id: "family",            title: "Family",                  description: "", sortOrder: 3, parentId: "foil-imprints", comingSoon: false },
  { id: "ashirwad",          title: "Ashirwad",                description: "", sortOrder: 4, parentId: "foil-imprints", comingSoon: false },
  { id: "devotional",        title: "Devotional",              description: "", sortOrder: 5, parentId: "foil-imprints", comingSoon: false },
  { id: "3d-casting",        title: "3D Casting Kit",          description: "Lifelike 3D casts of tiny hands and feet.", sortOrder: 2, parentId: "", comingSoon: true },
  { id: "diy-baby-imprints", title: "DIY Baby Imprints Frame", description: "Take your baby's imprints at home with our kit.", sortOrder: 3, parentId: "", comingSoon: true },
];

/** "foil-imprints" -> "Foil Imprints" */
export function humanizeCategoryId(id: string): string {
  return id
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function listCategoriesWithDerived(): Promise<CategoryView[]> {
  const [saved, usedCategories, usedSubcategories] = await Promise.all([
    Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
    Product.aggregate<{ _id: string; count: number }>([
      { $match: { category: { $type: "string", $ne: "" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
    Product.aggregate<{ _id: string; count: number }>([
      { $match: { subcategory: { $type: "string", $ne: "" } } },
      { $group: { _id: "$subcategory", count: { $sum: 1 } } },
    ]),
  ]);

  // Counted without case: products filter with an exact match, but values that
  // differ only by case are summed, not overwritten.
  const tally = (rows: { _id: string; count: number }[]) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const id = String(r._id).trim();
      if (id) m.set(id.toLowerCase(), (m.get(id.toLowerCase()) ?? 0) + r.count);
    }
    return m;
  };
  const categoryCounts = tally(usedCategories);
  const subcategoryCounts = tally(usedSubcategories);

  const byId = new Map<string, CategoryView>();
  for (const d of DEFAULT_CATEGORIES) byId.set(d.id, { ...d, derived: true });
  for (const c of JSON.parse(JSON.stringify(saved)) as CategoryView[]) {
    const fallback = byId.get(c.id);
    byId.set(c.id, {
      ...c,
      parentId: c.parentId ?? fallback?.parentId ?? "",
      comingSoon: c.comingSoon ?? fallback?.comingSoon ?? false,
      derived: false,
    });
  }

  // Categories products use that have neither a record nor a default.
  let next = Math.max(0, ...Array.from(byId.values()).map((c) => c.sortOrder ?? 0)) + 1;
  for (const id of Array.from(categoryCounts.keys()).sort()) {
    if (!byId.has(id)) {
      byId.set(id, { id, title: humanizeCategoryId(id), description: "", sortOrder: next++, parentId: "", comingSoon: false, derived: true });
    }
  }

  return Array.from(byId.values())
    .map((c) => ({
      ...c,
      productCount: c.parentId ? (subcategoryCounts.get(c.id) ?? 0) : (categoryCounts.get(c.id) ?? 0),
    }))
    .sort((a, b) => (a.parentId === b.parentId ? 0 : a.parentId ? 1 : -1) || a.sortOrder - b.sortOrder);
}
