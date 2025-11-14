import Container from "@/components/Container";
import ProductListView from "@/components/ProductListView";

export const metadata = ({ params }) => ({
  title: `${params.slug} – Buy Now`,
  description: `Explore best ${params.slug} products at the best price.`,
});

export default async function page({ params }) {

  const {category: slug} = await params;

  return (
    <Container>
      <ProductListView slug={slug} />
    </Container>
  );
}
