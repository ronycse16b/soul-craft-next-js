

"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPageForm() {
  const { register, handleSubmit, setValue, control, reset, watch, getValues } =
    useForm({
      defaultValues: {
        heroTitle: "",
        heroParagraph: "",
        heroButtonText: "",
        productTitle: "",
        productShortDesc: "",
        productType: "simple",
        price: "",
        discount: 0,
        quantity: "",
        sku: "",
        attributes: [{ name: "", values: "" }],
        variants: [],
        videoTitle: "",
        videoDescription: "",
        videoUrl: "",
        productDescription: "",
      },
    });

  const productType = watch("productType");

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

  const { quill: productQuill, quillRef: productQuillRef } = useQuill();
  const { quill: videoQuill, quillRef: videoQuillRef } = useQuill();

  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (productQuill) {
      productQuill.on("text-change", () => {
        setValue("productDescription", productQuill.root.innerHTML);
      });
    }
  }, [productQuill, setValue]);

  useEffect(() => {
    if (videoQuill) {
      videoQuill.on("text-change", () => {
        setValue("videoDescription", videoQuill.root.innerHTML);
      });
    }
  }, [videoQuill, setValue]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

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

  const onSubmit = (data) => {
    console.log("🧾 Product Data:", data);
    alert("✅ Product Saved Successfully!");
    reset();
    setImagePreviews([]);
  };

  return (
    <div className="lg:max-w-7xl 2xl:max-w-full mx-auto p-8 rounded-2xl my-5">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">
        Dynamic Landing Page Builder
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {/* HERO SECTION */}
        <section className="border p-6 rounded-xl bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-blue-500">
            Hero Section
          </h3>
          <input
            {...register("heroTitle")}
            placeholder="Hero Title"
            className="w-full border p-3 rounded mb-3"
          />
          <textarea
            {...register("heroParagraph")}
            placeholder="Hero Paragraph"
            rows={3}
            className="w-full border p-3 rounded mb-3"
          />
          <input
            {...register("heroButtonText")}
            placeholder="Hero Button Text"
            className="w-full border p-3 rounded"
          />
        </section>

        {/* PRODUCT INFO */}
        <section className="border p-6 rounded-xl bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-green-600">
            Product Info
          </h3>
          <input
            {...register("productTitle")}
            placeholder="Product Title"
            className="w-full border p-3 rounded mb-3"
          />
          <textarea
            {...register("productShortDesc")}
            placeholder="Short Description"
            rows={2}
            className="w-full border p-3 rounded mb-3"
          />

          {/* IMAGE UPLOAD */}
          <div className="mt-4">
            <label className="block mb-2 font-medium text-gray-700">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              {...register("productImages")}
              onChange={handleImageUpload}
              className="border p-2 rounded w-full"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt={`Preview ${i}`}
                    className="w-28 h-28 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImagePreviews((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT TYPE */}
          <div className="mt-4">
            <label className="block mb-2 font-medium text-gray-700">
              Product Type
            </label>
            <select
              {...register("productType")}
              className="border p-3 rounded w-full"
            >
              <option value="simple">Simple</option>
              <option value="variant">Variant</option>
            </select>
          </div>

          {/* SIMPLE PRODUCT FIELDS */}
          {productType === "simple" && (
            <div className="mt-4 border-t pt-4 grid grid-cols-4 gap-3">
              <input
                {...register("price")}
                type="number"
                placeholder="Price"
                className="border p-2 rounded"
              />
              <input
                {...register("discount")}
                type="number"
                placeholder="Discount"
                className="border p-2 rounded"
              />
              <input
                {...register("quantity")}
                type="number"
                placeholder="Quantity"
                className="border p-2 rounded"
              />
              <input
                {...register("sku")}
                placeholder="SKU"
                className="border p-2 rounded"
              />
            </div>
          )}
        </section>

        {/* VARIANT SECTION */}
        {productType === "variant" && (
          <section className="border p-6 rounded-xl bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-purple-600">
              Variants
            </h3>

            {/* ATTRIBUTES */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-3">Attributes</h4>
              {attrFields.map((attr, i) => (
                <div
                  key={attr.id}
                  className="border p-4 rounded-lg mb-3 bg-gray-50 flex flex-col gap-2"
                >
                  <input
                    {...register(`attributes.${i}.name`)}
                    placeholder="Attribute Name (Color, Size, etc.)"
                    className="border p-2 rounded"
                  />
                  <textarea
                    {...register(`attributes.${i}.values`)}
                    placeholder="Values (comma separated)"
                    rows={2}
                    className="border p-2 rounded"
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
              <div className="border p-4 rounded-lg mb-4 bg-gray-100">
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
                      className="border p-2 rounded"
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
                  These values will be applied to all variants. You can still
                  edit individual variants below.
                </p>
              </div>
            )}

            {/* INDIVIDUAL VARIANTS */}
            {variantFields.length > 0 &&
              variantFields.map((variant, idx) => (
                <div
                  key={variant.id}
                  className="border p-4 rounded-lg mb-3 bg-gray-50 flex flex-col gap-3"
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

        <section className="border p-6 rounded-xl bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Product Description
          </h3>
          <div
            ref={productQuillRef}
            className="bg-white border rounded min-h-[180px]"
          />
        </section>

        {/* VIDEO SECTION */}
        <section className="border p-6 rounded-xl bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-yellow-600">
            Video Section
          </h3>
          <input
            {...register("videoTitle")}
            placeholder="Video Title"
            className="border p-2 rounded mb-3 w-full"
          />
          <input
            {...register("videoUrl")}
            placeholder="Video URL"
            className="border p-2 rounded mb-3 w-full"
          />
          <h4 className="font-medium mb-2">Video Description</h4>
          <div
            ref={videoQuillRef}
            className="bg-white border rounded min-h-[150px] mb-2"
          />
        </section>

        {/* SUBMIT */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => reset()}
            className="bg-red-600 hover:bg-red-700 py-5 text-white flex items-center gap-2"
          >
            <RefreshCw size={18} /> Reset Form
          </Button>
          <Button
            type="submit"
            className="bg-sky-700 hover:bg-sky-800 py-5 text-white flex items-center gap-2"
          >
            <Plus size={18} /> Save Landing Page
          </Button>
        </div>
      </form>
    </div>
  );
}
