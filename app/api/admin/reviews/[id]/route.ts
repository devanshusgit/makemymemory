import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";

function isAdmin() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { approved } = await req.json();

  try {
    await connectDB();
    const review = await Review.findByIdAndUpdate(
      params.id,
      { approved },
      { new: true, select: "_id approved" }
    ).lean();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, approved });
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
