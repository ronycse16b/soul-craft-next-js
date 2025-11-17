"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Container from "./Container";

export default function NewArrivals() {
  const { data, isLoading } = useQuery({
    queryKey: ["featuredSection"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/featured-section`
      );
      return res.data.products || [];
    },
  });

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (!data?.length) return null;

  const [main, topRight, bottomLeft, bottomRight] = data;

  return (
    <Container className="w-full py-12 px-3 sm:px-8 bg-white">
      {/* Section Title */}
      <div
        className="flex items-center gap-2 mb-2"
        data-aos="fade-right"
        data-aos-delay="0"
      >
        <span className="w-2 h-2 rounded-full bg-[#f44]" />
        <span className="text-sm font-semibold text-[#f44] uppercase">
          Featured
        </span>
      </div>

      <h2
        className="text-xl sm:text-2xl font-bold mb-8"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        Featured Products
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[500px]">
        {/* Left Big Banner */}
        {main && (
          <Link
            href={`/products/${main.slug}`}
            className="relative md:col-span-2 overflow-hidden group h-[250px] sm:h-[350px] md:h-full rounded block"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <Image
              src={main.thumbnail}
              alt={main.productName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/50" />
            <div className="absolute bottom-3 sm:bottom-5 left-4 sm:left-6 text-white z-10">
              {/* <h3
                className="font-semibold leading-tight sm:leading-snug md:leading-normal
              text-sm sm:text-lg  max-w-[90%] "
              >
                {main.productName}
              </h3> */}
            </div>
          </Link>
        )}

        {/* Right Section */}
        <div className="flex flex-col gap-6 h-auto md:h-full">
          {/* Top Right */}
          {topRight && (
            <Link
              href={`/products/${topRight.slug}`}
              className="relative overflow-hidden group h-[200px] sm:h-[250px] md:h-[50%] rounded block"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <Image
                src={topRight.thumbnail}
                alt={topRight.productName}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/50" />
              <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 text-white">
                {/* <h3
                  className="font-semibold leading-tight mb-1
                text-xs sm:text-base md:text-lg max-w-[90%] line-clamp-2 break-words"
                >
                  {topRight.productName}
                </h3> */}
              </div>
            </Link>
          )}

          {/* Bottom 2 Items */}
          <div className="grid grid-cols-2 gap-3 h-[200px] sm:h-[250px] md:h-[50%]">
            {[bottomLeft, bottomRight]?.map(
              (item, i) =>
                item && (
                  <Link
                    key={i}
                    href={`/products/${item.slug}`}
                    className="relative overflow-hidden group rounded block"
                    data-aos={i % 2 === 0 ? "fade-up" : "fade-down"}
                    data-aos-delay={400 + i * 100} // staggered delay
                  >
                    <Image
                      src={item.thumbnail}
                      alt={item.productName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/50" />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
                      {/* <h3
                        className="font-semibold leading-tight mb-1
                      text-xs sm:text-sm md:text-base max-w-[90%] line-clamp-2 break-words"
                      >
                        {item.productName}
                      </h3> */}
                    </div>
                  </Link>
                )
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
