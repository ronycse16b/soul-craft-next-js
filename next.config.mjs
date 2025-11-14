/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // needed for Docker deployments

  images: {
    domains: [
      "images.unsplash.com",
      "localhost",
      "cdn.soulcraftbd.com",
      "soulcraftbd.com",
      "www.soulcraftbd.com",
    ],
    deviceSizes: [160, 320, 480, 640, 828, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/avif", "image/webp"],
  },

  compress: true, // gzip compression for static files

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["react", "react-dom"],
    // appDir removed
  },
};

export default nextConfig;
