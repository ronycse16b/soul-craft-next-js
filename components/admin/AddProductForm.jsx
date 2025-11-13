"use client";

import axios from "axios";
import { Plus, PlusIcon, Trash2 } from "lucide-react";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useQuill } from "react-quilljs";
import Quill from "quill";
// import ImageResize from "quill-image-resize-module-react";
import ImageResize from "quill-image-resize-module-react";
import { Button } from "../ui/button";
import Swal from "sweetalert2";

Quill.register("modules/imageResize", ImageResize);

import {
  clearLocalCache,
  getFromLocalCache,
  removeFromCDN,
  uploadMultiple,
} from "@/lib/uploadHelper";

export default function AddProductForm() {
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
      type: "simple", // default product type
      attributes: [{ name: "", values: "" }],
      variants: [],
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

  // ✅ Generate variants with unique SKU
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
      // Generate SKU based on all attribute values
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

    const mergedVariants = newVariants.map((newVar) => {
      const match = oldVariants.find(
        (oldVar) =>
          JSON.stringify(oldVar.attributes) ===
          JSON.stringify(newVar.attributes)
      );
      return match ? { ...newVar, ...match } : newVar;
    });

    reset({ ...getValues(), variants: mergedVariants });
  };

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(""); // ⭐ Track selected subcategory ID

  // Fetch categories on mount
  const fetchCategoriesWithSubs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/client`
      );
      const data = await res.json();
      if (data.success) setCategories(data.result);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithSubs();
  }, []);

  // Handle parent selection
  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParentId(parentId);
    setSelectedSubId(""); // Clear previously selected subcategory
    const selected = categories.find((cat) => cat._id === parentId);
    setSubcategories(selected?.subCategories || []);
  };

  // Watch product type
  const productType = watch("type");

  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]); // For preview,
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  const [isDeleting, setIsDeleting] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [error, setError] = useState("");

  const fileInputRef = useRef();

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
        ["image"], // ✅ enable image upload
        ["clean"],
      ],
    
    },
    clipboard: {
      matchVisual: false,
    },
    imageResize: {
      modules: ["Resize", "DisplaySize", "Toolbar"], // ✅ alignment + resize UI
    },
  };

  const { quill: descriptionQuill, quillRef: descriptionRef } = useQuill({
    modules,
  });

  useEffect(() => {
    if (descriptionQuill) {
      descriptionQuill.on("text-change", () => {
        const html = descriptionRef.current?.firstChild?.innerHTML;
        setValue("description", html || "");
      });
    }
  }, [descriptionQuill]);



const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const CACHE_KEY = "cdn_temp";

// Load cached images on mount
useEffect(() => {
  const cachedImages = getFromLocalCache(CACHE_KEY);
  if (cachedImages.length > 0) {
    setUploadedUrls(cachedImages);
    setThumbnailUrl(cachedImages[0]); // default thumbnail
  }
}, []);

// Handle multiple image selection and upload
const handleImageChange = async (e) => {
  try {
    setUploading(true);
    const files = Array.from(e.target.files);
    const validFiles = [];

    // Validate file size
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: `${file.name} is larger than 1MB and was not uploaded.`,
          confirmButtonText: "OK",
        });
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    // Upload valid files to CDN (this already saves to local cache)
    await uploadMultiple(validFiles, CACHE_KEY);

    // Read current cached URLs from localStorage
    const cachedUrls = getFromLocalCache(CACHE_KEY);

    // Update state directly from cache (avoids duplicates)
    setUploadedUrls(cachedUrls);

    // Set thumbnail if none
    if (!thumbnailUrl && cachedUrls.length > 0) {
      setThumbnailUrl(cachedUrls[0]);
    }

    toast.success(`${validFiles.length} file(s) uploaded successfully!`);
  } catch (err) {
    console.error("Upload Error:", err);
    toast.error("An error occurred while uploading images.");
  } finally {
    setUploading(false);
  }
};


// Remove an uploaded image
const handleRemoveImage = async (urlToRemove) => {
  try {
    setIsDeleting(urlToRemove);

    // Remove image from CDN & local cache
    await removeFromCDN(urlToRemove, CACHE_KEY);

    // Update state
    const filtered = uploadedUrls.filter((url) => url !== urlToRemove);
    setUploadedUrls(filtered);

    // Update thumbnail if removed
    if (thumbnailUrl === urlToRemove) {
      setThumbnailUrl(filtered[0] || null);
    }

    toast.success("Image removed successfully!");

    // Clear cache if no images left
    if (filtered.length === 0) clearLocalCache(CACHE_KEY);
  } catch (err) {
    console.error("Delete Error:", err);
    toast.error("Failed to remove image.");
  } finally {
    setIsDeleting(null);
  }
};

// On form submit, clear cache
const onSubmit = async (data) => {
  setIsSaving(true);

  if (!thumbnailUrl) {
    setError("thumbnail is Required", {
      type: "manual",
      message: "Thumbnail image is required",
    });
    setIsSaving(false);
    return;
  } else {
    setError("");
  }

  const productPayload = {
    ...data,
    colors,
    images: uploadedUrls,
    thumbnail: thumbnailUrl,
    subCategory: selectedSubId,
    category: selectedParentId,
  };

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
      productPayload
    );
    toast.success(res.data.message);

    // Reset form + clear uploaded images
    reset();
    setUploadedUrls([]);
    setThumbnailUrl(null);
    setSizes([]);
    setColors([]);
    clearLocalCache(CACHE_KEY);
    setSelectedParentId("");
    setSelectedSubId("");
    descriptionQuill?.setText("");
  } catch (err) {
    const errorMsg = err.response?.data?.error || "Something went wrong!";
    console.error(err);
    setError(errorMsg);
  } finally {
    setIsSaving(false);
  }
};


  if (error) {
    toast.error(error || "Something Went Wrong", {
      position: "bottom-right",
    });
  }

  return (
    <section className=" overflow-hidden  sm:mt-2 relative lg:max-w-[1060px] mx-auto 2xl:max-w-full bg-white  sm:px-2 lg:px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        {/* Left Side - Inputs */}
        <h2 className="text-md font-semibold   2xl:px-4 mb-5 flex items-center    ">
          <span className="border bg-primary text-white  flex px-2 py-1 rounded-full">
            {" "}
            Add Product Form
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
                      {["price", "discount", "quantity"].map((field) => (
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
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-4">Images Upload</h2>

              {/* Main Image Preview */}
              <div className="w-full flex items-center justify-center overflow-hidden bg-white rounded-lg relative border border-gray-200">
                {uploadedUrls.length > 0 ? (
                  <img
                    src={thumbnailUrl || uploadedUrls[0]}
                    alt="Main Preview"
                    className="w-full h-[350px] object-contain"
                  />
                ) : (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-52 border-2 border-dashed border-green-500 rounded-lg flex flex-col items-center justify-center text-green-600 cursor-pointer transition hover:bg-green-50"
                  >
                    <PlusIcon size={24} />
                    <span className="mt-2 text-sm text-red-600 animate-pulse font-bold">
                      Click or Tap to Upload Images (570px * 570px)
                    </span>
                    <span className="text-xs text-gray-500">
                      (Only image files allowed)
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

                {/* Spinner overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                    <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-3 mt-6 overflow-x-auto">
                {uploadedUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative w-24 h-24 flex-shrink-0 p-2 rounded-lg overflow-hidden border cursor-pointer transition hover:scale-105 ${
                      thumbnailUrl === url
                        ? "ring-2 ring-red-600"
                        : "border-gray-300"
                    }`}
                    onClick={() => setThumbnailUrl(url)}
                  >
                    <img
                      src={url}
                      alt={`img-${idx}`}
                      className="w-full h-full object-cover rounded"
                    />

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(url);
                      }}
                      disabled={isDeleting === url}
                      className={`absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs z-10 rounded-full ${
                        isDeleting === url
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isDeleting === url ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "✕"
                      )}
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-24 h-24 flex-shrink-0 border-2 border-dashed rounded-lg flex items-center justify-center text-green-600 cursor-pointer hover:bg-green-50 transition"
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

        {/* Submit Button */}
        <div className="col-span-1 lg:col-span-2 flex  justify-center w-full sm:justify-end mb-8  mt-4 ">
          <Button
            type="submit"
            disabled={isSaving}
            className=" bg-rose-600 text-white "
          >
            {isSaving ? "Saving..." : "Add Product"}
          </Button>
        </div>
      </form>
    </section>
  );
}
