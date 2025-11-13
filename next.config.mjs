/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "localhost",
      "soulcraftbd.com",
      "www.soulcraftbd.com",
    ],

    // ✅ Define responsive device breakpoints for Next.js image optimizer
    deviceSizes: [160, 320, 480, 640, 828, 1024, 1200],

    // ✅ Small images like icons or logos
    imageSizes: [16, 32, 48, 64, 96, 128, 256],

    // ✅ Serve modern formats automatically if supported
    formats: ["image/avif", "image/webp"],

    // ✅ Enable caching and optimized image handling
    // minimumCacheTTL: 31536000, // 1 year (in seconds)
  },

  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/upload/:path*",
      },
    ];
  },

  // ✅ Optional: Compress output JS/CSS/HTML
  compress: true,

  // ✅ Optional: Enable future build optimizations (Turbopack etc.)
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["react", "react-dom"],
  },
};

export default nextConfig;
