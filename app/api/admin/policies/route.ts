import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const policies = await Policy.find().sort({ slug: 1 });

    return NextResponse.json({ success: true, policies }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch policies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { slug, title, content, effectiveDate } = await req.json();

    if (!slug || !title || !content || !effectiveDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const policy = await Policy.create({
      slug,
      title,
      content,
      effectiveDate: new Date(effectiveDate),
    });

    return NextResponse.json({ success: true, policy }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create policy:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Policy with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create policy" },
      { status: 500 }
    );
  }
}
