import Container from "@/components/Container";
import ProductListView from "@/components/ProductListView";

export const metadata = {
  title: "Shop by Category",
  description: "Browse products by category in our shop.",
};

export default async function page({ params }) {

  const {category: slug} = await params;

  return (
    <Container>
      <ProductListView slug={slug} />
    </Container>
  );
}
