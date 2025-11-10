"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Container from "./Container";

export default function NewArrivals() {
  const { data, isLoading } = useQuery({
    queryKey: ["featuredSection"],
    queryFn: async () => {
      const res = await axios.get("/api/featured-section");
      return res.data.products || [];
    },
  });

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (!data?.length) return null;

  const [main, topRight, bottomLeft, bottomRight] = data;

  return (
    <Container className="w-full py-12 px-3 sm:px-8 bg-white">
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-[#f44]" />
        <span className="text-sm font-semibold text-[#f44] uppercase">
          Featured
        </span>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-8">New Arrival</h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[500px]">
        {/* Left Big Banner */}
        {main && (
          <div className="relative md:col-span-2 overflow-hidden group  h-[250px] md:h-full">
            <Image
              src={main.thumbnail}
              alt={main.productName}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-2 left-6 text-white z-10">
              <h3 className="text-2xl font-semibold mb-1 line-clamp-2">
                {main.productName}
              </h3>
              <p className="text-sm mb-3 max-w-xs opacity-90 line-clamp-3">
                {main.description}
              </p>
              <Button
                asChild
                className="bg-transparent underline text-destructive hover:bg-[#f69224] hover:text-white"
              >
                <Link href={`/products/${main.slug}`}>Shop Now</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex flex-col gap-6 h-full">
          {/* Top Right */}
          {topRight && (
            <div className="relative overflow-hidden group h-[50%] ">
              <Image
                src={topRight.thumbnail}
                alt={topRight.productName}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-2 left-6 text-white">
                <h3 className="text-lg font-semibold ">
                  {topRight.productName}
                </h3>
               
                <Button
                  asChild
                  className="bg-transparent underline text-destructive hover:bg-[#f69224] hover:text-white"
                >
                  <Link href={`/products/${topRight.slug}`}>Shop Now</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Bottom 2 Items */}
          <div className="grid grid-cols-2 gap-2 h-[50%]">
            {[bottomLeft, bottomRight]?.map(
              (item, i) =>
                item && (
                  <div
                    key={i}
                    className="relative overflow-hidden group "
                  >
                    <Image
                      src={item.thumbnail}
                      alt={item.productName}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-2 left-6 text-white">
                      <h3 className="text-base font-semibold ">
                        {item.productName}
                      </h3>
                     
                      <Button
                        asChild
                        className="bg-transparent underline text-destructive hover:bg-[#f69224] hover:text-white"
                      >
                        <Link href={`/products/${item.slug}`}>Shop Now</Link>
                      </Button>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
