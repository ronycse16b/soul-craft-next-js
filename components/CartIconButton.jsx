"use client";

import { useSelector } from "react-redux";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartIconButton() {
  const cartItems = useSelector((state) => state.cart.items);
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (totalQty > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500); // reset after animation
      return () => clearTimeout(timer);
    }
  }, [totalQty]);

  return (
    <Link href="/cart">
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full bg-gray-100 hover:bg-gray-200 relative hidden sm:inline-flex transition-transform duration-300 ${
          animate ? "scale-110 animate-bounce" : ""
        }`}
      >
        <ShoppingCart className="h-6 w-6 text-gray-800" />
        {totalQty > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white font-semibold transition-transform ${
              animate ? "scale-125 bg-black" : ""
            }`}
          >
            {totalQty}
          </span>
        )}
      </Button>
    </Link>
  );
}
