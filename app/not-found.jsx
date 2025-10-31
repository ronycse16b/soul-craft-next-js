// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | Soul Craft",
  description: "Sorry, the page you’re looking for doesn’t exist.",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-b from-gray-50 to-white px-6 text-center">
      {/* Icon */}
      <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-[#f69224]/10 text-[#f69224]">
        <AlertTriangle className="w-10 h-10" />
      </div>

      {/* Text */}
      <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 max-w-md mb-8">
        Oops! The page you’re looking for might have been removed or is
        temporarily unavailable. Let’s get you back home.
      </p>

      {/* Redirect Button */}
      <Link href="/" passHref>
        <Button className="bg-[#f69224] hover:bg-[#e27e1e] text-white px-6 py-3 rounded-lg font-semibold">
          Go Back Home
        </Button>
      </Link>

      {/* Optional: Secondary action */}
      <p className="mt-6 text-gray-500 text-sm">
        Need help?{" "}
        <Link
          href="/contact"
          className="text-[#6fd300] font-medium hover:underline"
        >
          Contact Support
        </Link>
      </p>
    </div>
  );
}
