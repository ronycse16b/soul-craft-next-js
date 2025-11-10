"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);

  // Images
  const mainImage =
    product?.thumbnail || product?.images?.[0] ;

  // Variants & stock
  const availableVariants =
    product.type === "variant"
      ? product.variants?.filter((v) => v.quantity > 0) || []
      : product.quantity > 0
      ? [
          {
            price: product.price,
            discount: product.discount || 0,
            quantity: product.quantity,
          },
        ]
      : [];

  const inStock = availableVariants.length > 0;

  // Price calculations
  const minPrice = availableVariants.length
    ? Math.min(...availableVariants.map((v) => v.price))
    : product.price || 0;

  const discountPrice = availableVariants.length
    ? Math.max(...availableVariants.map((v) => v.discount || 0))
    : product.discount || 0;

  const discountPercent = discountPrice
    ? Math.round(((minPrice - discountPrice) / minPrice) * 100)
    : 0;

  // Variant summary

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="w-full max-w-[300px] sm:max-w-[260px] md:max-w-[220px] lg:max-w-[240px] mx-auto rounded overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-500 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <Image
            src={mainImage}
            alt={product.productName}
            width={404}
            height={500}
            className={`w-full h-40 sm:h-48 md:h-44 lg:h-48 object-contain bg-gray-100 transition-transform duration-500 ${
              hovered ? "scale-105" : "scale-100"
            }`}
          />

          {/* Discount badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              -{discountPercent}%
            </div>
          )}

          {/* New Arrival badge */}
          {product.newArrival && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              New
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="">
          <div className="p-3">
            <h3 className="text-sm sm:text-xs font-semibold line-clamp-2 truncate">
              {product.productName}
            </h3>

            {/* Price */}
            <div className="mt-2 flex items-center gap-1">
              <span className="font-bold text-green-600 text-sm">
                {discountPrice || minPrice} BDT
              </span>
              {discountPercent > 0 && (
                <span className="line-through text-red-400 text-sm">
                  {minPrice} BDT
                </span>
              )}
            </div>
          </div>
          {/* Buy Now button */}
          <Link href={`/products/${product.slug}`}>
            <Button
              className={`mt-3 w-full text-white  font-semibold py-2 rounded-none ${
                !inStock ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!inStock}
              type="button"
            >
              {inStock ? "Buy Now" : "Out of Stock"}
            </Button>
          </Link>
        </div>
      </div>
    </Link>
  );
}
