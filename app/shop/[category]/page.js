import Container from "@/components/Container";
import ProductListView from "@/components/ProductListView";

// Dynamic metadata based on category slug
export async function generateMetadata({ params }) { 
  const { category } = await params;
  return {
    title: `${category} – Buy Now`,
    description: `Explore the best ${category} products at the best price.`,
  };
}

export default async function Page({ params }) {
  const { category } = await params;

  return (
    <Container>
      <ProductListView slug={category} />
    </Container>
  );
}
