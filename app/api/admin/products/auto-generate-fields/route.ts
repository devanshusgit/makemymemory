import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// Default customization fields template
const DEFAULT_CUSTOMIZATION_FIELDS = [
  {
    id: "name",
    label: "Name",
    type: "text" as const,
    placeholder: "Enter name",
    required: true,
    order: 1,
  },
  {
    id: "date",
    label: "Date",
    type: "date" as const,
    placeholder: "dd-mm-yyyy",
    required: false,
    order: 2,
  },
  {
    id: "time",
    label: "Time",
    type: "time" as const,
    placeholder: "--:--",
    required: false,
    order: 3,
  },
  {
    id: "weight",
    label: "Weight (optional)",
    type: "text" as const,
    placeholder: "e.g. 500g",
    required: false,
    order: 4,
  },
];

// POST - Auto-generate customization fields for all products without them
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
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
  if (!isAdmin(req)) {
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
