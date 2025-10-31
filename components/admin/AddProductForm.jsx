"use client";

import axios from "axios";
import { Plus, PlusIcon } from "lucide-react";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useQuill } from "react-quilljs";
import Quill from "quill";
// import ImageResize from "quill-image-resize-module-react";
import ImageResize from "quill-image-resize-module-react";
import { Button } from "../ui/button";
import Swal from "sweetalert2";

Quill.register("modules/imageResize", ImageResize);


export default function AddProductForm() {
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: "simple", // default product type
    },
  });

  const [uploadedDescriptionImages, setUploadedDescriptionImages] = useState([]);

  const [variantInput, setVariantInput] = useState([
    { variant: "", price: "", quantity: "", sku: "", discount: "" },
  ]);
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

  const initialSizes = ["38", "39", "40", "41", "42", "43"];
  const initialColors = ["Black", "Brown", "Olive", "White", "Navy"];

  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [showColorInput, setShowColorInput] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("uploadedImagesForAdd");
    if (stored) setUploadedUrls(JSON.parse(stored));
  }, []);

  // Update localStorage when uploadedUrls changes

  useEffect(() => {
      if (uploadedUrls?.length > 0) {
        console.log("🟨 Saving to LocalStorage:", uploadedUrls);
        localStorage.setItem(
          "uploadedImagesForAdd",
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
                setUploadedDescriptionImages((prev) => [...prev, imageUrl]);
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
      
      modules: ["Resize", "DisplaySize", "Toolbar" ], // ✅ alignment + resize UI
    },
  };
  
  const { quill: descriptionQuill, quillRef: descriptionRef } = useQuill({
    modules,
  });
  // const { quill: featuresQuill, quillRef: featuresRef } = useQuill({ modules });

  useEffect(() => {
    if (descriptionQuill) {
      descriptionQuill.on("text-change", () => {
        const html = descriptionRef.current?.firstChild?.innerHTML;
        setValue("description", html || "");
      });
    }

    
  }, [descriptionQuill]);



  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

  const handleImageChange = async (e) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files);
      const validFiles = [];
      const errors = [];

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

  const onSubmit = async (data) => {
    setIsSaving(true);

    // ✅ Thumbnail check
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
      variant: variantInput,
      colors,
      images: uploadedUrls,
      thumbnail: thumbnailUrl,
      subCategory: selectedSubId,
      category: selectedParentId,
    };

    try {
      // ✅ Step 1: Submit product to server
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
        productPayload
      );
      toast.success(res.data.message);

      // ✅ Step 2: Extract used image filenames from description
      const html = descriptionRef.current?.firstChild?.innerHTML || "";

      const usedImages = Array.from(
        new DOMParser()
          .parseFromString(html, "text/html")
          .querySelectorAll("img")
      )
        .map((img) => img.getAttribute("src"))
        .filter((src) => src?.startsWith("/uploads/")); // ✅ Only server images

      const usedFilenames = usedImages.map((src) =>
        src.split("/uploads/").pop()
      );

      // ✅ Step 3: Filter out unused images
      const unusedImages = uploadedDescriptionImages.filter((url) => {
        const filename = url.split("/uploads/").pop();
        return !usedFilenames.includes(filename);
      });

      // ✅ Step 4: Delete unused images from server
      if (unusedImages?.length > 0) {
        await Promise.all(
          unusedImages.map((url) => {
            const filename = url.split("/uploads/").pop();
            return fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/delete-upload-image`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename }),
              }
            );
          })
        );
      }

      // ✅ Step 3: Reset all states if needed (optional)
      reset();
      setSizes([]);
      setColors([]);
      setUploadedUrls([]);
      setVariantInput([{ variant: "", price: "", quantity: "", sku: "", discount: "" }]);
      setSelectedParentId("");
      setSelectedSubId("");
      setThumbnailUrl(null);
      descriptionQuill?.setText("");
      // featuresQuill?.setText("");
      localStorage.removeItem("uploadedImagesForAdd");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong!";
      console.error(err);
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };
  
  
  
  return (
    <section className=" overflow-hidden  sm:mt-2 relative lg:max-w-[1060px] mx-auto 2xl:max-w-full bg-white sm:px-10">
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
            {productType === "variant" && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Variants</h3>

                <div className="overflow-x-auto   bg-white">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-destructive text-white py-2">
                      <tr>
                        <th className="px-4 py-2 border text-left text-sm font-medium ">
                          Variant
                        </th>
                        <th className="px-4 py-2 border text-left text-sm font-medium ">
                          Price
                        </th>
                        <th className="px-4 py-2 border text-left text-sm font-medium ">
                          Quantity
                        </th>
                        <th className="px-4 py-2 border text-left text-sm font-medium ">
                          SKU
                        </th>
                        <th className="px-4 py-2 border text-left text-sm font-medium ">
                          Discount
                        </th>
                        <th className="px-4 py-2 border text-center text-sm font-medium ">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {variantInput?.map((variant, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 border">
                            <input
                              type="text"
                              placeholder="39,40, M,L,XL"
                              value={variant.variant}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].variant = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </td>

                          <td className="px-4 py-2 border">
                            <input
                              type="number"
                              placeholder="Price"
                              value={variant.price}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].price = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </td>

                          <td className="px-4 py-2 border">
                            <input
                              type="number"
                              placeholder="Quantity"
                              value={variant.quantity}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].quantity = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </td>

                          <td className="px-4 py-2 border">
                            <input
                              type="text"
                              placeholder="SKU"
                              value={variant.sku}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].sku = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </td>

                          <td className="px-4 py-2 border">
                            <input
                              type="number"
                              placeholder="Discount"
                              value={variant.discount}
                              onChange={(e) => {
                                const updated = [...variantInput];
                                updated[index].discount = e.target.value;
                                setVariantInput(updated);
                              }}
                              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </td>

                          <td className="px-4 py-2 border text-center">
                            <Button
                              type="button"
                              onClick={() =>
                                setVariantInput((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              variant="destructive"
                              size="sm"
                            >
                              X
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={() =>
                      setVariantInput((prev) => [
                        ...prev,
                        {
                          variant: "",
                          price: "",
                          quantity: "",
                          sku: "",
                          discount: "",
                        },
                      ])
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus /> Add Variant
                  </Button>
                </div>

                {/* Colors Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Colors</h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {initialColors.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        onClick={() => addColor(color)}
                        variant={colors.includes(color) ? "default" : "outline"}
                        size="sm"
                      >
                        {color}
                      </Button>
                    ))}
                  </div>

                  {!showColorInput ? (
                    <Button
                      type="button"
                      onClick={() => setShowColorInput(true)}
                      size="sm"
                    >
                      <Plus /> Add Custom Color
                    </Button>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        placeholder="Enter color (e.g. Olive)"
                        className="flex-grow h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <Button
                        type="button"
                        onClick={() => addColor(colorInput)}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {colors.map((color) => (
                      <span
                        key={color}
                        className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-sm"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="ml-1 text-red-200 font-bold hover:text-red-400"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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

          <div className="bg-base-200 mt-5  p-4 rounded-xl">
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
                        <span className="mt-2 text-sm  text-red-600 animate-pulse font-bold">
                          Click or Tap to Upload Images(570px * 570px )
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

              {errors.thumbnail && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.thumbnail.message}
                </p>
              )}
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
