"use client";


import FAQSection from "./FAQSection";
import FeatureHighlights from "./FeatureHighlights";
import HeroSection from "./HeroSection";
import LandingCheckoutForm from "./LandingCheckoutForm";
import LandingFooter from "./LandingFooter";
import ProductHighlight from "./ProductHighlight";
import VideoSection from "./VideoSection";



export default function ProductLandingPage() {
  const product = {
    name: "Classic Leather Wallet",
    description:
      "Handcrafted from premium leather, this wallet blends timeless style with modern functionality.",
    price: 39.99,
    regularPrice: 59.99,
    features: [
      {
        icon: "Wallet",
        title: "100% Genuine Leather",
        desc: "Made from premium cowhide leather.",
      },
      {
        icon: "ShieldCheck",
        title: "Durable Build",
        desc: "Designed to last for years.",
      },
      {
        icon: "Truck",
        title: "Free Delivery",
        desc: "Enjoy fast, free nationwide delivery.",
      },
      {
        icon: "BadgeCheck",
        title: "1-Year Warranty",
        desc: "Worry-free purchase guarantee.",
      },
    ],
    faqs: [
      {
        question: "Is this genuine leather?",
        answer: "Yes, crafted from 100% authentic cowhide.",
      },
      {
        question: "Do you offer Cash on Delivery?",
        answer: "Yes, available all over Bangladesh.",
      },
      {
        question: "What is the delivery time?",
        answer: "2-4 working days depending on location.",
      },
    ],
    videoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
    images: [
      "https://images.unsplash.com/photo-1600180758890-6d5bbf7b4aa7",
      "https://images.unsplash.com/photo-1600180758890-6d5bbf7b4aa7",
      "https://images.unsplash.com/photo-1614289372470-cb6f46b9b6b8",
    ],
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <HeroSection product={product} />
      <ProductHighlight product={product} />
      <FeatureHighlights features={product.features} />
      <FAQSection faqs={product.faqs} />
      <VideoSection videoUrl={product.videoUrl} />
      <LandingCheckoutForm product={product} />
      <LandingFooter />
    </div>
  );
}
