import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { listCategoriesWithDerived } from "@/lib/categories/productCategories";

// Refresh at most once a minute. With no revalidate/dynamic export and no use
// of `req`, Next built this route ONCE at deploy time and served that copy
// forever: editing a category in Admin, or giving a product a new category,
// never reached the shop until the next deploy. A minute keeps it cheap —
// /shop calls this for every visitor — while still picking changes up.
export const revalidate = 60;

// GET — public endpoint to list all categories, including any category a
// product uses that has no saved record yet (see productCategories.ts).
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const categories = await listCategoriesWithDerived();
    return NextResponse.json({ categories });
  } catch (error) {
    // Was swallowed silently, so a database outage left no trace in the logs.
    console.error("[categories GET]", error);
    // Throw rather than return a 500: with ISR, a returned 500 is cached and
    // served to every visitor until the next regeneration, while a thrown
    // error keeps serving the last good list.
    throw error;
  }
}
