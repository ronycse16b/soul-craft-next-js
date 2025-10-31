"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
// import { formatDistanceToNow } from "date-fns"; // optional friendly timestamps

/**
 * ProductListView
 *
 * Props (optional):
 * - productsFromServer: array of product objects OR null if you want this component to fetch by itself
 * - fetchProducts: async function({ page, pageSize, filters, search }) => { items, total }
 *
 * Product shape example:
 * {
 *   id, productName, brand, thumbnail, sizes: [{ price, sku, quantity }], category, colors: [], createdAt
 * }
 *
 * NOTE: Replace mockFetch with your real API call (axios/fetch) or pass a fetchProducts prop.
 */

const PRIMARY = "#f69224";
const SECONDARY = "#6fd300";

function mockFetch({ page, pageSize, filters, search }) {
  // Mock: returns generated items and total count; replace with API
  const total = 57;
  const start = (page - 1) * pageSize;
  const items = new Array(pageSize).fill(0).map((_, i) => {
    const id = start + i + 1;
    return {
      id,
      productName: `Product ${id}`,
      brand: ["Acme", "Makers", "CraftCo"][id % 3],
      thumbnail: "/p1.png" + id,
      sizes: [
        {
          price: (20 + id).toFixed(2),
          sku: `SKU-${1000 + id}`,
          quantity: id % 5,
        },
      ],
      category: ["Power Tools", "Hand Tools", "Accessories"][id % 3],
      colors: ["Black", "Coffee", "Master"].slice(0, (id % 3) + 1),
      createdAt: new Date(Date.now() - id * 86400000).toISOString(),
      rating: (Math.random() * 2 + 3).toFixed(1),
    };
  });
  return new Promise((res) => setTimeout(() => res({ items, total }), 350));
}

/* --- Product Card --- */
// function ProductCard({ product }) {
//   const price = product.sizes?.[0]?.price ?? "—";
//   return (
//     <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
//       <div className="relative w-full aspect-square">
//         <Image
//           src={product.thumbnail}
//           alt={product.productName}
//           fill
//           className="object-cover"
//         />
//       </div>
//       <div className="p-3 flex-1 flex flex-col justify-between">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-800">
//             {product.productName}
//           </h3>
//           <p className="text-xs text-gray-500">{product.brand}</p>
//           <div className="mt-2 text-sm font-medium" style={{ color: PRIMARY }}>
//             ${price}
//           </div>
//         </div>
//         <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
//           <div>{product.colors?.slice(0, 2).join(", ")}</div>
//           {/* <div title={product.createdAt}>
//             {formatDistanceToNow(new Date(product.createdAt), {
//               addSuffix: true,
//             })}
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );
// }

/* --- Pagination Controls --- */
function Pagination({ page, totalPages, setPage }) {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        className="px-3 py-1 rounded border text-sm"
        aria-label="Previous page"
      >
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => setPage(1)}
            className="px-3 py-1 rounded text-sm border"
          >
            1
          </button>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded text-sm border ${
            p === page ? "bg-orange-500 text-white border-orange-500" : ""
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2">…</span>}
          <button
            onClick={() => setPage(totalPages)}
            className="px-3 py-1 rounded text-sm border"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        className="px-3 py-1 rounded border text-sm"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}

/* --- Main Component --- */
export default function ProductListView({
  productsFromServer = null,
  fetchProducts = null,
}) {
  // pagination + filters + search states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [products, setProducts] = useState(productsFromServer ?? []);
  const [loading, setLoading] = useState(false);

  // filters
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]); // min, max
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [search, setSearch] = useState("");

  // UI: collapse filters on mobile
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Derived list of available brands/categories from currently loaded products (local)
  const availableBrands = useMemo(() => {
    const setB = new Set();
    products.forEach((p) => p.brand && setB.add(p.brand));
    return Array.from(setB).slice(0, 12);
  }, [products]);

  // Fetcher (either from prop or mock)
  async function load({ page, pageSize, replace = true }) {
    setLoading(true);
    try {
      const fetcher = fetchProducts ?? mockFetch;
      const { items, total: t } = await fetcher({
        page,
        pageSize,
        filters: { category, priceRange, brands: selectedBrands },
        search,
      });
      setTotal(t);
      if (replace) setProducts(items);
      else setProducts((prev) => [...prev, ...items]);
    } catch (e) {
      console.error("load products error", e);
    } finally {
      setLoading(false);
    }
  }

  // initial + whenever page/filters/search change
  useEffect(() => {
    setPage(1);
    load({ page: 1, pageSize, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    selectedBrands.join(","),
    priceRange.join(","),
    search,
    pageSize,
  ]);

  // when page changes (pagination click)
  useEffect(() => {
    load({ page, pageSize, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // toggle brand in selectedBrands
  function toggleBrand(brand) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  // helper: clear filters
  function clearFilters() {
    setCategory("All");
    setSelectedBrands([]);
    setPriceRange([0, 1000]);
    setSearch("");
  }

  return (
    <div className=" py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-md font-bold" style={{ color: PRIMARY }}>
          Home / Shop
        </h1>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <label className="text-sm text-gray-600">Show</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>

          <div className="sm:hidden">
            {/* Mobile: toggles filters */}
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
        {/* Filters column */}
        <aside
          className={`lg:col-span-3 ${
            filtersOpen ? "block" : "hidden"
          } sm:block bg-white    max-h-[350px] `}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Filters</h2>
            <button onClick={clearFilters} className="text-xs text-gray-500">
              Clear
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded px-2 py-1"
              >
                <option>All</option>
                <option>Power Tools</option>
                <option>Hand Tools</option>
                <option>Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brands</label>
              <div className="flex flex-wrap gap-2">
                {availableBrands.length === 0 ? (
                  <div className="text-xs text-gray-400">No brands yet</div>
                ) : (
                  availableBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => toggleBrand(b)}
                      className={`px-2 py-1 border rounded text-sm ${
                        selectedBrands.includes(b)
                          ? "bg-orange-500 text-white border-orange-500"
                          : ""
                      }`}
                    >
                      {b}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value || 0), priceRange[1]])
                  }
                  className="w-1/2 border rounded px-2 py-1"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value || 0)])
                  }
                  className="w-1/2 border rounded px-2 py-1"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  setPage(1);
                  load({ page: 1, pageSize, replace: true });
                  setFiltersOpen(false);
                }}
                className="w-full py-2 rounded text-white bg-destructive"
                
              >
                Apply
              </button>
            </div>
          </div>
        </aside>

        {/* Products column */}
        <main className="lg:col-span-9">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <strong>{Math.min(products.length, total)}</strong> of{" "}
              <strong>{total}</strong>
            </div>

            {/* <div className="hidden sm:flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="px-3 py-2 border rounded w-64"
              />
            </div> */}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading && products.length === 0 ? (
              // skeletons
              new Array(pageSize)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg animate-pulse h-60"
                  />
                ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-500">
                No products found.
              </div>
            ) : (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>

          {/* Pagination + Load more */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
