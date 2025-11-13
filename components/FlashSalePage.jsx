"use client";


import dynamic from "next/dynamic";

// Lazy load ProductCard (client-only)
const ProductCard = dynamic(() => import("@/components/ProductCard"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
  ),
});
import React, { useEffect, useState } from "react";
import Container from "@/components/Container";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function FlashSalePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [visibleCount, setVisibleCount] = useState(12);
  const [prevVisibleCount, setPrevVisibleCount] = useState(0);

  // Fetch flash sales
  const { data: flashSales = [], isLoading } = useQuery({
    queryKey: ["flashSales"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/flash-sale`);
      return res.data.flashSales || [];
    },
  });

  const activeSale = flashSales.find((sale) => sale.isActive);

  // Countdown timer
  useEffect(() => {
    if (!activeSale?.endTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(activeSale.endTime).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSale]);

  if (!activeSale || isLoading)
    return (
      <Container className="py-12 text-center">
        <p>Loading</p>
      </Container>
    );

  // Prepare products (handle variants & stock)
  const allProducts = activeSale.products
    .map(({ productId }) => {
      if (!productId) return null;
      const productData = { ...productId };

      if (productData.type === "variant" && productData.variants?.length) {
        const inStock = productData.variants.filter((v) => v.quantity > 0);
        if (inStock.length) {
          productData.price = inStock[0].price;
          productData.discount = inStock[0].discount;
          productData.sku = inStock[0].sku;
        } else {
          return null;
        }
      }

      return productData;
    })
    .filter(Boolean);

  // Slice products based on visible count
  const productsToRender = allProducts.slice(0, visibleCount);

  const loadMore = () => {
    setPrevVisibleCount(visibleCount);
    setVisibleCount((prev) => prev + 12);
  };

  // Framer Motion variants
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="w-full mt-2">
      {/* Header Overlay */}
      <div className="relative bg-gradient-to-r from-[#f91d16] via-[#f59e0b] to-[#056444] overflow-hidden">
        <Container className="relative z-10 py-16 text-center text-white">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-wide uppercase">
            Today’s
          </h3>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase drop-shadow-lg">
            {activeSale.title || "Flash Sale"}
          </h2>

          {/* Countdown */}
          <div className="flex justify-center md:gap-4 gap-1 mt-8 ">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col items-center bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform border border-white/30"
              >
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {String(value).padStart(2, "0")}
                </p>
                <span className="text-xs sm:text-sm uppercase text-white/90">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Container>

        {/* Overlay Effect */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      </div>

      {/* Products Grid */}
      <Container className="py-2 sm:py-12  px-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <AnimatePresence>
            {productsToRender?.map((product, index) => {
              const isNew = index >= prevVisibleCount;
              return isNew ? (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <ProductCard product={product} />
                </motion.div>
              ) : (
                <div key={product._id}>
                  <ProductCard product={product} />
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {visibleCount < allProducts.length && (
          <div className="flex justify-center mt-10">
            <button
              onClick={loadMore}
              className="bg-[#10b981] hover:bg-[#0f9e6f] text-white px-6 py-3 rounded-lg shadow-lg transition-colors uppercase font-semibold tracking-wide"
            >
              Load More
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
