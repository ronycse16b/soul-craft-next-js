

async function fetchProducts() {
  const res = await fetch(
    `https://soulcarftbd.com/api/products/client?page=1`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();
  return data.result || [];
}

export default async function sitemap() {
  const products = await fetchProducts();

  const productUrls = products.map((product) => ({
    url: `https://soulcarftbd.com/products/${product.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://soulcarftbd.com/",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://soulcarftbd.com/contact",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://soulcarftbd.com/about",
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://soulcarftbd.com/products",
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...productUrls,
  ];
}
