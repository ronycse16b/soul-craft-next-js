"use client";

import dynamic from "next/dynamic";
import React from "react";

// ✅ Dynamically import the client-only form
const ProductUpdateForm = dynamic(
  () => import("@/components/admin/ProductUpdateForm"),
  { ssr: false }
);

export default function ProductUpdateWrapper({ product }) {
  return <ProductUpdateForm product={product} />;
}
