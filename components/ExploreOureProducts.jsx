"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Container from "./Container";
import ProductCard from "./ProductCard";

export default function ExploreProducts() {
  const pathname = usePathname(); // get current route
  const [activeTab, setActiveTab] = useState("all");
  const [limit, setLimit] = useState(10);

  const { data: categoriesData, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/all-products");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const json = await res.json();
      return json.categories || [];
    },
  });

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ["products", activeTab],
    queryFn: async () => {
      const url = new URL("/api/all-products", window.location.origin);
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

  return (
    <Container className=" bg-white mt-2 px-1">
      <div>
        {/* Conditionally render header only on /shop */}
        {/* {!pathname === "/shop" && (
        
        )} */}
        <div className="relative bg-gradient-to-r from-[#f91d16] via-[#f59e0b] to-[#056444] overflow-hidden mb-10">
          <div className="relative z-10 py-16 text-center text-white px-1 ">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-wide uppercase">
              Today’s
            </h3>
            <h2 className="text-xl sm:text-4xl font-extrabold uppercase drop-shadow-lg">
              Explore Our Products
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl mx-auto">
              Discover our complete range of products across all categories.
              Find your favorites, check out the latest arrivals, and shop with
              confidence.
            </p>
          </div>

          {/* Overlay Effect */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        </div>

        {/* Tabs */}
        <div className="mb-8 overflow-x-auto no-scrollbar px-4">
          <div className="flex gap-3 min-w-max">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("all");
                setLimit(10);
              }}
              className={`rounded-full text-sm px-5 flex-shrink-0 transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-destructive hover:bg-destructive/80 text-white"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              All
            </Button>

            {categories.map((cat) => (
              <Button
                key={cat._id}
                variant={activeTab === cat.slug ? "default" : "outline"}
                onClick={() => {
                  setActiveTab(cat.slug);
                  setLimit(10);
                }}
                className={`rounded-full text-sm px-5 flex-shrink-0 transition-all duration-200 ${
                  activeTab === cat.slug
                    ? "bg-destructive hover:bg-destructive/80 text-white"
                    : "text-gray-700 hover:text-black"
                }`}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {prodLoading || catLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Card
                key={idx+1}
                className="animate-pulse border rounded-lg overflow-hidden"
              >
                <div className="bg-gray-200 h-40 w-full" />
                <CardContent className="p-3 space-y-2">
                  <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg font-medium">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

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
