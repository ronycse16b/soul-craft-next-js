"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ProductCard from "./ProductCard";

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
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
