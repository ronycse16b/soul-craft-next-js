"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Button } from "../ui/button";
import { Edit, Trash } from "lucide-react";

const AllProducts = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?page=${page}&limit=10&search=${searchTerm}`
      );
      const data = res.data;
      setProducts(data.result || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, page]);

  const changePage = async (newPage) => {
    setPage(newPage);
    await fetchProducts();
  };

  const toggleProductField = async (productId, field) => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/product/${productId}?field=${field}`
      );
      if (res.data?.success) {
        toast.success(`${field} toggled!`);
        fetchProducts();
      } else {
        toast.error(res.data.message || "Failed to toggle");
      }
    } catch {
      toast.error("Failed to toggle field");
    }
  };

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
        fetchProducts();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white w-full overflow-x-auto border">
      <h1 className="text-gray-700 mb-4 text-base sm:text-lg font-semibold">
        Products Management
      </h1>

      {/* Search + Add */}
      <form className="flex flex-col sm:flex-row gap-2 justify-between mb-4">
        <input
          type="text"
          placeholder="Search product by name or SKU"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 text-sm w-full sm:w-1/3 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <Link href={`/dashboard/add-product`}>
          <Button
            type="button"
            className="bg-sky-600 text-white text-sm px-4 py-2 rounded hover:bg-sky-700 transition w-full sm:w-auto"
          >
            Add New Product
          </Button>
        </Link>
      </form>

      {loading ? (
        <div className="animate-pulse text-sm text-gray-500">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No products found.</p>
      ) : (
        <>
          <div className="overflow-x-auto w-full ">
            <table className="min-w-[1000px] w-full text-xs text-gray-700 whitespace-nowrap">
              <thead className="bg-sky-100 text-gray-600 uppercase">
                <tr>
                  {[
                    "#",
                    "Image",
                    "Name",
                    // "Category",
                    "Type",
                    "SKU",
                    "Base Price",
                    "Discount",
                    "Stock",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 border text-left font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((item, index) => (
                  <Fragment key={item._id}>
                    <tr className="hover:bg-gray-50 transition">
                      <td className="px-3 py-1 border text-center">
                        {index + 1}
                      </td>
                      <td className="px-3 py-1 border">
                        <img
                          src={item.thumbnail}
                          alt="product"
                          className="w-10 h-8 object-cover rounded border"
                        />
                      </td>
                      <td className="px-3 py-1 border font-medium text-gray-800 truncate max-w-[160px]">
                        {item.productName}
                      </td>
                      {/* <td className="px-3 py-1 border">
                        {item.subCategory?.name}
                      </td> */}
                      <td className="px-3 py-1 border capitalize">
                        {item.type}
                      </td>
                      <td className="px-3 py-1 border">{item.sku || "--"}</td>
                      <td className="px-3 py-1 border font-semibold text-gray-800">
                        ৳ {item.price || "--"}
                      </td>
                      <td className="px-3 py-1 border text-green-600">
                        {item.discount ? `৳ ${item.discount}` : "--"}
                      </td>
                      <td className="px-3 py-1 border text-center">
                        {item.type === "variant"
                          ? item.variant?.reduce((a, v) => a + v.quantity, 0)
                          : item.quantity}
                      </td>
                      <td className="px-3 py-1 border text-center">
                        <div className="flex gap-1 flex-wrap justify-center">
                          <Link href={`/dashboard/product-update/${item.slug}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-sky-600 text-white hover:bg-sky-700 h-7 text-xs px-2"
                            >
                              <Edit className="w-3 h-3 mr-1" /> Edit
                            </Button>
                          </Link>
                          <Button
                            onClick={() =>
                              toggleProductField(item._id, "newArrival")
                            }
                            size="sm"
                            variant="ghost"
                            className={`h-7 text-xs px-2 text-white ${
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
                            size="sm"
                            variant="ghost"
                            className={`h-7 text-xs px-2 text-white ${
                              item.isActive
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-400 hover:bg-gray-500"
                            }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Button>
                          <Button
                            onClick={() => handleDelete(item._id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 bg-red-500 text-white hover:bg-red-600"
                          >
                            <Trash className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Variant child table */}
                    {item.type === "variant" && item.variant?.length > 0 && (
                      <tr>
                        <td colSpan={10} className="p-0 bg-gray-50">
                          <div className="p-2 overflow-x-auto">
                            <table className="min-w-[500px] w-full text-xs border border-gray-200">
                              <thead className="bg-gray-200 text-gray-700 uppercase text-[10px]">
                                <tr>
                                  {[
                                    "Variant",
                                    "SKU",
                                    "Price",
                                    "Quantity",
                                    "Discount",
                                  ].map((v, i) => (
                                    <th key={i} className="px-2 py-1 border">
                                      {v}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.variant.map((v, i) => (
                                  <tr
                                    key={i}
                                    className="hover:bg-gray-100 transition text-[10px] text-[14px]"
                                  >
                                    <td className="px-2 py-1 border">
                                      {v.variant}
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
                                        <span className="ml-1 text-red-500 text-[9px] font-medium">
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
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center sm:justify-end mt-4 gap-1 flex-wrap text-xs">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => page > 1 && changePage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => changePage(i + 1)}
                className={`px-2 py-1 border rounded ${
                  page === i + 1
                    ? "bg-sky-600 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => page < totalPages && changePage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllProducts;
