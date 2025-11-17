"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useRef, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Button } from "../ui/button";
import { ChevronDown, Edit, Trash } from "lucide-react";
import FeatureControl from "./FeatureControl";
import { useQuery } from "@tanstack/react-query";
import { PacmanLoader } from "react-spinners";
import { Package, CheckCircle, XCircle, Layers } from "lucide-react";

const AllProducts = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

  // =======================
  // 🚀 TANSTACK FETCHER
  // =======================
  const fetchProducts = async ({ queryKey }) => {
    const [_key, page, searchTerm] = queryKey;

    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?page=${page}&limit=10&search=${searchTerm}`
    );

    return res.data;
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["products", page, searchTerm],
    queryFn: fetchProducts,
    keepPreviousData: true,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60 * 30,
  });

  const products = data?.result || [];
  const totalPages = data?.totalPages || 1;
  const loading = isLoading || isFetching;

  // =======================
  // 🚦 Toggle Product Field
  // =======================
  const toggleProductField = async (productId, field) => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/product/${productId}?field=${field}`
      );

      if (res.data?.success) {
        toast.success(`${field} toggled!`);
        refetch(); // 🔥 correct for tanstack
      } else {
        toast.error(res.data.message || "Failed to toggle");
      }
    } catch {
      toast.error("Failed to toggle field");
    }
  };

  // =======================
  // 🗑 Delete Product
  // =======================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/product/${id}`
      );

      if (res.data.success) {
        toast.success("Product deleted");
        refetch(); // 🔥 tanstack refresh
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  // =======================
  // 🔽 Expand Variant Table
  // =======================
  const [expanded, setExpanded] = useState(new Set());
  const contentRefs = useRef({});

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // =======================
  // 📄 Pagination
  // =======================
  const changePage = (newPage) => {
    setPage(newPage);
  };

  return (
    <>
      {/* ======================= SUMMARY CARDS ======================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Products",
            value: products.length,
            color: "text-sky-600",
            icon: Package,
            bg: "bg-sky-200",
          },
          {
            label: "Active Items",
            value: products.filter((p) => p.isActive).length,
            color: "text-green-600",
            icon: CheckCircle,
            bg: "bg-green-200",
          },
          {
            label: "Out of Stock",
            value: products.filter(
              (p) => p.quantity < 1 && p.type !== "variant"
            ).length,
            color: "text-red-600",
            icon: XCircle,
            bg: "bg-red-200",
          },
          {
            label: "Variants",
            value: products.filter((p) => p.type === "variant").length,
            color: "text-purple-600",
            icon: Layers,
            bg: "bg-purple-200",
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`p-4 rounded shadow-lg hover:shadow-2xl transition relative overflow-hidden flex items-center gap-4 ${card.bg}`}
            style={{ minHeight: "120px" }}
          >
            {/* Icon container */}
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full bg-white`}
            >
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>

            {/* Text content */}
            <div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <h2 className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* ======================= LOADING OVERLAY (SECTION ONLY) ======================= */}

      {/* ======================= MAIN WRAPPER ======================= */}
      <div className="relative p-4 sm:p-6 bg-white w-full overflow-x-auto border">
        <h1 className="text-gray-800 mb-5 text-xl sm:text-2xl font-semibold">
          Product Management
        </h1>

        {/* Search + Add */}
        <form className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
          <input
            type="text"
            placeholder="Search product by name or SKU"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 bg-white p-2 text-sm w-full sm:w-1/3 rounded focus:outline-none focus:ring-2 focus:ring-gradient-to-r focus:ring-orange-400 focus:border-transparent"
          />

          <Link href={`/dashboard/add-product`}>
            <Button className="bg-destructive hover:bg-destructive/90 text-white text-sm px-5 py-4 rounded hover:scale-105 transition transform shadow-md">
              <span className="flex items-center gap-2">
                <Edit className="w-4 h-4" /> Add New Product
              </span>
            </Button>
          </Link>
        </form>

        {/* ======================= TABLE ======================= */}
        {products.length === 0 && !loading ? (
          <p className="text-gray-500 text-center py-12 text-lg">
            No products found.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto w-full relative">
              {loading &&  <span>Processing...</span>}
              <table className="min-w-[1000px] table w-full text-sm text-gray-700 whitespace-nowrap rounded overflow-hidden shadow-md">
                <thead className="bg-gray-50  text-gray-700 uppercase ">
                  <tr className="py-6">
                    {[
                      "#",
                      "Image",
                      "Name",
                      "Type",
                      "SKU",
                      "Base Price",
                      "Discount",
                      "Stock",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 border font-medium text-left"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {products.map((item, index) => {
                    const id = item._id ?? index;
                    const isOpen = expanded.has(id);

                    return (
                      <Fragment key={id}>
                        {/* ======================= MAIN PRODUCT ROW ======================= */}
                        <tr className="hover:bg-gray-50 transition duration-200">
                          <td className="px-3 py-1 border text-center">
                            {index + 1}
                          </td>

                          <td className="px-3 py-1 border">
                            <img
                              src={item.thumbnail}
                              className="w-10 h-10 object-cover rounded-md border shadow-sm"
                              alt="product"
                            />
                          </td>

                          <td className="px-3 py-1 border font-medium text-gray-800 truncate max-w-[160px]">
                            {item.productName}
                          </td>

                          <td className="px-3 py-1 border capitalize">
                            {item.type}
                          </td>
                          <td className="px-3 py-1 border">
                            {item.sku || "--"}
                          </td>

                          <td className="px-3 py-1 border font-semibold text-gray-800">
                            ৳ {item.price || "--"}
                          </td>

                          <td className="px-3 py-1 border text-green-600">
                            {item.discount ? `৳ ${item.discount}` : "--"}
                          </td>

                          <td className="px-3 py-1 border text-center">
                            {item.type === "variant"
                              ? item.variants?.reduce(
                                  (a, v) => a + v.quantity,
                                  0
                                )
                              : item.quantity}
                          </td>

                          <td className="px-3 py-1 border text-center flex flex-wrap gap-1 justify-center">
                            {item.type === "variant" &&
                              item.variants?.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggle(id)}
                                  aria-expanded={isOpen}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition text-xs"
                                >
                                  Details{" "}
                                  <ChevronDown
                                    size={15}
                                    className={`transform transition-transform duration-300 ${
                                      isOpen ? "rotate-180" : "rotate-0"
                                    }`}
                                  />
                                </button>
                              )}

                            <FeatureControl product={item} />

                            <Link
                              href={`/dashboard/product-update/${item.slug}`}
                            >
                              <Button className="bg-gradient-to-r from-sky-500 to-sky-700 text-white h-7 px-2 text-xs rounded-md hover:scale-105 transition">
                                <Edit className="w-3 h-3 mr-1" /> Edit
                              </Button>
                            </Link>

                            <Button
                              onClick={() =>
                                toggleProductField(item._id, "newArrival")
                              }
                              className={`h-7 px-2 text-xs text-white rounded-md ${
                                item.newArrival
                                  ? "bg-yellow-500 hover:bg-yellow-600"
                                  : "bg-yellow-600 hover:bg-yellow-700"
                              }`}
                            >
                              {item.newArrival ? "Remove New" : "Mark New"}
                            </Button>

                            <Button
                              onClick={() =>
                                toggleProductField(item._id, "isActive")
                              }
                              className={`h-7 px-2 text-xs text-white rounded-md ${
                                item.isActive
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-gray-400 hover:bg-gray-500"
                              }`}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </Button>

                            <Button
                              onClick={() => handleDelete(item._id)}
                              className="h-7 px-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              <Trash className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </td>
                        </tr>

                        {/* ======================= VARIANT ROW ======================= */}
                        {item.type === "variant" &&
                          item.variants?.length > 0 && (
                            <tr>
                              <td colSpan={10} className="p-0 bg-gray-50">
                                <div
                                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                    isOpen ? "max-h-[500px] p-2" : "max-h-0 p-0"
                                  }`}
                                >
                                  <div className="overflow-x-auto">
                                    <table className="min-w-[500px] w-full text-xs border border-gray-200 rounded-md">
                                      <thead className="bg-gray-200 text-gray-700 uppercase text-[10px]">
                                        <tr>
                                          {[
                                            "Variant",
                                            "SKU",
                                            "Price",
                                            "Qty",
                                            "Discount",
                                          ].map((v, i) => (
                                            <th
                                              key={i}
                                              className="px-2 py-1 border"
                                            >
                                              {v}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {item.variants.map((v, i) => (
                                          <tr
                                            key={i}
                                            className="hover:bg-gray-100 transition text-[13px]"
                                          >
                                            <td className="px-2 py-1 border">
                                              {Object.entries(
                                                v.attributes || {}
                                              )
                                                .map(
                                                  ([k, val]) => `${k}: ${val}`
                                                )
                                                .join(", ")}
                                            </td>

                                            <td className="px-2 py-1 border">
                                              {v.sku}
                                            </td>

                                            <td className="px-2 py-1 border font-semibold text-gray-800">
                                              ৳ {v.price}
                                            </td>

                                            <td className="px-2 py-1 border">
                                              {v.quantity}
                                              {v.quantity < 5 && (
                                                <span className="ml-1 text-red-500 text-[10px] font-medium">
                                                  (Low)
                                                </span>
                                              )}
                                            </td>

                                            <td className="px-2 py-1 border">
                                              {v.discount || 0}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ======================= PAGINATION ======================= */}
            <div className="flex justify-center sm:justify-end mt-6 gap-2 flex-wrap text-xs">
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-50 hover:scale-105 transition"
                onClick={() => page > 1 && changePage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => changePage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    page === i + 1
                      ? "bg-destructive text-white"
                      : " hover:bg-destructive/90 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="px-3 py-1 border rounded-md disabled:opacity-50 hover:scale-105 transition"
                onClick={() => page < totalPages && changePage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AllProducts;
