import { NextResponse } from "next/server";
import { fetchGoogleReviews } from "@/lib/reviews/googleReviews";

/**
 * Google Business Profile reviews as JSON, for anything that needs them
 * client-side (the reviews page itself renders them on the server).
 */
export async function GET() {
  const data = await fetchGoogleReviews();

  if (!data.configured) {
    return NextResponse.json(
      { error: "Google reviews are not configured", ...data },
      { status: 503 },
    );
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
