import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

/**
 * GET /api/user/cart - Get user's saved cart
 * POST /api/user/cart - Save user's cart
 */

export async function GET(req: NextRequest) {
  try {
    const userSession = req.cookies.get("user_session")?.value;
    if (!userSession) {
      return NextResponse.json({ cart: null }, { status: 200 });
    }

    try {
      const user = JSON.parse(userSession);
      await connectDB();

      const dbUser = await User.findOne({ email: user.email }).select("savedCart");
      
      return NextResponse.json({ 
        success: true,
        cart: dbUser?.savedCart || null 
      });
    } catch {
      return NextResponse.json({ cart: null }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userSession = req.cookies.get("user_session")?.value;
    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { items } = await req.json();

    try {
      const user = JSON.parse(userSession);
      await connectDB();

      await User.findOneAndUpdate(
        { email: user.email },
        { savedCart: items },
        { new: true }
      );

      return NextResponse.json({ 
        success: true,
        message: "Cart saved successfully" 
      });
    } catch (error) {
      return NextResponse.json({ error: "Database error" }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
