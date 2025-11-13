"use client";

import axios from "axios";
import { Plus, PlusIcon, Trash2 } from "lucide-react";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useQuill } from "react-quilljs";
import Quill from "quill";
import ImageResize from "quill-image-resize-module-react";
import { Button } from "../ui/button";
import Swal from "sweetalert2";
import { clearLocalCache, getFromLocalCache, removeFromCDN, uploadMultiple } from "@/lib/uploadHelper";

Quill.register("modules/imageResize", ImageResize);

export default function UpdateProductForm({ product }) {
  const {
    register,
    setValue,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productName: product.productName || "",
      description: product.description || "",
      type: product.type || "simple",
      price: product.price || 0,
      discount: product.discount || 0,
      quantity: product.quantity || 0,
      sku: product.sku || "",
      attributes: product.attributes?.map((a) => ({
        name: a.name,
        values: Array.isArray(a.values) ? a.values.join(",") : a.values,
      })) || [{ name: "", values: "" }],
      variants: product.variants || [],
      video: product.video || "",
    },
  });

  const {
    fields: attrFields,
    append: addAttr,
    remove: removeAttr,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  const {
    fields: variantFields,
    append: addVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const [uploadedUrls, setUploadedUrls] = useState(product.images || []);
  const [thumbnailUrl, setThumbnailUrl] = useState(product.thumbnail || null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(
    product.category || ""
  );
  const [selectedSubId, setSelectedSubId] = useState(
    product.subCategory?._id || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [error, setError] = useState("");

  const productType = watch("type");

  // Fetch categories on mount
  const fetchCategoriesWithSubs = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/client`
      );
      const data = await res.json();
      if (data.success) setCategories(data.result);

      // Set subcategories based on current parent
      const parentCat = data.result.find((cat) => cat._id === selectedParentId);
      setSubcategories(parentCat?.subCategories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategoriesWithSubs();
  }, []);

  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParentId(parentId);
    setSelectedSubId("");
    const selected = categories.find((cat) => cat._id === parentId);
    setSubcategories(selected?.subCategories || []);
  };

  const modules = {
    toolbar: {
      container: [
        ["bold", "italic", "underline", "strike"],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        ["image"],
        ["clean"],
      ],
      // handlers: {
      //   image: function () {
      //     const input = document.createElement("input");
      //     input.setAttribute("type", "file");
      //     input.setAttribute("accept", "image/*");
      //     input.click();

      //     input.onchange = async () => {
      //       const file = input.files[0];
      //       if (!file) return;
      //       if (file.size > 1 * 1024 * 1024) {
      //         alert("File too large. Max 1MB allowed.");
      //         return;
      //       }
      //       const formData = new FormData();
      //       formData.append("images", file);
      //       try {
      //         const res = await fetch(
      //           `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
      //           { method: "POST", body: formData }
      //         );
      //         const data = await res.json();
      //         if (data.success) {
      //           const imageUrl = data.imageUrls[0];
      //           const range = this.quill.getSelection();
      //           this.quill.insertEmbed(range.index, "image", imageUrl);
      //           setUploadedDescriptionImages((prev) => [...prev, imageUrl]);
      //         }
      //       } catch (err) {
      //         console.error(err);
      //         alert("Upload failed. Try again.");
      //       }
      //     };
      //   },
      // },
    },
    clipboard: { matchVisual: false },
    imageResize: { modules: ["Resize", "DisplaySize", "Toolbar"] },
  };

  const { quill: descriptionQuill, quillRef: descriptionRef } = useQuill({
    modules,
    theme: "snow",
  });

  useEffect(() => {
    if (descriptionQuill) {
      descriptionQuill.root.innerHTML = product.description || "";
      descriptionQuill.on("text-change", () => {
        const html = descriptionRef.current?.firstChild?.innerHTML;
        setValue("description", html || "");
      });
    }
  }, [descriptionQuill]);

  const generateVariants = () => {
    const attrs = getValues("attributes") || [];
    const validAttrs = attrs
      .filter((attr) => attr.name.trim() && attr.values.trim())
      .map((attr) => ({
        name: attr.name.trim(),
        values: attr.values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }));

    if (!validAttrs.length) return [];

    const combine = (arr1, arr2) => {
      const result = [];
      arr1.forEach((a) => arr2.forEach((b) => result.push({ ...a, ...b })));
      return result;
    };

    let combinations = validAttrs[0].values.map((v) => ({
      [validAttrs[0].name]: v,
    }));
    for (let i = 1; i < validAttrs.length; i++) {
      const current = validAttrs[i];
      const mapped = current.values.map((v) => ({ [current.name]: v }));
      combinations = combine(combinations, mapped);
    }

    return combinations.map((c, index) => {
      const skuParts = Object.values(c).join("-");
      const sku = `SKU-${skuParts}-${index + 1}`;
      return {
        attributes: c,
        price: "",
        discount: 0,
        quantity: "",
        sku,
      };
    });
  };

  const handleGenerateVariants = () => {
    const newVariants = generateVariants();
    const oldVariants = getValues("variants") || [];
    const mergedVariants = newVariants.map((nv) => {
      const match = oldVariants.find(
        (ov) => JSON.stringify(ov.attributes) === JSON.stringify(nv.attributes)
      );
      return match ? { ...nv, ...match } : nv;
    });
    reset({ ...getValues(), variants: mergedVariants });
  };

  const CACHE_KEY = `update_product_images_${product._id}`;
  // --- Load DB + Cache Images ---
  useEffect(() => {
    const loadImages = () => {
      const dbImages = product.images || []; // existing product images from DB
      const cachedImages = getFromLocalCache(CACHE_KEY); // temporary uploads
      const allImages = [...dbImages, ...cachedImages];
      setUploadedUrls(allImages);
      setThumbnailUrl(allImages[0] || null);
    };

    loadImages();
  }, [product]);

  // --- Handle Image Upload ---
  const handleImageChange = async (e) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files);

      // Filter out oversized files
      const validFiles = files.filter((f) => f.size <= 1 * 1024 * 1024);
      if (!validFiles.length) {
        Swal.fire({ icon: "error", title: "No valid files or file too large" });
        return;
      }

      const uploaded = await uploadMultiple(validFiles, CACHE_KEY);

      setUploadedUrls((prev) => {
        const combined = [...prev, ...uploaded];
        return combined;
      });

      if (!thumbnailUrl && uploaded.length > 0) setThumbnailUrl(uploaded[0]);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Upload failed. Try again." });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // --- Handle Image Remove ---
  const handleRemoveImage = async (urlToRemove) => {
    try {
      setIsDeleting(urlToRemove);
      await removeFromCDN(urlToRemove, CACHE_KEY);

      setUploadedUrls((prev) => {
        const updated = prev.filter((u) => u !== urlToRemove);
        if (thumbnailUrl === urlToRemove) setThumbnailUrl(updated[0] || null);
        return updated;
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed to remove image" });
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  // --- Submit Product Update ---
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/update/${product._id}`,
        {
          ...data,
          images: uploadedUrls,
          thumbnail: thumbnailUrl,
          category: selectedParentId,
          subCategory: selectedSubId,
        }
      );
      toast.success(res.data.message || "Product updated successfully!");
      clearLocalCache(CACHE_KEY);
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="overflow-hidden sm:mt-2 relative lg:max-w-[1060px] mx-auto 2xl:max-w-full bg-white sm:px-2 lg:px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        <h2 className="text-md font-semibold 2xl:px-4 mb-5 flex items-center">
          <span className="border bg-primary text-white flex px-2 py-1 rounded-full">
            Update Product Form
          </span>
        </h2>

        {error && (
          <div className="text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2 mb-4 sm:mx-6">
            {error}
          </div>
        )}
        <section className="  sm:mb-6">
          <div className="bg-base-200   2xl:p-6 rounded-xl">
            <div className="">
              <label className="font-semibold text-sm mb-2 block text-gray-600">
                Product Name
              </label>
              <input
                {...register("productName")}
                placeholder="Product Name"
                className="flex-grow w-full h-11 px-4 mb-3 text-gray-700 transition duration-200  border border-gray-300 rounded appearance-none md:mr-2 md:mb-0 focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline bg-white"
                required
              />

              <div className="col-span-2 my-4">
                <label className="font-semibold text-sm mb-2 block">
                  Description Product
                </label>
                <div
                  ref={descriptionRef}
                  className="bg-white border border-gray-300  min-h-[120px] px-2 py-1"
                />
                <input
                  type="hidden"
                  className="hidden"
                  {...register("description", { required: true })}
                />
              </div>
            </div>
            <label htmlFor="type" className="label">
              Product Type
            </label>
            <select
              id="type"
              {...register("type", { required: "Product type is required" })}
              onChange={(e) => setValue("type", e.target.value)}
              className="flex-grow  h-11 px-4  text-gray-700 transition duration-200  border border-gray-300 rounded appearance-none md:mr-2 md:mb-0 focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline bg-white w-full mb-4"
              defaultValue=""
            >
              <option value="" disabled>
                Select a product type
              </option>
              <option value="simple">Simple</option>
              <option value="variant">Variant</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}

            {/* VARIANT SECTION */}
            {productType === "variant" && (
              <section className="border p-6  bg-white  mt-5">
                <h3 className="text-xl font-semibold mb-4 text-purple-600">
                  Variants
                </h3>

                {/* ATTRIBUTES */}
                <div className="mb-4">
                  {attrFields.map((attr, i) => (
                    <div
                      key={attr.id}
                      className="border p-4 rounded-lg mb-3 bg-gray-50 flex flex-col gap-2"
                    >
                      <input
                        {...register(`attributes.${i}.name`)}
                        placeholder="Attribute Name (Color, Size, etc.)"
                        className="border p-2 rounded bg-white "
                      />
                      <textarea
                        {...register(`attributes.${i}.values`)}
                        placeholder="Values (comma separated)"
                        rows={2}
                        className="border p-2 rounded bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttr(i)}
                        className="flex items-center gap-1 text-red-600"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addAttr({ name: "", values: "" })}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      <Plus size={16} /> Add Attribute
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateVariants}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      Generate Variants
                    </button>
                  </div>
                </div>

                {/* APPLY TO ALL */}
                {variantFields.length > 0 && (
                  <div className="border p-4 rounded-lg mb-4 bg-gray-50">
                    <h4 className="text-lg font-semibold mb-2">
                      Apply to All Variants
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {["price", "discount", "quantity", "sku"].map((field) => (
                        <input
                          key={field}
                          placeholder={
                            field.charAt(0).toUpperCase() + field.slice(1)
                          }
                          className="border p-2 rounded bg-white"
                          onChange={(e) => {
                            const val = e.target.value;
                            variantFields.forEach((v, idx) =>
                              setValue(`variants.${idx}.${field}`, val)
                            );
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      These values will be applied to all variants. You can
                      still edit individual variants below.
                    </p>
                  </div>
                )}

                {/* INDIVIDUAL VARIANTS */}
                {variantFields.length > 0 &&
                  variantFields.map((variant, idx) => (
                    <div
                      key={variant.id}
                      className="border p-4 rounded-lg mb-3 bg-white flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(variant.attributes).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <input
                          {...register(`variants.${idx}.price`)}
                          type="number"
                          placeholder="Price"
                          className="border p-2 rounded"
                        />
                        <input
                          {...register(`variants.${idx}.discount`)}
                          type="number"
                          placeholder="Discount"
                          className="border p-2 rounded"
                        />
                        <input
                          {...register(`variants.${idx}.quantity`)}
                          type="number"
                          placeholder="Quantity"
                          className="border p-2 rounded"
                        />
                        <input
                          {...register(`variants.${idx}.sku`)}
                          placeholder="SKU"
                          className="border p-2 rounded"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="flex items-center gap-1 text-red-600"
                      >
                        <Trash2 size={16} /> Remove Variant
                      </button>
                    </div>
                  ))}
                {/* PRODUCT DESCRIPTION */}
              </section>
            )}

            {/* Simple Product Pricing & Stock */}
            {productType === "simple" && (
              <div className="bg-white rounded p-6 border mt-5">
                <h2 className="text-lg font-semibold mb-6">Pricing & Stock</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SKU */}
                  <div>
                    <label
                      htmlFor="sku"
                      className="block text-sm font-medium mb-2"
                    >
                      SKU
                    </label>
                    <input
                      id="sku"
                      {...register("sku")}
                      placeholder="SKU"
                      className="w-full h-11 px-4 text-gray-700 border border-gray-300 rounded-md bg-white transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>

                  {/* Base Price */}
                  <div>
                    <label
                      htmlFor="salePrice"
                      className="block text-sm font-medium mb-2"
                    >
                      Base Price
                    </label>
                    <input
                      id="salePrice"
                      type="number"
                      {...register("price")}
                      placeholder="Base Price"
                      className="w-full h-11 px-4 text-gray-700 border border-gray-300 rounded-md bg-white transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>

                  {/* Discount Price */}
                  <div>
                    <label
                      htmlFor="discount"
                      className="block text-sm font-medium mb-2"
                    >
                      Discount Price
                    </label>
                    <input
                      id="discount"
                      type="number"
                      {...register("discount")}
                      placeholder="Discount Price"
                      className="w-full h-11 px-4 text-gray-700 border border-gray-300 rounded-md bg-white transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label
                      htmlFor="qty"
                      className="block text-sm font-medium mb-2"
                    >
                      Quantity
                    </label>
                    <input
                      id="qty"
                      type="number"
                      {...register("quantity")}
                      placeholder="Quantity"
                      className="w-full h-11 px-4 text-gray-700 border border-gray-300 rounded-md bg-white transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* right Side - Inputs */}

          <div className="bg-base-200 mt-5 p-4 rounded-xl relative">
            <div className="w-full ">
              <h2 className="text-lg font-semibold mb-4">Images Upload</h2>

              {/* Main Image Preview */}
              <div className="w-full flex items-center justify-center overflow-hidden bg-white relative">
                {uploadedUrls.length > 0 ? (
                  <img
                    src={`${thumbnailUrl || uploadedUrls[0]}`}
                    alt="Main Preview"
                    className="w-full h-[350px] object-contain"
                  />
                ) : (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-52 border-2 border-dashed border-green-500 rounded-lg flex flex-col items-center justify-center text-green-600 cursor-pointer transition-colors hover:bg-green-50"
                  >
                    <PlusIcon size={24} />
                    <span className="mt-2 text-sm text-red-600 animate-pulse font-bold">
                      Click or Tap to Upload Images (570px * 570px)
                    </span>
                    <span className="text-xs text-gray-500">
                      (Only image files are allowed)
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Uploading Spinner Overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                    <svg
                      className="animate-spin h-10 w-10 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-3 mt-6">
                {uploadedUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative w-24 h-24 p-2 rounded-lg overflow-hidden border border-gray-300 cursor-pointer ${
                      thumbnailUrl === url ? "ring-2 ring-red-600" : ""
                    }`}
                    onClick={() => setThumbnailUrl(url)}
                  >
                    <img
                      src={`${url}`}
                      alt={`img-${idx}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(url);
                      }}
                      disabled={isDeleting === url}
                      className={`absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs z-10 ${
                        isDeleting === url
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isDeleting === url ? (
                        <svg
                          className="animate-spin w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      ) : (
                        "✕"
                      )}
                    </button>
                  </div>
                ))}

                {/* Add More Images */}
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-green-600 cursor-pointer hover:bg-green-50"
                >
                  <PlusIcon size={20} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {/* Additional Information */}
          <div className="bg-white p-6 rounded border ">
            <h2 className="text-lg font-semibold mb-6">
              Additional Information
            </h2>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={selectedParentId}
                onChange={handleParentChange}
              >
                <option value="">Select parent category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            {subcategories?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Sub Category
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-md bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                >
                  <option value="">Select subcategory</option>
                  {subcategories?.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Video URL */}
            <div className="mb-4">
              <label htmlFor="video" className="block text-sm font-medium mb-2">
                Video URL (optional)
              </label>
              <input
                id="video"
                {...register("video")}
                placeholder="Video URL (optional)"
                className="w-full h-11 px-4 text-gray-700 border border-gray-300 rounded-md bg-white transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </section>

        <div className="mb-4 flex justify-end mt-6">
          <Button
            type="submit"
            className="bg-rose-600 text-white"
            disabled={isSaving}
          >
            {isSaving ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </section>
  );
}
