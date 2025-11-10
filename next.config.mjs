/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "localhost",
      "soulcraftbd.com",
      "www.soulcraftbd.com", // Add www domain here
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/upload/:path*",
      },
    ];
  },
};

export default nextConfig;
