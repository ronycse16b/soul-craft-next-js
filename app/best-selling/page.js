import BestSellingPage from "@/components/BestSellingPage";
import Container from "@/components/Container";

export const metadata = {
  title: "Best Selling Products - Soul Craft",
  description: "Best Selling Products",
};

export default function page() {
  return (
    <Container className='px-1'>
      <BestSellingPage />
    </Container>
  );
}
