/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "localhost",
      "nobofit.com",
      "www.nobofit.com", // Add www domain here
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
