import Container from "@/components/Container";
import ProductPage from "@/components/ProductPage";
import React from "react";
import Head from "next/head";

export default async function page({ params }) {
  const { slug } = await params;
  const singleData = await fetchProduct(slug);

  const product = singleData?.product || null;

  async function fetchProduct(slug) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${slug}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    return res.json();
  }

  if (!product) return <p>Product not found</p>;

  // Prepare JSON-LD for product
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.productName,
    image: product.thumbnail || [],
    description: product.description?.replace(/<[^>]+>/g, "") || "",
    sku: product.sku || product.variants?.[0]?.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "Unknown Brand",
    },
    stock: product.stock > 0 ? "InStock" : "OutOfStock",
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug}`,
      priceCurrency: "BDT",
      price:
        product.type === "variant" ? product.variants[0]?.price : product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <Container className="px-1">
      <Head>
        {/* Basic SEO */}
        <title>{product.productName} | My Store</title>
        <meta
          name="description"
          content={product.description?.replace(/<[^>]+>/g, "") || ""}
        />
        <meta
          name="keywords"
          content={product.subCategory?.name || product.category || "products"}
        />
        <meta name="robots" content="index, follow" />

        {/* OpenGraph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.productName} />
        <meta
          property="og:description"
          content={product.description?.replace(/<[^>]+>/g, "") || ""}
        />
        <meta
          property="og:image"
          content={product.images?.[0] || "/placeholder.png"}
        />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug}`}
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.productName} />
        <meta
          name="twitter:description"
          content={product.description?.replace(/<[^>]+>/g, "") || ""}
        />
        <meta
          name="twitter:image"
          content={product.images?.[0] || "/placeholder.png"}
        />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* Render ProductPage with product prop */}
      <ProductPage product={product} />
    </Container>
  );
}
