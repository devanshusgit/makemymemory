import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";
import { DEFAULT_ANNOUNCEMENTS } from "@/lib/settings/announcements";

// Every visitor's header asks for this, so it is cached and refreshed at most
// once a minute: an Admin edit shows up within a minute.
export const revalidate = 60;

export async function GET() {
  try {
    await connectDB();
    const settings: any = await Settings.findOne({}).select("announcements").lean();
    const list = Array.isArray(settings?.announcements) && settings.announcements.length
      ? settings.announcements
      : DEFAULT_ANNOUNCEMENTS;
    return NextResponse.json({ announcements: list });
  } catch (error) {
    console.error("[announcements GET]", error);
    return NextResponse.json({ announcements: DEFAULT_ANNOUNCEMENTS });
  }
}
