"use client";

import { Truck, Headphones, ShieldCheck } from "lucide-react";
import Container from "./Container";

export default function FeatureInfo() {
  return (
    <Container className="w-full py-10 px-4 sm:px-8 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 rounded-md">
        {/* Item 1 */}
        <div className="flex flex-col items-center justify-center text-center p-6 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center mb-4">
            <Truck className="text-white w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base mb-1">
            FREE AND FAST DELIVERY
          </h3>
          <p className="text-gray-500 text-sm">
            Free delivery for all orders over $140
          </p>
        </div>

        {/* Item 2 */}
        <div className="flex flex-col items-center justify-center text-center p-6 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center mb-4">
            <Headphones className="text-white w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base mb-1">
            24/7 CUSTOMER SERVICE
          </h3>
          <p className="text-gray-500 text-sm">
            Friendly 24/7 customer support
          </p>
        </div>

        {/* Item 3 */}
        <div className="flex flex-col items-center justify-center text-center p-6">
          <div className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center mb-4">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base mb-1">
            MONEY BACK GUARANTEE
          </h3>
          <p className="text-gray-500 text-sm">
            We return money within 30 days
          </p>
        </div>
      </div>
    </Container>
  );
}
