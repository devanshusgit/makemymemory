import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db/connect";
import ContactMessage from "@/lib/db/models/ContactMessage";

// PATCH - Mark as read/unread
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("admin_session");
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!session || !adminPassword || session.value !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { isRead } = await req.json();

    const message = await ContactMessage.findByIdAndUpdate(
      params.id,
      { isRead },
      { new: true }
    );

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error("Error updating contact message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete message
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("admin_session");
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!session || !adminPassword || session.value !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const message = await ContactMessage.findByIdAndDelete(params.id);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
