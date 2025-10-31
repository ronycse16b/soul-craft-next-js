import Container from "@/components/Container";
import ProductListView from "@/components/ProductListView";

export const metadata = {
  title: "Shop by Category",
  description: "Browse products by category in our shop.",
};

export default function page() {
  return (
    <Container>
      <ProductListView />
    </Container>
  );
}
