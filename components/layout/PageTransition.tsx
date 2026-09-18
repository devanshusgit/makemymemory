"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The first render (server HTML + hydration) must be visible immediately:
  // starting at opacity 0 kept every page invisible until JS had loaded,
  // hydrated and animated, which is what pushed LCP to 8–24 s. Only
  // client-side navigations after that fade in.
  const isFirstRender = useRef(true);
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <motion.div
      key={pathname}
      initial={isFirstRender.current ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
