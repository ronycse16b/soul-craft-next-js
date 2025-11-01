"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";

export default function ProductHighlight({ product }) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <section className="relative bg-gradient-to-b from-white via-orange-50/40 to-white overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(246,146,36,0.08),transparent_70%)]"></div>

      {/* --- Product Highlight --- */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl mx-auto py-20 px-6 md:px-12">
        {/* Left: Image Slider */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex flex-col items-center"
        >
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={product.images[currentImage]}
              alt={product.name}
              width={520}
              height={520}
              className="rounded-2xl shadow-2xl object-cover border-4 border-white"
            />
          </motion.div>

          <div className="flex flex-wrap justify-center mt-6 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  currentImage === idx
                    ? "border-orange-500 scale-105 shadow-md"
                    : "border-gray-300 hover:scale-105"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right: Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 text-center md:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-snug">
            {product.name}
          </h2>

          <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-4xl font-bold text-green-600"
            >
              ${product.price}
            </motion.span>
            {product.regularPrice && (
              <span className="text-gray-400 line-through text-xl">
                ${product.regularPrice}
              </span>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed mb-8 text-lg">
            {product.description}
          </p>

          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "#f47b0a",
              boxShadow: "0 6px 20px rgba(246,146,36,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg transition-all"
          >
            অর্ডার করতে চাই
          </motion.button>
        </motion.div>
      </div>

      {/* --- Product Description Section --- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative max-w-6xl mx-auto  shadow-xl p-8 md:p-12 mt-10 mb-16 border border-gray-300"
      >
        <h3 className="text-2xl md:text-3xl font-bold  text-gray-900 mb-6 flex items-center justify-center gap-2">
          <Info className="text-orange-500" size={28} /> পণ্যের বিস্তারিত
        </h3>

        <p className="text-gray-700 leading-relaxed  mb-8">
          এই পণ্যটি উচ্চমানের উপকরণ দ্বারা তৈরি যা টেকসই, আরামদায়ক এবং ব্যবহার
          উপযোগী। প্রতিদিনের ব্যবহারে এটি পায়ের আরাম ও সাপোর্ট বজায় রাখে।
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-green-600 mt-1" />
            <p className="text-gray-700">
              ১০০% নরম ও আরামদায়ক ফোম ব্যবহার করা হয়েছে।
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-green-600 mt-1" />
            <p className="text-gray-700">
              ওজনে হালকা ও পায়ের সঙ্গে মানানসই ডিজাইন।
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-green-600 mt-1" />
            <p className="text-gray-700">
              ঘাম প্রতিরোধক চামড়া ব্যবহৃত, দুর্গন্ধহীন।
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-green-600 mt-1" />
            <p className="text-gray-700">
              প্রতিদিনের ব্যবহার বা উপহার দেওয়ার জন্য আদর্শ।
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
