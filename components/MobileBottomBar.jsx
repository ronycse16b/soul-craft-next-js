"use client";

import { ShoppingBag, Grid, Heart, User, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileBottomBar() {
  const [open, setOpen] = useState(false);

  const categories = [
    { name: "Men’s Fashion", href: "/shop?category=men" },
    { name: "Women’s Fashion", href: "/shop?category=women" },
    { name: "Electronics", href: "/shop?category=electronics" },
    { name: "Home & Living", href: "/shop?category=home" },
    { name: "Beauty & Health", href: "/shop?category=beauty" },
    { name: "Accessories", href: "/shop?category=accessories" },
  ];

  return (
    <>
      {/* 🔹 Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex justify-around items-center py-2 z-50 md:hidden">
        {/* Cart */}
        <Link
          href="/cart"
          className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[11px] font-medium mt-1">Cart</span>
        </Link>

        {/* Categories (Sheet) */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition">
              <Grid className="h-5 w-5" />
              <span className="text-[11px] font-medium mt-1">Categories</span>
            </button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className=" p-5 pb-8 bg-white animate-slide-up"
          >
            <SheetHeader className="flex justify-between items-center mb-4">
              <SheetTitle className="text-lg font-semibold text-gray-800">
                All Categories
              </SheetTitle>
             
            </SheetHeader>

            {/* 🔸 Category List */}
            <div className="divide-y divide-gray-200">
              {categories.map((cat, i) => (
                <Link
                  key={i}
                  href={cat.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-[#f69224]/10 transition-all"
                >
                  <span className="text-[15px] font-medium text-gray-800">
                    {cat.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition"
        >
          <Heart className="h-5 w-5" />
          <span className="text-[11px] font-medium mt-1">Wishlist</span>
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition"
        >
          <User className="h-5 w-5" />
          <span className="text-[11px] font-medium mt-1">Account</span>
        </Link>
      </div>
    </>
  );
}
