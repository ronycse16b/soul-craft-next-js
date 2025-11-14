async function fetchAllProducts() {
  let page = 1;
  let allProducts = [];
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `https://soulcraftbd.com/api/products/client?page=${page}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    const result = data.result || [];

    if (!result.length) {
      hasMore = false;
    } else {
      allProducts = [...allProducts, ...result];
      page += 1;
    }
  }

  return allProducts;
}

async function fetchCategories() {
  const res = await fetch(`https://soulcraftbd.com/api/categories/client`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data || [];
}

async function fetchSubCategories() {
  const res = await fetch(`https://soulcraftbd.com/api/sub-categories`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data?.result || [];
}

export default async function sitemap() {
  const baseUrl = "https://soulcraftbd.com";

  const [products, categories, subCategories] = await Promise.all([
    fetchAllProducts(),
    fetchCategories(),
    fetchSubCategories(),
  ]);

  // Product URLs
  const productUrls = products?.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt || p.createdAt || new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));


  // Subcategory URLs
  const subCategoryUrls = subCategories?.map((sc) => ({
    url: `${baseUrl}/subcategory/${sc.slug}`,
    lastModified: sc.updatedAt || sc.createdAt || new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Static pages
  const staticPages = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/products`, changeFrequency: "weekly", priority: 0.7 },
  ];

  return [...staticPages, ...subCategoryUrls, ...productUrls];
}
