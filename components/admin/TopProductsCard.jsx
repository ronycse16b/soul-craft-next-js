// app/dashboard/components/TopProductsCard.jsx
"use client";
import { useEffect, useState } from "react";

export default function TopProductsCard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/top-products`)
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
      <ul className="space-y-2 max-h-[300px] overflow-y-auto">
        {products.map((item, idx) => (
          <li key={idx} className="flex justify-between text-sm border-b border-gray-300 pb-1">
            <span>{item.name}</span>
            <span className="text-[#f69224] font-semibold">
              ৳{item.totalSales}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
