"use client";

import ThankYouCard from "@/components/ThankYouCard";



export default function ThankYouPage() {
  // You can get these values from order confirmation data or params
  const orderId = "ORD-20251008";
  const total = 2599.5;
  const itemsCount = 3;

  return (
    <main className="sm:bg-gradient-to-b from-[#f0fdf4] via-[#fafffb] to-white  flex items-center justify-center">
      <ThankYouCard orderId={orderId} total={total} itemsCount={itemsCount} />
    </main>
  );
}
