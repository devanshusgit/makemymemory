"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Heart, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";

const ease = [0.4, 0, 0.2, 1] as const;

function GridCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: (index % 6) * 0.07, duration: 0.55, ease }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-soft
                 hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block relative overflow-hidden">
        <div className="relative aspect-[4/3] bg-stone-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-stone-400 text-sm">No Image</span>
            </div>
          )}
        </div>

        {product.badge && (
          <span className="absolute top-3 left-3 bg-sage text-white text-[11px]
                           font-semibold px-2.5 py-1 rounded-full tracking-wide z-10">
            {product.badge}
          </span>
        )}

        <button
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm
                     rounded-full flex items-center justify-center text-stone-400
                     opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                     hover:text-red-400 transition-all duration-200 shadow-soft"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {/* Hover quick-add */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0
                        transition-transform duration-300 ease-out z-10">
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className="w-full flex items-center justify-center gap-2
                       bg-ink/90 backdrop-blur-sm text-canvas
                       py-2.5 rounded-2xl text-xs font-semibold tracking-wide
                       hover:bg-ink transition-colors duration-150"
          >
            {added
              ? <><Check className="w-3.5 h-3.5" /> Added!</>
              : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
            }
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="px-4 py-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/shop/${product.slug}`}>
            <p className="text-sm font-semibold text-ink hover:text-sage-dark transition-colors truncate">
              {product.name}
            </p>
          </Link>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-ink">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
          className={`sm:hidden shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                       transition-colors duration-200
                       ${added ? "bg-sage text-white" : "bg-ink text-canvas hover:bg-sage-dark"}`}
        >
          {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
        </button>
      </div>
    </motion.article>
  );
}

export default function ProductGridSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=4");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="bg-stone-50 py-20 sm:py-28">
        <div className="section-wrap">
          <div className="text-center">
            <p className="text-stone-400">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show anything if no products
  }

  return (
    <section className="bg-stone-50 py-20 sm:py-28">
      <div className="section-wrap">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="label-tag mb-3 inline-flex"
            >
              Our Products
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08, ease }}
              className="section-heading"
            >
              Made for Every Moment
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold
                                          text-ink/60 hover:text-ink transition-colors underline underline-offset-4">
              Shop All →
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product, i) => (
            <GridCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
