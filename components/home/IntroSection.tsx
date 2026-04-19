"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { FEATURED_PRODUCTS } from "@/lib/data/products";
import { useCart } from "@/lib/context/CartContext";

const ease = [0.4, 0, 0.2, 1] as const;

function PreviewCard({
  product,
  index,
}: {
  product: (typeof FEATURED_PRODUCTS)[number];
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
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease }}
    >
      <Link
        href={`/shop/${product.slug}`}
        className="group block bg-white rounded-3xl overflow-hidden shadow-soft
                   hover:shadow-card hover:-translate-y-1 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl
                            group-hover:scale-105 transition-transform duration-500">
              {product.emoji}
            </div>
          )}
          {product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-sage text-white text-[11px]
                             font-semibold px-2.5 py-1 rounded-full">
              {product.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink group-hover:text-sage-dark
                        transition-colors truncate pr-2">
            {product.name}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-sm font-bold text-ink">₹{product.price}</p>
            <button
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
              className={`w-7 h-7 rounded-full flex items-center justify-center
                           transition-colors duration-200
                           ${added ? "bg-sage text-white" : "bg-ink text-canvas hover:bg-sage-dark"}`}
            >
              {added ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function IntroSection() {
  return (
    <section className="bg-canvas py-20 sm:py-28">
      <div className="section-wrap">

        <div className="max-w-2xl mx-auto text-center mb-16 sm:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="label-tag mb-5 inline-flex"
          >
            Why We Exist
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            className="font-serif font-bold text-ink leading-tight mb-5"
            style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)", letterSpacing: "-0.02em" }}
          >
            Some moments deserve more<br className="hidden sm:block" /> than a screenshot.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="text-stone-500 text-base sm:text-lg leading-relaxed"
          >
            We turn your favourite photos into tangible, lasting keepsakes —
            things you can hold, display, and pass down. Because the best memories
            deserve a home beyond your phone.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          {FEATURED_PRODUCTS.map((product, i) => (
            <PreviewCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="text-center"
        >
          <Link href="/shop" className="btn-outline px-10 py-4 text-sm">
            Explore All Products
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
