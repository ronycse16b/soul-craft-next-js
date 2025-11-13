"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import Container from "./Container";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

export default function BannerSlider() {
  const plugin = React.useRef(Autoplay({ delay: 4000 }));

  // ✅ Fetch dynamic banners
  const {
    data: banners = [],
    isLoading: isBannerLoading,
    isError: isBannerError,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/banner`
      );
      return data?.data[0].imageUrls || [];
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  // ✅ Fetch dynamic categories
  const {
    data: categories = [],
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/client`
      );

      return data?.result || [];
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  // ✅ Elegant Spinner Component


  return (
    <Container className="px-0">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Categories */}
        <aside className="w-full lg:w-1/4 bg-white border-r border-gray-200 p-4 hidden lg:block">
          <h3
            className="mb-4 px-3 py-1 text-white uppercase font-bold italic 
  bg-destructive
  shadow-xl text-center sm:text-left"
          >
            # Popular Categories
          </h3>

          <div className="divide-y divide-gray-200">
            {categories?.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop/${cat.slug}`}
                className="flex items-center justify-between px-2 py-2 hover:bg-[#f69224]/10 transition-all"
              >
                <span className="text-[15px] font-medium text-gray-800">
                  {cat.name}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </aside>

        {/* Right Side: Banner Slider */}
        <div className="w-full lg:w-3/4 relative pt-0 pl-0 pb-0 md:pl-4 md:pt-6 md:pb-6">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {banners?.map((banner, index) => (
                <CarouselItem key={`banner-${index}`}>
                  <div className="relative h-[300px] sm:h-[320px] md:h-[300px] lg:h-[370px] flex items-center justify-center overflow-hidden transition-all duration-500">
                    <Image
                      src={banner}
                      alt={`Banner ${index + 1}`}
                      fill
                      priority={index === 0} // Optimize first image load
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-center"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-lg items-center justify-center">
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </CarouselPrevious>
            <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-lg items-center justify-center">
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </CarouselNext>
          </Carousel>
        </div>
      </div>
    </Container>
  );
}
