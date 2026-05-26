import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { User } from "@/lib/db/models/User";
import { sendNewProductNotification, sendNewProductToUsers } from "@/lib/email/resend";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// GET all products
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const products = await Product.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST create product
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, description, price, originalPrice, category, badge, inStock, images, videos, customizationFields } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: "Name, description, price and category are required" }, { status: 400 });
    }

    await connectDB();

    // Generate unique slug
    let slug = toSlug(name);
    const existing = await Product.findOne({ slug }).lean();
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category: category.trim(),
      badge: badge?.trim() || undefined,
      inStock: inStock !== false,
      images: images || [],
      videos: videos || [],
      customizationFields: customizationFields || [],
    });

    // Send email notifications (non-blocking)
    const productObj = product.toObject();
    
    // Notify admin
    sendNewProductNotification(productObj).catch(err => 
      console.error("[products] Failed to send admin notification:", err)
    );

    // Notify all users (optional - can be enabled/disabled via env var)
    if (process.env.NOTIFY_USERS_NEW_PRODUCTS === "true") {
      User.find({ email: { $exists: true, $ne: "" } })
        .select("name email")
        .lean()
        .then(users => {
          if (users.length > 0) {
            sendNewProductToUsers(productObj, users).catch(err =>
              console.error("[products] Failed to send user notifications:", err)
            );
          }
        })
        .catch(err => console.error("[products] Failed to fetch users:", err));
    }

    return NextResponse.json({ success: true, product: JSON.parse(JSON.stringify(product)) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create product" }, { status: 500 });
  }
}
