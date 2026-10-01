import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/lib/db/models/Category";
import { isAdminRequest } from "@/lib/auth/admin";
import { Product } from "@/lib/db/models/Product";
import { humanizeCategoryId, DEFAULT_CATEGORIES } from "@/lib/categories/productCategories";

export const dynamic = "force-dynamic";

// PATCH — update category
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json().catch(() => null)) ?? {};

    // Only the editable fields. This used to $set the raw request body, so any
    // key at all could be written onto the record.
    const $set: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) $set.title = body.title.trim();
    if (typeof body.description === "string") $set.description = body.description.trim();
    if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) $set.sortOrder = body.sortOrder;
    if (typeof body.parentId === "string") $set.parentId = body.parentId.trim().toLowerCase();
    if (typeof body.comingSoon === "boolean") $set.comingSoon = body.comingSoon;
    if ($set.parentId === params.id.toLowerCase()) {
      return NextResponse.json({ error: "A category can't be its own parent" }, { status: 400 });
    }

    await connectDB();

    // A category listed as "derived" in Admin has no record yet — products use
    // it but nobody saved a title for it. Editing one creates that record.
    // Anything else still has to exist: an unknown or deleted id is a 404, not
    // a silently re-created category.
    const exists = await Category.exists({ id: params.id.toLowerCase() });
    if (!exists) {
      // Compared in code rather than with a regex built from the URL segment,
      // which would need escaping and could be abused. There are only a handful
      // of distinct categories, so this stays cheap.
      const wanted = params.id.trim().toLowerCase();
      const productCategories: unknown[] = await Product.distinct("category");
      const usedByProducts = productCategories.some(
        (c) => typeof c === "string" && c.trim().toLowerCase() === wanted
      );
      // Built-in shop categories (DEFAULT_CATEGORIES) can be saved too.
      const isDefault = DEFAULT_CATEGORIES.some((d) => d.id === wanted);
      if (!usedByProducts && !isDefault) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // No `id` here: on an upsert the filter's equality already becomes the new
    // document's id, and naming the same path in $setOnInsert is a conflict
    // MongoDB rejects.
    // Saving a built-in default for the first time keeps its other defaults.
    const preset = DEFAULT_CATEGORIES.find((d) => d.id === params.id.toLowerCase());
    const update: Record<string, unknown> = {
      $setOnInsert: {
        ...($set.title ? {} : { title: preset?.title ?? humanizeCategoryId(params.id) }),
        ...($set.description !== undefined || !preset ? {} : { description: preset.description }),
        ...($set.parentId !== undefined ? {} : { parentId: preset?.parentId ?? "" }),
        ...($set.comingSoon !== undefined ? {} : { comingSoon: preset?.comingSoon ?? false }),
        // Append it, like POST does, instead of jumping to the top at 0.
        ...($set.sortOrder === undefined ? { sortOrder: preset?.sortOrder ?? await Category.countDocuments() } : {}),
      },
    };
    if (Object.keys($set).length) update.$set = $set;

    const category = await Category.findOneAndUpdate(
      { id: params.id.toLowerCase() },
      update,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: false }
    ).lean();
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ category: JSON.parse(JSON.stringify(category)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to update" }, { status: 500 });
  }
}

// DELETE — remove category
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    await Category.findOneAndDelete({ id: params.id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to delete" }, { status: 500 });
  }
}
