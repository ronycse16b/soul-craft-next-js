// hooks/useProductsQuery.js
"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useProductsQuery = (filters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products-by-category?slug=${params}`
      );
      return data;
    },
    staleTime: 1000 * 60, // 1 minute caching
    keepPreviousData: true,
  });
};
