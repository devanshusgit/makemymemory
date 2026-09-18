import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";
import { Review } from "@/lib/db/models/Review";

// Public homepage counters. Replaces the homepage's calls to
// /api/admin/settings/stats (an admin-namespaced URL) and to
// /api/reviews?approved=true (which downloaded review text just to average
// the first page of ratings). Cached on the CDN for 60 s; admin edits to the
// counters also refresh it immediately (see app/api/admin/settings/stats).
export const revalidate = 60;

export async function GET() {
  try {
    await connectDB();
    const [settings, ratingAgg] = await Promise.all([
      Settings.findOne({}).lean() as Promise<any>,
      Review.aggregate([
        { $match: { approved: true, rejected: { $ne: true } } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
    ]);
    const agg = ratingAgg[0];
    return NextResponse.json({
      stats: {
        happyCustomers:  settings?.happyCustomers ?? 1000,
        memoriesCreated: settings?.memoriesCreated ?? 2500,
        founded:         settings?.founded ?? 2020,
      },
      // Average of every approved review, 1 decimal; null until the first
      // review is approved (the homepage shows "New" instead of "0★").
      rating:      agg?.count ? Math.round(agg.avg * 10) / 10 : null,
      reviewCount: agg?.count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Stats unavailable" }, { status: 500 });
  }
}
