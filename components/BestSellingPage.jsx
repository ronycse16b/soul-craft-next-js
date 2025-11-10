"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default function BestSellingPage() {
  const [limit, setLimit] = useState(12);

  const { data, isLoading } = useQuery({
    queryKey: ["bestSellingAll"],
    queryFn: async () => {
      const res = await fetch("/api/best-selling-products");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  if (isLoading)
    return (
      <Container className="py-10 text-center">
        <p>...</p>
      </Container>
    );

  const products = data?.bestSelling || [];

  const loadMore = () => setLimit((prev) => prev + 12);

  return (
    <section className="relative mt-1 bg-white">
      {/* Top Overlay Section */}
      <div className="relative bg-gradient-to-r from-[#f91d16] via-[#f59e0b] to-[#056444] overflow-hidden">
        <Container className="relative z-10 py-16 text-center text-white">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-wide uppercase">
            Today’s
          </h3>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase drop-shadow-lg">
            Best Selling
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl mx-auto">
            Check out our most popular products chosen by customers this month.
            These top-selling items are tried, tested, and highly rated.
          </p>
        </Container>

        {/* Overlay Effect */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      </div>

      {/* Products Grid */}
      <div className="px-0 sm:px-0 my-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.slice(0, limit).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Load More */}
        {limit < products.length && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={loadMore}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-none"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
