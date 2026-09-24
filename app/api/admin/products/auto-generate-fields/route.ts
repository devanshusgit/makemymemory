import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { isAdminRequest } from "@/lib/auth/admin";
import { DEFAULT_CUSTOMIZATION_FIELDS } from "@/lib/data/customizationFields";

export const dynamic = "force-dynamic";

// POST - Auto-generate customization fields for all products without them
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => null)) ?? {};
    const { productIds, fields } = body;

    await connectDB();

    const fieldsToUse = fields || DEFAULT_CUSTOMIZATION_FIELDS;

    let query: any = {
      $or: [
        { customizationFields: { $exists: false } },
        { customizationFields: { $size: 0 } },
      ],
    };

    // If specific product IDs provided, only update those
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      query = { _id: { $in: productIds } };
    }

    const result = await Product.updateMany(
      query,
      {
        $set: {
          customizationFields: fieldsToUse,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} products with customization fields`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error("[auto-generate-fields]", error);
    return NextResponse.json(
      { error: error.message || "Failed to auto-generate fields" },
      { status: 500 }
    );
  }
}

// GET - Preview default fields
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Count products without customization fields
    const productsWithoutFields = await Product.countDocuments({
      $or: [
        { customizationFields: { $exists: false } },
        { customizationFields: { $size: 0 } },
      ],
    });

    return NextResponse.json({
      defaultFields: DEFAULT_CUSTOMIZATION_FIELDS,
      productsWithoutFields,
    });
  } catch (error: any) {
    console.error("[auto-generate-fields GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
