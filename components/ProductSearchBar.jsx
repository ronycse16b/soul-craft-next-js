"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

export default function ProductSearchBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 🔹 Debounce to prevent too many requests
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(handler);
  }, [query]);

  // 🔹 Fetch from backend
  const { data, isFetching } = useQuery({
    queryKey: ["searchProducts", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/search?q=${debouncedQuery}`
      );
     
      return res.data?.data || [];
    },
    enabled: !!debouncedQuery,
  });


  

  return (
    <div className="relative w-full sm:w-72">
    
      {/* Search Input */}
      <div className="flex items-center w-full relative">
        <Input
          placeholder="What are you looking for?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className=" pl-10 text-sm border-gray-300 focus-visible:ring-0 focus:border-gray-400 rounded-md w-full"
        />
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
      </div>

      {/* Mobile visible input */}
     

      {/* Search Results Dropdown */}
      {debouncedQuery && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
          {isFetching ? (
            <p className="p-3 text-sm text-gray-500">Searching...</p>
          ) : data.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">No products found</p>
          ) : (
            data?.map((p) => (
              <Link
                key={p._id}
                href={`/products/${p.slug}`}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors"
                onClick={() => setQuery("")}
              >
                <div className="relative w-10 h-10 rounded overflow-hidden border">
                  <Image
                    src={p?.thumbnail}
                    alt={p?.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {p.productName}
                  </p>
                 
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
