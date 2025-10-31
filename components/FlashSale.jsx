"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Container from "./Container";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    name: "AK-900 Wired Keyboard",
    image: "https://images.unsplash.com/photo-1587202372775-98926b0b6a59?w=600",
    price: 40,
    oldPrice: 50,
    discount: 20,
    rating: 4,
    reviews: 99,
  },
  {
    id: 2,
    name: "IPS LCD Gaming Monitor",
    image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=600",
    price: 370,
    oldPrice: 400,
    discount: 8,
    rating: 4,
    reviews: 99,
  },
  {
    id: 3,
    name: "S-Series Comfort Chair",
    image: "https://images.unsplash.com/photo-1585559604582-675cfb2c8885?w=600",
    price: 210,
    oldPrice: 250,
    discount: 15,
    rating: 4,
    reviews: 99,
  },
  {
    id: 4,
    name: "HAVIT HV-G92 Gamepad",
    image: "https://images.unsplash.com/photo-1606813902911-4e07c2b8d8e5?w=600",
    price: 120,
    oldPrice: 160,
    discount: 40,
    rating: 5,
    reviews: 88,
  },
  {
    id: 5,
    name: "Wireless Mouse X200",
    image: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=600",
    price: 60,
    oldPrice: 80,
    discount: 25,
    rating: 4.5,
    reviews: 45,
  },
];

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 31,
  });
  const [visibleCount, setVisibleCount] = useState(2);
  const swiperRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) {
          seconds = 59;
          minutes--;
        } else if (hours > 0) {
          minutes = 59;
          hours--;
        } else if (days > 0) {
          hours = 23;
          days--;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Responsive card count
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleCount(2);
      else if (width >= 640 && width < 1024) setVisibleCount(3);
      else setVisibleCount(5);
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  return (
    <Container className="w-full sm:py-12 py-6 px-1 sm:px-8 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between justify-center  items-center gap-6 w-full mb-6">
          <div >
            <h3 className="text-[#f69224] font-semibold text-lg">Today’s</h3>
            <h2 className="text-xl sm:text-xl font-bold text-black uppercase">
              Flash Sales
            </h2>
          </div>

          {/* Countdown */}
          <div className="flex gap-2 mt-4 sm:mt-0">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col items-center bg-destructive  shadow-md px-2 transition-transform transform hover:scale-105"
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
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            spaceBetween={10}
            slidesPerView={visibleCount}
            modules={[Autoplay, Navigation]}
            // navigation
            className="mySwiper"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-10">
        <Button className="bg-destructive text-white px-6 py-3 rounded-none">
          View All Products
        </Button>
      </div>

      <hr className="my-8 border-gray-200" />
    </Container>
  );
}
