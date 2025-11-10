"use client";

import {
  ShoppingBag,
  Grid,
  Heart,
  User,
  Home,
  ChevronRight,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";

export default function MobileBottomBar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  // ✅ TanStack Query v5 - Caching enabled
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/client`);
      return res.data?.result || [];
    },
    staleTime: 1000 * 60 * 5, // 5 mins cache before re-fetch
    gcTime: 1000 * 60 * 10, // garbage collect after 10 mins
    refetchOnWindowFocus: false,
  });

    const cartItems = useSelector((state) => state.cart.items);
    const totalQty = cartItems?.reduce((sum, item) => sum + item.quantity, 0);
  
    const [animate, setAnimate] = useState(false);
  
    useEffect(() => {
      if (totalQty > 0) {
        setAnimate(true);
        const timer = setTimeout(() => setAnimate(false), 500); // reset after animation
        return () => clearTimeout(timer);
      }
    }, [totalQty]);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex justify-around items-center py-2 z-50 md:hidden">
      {/* 🏠 Home */}
      <Link
        href="/"
        className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition"
      >
        <Home className="h-5 w-5" />
        <span className="text-[11px] font-medium mt-1">Home</span>
      </Link>
      <Link
        href="/shop"
        className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition"
      >
        <Package className="h-5 w-5" />
        <span className="text-[11px] font-medium mt-1">Shop</span>
      </Link>

      {/* 🛍️ Cart */}
      <Link
        href="/cart"
        className="flex flex-col items-center relative text-gray-700 hover:text-[#f69224] transition"
      >
        <ShoppingBag className="h-5 w-5 " />
        {totalQty > 0 && (
          <span
            className={`absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white font-semibold transition-transform ${
              animate ? "scale-125 bg-black" : ""
            }`}
          >
            {totalQty}
          </span>
        )}
        <span className="text-[11px] font-medium mt-1">Cart</span>
      </Link>

      {/* 🧭 Categories (Sheet) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition">
            <Grid className="h-5 w-5" />
            <span className="text-[11px] font-medium mt-1">Categories</span>
          </button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="p-5 pb-8 bg-white rounded-none animate-slide-up"
        >
          <SheetHeader className="flex justify-between items-center mb-4">
            <SheetTitle className="text-lg font-semibold bg-rose-600 text-white px-3 py-1 rounded-full shadow-md">
              All Categories
            </SheetTitle>
          </SheetHeader>

          {/* 🔸 Category List */}
          {isLoading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
          ) : isError ? (
            <p className="text-sm text-red-500 text-center py-4">Failed.</p>
          ) : categories?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/shop/${cat.slug}`}
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
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No categories found.
            </p>
          )}
        </SheetContent>
      </Sheet>

      {/* 👤 Account */}
      {user ? (
        <Link
          href="/account"
          className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition"
        >
          <Avatar className="h-6 w-6 border-2 border-[#f69224]">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] font-medium mt-1">Account</span>
        </Link>
      ) : (
        <Link
          href="/auth/sign-in"
          className="flex flex-col items-center text-gray-700 hover:text-[#f69224] transition"
        >
          <User className="h-5 w-5" />
          <span className="text-[11px] font-medium mt-1">Login</span>
        </Link>
      )}
    </div>
  );
}
