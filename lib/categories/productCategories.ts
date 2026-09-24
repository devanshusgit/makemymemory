import { Category } from "@/lib/db/models/Category";
import { Product } from "@/lib/db/models/Product";

/**
 * Categories as the storefront and Admin should see them.
 *
 * A product's category is just a string on the product ("foil-imprints"); the
 * Category collection only adds a display title and description on top. When
 * the live database was switched, the products came across but the Category
 * records did not — so the shop's category tabs and Admin > Settings >
 * Categories were both empty, while all six products still said
 * "foil-imprints".
 *
 * This returns the saved categories plus any category a product actually uses
 * that has no record yet, marked `derived: true` with a title made from its id.
 * A category can therefore never disappear just because nobody created its
 * record. Saving a derived one from Admin turns it into a real record.
 */

export interface CategoryView {
  _id?: string;
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  derived?: boolean;
  productCount?: number;
}

/** "foil-imprints" -> "Foil Imprints" */
export function humanizeCategoryId(id: string): string {
  return id
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function listCategoriesWithDerived(): Promise<CategoryView[]> {
  const [saved, used] = await Promise.all([
    Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
    Product.aggregate<{ _id: string; count: number }>([
      { $match: { category: { $type: "string", $ne: "" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  // Keyed by the category exactly as products store it (trimmed only, like the
  // Product schema), because /api/products filters with an exact match — an id
  // normalised to lowercase here would match nothing there. Values that differ
  // only by case are summed, not overwritten.
  const counts = new Map<string, number>();
  for (const u of used) {
    const id = String(u._id).trim();
    if (id) counts.set(id, (counts.get(id) ?? 0) + u.count);
  }
  const countFor = (id: string) => {
    let total = 0;
    counts.forEach((n, key) => { if (key.toLowerCase() === id.toLowerCase()) total += n; });
    return total;
  };

  const views: CategoryView[] = JSON.parse(JSON.stringify(saved)).map((c: CategoryView) => ({
    ...c,
    productCount: countFor(c.id),
  }));

  // Saved Category ids are lowercased by the schema, so compare without case.
  const known = new Set(views.map((c) => c.id.toLowerCase()));
  const lastOrder = views.reduce((max, c) => Math.max(max, c.sortOrder ?? 0), 0);
  let next = lastOrder + 1;

  for (const [id] of Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    if (!id || known.has(id.toLowerCase())) continue;
    known.add(id.toLowerCase());
    views.push({
      id,
      title: humanizeCategoryId(id),
      description: "",
      sortOrder: next++,
      derived: true,
      productCount: countFor(id),
    });
  }

  return views;
}
