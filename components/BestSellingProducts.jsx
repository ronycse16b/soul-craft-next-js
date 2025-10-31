"use client";

import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "./Container";
import ProductCard from "./ProductCard";

export default function BestSellingProducts() {
    const products = [
      {
        id: 1,
        name: "Summer Dress",
        price: "$49.99",
        image:
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400",
      },
      {
        id: 2,
        name: "Casual Shirt",
        price: "$29.99",
        image:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400",
      },
      {
        id: 3,
        name: "Elegant Shoes",
        price: "$79.99",
        image:
          "https://images.unsplash.com/photo-1521334884684-d80222895322?w=400",
      },

      {
        id: 5,
        name: "Leather Bag",
        price: "$99.99",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      },
      {
        id: 6,
        name: "Leather Bag",
        price: "$99.99",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      },
     
    ];
  return (
    <section className="py-14 bg-white">
      <Container>
        {/* Header */}
        <div className="flex flex-row justify-between items-center mb-10">
          <div>
            <span className="text-[#f69224] font-semibold text-sm tracking-wide flex items-center gap-2">
              <div className="w-2 h-5 rounded-sm bg-[#f69224]" />
              This Month
            </span>
            <h2 className="text-md sm:text-2xl font-bold text-black mt-2 uppercase">
              Best Selling Products
            </h2>
          </div>

          <Button className="bg-destructive hover:bg-destructive/90 text-white mt-4 sm:mt-0 rounded-none">
            View All
          </Button>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />

          ))}
        </div>
      </Container>
    </section>
  );
}
