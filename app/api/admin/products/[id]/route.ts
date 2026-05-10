import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// PATCH update product
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        $set: {
          name:          body.name?.trim(),
          description:   body.description?.trim(),
          price:         body.price !== undefined ? Number(body.price) : undefined,
          originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
          category:      body.category?.trim(),
          badge:         body.badge?.trim() || undefined,
          inStock:       body.inStock,
          images:        body.images || [],
          videos:        body.videos || [],
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product: JSON.parse(JSON.stringify(product)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
