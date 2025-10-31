"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Edit, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export default function FlashSaleManager() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editId, setEditId] = useState(null);

  // form contains product-level info including variant/skus and discount
  const [form, setForm] = useState({
    title: "",
    endTime: "",
    description: "",
    // products: [ { _id, productName, type, variant(s)?, sku?, discount, selectedVariant? } ]
    products: [],
  });

  const [productSearch, setProductSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // selected product _id(s)
  const [bulkDiscount, setBulkDiscount] = useState("");
  const queryClient = useQueryClient();

  // ----------- helpers for datetime-local conversion (local timezone) -----------
  const toLocalDatetimeInput = (isoOrDate) => {
    // accepts Date or ISO string -> returns "YYYY-MM-DDTHH:MM" for datetime-local input
    const d = isoOrDate ? new Date(isoOrDate) : new Date();
    const pad = (n) => (n < 10 ? "0" + n : n);
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const isoFromLocalInput = (localInputValue) => {
    // localInputValue like "2025-10-30T14:30" -> convert to ISO string (with timezone)
    // create date using local components to preserve user-chosen local time
    if (!localInputValue) return null;
    const d = new Date(localInputValue);
    return d.toISOString();
  };

  // ==================== FETCH FLASH SALES ====================
  const { data: flashSales = {}, isLoading: flashLoading } = useQuery({
    queryKey: ["flashSales"],
    queryFn: async () => (await axios.get("/api/flash-sale")).data,
  });

  // ==================== FETCH PRODUCTS (with search) ====================
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", productSearch],
    queryFn: async () => {
      const res = await axios.get("/api/all-products", {
        params: { search: productSearch, limit: 100 },
      });
      // make sure we return an array
      return res.data?.products || [];
    },
    keepPreviousData: true,
  });

  // ==================== MUTATIONS ====================
  const mutation = useMutation({
    mutationFn: async (data) =>
      editId
        ? axios.put(`/api/flash-sale/${editId}`, { id: editId, ...data })
        : axios.post("/api/flash-sale", data),
    onSuccess: () => {
      toast.success(editId ? "Flash Sale Updated!" : "Flash Sale Added!");
      queryClient.invalidateQueries(["flashSales"]);
      setModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      console.error("Flash mutation error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => axios.delete(`/api/flash-sale?id=${id}`),
    onSuccess: () => {
      toast.success("Deleted successfully!");
      queryClient.invalidateQueries(["flashSales"]);
    },
  });

  // Toggle active/inactive (server should update an "active" flag or endTime)
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }) =>
      // backend: toggle active or update endTime accordingly
      axios.post(`/api/flash-sale/toggle-active`, { id, active }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries(["flashSales"]);
    },
    onError: (err) => {
      console.error("Toggle active error", err);
      toast.error("Failed to update status");
    },
  });

  // ==================== HANDLERS ====================

  const handleEdit = (sale) => {
    setEditId(sale._id);

    // Map products to form.products preserving discounts, selectedVariant/sku and product meta
    // sale.products could be array of objects like: { productId: {...}, discount, variant? , sku? }
    const mappedProducts = (sale.products || []).map((entry) => {
      const productMeta = entry.productId || entry; // attempt both shapes
      return {
        _id: productMeta._id || productMeta.id || entry._id,
        productName:
          productMeta.productName ||
          productMeta.name ||
          entry.productName ||
          "Untitled",
        type: productMeta.type || productMeta.productType || "simple",
        sku: entry.sku || productMeta.sku || null,
        // variant info could be in entry.variant or productMeta.variant
        variant: entry.variant || productMeta.variant || null,
        attributes: productMeta.attributes || entry.attributes || null,
        discount:
          entry.discount != null ? entry.discount : productMeta.discount || 0,
        // keep raw product object if needed later
        _raw: productMeta,
      };
    });

    setForm({
      title: sale.title || "",
      // convert sale.endTime (ISO) to local datetime-local value
      endTime: sale.endTime ? toLocalDatetimeInput(sale.endTime) : "",
      description: sale.description || "",
      products: mappedProducts,
    });

    setSelectedIds(mappedProducts.map((p) => p._id));
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title) return toast.error("Title is required");
    if (!form.endTime) return toast.error("End time is required");

    // Build payload preserving sku/variant and discount
    const selectedProductsPayload = form.products.map((p) => {
      return {
        productId: p._id,
        discount: Number(p.discount || 0),
        sku: p.sku || (p._raw && p._raw.sku) || null,
        variant: p.variant || null,
      };
    });

    // convert local datetime-local to ISO
    const payload = {
      title: form.title,
      description: form.description,
      endTime: isoFromLocalInput(form.endTime),
      products: selectedProductsPayload,
    };

    // if trying to create new but active flash exists, block
    if (!editId) {
      const activeFlashExists = (flashSales.flashSales || []).some(
        (f) => new Date(f.endTime) > new Date()
      );
      if (activeFlashExists) {
        toast.error("An active flash sale already running. Edit it instead.");
        return;
      }
    }

    mutation.mutate(payload);
  };

  // when toggling selection from product list
const toggleSelect = (id) => {
  setSelectedIds((prev) => {
    const already = prev.includes(id);

    if (already) {
      // remove selection AND remove from form.products
      setForm((prevForm) => ({
        ...prevForm,
        products: prevForm.products.filter((fp) => fp._id !== id),
      }));
      return prev.filter((pid) => pid !== id);
    } else {
      // only add if not already in form.products
      setForm((prevForm) => {
        if (prevForm.products.some((fp) => fp._id === id)) return prevForm;

        const product = products.find((p) => p._id === id);
        if (!product) return prevForm;

        const newItem = {
          _id: product._id,
          productName: product.productName || product.name || "Untitled",
          type: product.type || product.productType || "simple",
          sku: product.sku || null,
          variant: null,
          attributes: product.attributes || null,
          discount: 0,
          _raw: product,
        };

        return {
          ...prevForm,
          products: [...prevForm.products, newItem],
        };
      });

      return [...prev, id];
    }
  });
};

  // update discount for a product in form.products
  const updateProductDiscount = (productId, value) => {
    const discount = Number(value || 0);
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p._id === productId ? { ...p, discount } : p
      ),
    }));
  };

  // update selected variant/sku for a product in form.products (if UI added later)
  const updateProductVariant = (productId, variantObj) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p._id === productId
          ? { ...p, variant: variantObj, sku: variantObj?.sku || p.sku }
          : p
      ),
    }));
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this flash sale?"))
      deleteMutation.mutate(id);
  };

  const handleBulkDiscount = () => {
    if (!bulkDiscount && bulkDiscount !== 0)
      return toast.error("Enter bulk discount %");
    const parsed = Number(bulkDiscount || 0);
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p) => ({ ...p, discount: parsed })),
    }));
    toast.success(`Applied ${parsed}% discount to all`);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ title: "", endTime: "", description: "", products: [] });
    setSelectedIds([]);
    setProductSearch("");
    setBulkDiscount("");
  };

  // ==================== LOGIC: Prevent multiple active flash ====================
  const activeFlash = (flashSales.flashSales || []).some(
    (f) => new Date(f.endTime) > new Date()
  );

  // ==================== FILTERED SALES ====================
  const filteredSales = (flashSales.flashSales || []).filter((item) =>
    (item.title || "").toLowerCase().includes(search.toLowerCase())
  );

  // toggle active/inactive UI handler (calls API)
  const handleToggleActive = (sale) => {
    // If currently active -> deactivate (set endTime to now or send active=false)
    const isActive = sale?.isActive;
    // prefer to call backend endpoint that toggles active status
    toggleActiveMutation.mutate({ id: sale._id, active: isActive ? false : true });
  };

  return (
    <section className="p-10 lg:p-15 bg-white border lg:max-w-[1300px] 2xl:max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Flash Sale Manager
      </h2>

      {/* Search + Add Button */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <Input
          placeholder="Search Flash Sale..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-none"
        />
        <Button
          onClick={() => {
            if (activeFlash) {
              toast.error(
                "An active flash sale is already running. Please edit it instead!"
              );
              return;
            }
            resetForm();
            // default endTime suggestion: 1 hour from now (local)
            const defaultEnd = toLocalDatetimeInput(
              new Date(Date.now() + 60 * 60 * 1000)
            );
            setForm((prev) => ({ ...prev, endTime: defaultEnd }));
            setModalOpen(true);
          }}
          className="bg-[#f69224] hover:bg-[#e68110] text-white"
        >
          + Add Flash
        </Button>
      </div>

      {/* Flash Sale Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-md">
        <Table className="min-w-full border-collapse border border-gray-300">
          <TableHeader className="sticky top-0 bg-gray-200 z-10">
            <TableRow>
              <TableHead className="border border-gray-300 px-3 py-2">
                SN
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2">
                Title
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2">
                Description
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2">
                End Time
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2">
                Products
              </TableHead>
              <TableHead className="border border-gray-300 px-3 py-2 text-center">
                Status / Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {flashLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-2">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-2">
                  No flash sales found
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale, idx) => {
               
                const isActive = sale?.isActive;
                return (
                  <React.Fragment key={sale._id}>
                    <TableRow className="border-b">
                      <TableCell className="border border-gray-300 px-3 py-2">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-3 py-2 font-semibold">
                        {sale.title}{" "}
                        {isActive ? (
                          <span className="ml-2 text-green-600 text-xs font-semibold">
                            (Active)
                          </span>
                        ) : (
                          <span className="ml-2 text-red-500 text-xs font-semibold">
                            (Inactive)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-3 py-2">
                        {sale.description}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-3 py-2">
                        {sale.endTime
                          ? new Date(sale.endTime).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-300 px-3 py-2">
                        {sale.products?.length || 0}
                      </TableCell>
                      <TableCell className="flex justify-center gap-2 border border-gray-300 px-3 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setExpanded(expanded === sale._id ? null : sale._id)
                          }
                        >
                          {expanded === sale._id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(sale)}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(sale._id)}
                        >
                          <Trash className="w-4 h-4 text-red-600" />
                        </Button>

                        {/* Active toggle */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(sale)}
                        >
                          {isActive ? "Set Inactive" : "Set Active"}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Product List */}
                    {expanded === sale._id && sale.products?.length > 0 && (
                      <TableRow className="bg-white">
                        <TableCell colSpan={7} className="p-0">
                          <div className="m-3 border  shadow-sm overflow-hidden">
                            <div className="bg-red-100 px-3 py-2 border-b">
                              <h4 className="text-sm font-semibold text-gray-700">
                                Product Details
                              </h4>
                            </div>

                            <Table className="w-full text-sm">
                              <TableHeader>
                                <TableRow className="bg-white">
                                  <TableHead className="border px-2 py-1">
                                    Product name
                                  </TableHead>
                               
                                  <TableHead className="border px-2 py-1">
                                    Variant
                                  </TableHead>
                                  <TableHead className="border px-2 py-1">
                                    SKU
                                  </TableHead>
                                  <TableHead className="border px-2 py-1">
                                    Price
                                  </TableHead>
                                  
                                </TableRow>
                              </TableHeader>

                              <TableBody>
                                {sale.products.map((p, i) => {
                                  const product = p.productId || {};
                                  const productName =
                                    product.productName || "Untitled";
                                  const type = product.type || "simple";
                                  const variants = Array.isArray(
                                    product.variant
                                  )
                                    ? product.variant
                                    : [];
                                

                                  // Helper for formatted price
                                 

                                  // Simple product
                                  if (type === "simple") {
                                   

                                    return (
                                      <TableRow key={i}>
                                        <TableCell className="border px-2 py-1">
                                          {productName}
                                        </TableCell>

                                        <TableCell className="border px-2 py-1">
                                          -
                                        </TableCell>
                                        <TableCell className="border px-2 py-1">
                                          {product.sku || "-"}
                                        </TableCell>
                                        <TableCell className="border px-2 py-1">
                                          {product?.discount > 0 ? (
                                            <span className="text-gray-400 line-through mr-1">
                                              {product.price}
                                            </span>
                                          ) : null}
                                          <span className="text-orange-600 font-medium">
                                            {product?.discount > 0
                                              ? product?.discount
                                              : product.price}
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  }

                                  // Variant product
                                  return (
                                    <React.Fragment key={i}>
                                      {variants.length > 0 ? (
                                        variants.map((v, idx) => {
                                          
                                          return (
                                            <TableRow key={idx}>
                                              <TableCell className="border px-2 py-1">
                                                {idx === 0 ? (
                                                  <span className="font-medium">
                                                    {productName}
                                                  </span>
                                                ) : (
                                                  ""
                                                )}
                                              </TableCell>
                                             
                                              <TableCell className="border px-2 py-1">
                                                {v.variant || "-"}
                                              </TableCell>
                                              <TableCell className="border px-2 py-1">
                                                {v.sku || "-"}
                                              </TableCell>
                                              <TableCell className="border px-2 py-1">
                                                {v.discount > 0 ||
                                                discount > 0 ? (
                                                  <>
                                                    <span className="text-gray-400 line-through mr-1">
                                                      {v.price}
                                                    </span>
                                                    <span className="text-orange-600 font-medium">
                                                      {
                                                        v.discount 
                                                      }
                                                    </span>
                                                  </>
                                                ) : (
                                                  <span>
                                                    {v.price}
                                                  </span>
                                                )}
                                              </TableCell>

                                              {/* <TableCell className="border px-2 py-1">
                                                {sale?.discount || 0}
                                              </TableCell> */}
                                            </TableRow>
                                          );
                                        })
                                      ) : (
                                        <TableRow>
                                          <TableCell className="border px-2 py-1">
                                            {productName}
                                          </TableCell>
                                          <TableCell className="border px-2 py-1 capitalize">
                                            Variant
                                          </TableCell>
                                          <TableCell className="border px-2 py-1">
                                            No variants
                                          </TableCell>
                                          <TableCell className="border px-2 py-1">
                                            -
                                          </TableCell>
                                          <TableCell className="border px-2 py-1">
                                            {product.price}
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ==================== MODAL ==================== */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className=" max-h-[90vh] min-w-[1000px] px-10">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Flash Sale" : "Add New Flash Sale"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Enter Flash Sale Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            {/* ==================== Product Selection ==================== */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-700 text-sm">
                  Select Products
                </h4>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Bulk %"
                    type="number"
                    value={bulkDiscount}
                    onChange={(e) => setBulkDiscount(e.target.value)}
                    className="w-36"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBulkDiscount}
                  >
                    Apply All
                  </Button>
                </div>
              </div>

              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />

              <div className="overflow-x-auto max-h-52 border border-gray-300 mt-5 rounded-md">
                <Table className="min-w-full border-collapse border border-gray-300">
                  <TableHeader className="sticky top-0 bg-gray-100 z-10">
                    <TableRow>
                      <TableHead className="border border-gray-300 px-3 py-2">
                        Select
                      </TableHead>
                      <TableHead className="border border-gray-300 px-3 py-2">
                        Product Name
                      </TableHead>
                      <TableHead className="border border-gray-300 px-3 py-2">
                        Price / Variants
                      </TableHead>
                      <TableHead className="border border-gray-300 px-3 py-2">
                        Discount
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {productsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-2">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-2">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((p) => {
                        const selected = selectedIds.includes(p._id);
                        // find discount in form.products if exists
                        const existing =
                          form.products.find((fp) => fp._id === p._id)
                            ?.discount ?? 0;

                        return (
                          <TableRow
                            key={p._id}
                            className="hover:bg-gray-50 border border-gray-300"
                          >
                            <TableCell className="border border-gray-300 px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSelect(p._id)}
                              />
                            </TableCell>

                            <TableCell className="border border-gray-300 px-3 py-2 font-medium">
                              {p.productName}
                              <div className="text-xs text-gray-500">
                                SKU: {p.sku || "-"}
                              </div>
                            </TableCell>

                            <TableCell className="border border-gray-300 px-3 py-2">
                              {p.type === "variant" ? (
                                <Table className="min-w-full border border-gray-200">
                                  <TableHeader>
                                    <TableRow className="bg-gray-50">
                                      <TableHead className="text-xs border border-gray-200 px-2 py-1">
                                        Variant
                                      </TableHead>
                                      <TableHead className="text-xs border border-gray-200 px-2 py-1">
                                        Price
                                      </TableHead>
                                      <TableHead className="text-xs border border-gray-200 px-2 py-1">
                                        Discount
                                      </TableHead>
                                      <TableHead className="text-xs border border-gray-200 px-2 py-1">
                                        SKU
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {(p.variant || []).map((v, i) => (
                                      <TableRow
                                        key={i}
                                        className="border-b border-gray-200"
                                      >
                                        <TableCell className="text-xs px-2 py-1">
                                          {v.variant ||
                                            v.name ||
                                            JSON.stringify(v)}
                                        </TableCell>
                                        <TableCell className="text-xs px-2 py-1">
                                          {v.price}
                                        </TableCell>
                                        <TableCell className="text-xs px-2 py-1">
                                          {v.discount ?? "-"}
                                        </TableCell>
                                        <TableCell className="text-xs px-2 py-1">
                                          {v.sku || "-"}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="flex flex-col">
                                  {p.discount ? (
                                    <>
                                      <span>Discount Price: {p.discount}</span>{" "}
                                      <span className="line-through text-red-500">Price: {p.price}</span>
                                    </>
                                  ) : (
                                    <span>Price: {p.price}</span>
                                  )}
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="border border-gray-300 px-3 py-2 text-center">
                              <Input
                                type="number"
                                value={existing}
                                onChange={(e) =>
                                  updateProductDiscount(p._id, e.target.value)
                                }
                                className="w-20"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-[#6fd300] hover:bg-[#5fc100] text-white"
              >
                {editId ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
