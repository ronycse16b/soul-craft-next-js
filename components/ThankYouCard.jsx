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
    <div className="min-h-[80vh] flex items-center justify-center  px-4 sm:py-10 py-2">
      <Card className="w-full max-w-md sm:max-w-lg mx-auto   bg-white/90 backdrop-blur-sm rounded-sm shadow-none">
        {/* HEADER */}
        <CardHeader className="text-center pt-8 pb-3">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-gradient-to-tr from-white to-green-50 ring-8 ring-green-100 shadow-sm">
            <CheckCircle className="w-9 h-9 sm:w-10 sm:h-10 text-[#16a34a]" />
          </div>

          <CardTitle className="mt-5 text-lg sm:text-2xl font-semibold text-[#14532d]">
            Order Submitted Successfully
          </CardTitle>
          <CardDescription className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Thank you for your purchase! We’re processing your order and will
            notify you once it ships.
          </CardDescription>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="pt-4 px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-xs text-gray-500">Order ID</p>
              <p className="font-medium text-gray-800 text-sm">
                {orderId ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Items</p>
              <p className="font-medium text-gray-800 text-sm">{itemsCount}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-semibold text-[#16a34a] text-sm">
                ৳ {Number(total).toFixed(2)}
              </p>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 sm:p-4 border border-green-200/60">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <Badge className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-md">
                Next Steps
              </Badge>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                You’ll receive a confirmation email and tracking details once
                your order ships.
              </p>
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch justify-between px-5 sm:px-8 py-5 border-t border-green-100/70">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-green-700 border-green-300 hover:bg-green-50 text-sm cursor-pointer"
              onClick={() => router.push(`/orders/${orderId}`)}
            >
              View Order
            </Button>

            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-medium shadow-sm">
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="mt-3 sm:mt-0 text-center sm:text-right text-xs sm:text-sm text-gray-500">
            <p>Need help?</p>
            <Link
              href="/contact"
              className="text-green-700 font-semibold hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
