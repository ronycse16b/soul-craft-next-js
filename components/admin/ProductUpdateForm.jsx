"use client";

import axios from "axios";
import { Plus, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQuill } from "react-quilljs";
import Quill from "quill";
import ImageResize from "quill-image-resize-module-react";
import { Button } from "../ui/button";

Quill.register("modules/imageResize", ImageResize);

export default function ProductUpdateForm({ product }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    type: "",
    sku: "",
    price: "",
    discount: "",
    quantity: "",
    video: "",
  });

  const [variantInput, setVariantInput] = useState([
    { variant: "", price: "", quantity: "", sku: "", discount: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState(""); // ⭐ Track selected subcategory ID
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]); // For preview,
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const initialColors = ["Black", "Brown", "Olive", "White", "Navy"];

  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [showColorInput, setShowColorInput] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

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

  // When categories are loaded, set defaults from product
  useEffect(() => {
    if (categories.length && product) {
      const catId = product.category;
      const subId = product.subCategory;

      setSelectedParentId(catId);

      const selectedCat = categories.find((cat) => cat._id === catId);
      const subCats = selectedCat?.subCategories || [];
      setSubcategories(subCats);

      // Set default subcategory only if it exists in the list
      const foundSub = subCats.find((sub) => sub._id === subId?._id);

      if (foundSub) {
        setSelectedSubId(foundSub?._id);
      } else {
        setSelectedSubId(""); // fallback if not found
      }
    }
  }, [categories, product]);

  // Handle parent category change
  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParentId(parentId);
    setSelectedSubId(""); // reset sub

    const selectedCat = categories.find((cat) => cat._id === parentId);
    setSubcategories(selectedCat?.subCategories || []);
  };

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("uploadedImagesForUpdate");
    console.log("🟩 LocalStorage Loaded:", stored);
    if (stored) setUploadedUrls(JSON.parse(stored));
  }, []);

  // Update localStorage when uploadedUrls changes
  // ✅ Only save to localStorage if uploadedUrls is NOT empty
  useEffect(() => {
    if (uploadedUrls?.length > 0) {
      console.log("🟨 Saving to LocalStorage:", uploadedUrls);
      localStorage.setItem(
        "uploadedImagesForUpdate",
        JSON.stringify(uploadedUrls)
      );
    }
  }, [uploadedUrls]);


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
      handlers: {
        image: function () {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();

          input.onchange = async () => {
            const file = input.files[0];

            if (!file) return;
            if (file.size > 1 * 1024 * 1024) {
              alert("File too large. Max 1MB allowed.");
              return;
            }

            const formData = new FormData();
            formData.append("images", file); // your backend expects 'images'

            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
                {
                  method: "POST",
                  body: formData,
                }
              );

              const data = await res.json();
              if (data.success) {
                const imageUrl = data.imageUrls[0]; // assuming single file upload
                const range = this.quill.getSelection();
                this.quill.insertEmbed(range.index, "image", imageUrl);
              } else {
                alert("Image upload failed.");
              }
            } catch (error) {
              console.error("Image upload error:", error);
              alert("Upload failed. Try again.");
            }
          };
        },
      },
    },
    clipboard: {
      matchVisual: false,
    },
    imageResize: {
      modules: ["Resize", "DisplaySize", "Toolbar"], // enable resize UI
    },
  };
  const { quill: descriptionQuill, quillRef: descriptionRef } = useQuill({
    modules,
  });

  useEffect(() => {
    if (product && descriptionQuill) {
      descriptionQuill.clipboard.dangerouslyPasteHTML(
        product.description || ""
      );
    }
  }, [product, descriptionQuill]);

  useEffect(() => {
    if (!descriptionQuill) return;

    const handler = () => {
      const html = descriptionQuill.root.innerHTML;
      setFormData((prev) => ({
        ...prev,
        description: html,
      }));
    };

    descriptionQuill.on("text-change", handler);
    return () => {
      descriptionQuill.off("text-change", handler);
    };
  }, [descriptionQuill]);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product?.productName,
        type: product?.type,
        description: product?.description,
        subCategory: product?.subCategory,
        category: product?.category,
        video: product?.video,
        price: product?.price,
        discount: product?.discount,
        sku: product?.sku,
        quantity: product?.quantity,
        colors: product?.colors || ["Black", "Coffee", "Master"],
      });

      if (Array.isArray(product.colors)) {
        setColors(product.colors);
      }

      // ✅ Set Variant Input
      if (product.type === "variant" && Array.isArray(product.variant)) {
        setVariantInput(() =>
          product.variant.map((v) => ({
            variant: v.variant || "",
            price: v.price || "",
            quantity: v.quantity || "",
            sku: v.sku || "",
            discount: v.discount || "",
          }))
        );
      } else {
        setVariantInput([
          {
            variant: "",
            price: "",
            quantity: "",
            sku: "",
            discount: "",
          },
        ]);
      }
      if (product) {
        setSelectedParentId(product.category || "");
        setSelectedSubId(product.subCategory || "");
      }
      // Set subcategories for selected parent
      const parentCat = categories.find((cat) => cat._id === product.category);
      setSubcategories(parentCat?.subCategories || []);

      const localImages = localStorage.getItem("uploadedImagesForUpdate");
      const localThumb = localStorage.getItem("thumbnail");

      // 💡 ডেটাবেজ থেকে প্রাপ্ত ডেটা এখানে ধরে নিচ্ছি
      const dbImages = product?.images || [];
      const dbThumbnail = product?.thumbnail || null;

      // ✅ Merge করে initial set
      const uniqueImages = Array.from(
        new Set([...dbImages, ...(localImages ? JSON.parse(localImages) : [])])
      );
      setUploadedUrls(uniqueImages);

      // ✅ থাম্বনেইল
      if (localThumb) {
        setThumbnailUrl(localThumb);
      } else if (dbThumbnail) {
        setThumbnailUrl(dbThumbnail);
      } else if (uniqueImages.length > 0) {
        setThumbnailUrl(uniqueImages[0]);
      }
    }
  }, [product]);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

  const handleImageChange = async (e) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files);
      const validFiles = [];
      const errors = [];

      files.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name} is larger than 1MB and was not uploaded.`);
          setError("");
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join("\n"));
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      const formData = new FormData();
      validFiles.forEach((file) => formData.append("images", file));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setUploadedUrls((prev) => [...prev, ...data.imageUrls]);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("An error occurred while uploading images.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (urlToRemove) => {
    try {
      setIsDeleting(urlToRemove);
      const filename = urlToRemove.split("/uploads/")[1]; // Extract filename only

      // Call API to delete from server
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/delete-upload-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        }
      );

      // Remove from UI + localStorage
      const filtered = uploadedUrls.filter((url) => url !== urlToRemove);
      setUploadedUrls(filtered);
    } catch (error) {
      console.log(error?.message);
    } finally {
      setIsDeleting(null);
    }
  };

  // Add color if not already selected
  const addColor = (color) => {
    if (color && !colors.includes(color)) {
      setColors([...colors, color]);
      if (color === colorInput) setColorInput("");
    }
  };

  const removeColor = (value) => {
    setColors(colors.filter((c) => c !== value));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);
    // ✅ Thumbnail validation
    if (!thumbnailUrl) {
      setError("thumbnail is Required", {
        type: "manual",
        message: "Thumbnail image is required",
      });
      setIsSaving(false);
      return;
    } else {
      setError("");
      setIsSaving(false);
    }
    const productPayload = {
      ...formData,
      variant: variantInput,
      colors,
      images: uploadedUrls,
      thumbnail: thumbnailUrl,
      subCategory: selectedSubId,
      category: selectedParentId,
    };

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/update/${product?._id}`,
        productPayload
      );

      toast.success(res.data.message);
      setColors([]);
      setUploadedUrls([]);
      setVariantInput([
        { variant: "", price: "", quantity: "", sku: "", discount: "" },
      ]);
      setSelectedParentId("");
      setSelectedSubId("");
      setThumbnailUrl(null);
      setError("");
      // localStorage.removeItem("uploadedImagesForUpdate");
      router?.push("/dashboard/products-list");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong!";
      console.error(err);
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className=" overflow-hidden  sm:mt-2 relative border bg-white">
      <h2 className="text-md font-semibold   2xl:px-4 mb-5 flex items-center    ">
        <span className="border bg-primary text-white  flex px-2 py-1 absolute top-0 left-0">
          {" "}
          Update Product Form
        </span>
      </h2>
      {error && (
        <div className="text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2 mb-4 sm:mx-6">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="sm:p-6">
        {/* Left Side - Inputs */}

        <section className="  sm:mb-6">
          <div className="bg-base-200  p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              General Information
            </h2>

            {/* Product Name */}
            <div>
              <label className="font-semibold text-sm mb-2 block text-gray-600">
                Product Name
              </label>
              <input
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                placeholder="Product Name"
                className="flex-grow w-full h-11 px-4 mb-3 text-gray-700 transition duration-200 border border-gray-300 rounded bg-white focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline"
                required
              />

              {/* Description */}
              <div className="col-span-2 my-4">
                <label className="font-semibold text-sm mb-2 block">
                  Description Product
                </label>
                <div
                  ref={descriptionRef}
                  className="bg-white border border-gray-300  min-h-[120px] px-2 py-1"
                />
                {/* hidden input is optional now */}
              </div>
            </div>

            {/* Type */}
            <label htmlFor="type" className="label">
              Product Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="flex-grow h-11 px-4 mb-4 text-gray-700 transition duration-200 border border-gray-300 rounded bg-white focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline w-full"
            >
              <option value="" disabled>
                Select a product type
              </option>
              <option value="simple">Simple</option>
              <option value="variant">Variant</option>
            </select>

            {/* Variant Section */}
            {formData?.type === "variant" && (
              <div className="my-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Product Variants
                </h3>

                <div className="overflow-x-auto  border border-gray-200">
                  <table className="min-w-full bg-white text-sm text-gray-700">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="py-3 px-4 text-left">Variant</th>
                        <th className="py-3 px-4 text-left">Price</th>
                        <th className="py-3 px-4 text-left">Quantity</th>
                        <th className="py-3 px-4 text-left">SKU</th>
                        <th className="py-3 px-4 text-left">Discount (%)</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {variantInput.map((variant, index) => (
                        <tr
                          key={index}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              placeholder="39, 40, 100ml, M, L"
                              value={variant.variant}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].variant = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </td>

                          <td className="py-2 px-4">
                            <input
                              type="number"
                              placeholder="Price"
                              value={variant.price}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].price = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </td>

                          <td className="py-2 px-4">
                            <input
                              type="number"
                              placeholder="Quantity"
                              value={variant.quantity}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].quantity = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </td>

                          <td className="py-2 px-4">
                            <input
                              type="text"
                              placeholder="SKU"
                              value={variant.sku}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].sku = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </td>

                          <td className="py-2 px-4">
                            <input
                              type="number"
                              placeholder="Discount"
                              value={variant.discount}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].discount = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </td>

                          <td className="py-2 px-4 text-center">
                            <Button
                              type="button"
                              onClick={() =>
                                setVariantInput(
                                  variantInput.filter((_, i) => i !== index)
                                )
                              }
                              className="bg-red-500 text-white font-semibold"
                            >
                              ✕
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setVariantInput([
                      ...variantInput,
                      {
                        variant: "",
                        price: "",
                        quantity: "",
                        sku: "",
                        discount: "",
                      },
                    ])
                  }
                  className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-orange-500 transition"
                >
                  + Add Variant
                </button>

                {/* Color Options */}
                <div className="mt-6">
                  <label className="font-semibold text-sm mb-1 block">
                    Colors
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {initialColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => addColor(color)}
                        className={`px-4 py-1 border rounded ${
                          colors.includes(color)
                            ? "bg-primary text-white border-primary"
                            : "border-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>

                  {!showColorInput ? (
                    <button
                      type="button"
                      onClick={() => setShowColorInput(true)}
                      className="bg-gray-700 text-white px-3 py-1 flex items-center mt-3 rounded hover:bg-gray-600 transition"
                    >
                      <Plus className="mr-2 w-4 h-4" /> Add Custom Color
                    </button>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        placeholder="Enter color (e.g. Olive)"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addColor(colorInput)}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-orange-500 transition"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {colors?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {colors.map((color) => (
                        <span
                          key={color}
                          className="bg-sky-600 px-3 py-1 text-white rounded-full flex items-center gap-1"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="ml-1 text-white font-bold hover:text-red-300"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing & Stock for Simple Type */}
            {formData?.type === "simple" && (
              <div className="bg-base-200  p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4">Pricing & Stock</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SKU */}
                  <div>
                    <label
                      htmlFor="sku"
                      className="block text-sm font-medium mb-1"
                    >
                      SKU
                    </label>
                    <input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      placeholder="SKU"
                      className="flex-grow w-full h-11 px-4 mb-3 text-gray-700 transition duration-200 border border-gray-300 rounded bg-white focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  {/* Base Price */}
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium mb-1"
                    >
                      Base Price
                    </label>
                    <input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="Sale Price"
                      className="flex-grow w-full h-11 px-4 mb-3 text-gray-700 transition duration-200 border border-gray-300 rounded bg-white focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label
                      htmlFor="discount"
                      className="block text-sm font-medium mb-1"
                    >
                      Discount Price
                    </label>
                    <input
                      id="discount"
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({ ...formData, discount: e.target.value })
                      }
                      placeholder="Discount Price"
                      className="flex-grow w-full h-11 px-4 mb-3 text-gray-700 transition duration-200 border border-gray-300 rounded bg-white focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium mb-1"
                    >
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="Quantity"
                      className="flex-grow w-full h-11 px-4 mb-3 text-gray-700 transition duration-200 border border-gray-300 rounded bg-white focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* right Side - Inputs */}

          <div className="bg-base-200 my-3 p-4 rounded-xl">
            <div className="w-full ">
              <h2 className="text-lg font-semibold mb-4">Images Upload</h2>

              {/* Main Image Preview */}
              <div className="w-full    flex items-center justify-center overflow-hidden bg-white">
                {uploadedUrls.length > 0 ? (
                  <img
                    src={`${thumbnailUrl || uploadedUrls[0]}`}
                    alt="Main Preview"
                    className="w-full h-[350px] object-contain"
                  />
                ) : (
                  <>
                    <div className="w-full">
                      <div
                        onClick={() => fileInputRef.current.click()}
                        className="w-full h-52 border-2 border-dashed border-green-500 rounded-lg flex flex-col items-center justify-center text-green-600 cursor-pointer transition-colors hover:bg-green-50"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            fileInputRef.current.click();
                        }}
                      >
                        <PlusIcon size={24} />
                        <span className="mt-2 text-sm font-medium">
                          Click or Tap to Upload Images
                        </span>
                        <span className="text-xs text-gray-500">
                          (Only image files are allowed)
                        </span>
                      </div>

                      <input
                        type="file"
                        required
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </>
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
                      className={`absolute top-1 right-1 bg-red-600  text-white  w-5 h-5 flex items-center justify-center text-xs z-10 ${
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

                {uploadedUrls.length > 0 && (
                  <>
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-green-600 cursor-pointer hover:bg-green-50"
                    >
                      <PlusIcon size={20} />
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Uploading Status */}
              {uploading && (
                <p className="text-sm text-gray-500 mt-2">Image Uploading...</p>
              )}
            </div>
          </div>
        </section>

        <section>
          {/* Additional Information */}
          <div
            className={`= "w-full p-6"
           rounded-xl bg-base-200`}
          >
            <div className="w-full space-y-4 p-5 my-2">
              <h2 className="text-lg font-semibold mb-4">
                Additional Information
              </h2>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  className="w-full border border-gray-300 p-2 rounded"
                  value={selectedParentId}
                  onChange={handleParentChange}
                >
                  <option value="">Select parent category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sub Category
                  </label>
                  <select
                    className="w-full border border-gray-300 p-2 rounded"
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Video URL */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="video"
                  className="block text-sm font-medium mb-1"
                >
                  Video URL (optional)
                </label>
                <input
                  id="video"
                  value={formData.video}
                  onChange={(e) =>
                    setFormData({ ...formData, video: e.target.value })
                  }
                  placeholder="Video URL (optional)"
                  className="flex-grow w-full h-11 px-4 mb-3 text-gray-700 transition duration-200 border border-gray-300 rounded bg-white focus:border-deep-purple-accent-200 focus:outline-none focus:shadow-outline"
                />
              </div>
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
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
