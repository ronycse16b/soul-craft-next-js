import BannerSlider from "@/components/BannerSlider";
import BestSellingProducts from "@/components/BestSellingProducts";
import CategorySection from "@/components/CategorySection";
import Container from "@/components/Container";
import ExploreProducts from "@/components/ExploreOureProducts";
import FeatureInfo from "@/components/FeatureInfo";
import FlashSale from "@/components/FlashSale";
import MusicExperience from "@/components/MusicExperience";
import NewArrivals from "@/components/NewArrivals";


export default function Home() {
  return (
    <div>
      
        <BannerSlider/>
        <FlashSale/>
        <CategorySection/>
        <BestSellingProducts/>
        <MusicExperience/>
        <ExploreProducts/>
        <NewArrivals/>
        <FeatureInfo/>


     
    </div>
  );
}
