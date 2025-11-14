"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";

export default function ThankYouCard({ orderId, total = 0, itemsCount = 0 }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-1 lg:py-10 bg-gradient-to-b from-green-50 via-white to-white">
      <Card className="w-full max-w-md sm:max-w-lg bg-white rounded-md  border border-green-100/60 pb-4">
        {/* HEADER */}
        <CardHeader className="text-center pt-10 pb-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500 border border-green-200 shadow-inner flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white animate-scaleIn" />
          </div>

          <CardTitle className="mt-6 text-2xl sm:text-3xl font-bold text-green-700  leading-tight">
            Thanks for Your Order!
          </CardTitle>

          <CardDescription className="mt-2 text-xs md:text-sm text-gray-600 max-w-sm mx-auto">
            We’re processing your order. You’ll get updates soon.
          </CardDescription>
        </CardHeader>

        {/* SUMMARY */}
        <CardContent className="px-6 sm:px-8">
          <div className="flex flex-col text-center gap-3 py-4">
            <div>
              <p className="text-[11px] text-gray-500">Order Number</p>
              <p className=" font-bold text-gray-800 text-sm">
                {orderId ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Items</p>
              <p className="font-medium text-gray-800 text-sm">{itemsCount}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Total</p>
              <p className="font-semibold text-green-600 text-sm">
                ৳ {Number(total).toFixed(2)}
              </p>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Next Steps Box */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex gap-3">
              <Badge className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-md">
                Info
              </Badge>
              <p className="text-xs text-gray-700 leading-relaxed">
                We’ll send you a confirmation message with tracking details once
                your order ships.
              </p>
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex  gap-4 px-6 pt-4 mt-4 border-t border-green-100">
          <Button
            variant="outline"
            className="w-1/2 text-green-700 border-green-400 cursor-pointer hover:bg-green-50 shadow-sm"
            onClick={() => router.push(`/orders/${orderId}`)}
          >
            View Order
          </Button>

          <Link href="/shop" className="w-1/2">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md">
              Continue Shopping
            </Button>
          </Link>
        </CardFooter>

        <div className="pt-2 text-center text-[11px] text-gray-500">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-green-700 underline font-medium"
          >
            Contact Support
          </Link>
        </div>
      </Card>
    </div>
  );
}
