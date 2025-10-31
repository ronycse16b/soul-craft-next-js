import ProductUpdateWrapper from "@/components/admin/ProductUpdateWrapper";

async function fetchProduct(slug) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${slug}`,
    { cache: "no-store" }
  );
  const product = await res.json();
  return product?.product;
}

export default async function Page({ params }) {
  const { slug } = await params;
  const singleData = await fetchProduct(slug);

  if (!singleData) {
    return <div>Product not found</div>;
  }

  // ✅ Pass the data to a client wrapper
  return <ProductUpdateWrapper product={singleData} />;
}
