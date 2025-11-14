import { fetchAllProducts } from "./sitemap"; // reuse product fetch

export async function GET() {
  const baseUrl = "https://soulcraftbd.com";
  const products = await fetchAllProducts();

  const xmlProducts = products
    .map(
      (p) => `
      <item>
        <g:id>${p._id}</g:id>
        <g:title>${p.productName}</g:title>
        <g:description><![CDATA[${p.description?.replace(
          /<[^>]+>/g,
          ""
        )}]]></g:description>
        <g:link>${baseUrl}/products/${p.slug}</g:link>
        <g:image_link>${p.thumbnail || p.images?.[0]}</g:image_link>
        <g:availability>${
          p.quantity > 0 ? "in stock" : "out of stock"
        }</g:availability>
        <g:price>${p.price} BDT</g:price>
        <g:brand>${p.brand || "Soul Craft"}</g:brand>
        <g:condition>new</g:condition>
      </item>
    `
    )
    .join("");

  const xml = `
    <rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
      <channel>
        <title>Soul Craft Products</title>
        <link>${baseUrl}</link>
        <description>All products from Soul Craft</description>
        ${xmlProducts}
      </channel>
    </rss>
  `;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
