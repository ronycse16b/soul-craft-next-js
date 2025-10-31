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

export default function BannerSlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  const categories = [
    { name: "Men’s Fashion", href: "/shop?category=men" },
    { name: "Women’s Fashion", href: "/shop?category=women" },
    { name: "Electronics", href: "/shop?category=electronics" },
    { name: "Home & Living", href: "/shop?category=home" },
    { name: "Beauty & Health", href: "/shop?category=beauty" },
    { name: "Accessories", href: "/shop?category=accessories" },
  ];

  const banners = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1521334884684-d80222895322?w=1600",
      title: "Soul Craft Trends 2025",
      desc: "Upgrade your wardrobe with our latest arrivals.",
      buttonText: "Shop Now",
      buttonLink: "/shop",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600",
      title: "Hot Deals of the Season",
      desc: "Save big on selected items before they’re gone!",
      buttonText: "View Deals",
      buttonLink: "/hot-deals",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600",
      title: "Exclusive Accessories",
      desc: "Complete your look with premium accessories.",
      buttonText: "Explore Now",
      buttonLink: "/accessories",
    },
  ];

  return (
    <Container className="px-0">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Categories */}
        <aside className="w-full lg:w-1/4 bg-white border-r border-gray-200 p-4 hidden lg:block">
          <h3 className="  mb-4 bg-destructive text-white px-2 py-1 uppercase shadow"># Popular Categories</h3>
         <div className="divide-y divide-gray-200">
                     {categories?.map((cat, i) => (
                       <Link
                         key={i}
                         href={cat.href}
                         
                         className="flex items-center justify-between  px-2 py-2 hover:bg-[#f69224]/10 transition-all"
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
              {banners?.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div
                    className="relative h-[300px] sm:h-[320px] md:h-[300px] lg:h-[350px] flex items-center justify-center overflow-hidden transition-all duration-500"
                    style={{
                      backgroundImage: `url(${banner.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Optional Text Content */}
                    {/* Add your overlay text here if needed */}
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

          {/* Dot Indicators */}
          <div className="absolute bottom-10 w-full flex justify-center gap-2">
            {banners?.map((_, idx) => (
              <span
                key={idx}
                className="block w-2 h-2 rounded-full bg-white/70 hover:bg-white transition-all"
              />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
