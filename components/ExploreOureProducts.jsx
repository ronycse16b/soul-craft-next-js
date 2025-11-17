"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Container from "./Container";

// Lazy load ProductCard
const ProductCard = dynamic(() => import("./ProductCard"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
  ),
});

export default function ExploreProducts() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("all");
  const [limit, setLimit] = useState(10);
  const [showAllCats, setShowAllCats] = useState(false);

  const { data: categoriesData, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/all-products`
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const json = await res.json();
      return json.categories || [];
    },
    keepPreviousData: true,
    onSuccess: (data) => {
      if (data.length > 8) setShowAllCats(true);
    },
  });

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ["products", activeTab],
    queryFn: async () => {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/all-products`,
        window.location.origin
      );
      if (activeTab !== "all") url.searchParams.set("slug", activeTab);
      url.searchParams.set("limit", limit.toString());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    keepPreviousData: true,
  });

  const products = productsData?.products || [];
  const categories = categoriesData || [];

  const handleLoadMore = () => setLimit((prev) => prev + 6);
  // Show max 8 categories initially on mobile

  return (
    <Container className="bg-white my-3 px-1">
      <div>
        {/* Header */}
        <div className="relative overflow-hidden mb-5">
          <div className="relative z-10 py-6 text-center text-black px-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-wide uppercase drop-shadow-2xl">
              Today’s
            </h3>
            <h2 className="text-xl sm:text-4xl font-extrabold uppercase drop-shadow-lg">
              Explore Our Products
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 px-2">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar">
            {/* Tabs */}
            <div className="flex gap-4 flex-nowrap">
              {/* All Tab */}
              <button
                onClick={() => {
                  setActiveTab("all");
                  setLimit(6);
                }}
                className="relative pb-1 font-medium whitespace-nowrap"
              >
                <span
                  className={`${
                    activeTab === "all"
                      ? "text-destructive font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  All
                </span>
                {activeTab === "all" && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-destructive "
                  />
                )}
              </button>

              {/* Category Tabs */}
              {(showAllCats ? categories : categories.slice(0, 6)).map(
                (cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      setActiveTab(cat.slug);
                      setLimit(6);
                    }}
                    className="relative pb-1 text-sm font-medium whitespace-nowrap"
                  >
                    <span
                      className={`${
                        activeTab === cat.slug
                          ? "text-destructive font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {cat.name}
                    </span>
                    {activeTab === cat.slug && (
                      <motion.div
                        layoutId="underline"
                        className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-destructive rounded-full"
                      />
                    )}
                  </button>
                )
              )}
            </div>

            {/* See More / Show Less */}
            {categories.length > 6 && (
              <button
                onClick={() => setShowAllCats((prev) => !prev)}
                className="ml-3 text-sm font-medium text-blue-600 hover:underline whitespace-nowrap flex-shrink-0"
              >
                {showAllCats ? "Show Less" : "See More"}
              </button>
            )}
          </div>
        </div>
        <hr className="mb-6" />
        {/* Product Grid with Framer Motion */}
        <AnimatePresence mode="wait">
          {prodLoading || catLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              {Array.from({ length: 5 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="animate-pulse border rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-200 h-40 w-full" />
                  <CardContent className="p-3 space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded" />
                    <div className="bg-gray-200 h-4 w-1/2 rounded" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 py-20"
            >
              <p className="text-lg font-medium">No products found.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              {products.map((product) => (
                <Suspense
                  key={product._id}
                  fallback={
                    <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
                  }
                >
                  <ProductCard product={product} />
                </Suspense>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More */}
        {!prodLoading &&
          products.length > 0 &&
          products.length % limit === 0 && (
            <div className="flex justify-center mt-10">
              <Button
                onClick={handleLoadMore}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-none"
              >
                Load More
              </Button>
            </div>
          )}
      </div>
    </Container>
  );
}
