"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingBasketIcon } from "lucide-react";
import { useState } from "react";

export default function ProductCard() {
  const product = {
    name: "Gucci Duffle Bag",
    image: "/p1.png", // Replace with actual path
    price: 960,
    originalPrice: 1160,
    rating: 4.5,
    reviews: 65,
  };

  const discount = product.originalPrice - product.price;
  const discountPercent = Math.round((discount / product.originalPrice) * 100);

  const [open, setOpen] = useState(false);

  return (
    <Card className="w-full max-w-[220px] rounded-none border-0  hover:shadow-lg transition-all duration-200">
      {/* Product Image */}
      <div className="relative w-full aspect-[1] bg-gray-100 flex items-center justify-center overflow-hidden ">
        {/* Discount Badge */}
        <Badge
          variant="destructive"
          className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-none"
        >
          -{discountPercent}%
        </Badge>

        <img
          src={product.image}
          alt={product.name}
          className="max-w-[70%] max-h-[70%] object-contain transition-transform duration-300 hover:scale-105"
        />

        {/* Icons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full bg-white hover:bg-[#f69224]/10 shadow-sm p-1"
          >
            <Heart className="w-4 h-4 text-[#f69224]" />
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-white hover:bg-[#6fd300]/10 shadow-sm p-1"
              >
                <Eye className="w-4 h-4 text-[#6fd300]" />
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-sm border-none shadow-xl overflow-hidden">
              <Image
                src="/p1.png"
                alt="Quick View"
                width={500}
                height={400}
                className="w-full h-auto object-contain bg-white"
                priority
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="px-2 py-1 space-y-1">
        <h3 className="text-xs font-semibold line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs">
          <span className="font-bold text-green-600">${product.price}</span>
          <span className="line-through text-gray-500">
            ${product.originalPrice}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          ⭐ {product.rating} ({product.reviews} reviews)
        </div>
      </CardContent>

      {/* Add to Cart */}
      <CardFooter className="px-2 py-1">
        <Button
          className="w-full h-7 text-xs flex items-center justify-center gap-1"
          onClick={() => console.log("Added to cart!")}
        >
          <ShoppingBasketIcon className="w-3 h-3" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
