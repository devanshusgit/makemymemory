import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";
import { isAdminRequest } from "@/lib/auth/admin";
import { DEFAULT_ANNOUNCEMENTS, cleanAnnouncements } from "@/lib/settings/announcements";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const settings: any = await Settings.findOne({}).select("announcements").lean();
    const list = Array.isArray(settings?.announcements) && settings.announcements.length
      ? settings.announcements
      : DEFAULT_ANNOUNCEMENTS;
    return NextResponse.json({ announcements: list });
  } catch {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const list = cleanAnnouncements(body?.announcements);
    if (!list || !list.length) {
      return NextResponse.json({ error: "Add at least one message" }, { status: 400 });
    }
    await connectDB();
    await Settings.findOneAndUpdate({}, { $set: { announcements: list } }, { upsert: true });
    revalidatePath("/api/announcements");
    return NextResponse.json({ success: true, announcements: list });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
