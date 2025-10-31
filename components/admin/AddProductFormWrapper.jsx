// components/AddProductFormWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const AddProductForm = dynamic(() => import("./AddProductForm"), {
  ssr: false,
});

export default AddProductForm;
