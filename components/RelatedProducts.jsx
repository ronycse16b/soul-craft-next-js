"use client";

import dynamic from "next/dynamic";

// Lazy load ProductCard (client-only)
const ProductCard = dynamic(() => import("./ProductCard"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
  ),
});

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Suspense } from "react";

export default function RelatedProducts({ categoryId, excludeId }) {
  const fetchRelated = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/related?category=${categoryId}&exclude=${excludeId}`
    );
    return res.data.data;
  };

  const {
    data: relatedProducts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["relatedProducts", categoryId, excludeId],
    queryFn: fetchRelated,
    enabled: !!categoryId, // only fetch if categoryId exists
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  if (isLoading) return <p>Loading related products...</p>;
  if (isError || relatedProducts.length === 0)
    return <p>No related products found.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {relatedProducts?.map((p) => (
        <Suspense
          key={p._id}
          fallback={
            <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
          }
        >
          <ProductCard product={p} />
        </Suspense>
      ))}
    </div>
  );
}
