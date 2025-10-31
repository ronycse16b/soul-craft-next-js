

async function fetchProducts() {
  const res = await fetch(
    `https://nobofit.com/api/products/client?page=1`,
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
    url: `https://nobofit.com/products/${product.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://nobofit.com/",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://nobofit.com/contact",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://nobofit.com/about",
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://nobofit.com/products",
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...productUrls,
  ];
}
