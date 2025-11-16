"use client";

import BannerSlider from "@/components/BannerSlider";
import BestSellingProducts from "@/components/BestSellingProducts";
import CategorySection from "@/components/CategorySection";
import ExploreProducts from "@/components/ExploreOureProducts";
import FeatureInfo from "@/components/FeatureInfo";
import FlashSale from "@/components/FlashSale";
import MusicExperience from "@/components/MusicExperience";
import NewArrivals from "@/components/NewArrivals";
import OurStorySection from "@/components/OurStorySection";

export default function Home() {
  return (
    <div className="">
      {/* HERO (Subtle fade) */}
      <BannerSlider />
        <FlashSale />
        <CategorySection />
        
        <BestSellingProducts />
        <MusicExperience />
        <ExploreProducts />
        <NewArrivals />
        <FeatureInfo />
        <OurStorySection />
    </div>
  );
}
