import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { syncCategoryComingSoonStatus } from "@/lib/utils/categorySyncUtils";
import { isAdminRequest } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

// PATCH update product
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    await connectDB();
    
    // Get the old product to track category change
    const oldProduct = await Product.findById(params.id);
    
    // Only touch the fields this request actually carried. The previous version
    // defaulted images/videos/customizationFields/details/enabledOptions to an
    // empty value whenever they were absent, so any partial update silently
    // wiped them. descriptionAttachments was missing from the list entirely,
    // so the form could never save a change to it.
    const $set: Record<string, unknown> = {};
    // Mongoose strips undefined values out of $set, so a field the admin
    // deliberately emptied was simply left alone — clearing a badge or an
    // original price saved successfully and changed nothing, and the storefront
    // kept showing the pill and the struck-through MRP. Those two have to be
    // removed with $unset instead.
    const $unset: Record<string, unknown> = {};
    const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

    if (has("name"))          $set.name = body.name?.trim();
    if (has("description"))   $set.description = body.description?.trim();
    if (has("price"))         $set.price = Number(body.price);
    if (has("category"))      $set.category = body.category?.trim();
    if (has("inStock"))       $set.inStock = body.inStock;

    if (has("originalPrice")) {
      const value = Number(body.originalPrice);
      if (body.originalPrice === "" || body.originalPrice == null || !Number.isFinite(value) || value <= 0) {
        $unset.originalPrice = "";
      } else {
        $set.originalPrice = value;
      }
    }

    if (has("badge")) {
      const badge = typeof body.badge === "string" ? body.badge.trim() : "";
      if (badge) $set.badge = badge;
      else $unset.badge = "";
    }
    if (has("images"))        $set.images = body.images || [];
    if (has("videos"))        $set.videos = body.videos || [];
    if (has("customizationFields"))    $set.customizationFields = body.customizationFields || [];
    if (has("details"))                $set.details = body.details || [];
    if (has("enabledOptions"))         $set.enabledOptions = body.enabledOptions ?? {};
    if (has("descriptionAttachments")) $set.descriptionAttachments = body.descriptionAttachments || [];

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    const product = await Product.findByIdAndUpdate(
      params.id,
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    
    // Sync both old and new category if they differ (non-blocking)
    if (oldProduct && body.category && oldProduct.category !== body.category) {
      syncCategoryComingSoonStatus(oldProduct.category).catch(err => 
        console.error("[products-api] Failed to sync old category:", err)
      );
      syncCategoryComingSoonStatus(body.category).catch(err => 
        console.error("[products-api] Failed to sync new category:", err)
      );
    } else if (body.category) {
      syncCategoryComingSoonStatus(body.category).catch(err => 
        console.error("[products-api] Failed to sync category:", err)
      );
    }
    
    return NextResponse.json({ success: true, product: JSON.parse(JSON.stringify(product)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    
    // Get product to know which category to sync
    const product = await Product.findById(params.id);
    await Product.findByIdAndDelete(params.id);
    
    // Sync the category after deletion (non-blocking)
    if (product?.category) {
      syncCategoryComingSoonStatus(product.category).catch(err => 
        console.error("[products-api] Failed to sync category after delete:", err)
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
