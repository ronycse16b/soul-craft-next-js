"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HashLoader } from "react-spinners";


export default function ProductListView({ slug }) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch products using TanStack Query
  const { data, isFetching } = useQuery({
    queryKey: ["products", slug, selectedSub, selectedFilters, page, sortBy],
    queryFn: async () => {
      const filtersQuery = Object.entries(selectedFilters)
        .map(([key, vals]) => `${key}:${vals.join(",")}`)
        .join("|");

      const url = `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/api/products-by-category?slug=${slug}&page=${page}&pageSize=${pageSize}&sort=${sortBy}${
        selectedSub ? `&subCategoriesId=${selectedSub}` : ""
      }${filtersQuery ? `&filters=${filtersQuery}` : ""}`;

      const res = await axios.get(url);
      return res.data;
    },
    keepPreviousData: false, // ensures new query replaces previous products
  });

  const products = data?.result ?? [];
  const subCategories = data?.subCategories ?? [];
  const filters = data?.filters ?? {};
  const pagination = data?.pagination ?? { total: 0, page: 1, pages: 1 };
  const totalPages = pagination.pages;

  const toggleFilter = (key, value) => {
    setSelectedFilters((prev) => {
      const current = new Set(prev[key] || []);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [key]: [...current] };
    });
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSelectedSub(null);
    setSortBy("newest");
    setPage(1);
  };

const Pagination = () => {
  const maxVisible = 5; // max buttons to show at once (excluding Prev/Next)
  const pages = [];

  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

  const handlePrev = () => setPage(Math.max(1, page - 1));
  const handleNext = () => setPage(Math.min(totalPages, page + 1));

  const handleEllipsisLeft = () => setPage(Math.max(1, start - 1));
  const handleEllipsisRight = () => setPage(Math.min(totalPages, end + 1));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={handlePrev} className="px-3 py-1 border rounded text-sm">
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => setPage(1)}
            className="px-3 py-1 border rounded text-sm"
          >
            1
          </button>
          {start > 2 && (
            <button
              onClick={handleEllipsisLeft}
              className="px-2 py-1 border rounded text-sm"
            >
              …
            </button>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded text-sm border ${
            p === page ? "bg-destructive text-white border-destructive" : ""
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <button
              onClick={handleEllipsisRight}
              className="px-2 py-1 border rounded text-sm"
            >
              …
            </button>
          )}
          <button
            onClick={() => setPage(totalPages)}
            className="px-3 py-1 border rounded text-sm"
          >
            {totalPages}
          </button>
        </>
      )}

      <button onClick={handleNext} className="px-3 py-1 border rounded text-sm">
        Next
      </button>
    </div>
  );
};


  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-md font-bold text-destructive">Shop</h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
          <div className="sm:hidden">
            <button
              className="px-3 py-1 rounded border"
              onClick={() => setFiltersOpen((s) => !s)}
            >
              {filtersOpen ? "Hide Filters" : "Filters"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside
          className={`lg:col-span-3 border-r  ${
            filtersOpen ? "block" : "hidden"
          } sm:block bg-white rounded-md  p-4`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Filters</h2>
            <button onClick={clearFilters} className="text-xs text-gray-500">
              Clear
            </button>
          </div>

          {/* Subcategories */}
          {subCategories?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Category</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedSub(null)}
                  className={`text-left px-3 py-1 rounded border text-sm uppercase ${
                    selectedSub === null
                      ? "bg-orange-500 text-white border-orange-500"
                      : "hover:bg-orange-100"
                  }`}
                >
                  {slug}
                </button>
                {subCategories?.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => setSelectedSub(sub._id)}
                    className={`text-left px-3 py-1 rounded border text-sm uppercase ${
                      selectedSub === sub._id
                        ? "bg-orange-500 text-white border-orange-500"
                        : "hover:bg-orange-100"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic attribute filters */}
          {Object.entries(filters).map(([key, values]) => (
            <div key={key} className="mb-4">
              <h3 className="text-sm font-medium mb-2 capitalize">{key}</h3>
              <div className="flex flex-wrap gap-2">
                {values.map((v) => (
                  <button
                    key={v}
                    onClick={() => toggleFilter(key, v)}
                    className={`px-2 py-1 border rounded text-xs ${
                      selectedFilters[key]?.includes(v)
                        ? "bg-orange-500 text-white border-orange-500"
                        : "hover:bg-orange-100"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Products */}
        <main className="lg:col-span-9">
          {isFetching ? (
            <div className="flex items-center justify-center  min-h-[500px]">
              <HashLoader color="#e50000" size={50} />
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No products found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products?.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Pagination />
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
