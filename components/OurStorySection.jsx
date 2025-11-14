"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Container from "./Container";
import Image from "next/image";
import { Verified } from "lucide-react";

const testimonials = [
  {
    name: "Rina Akter",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg", // Bangladeshi-style avatar
    quote:
      "LUXE has completely upgraded my wardrobe. The quality is top-notch and I love the local",
    rating: 5,
    verified: true,
  },
  {
    name: "Arif Hossain",
    avatar: "https://randomuser.me/api/portraits/men/72.jpg",
    quote:
      "Professional service and premium quality. LUXE is my favorite for formal wear.",
    rating: 5,
    verified: true,
  },
  {
    name: "Moushumi Sultana",
    avatar: "https://randomuser.me/api/portraits/women/50.jpg",
    quote:
      "I always recommend LUXE to friends and clients. The attention to detail is amazing.",
    rating: 5,
    verified: true,
  },
  {
    name: "Jahid Rahman",
    avatar: "https://randomuser.me/api/portraits/men/40.jpg",
    quote:
      "The designs and quality are unmatched. Very satisfied with every purchase!",
    rating: 5,
    verified: true,
  },
  {
    name: "Tania Islam",
    avatar: "https://randomuser.me/api/portraits/women/37.jpg",
    quote:
      "Finding stylish and high-quality local brands is rare. LUXE truly stands out!",
    rating: 5,
    verified: true,
  },
];


const OurStorySection = () => {
  return (
    <section className="mb-10 ">
      <section className="bg-gray-50 p-3">
        <Container className="md:py-16  px-0 py-3">
          {/* Our Story */}
          <div className="  flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4">
                Founded in 2020, LUXE represents the pinnacle of contemporary
                fashion. We believe in creating timeless pieces that transcend
                seasons and trends.
              </p>
              <p className="text-gray-700 mb-6">
                Our commitment to quality craftsmanship and sustainable
                practices ensures that every piece in our collection meets the
                highest standards of excellence.
              </p>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-2xl font-bold">50K+</p>
                  <p className="text-gray-500">Happy Customers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-gray-500">Premium Products</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/our.jpg"
                alt="Our Story"
                width={500}
                height={500}
                className="rounded shadow w-full"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Testimonials */}

      <Container className="px-0 my-8 lg:py-16">
        <div className="container mx-auto  p-3">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-4">
            What Our Customers Say
          </h3>
          <p className="text-center text-gray-500 mb-12">
            Trusted by fashion enthusiasts in Bangladesh
          </p>

          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{ delay: 5000 }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((t, index) => (
              <SwiperSlide key={index}>
                <div className="bg-red-50 border rounded p-6 shadow flex flex-col items-center text-center">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-16 h-16 rounded-full mb-4"
                  />
                  <h4 className="font-semibold flex items-center gap-2">
                    {t.name}
                    {t.verified && (
                      <span className="text-blue-500 text-sm font-bold">
                        <Verified/>
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-700 mt-2 mb-3 ">{t.quote}</p>
                  <div className="flex gap-1 text-yellow-400">
                    {Array(t.rating)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
};

export default OurStorySection;
