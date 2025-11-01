"use client";

export default function VideoSection({ videoUrl }) {
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-gradient-to-b from-gray-50 to-white border-t">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">
          Watch Product Demo
        </h2>

        <div className="flex flex-col-reverse md:flex-row items-center md:items-start gap-10">
          {/* Left Side Info */}
          <div className="md:w-1/2 text-center md:text-left">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Discover the Features
            </h3>
            <p className="text-gray-600 mb-6">
              Watch this demo to explore the product’s key features, usage tips,
              and real-life applications. Perfect for understanding the value
              before purchase.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li>✔ Easy to use and intuitive</li>
              <li>✔ Designed for productivity</li>
              <li>✔ High-quality and reliable</li>
              <li>✔ Optimized for mobile and desktop</li>
            </ul>
          </div>

          {/* Right Side Video */}
          <div className="md:w-1/2 w-full rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
            <div className="relative pb-[56.25%] w-full h-0">
              <iframe
                src={videoUrl}
                title="Product Video"
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
