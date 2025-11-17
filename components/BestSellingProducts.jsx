"use client";

import dynamic from "next/dynamic";

// Lazy load ProductCard (client-only)
const ProductCard = dynamic(() => import("./ProductCard"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
  ),
});

import Link from "next/link";
import Container from "./Container";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

export default function BestSellingProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["bestSelling"], // query key
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/best-selling-products`
      );
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
  const limit = 5;

  return (
    <>
      {data?.bestSelling?.length > 0 && (
        <section className="py-14 bg-white">
          <Container>
            <div className="flex flex-row justify-between items-center mb-10">
              <div>
                <span className="text-[#f69224] font-semibold text-sm tracking-wide flex items-center gap-2">
                  <div className="w-2 h-5 rounded-sm bg-[#f69224]" />
                  This Month
                </span>
                <h2 className="text-md sm:text-2xl font-bold text-black mt-2 uppercase">
                  Best Selling Products
                </h2>
              </div>

              <Link href="/best-selling">
                <Button className="bg-destructive hover:bg-destructive/90 text-white mt-4 sm:mt-0 rounded-none">
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {products?.slice(0, limit)?.map((product) => (
                <Suspense
                  key={product._id}
                  fallback={
                    <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
                  }
                >
                  <ProductCard product={product} />
                </Suspense>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
