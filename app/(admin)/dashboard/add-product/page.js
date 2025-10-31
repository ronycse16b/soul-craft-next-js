'use client'
import dynamic from "next/dynamic";

const AddProductForm = dynamic(
  () => import("@/components/admin/AddProductForm"),
  {
    ssr: false, // disables server-side rendering for this component
  }
);

export default function Page() {
  return (
    <div>
      <AddProductForm />
    </div>
  );
}
