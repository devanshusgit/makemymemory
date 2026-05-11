import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid policy ID" },
        { status: 400 }
      );
    }

    const policy = await Policy.findById(params.id);

    if (!policy) {
      return NextResponse.json(
        { success: false, error: "Policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, policy }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch policy:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch policy" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid policy ID" },
        { status: 400 }
      );
    }

    const { title, content, effectiveDate } = await req.json();

    if (!title || !content || !effectiveDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const policy = await Policy.findByIdAndUpdate(
      params.id,
      {
        title,
        content,
        effectiveDate: new Date(effectiveDate),
      },
      { new: true }
    );

    if (!policy) {
      return NextResponse.json(
        { success: false, error: "Policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, policy }, { status: 200 });
  } catch (error) {
    console.error("Failed to update policy:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update policy" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid policy ID" },
        { status: 400 }
      );
    }

    const policy = await Policy.findByIdAndDelete(params.id);

    if (!policy) {
      return NextResponse.json(
        { success: false, error: "Policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Policy deleted" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete policy:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete policy" },
      { status: 500 }
    );
  }
}
