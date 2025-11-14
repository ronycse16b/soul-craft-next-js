import Container from "@/components/Container";
import ProductPage from "@/components/ProductPage";

export async function generateMetadata({ params }) {
  const {slug} = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const cleanDescription =
    product.description?.replace(/<[^>]+>/g, "")?.slice(0, 160) ||
    "Buy high-quality products from Soul Craft.";

  const ogImage =
    product.thumbnail ||
    product.images?.[0] ||
    "https://soulcraftbd.com/og-image.jpg";

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug}`;

  return {
    title: `${product.productName} | Soul Craft`,
    description: cleanDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      title: product.productName,
      description: cleanDescription,
      url,
      siteName: "Soul Craft",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.productName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.productName,
      description: cleanDescription,
      images: [ogImage],
    },
  };
}

async function fetchProduct(slug) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${slug}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data?.product || null;
}

export default async function ProductDetailsPage({ params }) {

  const {slug} = await params;

  const product = await fetchProduct(slug);

  if (!product) return <p>Product not found</p>;

  // Prepare JSON-LD (Google + Meta Catalog)
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "website",
    name: product.productName,
    image: product.thumbnail || product.images || [],
    description: product.description?.replace(/<[^>]+>/g, "") || "",
    sku: product.sku || product.variants?.[0]?.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Soul Craft",
    },
    aggregateRating:
      product.numReviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.numReviews,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug}`,
      priceCurrency: "BDT",
      price:
        product.type === "simple"
          ? product.price
          : product.variants?.[0]?.price,
      availability:
        product.quantity > 0 || product.variants?.some((v) => v.quantity > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Container className="px-1">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      ></script>

      <ProductPage product={product} />
    </Container>
  );
}
