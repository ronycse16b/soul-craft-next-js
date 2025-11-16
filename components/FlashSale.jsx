"use client";

import dynamic from "next/dynamic";

// Lazy load ProductCard (client-only)
const ProductCard = dynamic(() => import("./ProductCard"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
  ),
});

import React, { useEffect, useState, useRef, Suspense } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Container from "./Container";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [visibleCount, setVisibleCount] = useState(2);
  const swiperRef = useRef(null);

  // TanStack Query fetch
  const { data = [], isLoading } = useQuery({
    queryKey: ["flashSales"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/flash-sale`
      ); // your API
      return res.data.flashSales || [];
    },
  });

  const activeSale = data?.find((sale) => sale?.isActive);

  // Countdown timer
  useEffect(() => {
    if (!activeSale?.endTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(activeSale.endTime).getTime();
      const distance = end - now;

      if (distance <= 0)
        return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSale]);

  // Responsive card count
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCount(2);
      else if (width < 1024) setVisibleCount(3);
      else setVisibleCount(5);
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Render
  return (
    <Container className="w-full sm:py-12 py-6 px-1 sm:px-8 bg-gradient-to-b ">
      {activeSale && (
        <>
          {/* Header */}
          <div data-aos="fade-up" data-aos-duration="1000" className="mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between justify-center items-center gap-6 w-full mb-6">
              <div>
                <h3 className="text-[#f69224] font-semibold text-lg">
                  Today’s
                </h3>
                <h2 className="text-xl sm:text-3xl font-bold text-black uppercase">
                  {activeSale.title || "Flash Sales"}
                </h2>
              </div>

              {/* Countdown */}
              <div className="flex gap-2 mt-4 sm:mt-0">
                {Object.entries(timeLeft).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col items-center bg-destructive shadow-md px-2 transition-transform transform hover:scale-105"
                  >
                    <p className="text-xl font-bold text-white">
                      {String(value).padStart(2, "0")}
                    </p>
                    <span className="text-xs font-medium uppercase text-gray-200">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Swiper Carousel */}
            <div
              onMouseEnter={() => swiperRef.current?.autoplay.stop()}
              onMouseLeave={() => swiperRef.current?.autoplay.start()}
            >
              <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                loop={true}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                spaceBetween={10}
                slidesPerView={visibleCount}
                modules={[Autoplay, Navigation]}
                className="mySwiper"
              >
                {activeSale?.products?.map(({ productId, index }) => {
                  return (
                    <SwiperSlide>
                      <Suspense
                        key={productId?._id}
                        fallback={
                          <div className="h-[240px] bg-gray-100 animate-pulse rounded-md" />
                        }
                      >
                        <ProductCard product={productId} />
                      </Suspense>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>

          {/* View All Button */}
          <Link href="/flash-sales" className="flex justify-center mt-10">
            <Button className="bg-destructive text-white px-6 py-6 rounded-full">
              View All Products
            </Button>
          </Link>

          <hr className="my-8 border-gray-200" />
        </>
      )}
    </Container>
  );
}
