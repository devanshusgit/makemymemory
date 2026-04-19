import { connectDB } from "@/lib/db/connect";
import { Review } from "@/lib/db/models/Review";
import AdminReviewsClient from "@/components/admin/AdminReviewsClient";

export const dynamic = "force-dynamic";

async function getReviews() {
  try {
    await connectDB();
    const reviews = await Review.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(reviews));
  } catch {
    return [];
  }
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-[#2C2520]">Reviews</h1>
        <p className="text-stone-500 text-sm mt-1">{reviews.length} total reviews</p>
      </div>
      <AdminReviewsClient reviews={reviews} />
    </div>
  );
}
