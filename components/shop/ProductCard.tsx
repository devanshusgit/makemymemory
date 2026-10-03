"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/lib/context/WishlistContext";
import { cloudinaryCoverUrl } from "@/lib/utils/cloudinary";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  // The cart icon opens the product page: customers must pick frame type,
  // colour, finish etc. (and often photos) before an item can be added.
  // Adding straight from the card used to skip those options silently.
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/shop/${product.slug}`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const avgRating = (product as any).avgRating || 0;
  const reviewCount = (product as any).reviewCount || 0;

  return (
    <article className="card group flex flex-col">
      {/* Image area */}
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] sm:aspect-square bg-stone-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={cloudinaryCoverUrl(product.images[0], 600)}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 bg-stone-200 rounded-xl flex items-center justify-center">
                <span className="text-stone-400 text-sm font-medium">No Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] sm:text-[11px]
                           font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full tracking-wide z-10"
            style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}
          >
            {product.badge}
          </span>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <span
            className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] sm:text-[11px]
                           font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full tracking-wide z-10"
            style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
          >
            Out of Stock
          </span>
        )}

        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-soft
                     flex items-center justify-center
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0
                     transition-all duration-200"
          style={{
            backgroundColor: inWishlist ? "#FF6B6B" : "white",
            color: inWishlist ? "white" : "#C9A84C",
          }}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-current" : ""}`} />
        </motion.button>
      </Link>

      {/* Info */}
      <div className="p-2.5 sm:p-5 flex flex-col flex-1">
        <Link href={`/shop/${product.slug}`}>
          <h3
            className="font-serif font-semibold text-sm sm:text-base
                         transition-colors line-clamp-1 mb-0.5 sm:mb-1"
            style={{ color: "#1A1A1A" }}
          >
            {product.name}
          </h3>
        </Link>
        <p className="text-stone-400 text-xs sm:text-sm leading-relaxed line-clamp-1 sm:line-clamp-2 flex-1 mb-2 sm:mb-3">
          {product.description}
        </p>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i <= Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-stone-500">
              {avgRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-bold text-base sm:text-lg whitespace-nowrap" style={{ color: "#1A1A1A" }}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs line-through whitespace-nowrap" style={{ color: "#6B6560" }}>
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="hidden sm:inline text-xs font-semibold text-green-700 whitespace-nowrap">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% off
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label={`Customise ${product.name}`}
            title="Choose your frame, colour and photo"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0
                        transition-all duration-200 bg-ink text-white ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
        {product.originalPrice && product.originalPrice > product.price && (
          <p className="sm:hidden text-[11px] font-semibold text-green-700 mt-1">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% off
          </p>
        )}
      </div>
    </article>
  );
}
