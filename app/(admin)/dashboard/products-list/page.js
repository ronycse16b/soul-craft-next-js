'use client'

import AllProducts from "@/components/admin/AllProducts";
import { Suspense } from "react";

export default async function ProductsManagement({}) {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <AllProducts />
      </Suspense>
    </div>
  );
}
