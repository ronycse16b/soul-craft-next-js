"use client";

import { useSearchParams } from "next/navigation";
import ThankYouCard from "@/components/ThankYouCard";

export default function ThankYouPage() {
  const params = useSearchParams();

  const orderId = params.get("orderId");
  const total = params.get("total") || 0;
  const itemsCount = params.get("items") || 0;

  return (
    <main className="sm:bg-gradient-to-b from-[#f0fdf4] via-[#fafffb] to-white flex items-center justify-center">
      <ThankYouCard orderId={orderId} total={total} itemsCount={itemsCount} />
    </main>
  );
}
