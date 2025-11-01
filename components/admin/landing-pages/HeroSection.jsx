"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center min-h-[90vh] px-6 py-16 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: "url('/auth.png')",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75"></div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl text-white"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-white border-4 border-white p-4">
            <Image
              src="/logo3.png"
              alt="Anon Logo"
              width={90}
              height={90}
              className="object-contain"
            />
          </div>
        </div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-6 bg-black inline-block px-6 py-3 rounded-lg border border-white text-red-500 shadow-lg"
        >
          ওজনে হালকা এবং নরম জুতা খুঁজে থাকলে ডাক্টর কমফোর্ট স্যান্ডেল ব্যবহার
          করুন !
        </motion.h1>

        {/* Paragraph */}
        <p className="text-base md:text-lg font-medium leading-relaxed  px-6 py-4  text-gray-100 mb-8">
          রাবারলেক্স(সপ্ত) চামড়ার তৈরি (মোজা ব্যবহার করুন)। পৃষ্ঠের চামড়ার
          তৈরি জুতা বা মোজায় সঠিক বায়ু প্রবাহ থাকার কারণে অতিরিক্ত ঘামায় না
          এবং যেখানে সেখানে দুর্গন্ধ ছড়ায় না।
        </p>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold text-lg px-10 py-4 rounded-full border-2 border-white shadow-md transition"
        >
          অর্ডার করতে চাই
        </motion.button>
      </motion.div>

      {/* Fixed Smooth Curved Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-0">
        <svg
          className="relative block w-[calc(200%+1.3px)] h-[100px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C360,160 1080,0 1440,80 L1440,120 L0,120 Z"
            fill="#ffffff"
          ></path>
        </svg>
      </div>
    </section>
  );
}
