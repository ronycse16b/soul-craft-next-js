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
    <div className="space-y-14">
      {/* HERO BANNER (fade-down) */}
      <div
        data-aos="fade-down"
        data-aos-offset="120"
        data-aos-duration="700"
        data-aos-easing="ease-out"
      >
        <BannerSlider />
      </div>

      {/* FLASH SALE (fade-right) */}
      <div
        data-aos="fade-right"
        data-aos-offset="150"
        data-aos-duration="700"
        data-aos-easing="ease-in-sine"
      >
        <FlashSale />
      </div>

      {/* CATEGORY SECTION (fade-left) */}
      <div
        data-aos="fade-left"
        data-aos-offset="150"
        data-aos-duration="700"
        data-aos-easing="ease-in-sine"
      >
        <CategorySection />
      </div>

      {/* BEST SELLING PRODUCTS (zoom-in) */}
      <div
        data-aos="zoom-in"
        data-aos-offset="180"
        data-aos-duration="700"
        data-aos-easing="ease-out"
      >
        <BestSellingProducts />
      </div>

      {/* MUSIC EXPERIENCE (fade-right) */}
      <div
        data-aos="fade-right"
        data-aos-offset="200"
        data-aos-duration="700"
        data-aos-easing="ease-in"
      >
        <MusicExperience />
      </div>

      {/* EXPLORE PRODUCTS (fade-up) */}
      <div
        data-aos="fade-up"
        data-aos-offset="180"
        data-aos-duration="700"
        data-aos-easing="ease-out"
      >
        <ExploreProducts />
      </div>

      {/* NEW ARRIVALS (fade-left) */}
      <div
        data-aos="fade-left"
        data-aos-offset="180"
        data-aos-duration="700"
        data-aos-easing="ease-out"
      >
        <NewArrivals />
      </div>

      {/* FEATURE INFO (zoom-in) */}
      <div
        data-aos="zoom-in"
        data-aos-offset="150"
        data-aos-duration="700"
        data-aos-easing="ease-in"
      >
        <FeatureInfo />
      </div>

      {/* OUR STORY (fade-up) */}
      <div
        data-aos="fade-up"
        data-aos-offset="150"
        data-aos-duration="700"
        data-aos-easing="ease-out"
      >
        <OurStorySection />
      </div>
    </div>
  );
}
