import Link from "next/link";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Blog — Gift Ideas & Inspiration",
  description: "Discover gift ideas, personalisation tips, and heartfelt stories from the Make My Memory community.",
  path:        "/blog",
});

const posts = [
  {
    slug:     "top-10-personalised-gifts-2025",
    emoji:    "🎁",
    category: "Gift Ideas",
    title:    "Top 10 Personalised Gifts for Every Occasion in 2025",
    excerpt:  "From birthdays to anniversaries, here are the most loved personalised gifts that will make your loved ones feel truly special.",
    date:     "January 15, 2025",
    readTime: "5 min read",
  },
  {
    slug:     "how-to-choose-the-perfect-photo",
    emoji:    "📸",
    category: "Tips & Tricks",
    title:    "How to Choose the Perfect Photo for Your Custom Gift",
    excerpt:  "Not all photos print equally. Here's our guide to selecting images that will look stunning on any product.",
    date:     "January 8, 2025",
    readTime: "4 min read",
  },
  {
    slug:     "personalised-gifts-for-new-parents",
    emoji:    "👶",
    category: "Gift Ideas",
    title:    "The Most Heartfelt Gifts for New Parents",
    excerpt:  "Welcoming a new baby is one of life's most precious moments. Here are the personalised gifts that new parents will treasure forever.",
    date:     "December 28, 2024",
    readTime: "6 min read",
  },
  {
    slug:     "behind-the-scenes-how-we-make-your-gifts",
    emoji:    "🏭",
    category: "Behind the Scenes",
    title:    "Behind the Scenes: How We Craft Your Personalised Gifts",
    excerpt:  "Ever wondered what happens after you place your order? Take a tour of our production studio and see how your memories come to life.",
    date:     "December 20, 2024",
    readTime: "7 min read",
  },
  {
    slug:     "anniversary-gift-guide",
    emoji:    "💑",
    category: "Gift Ideas",
    title:    "The Ultimate Anniversary Gift Guide by Year",
    excerpt:  "From paper to gold, every anniversary milestone deserves a special gift. Here's our curated guide for every year of marriage.",
    date:     "December 12, 2024",
    readTime: "8 min read",
  },
  {
    slug:     "caring-for-your-personalised-products",
    emoji:    "✨",
    category: "Care Guide",
    title:    "How to Care for Your Personalised Products",
    excerpt:  "Your personalised gifts are made to last. Follow these simple care tips to keep them looking beautiful for years to come.",
    date:     "December 5, 2024",
    readTime: "3 min read",
  },
];

const categories = ["All", "Gift Ideas", "Tips & Tricks", "Behind the Scenes", "Care Guide"];

export default function BlogPage() {
  return (
    <div className="bg-canvas min-h-screen">
      {/* Dark hero */}
      <div className="bg-stone-900 py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            Stories &amp; Ideas
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            The Memory Journal
          </h1>
          <p className="text-stone-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Gift ideas, personalisation tips, and stories from our community.
          </p>
        </div>
      </div>

      <div className="section-wrap py-12 sm:py-16">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all
                          ${cat === "All"
                            ? "bg-ink text-canvas"
                            : "bg-white text-stone-500 border border-stone-200 hover:border-stone-400"
                          }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-soft
                         hover:shadow-card hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Thumbnail */}
              <div className="h-44 bg-stone-100 flex items-center justify-center text-6xl">
                {post.emoji}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="label-tag text-[10px]">{post.category}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-400">{post.readTime}</span>
                </div>
                <h2 className="font-serif font-bold text-ink text-base leading-snug mb-2
                               group-hover:text-sage-dark transition-colors">
                  {post.title}
                </h2>
                <p className="text-stone-500 text-xs leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">{post.date}</span>
                  <span className="text-xs font-semibold text-sage-dark">Read more →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-stone-900 rounded-3xl p-8 sm:p-12 text-center">
          <p className="text-2xl mb-3">📬</p>
          <h2 className="font-serif font-bold text-white text-2xl mb-2">
            Get gift ideas in your inbox
          </h2>
          <p className="text-stone-400 text-sm mb-6 max-w-md mx-auto">
            Subscribe to our newsletter for personalisation tips, exclusive offers, and heartfelt stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3
                         text-white text-sm placeholder:text-white/30
                         focus:outline-none focus:border-sage/50"
            />
            <button className="bg-sage text-white px-6 py-3 rounded-full text-sm font-semibold
                               hover:bg-sage-dark transition-colors shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
