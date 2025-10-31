import HeaderFooterWrapper from "@/components/HeaderFooterWrapper";
import "./globals.css";
import TanstackProvider from "@/TanstackProvider";

export const metadata = {
  // Page title template
  title: {
    template: "%s | Soul Craft",
    default: "Soul Craft",
  },
  description:
    "Soul Craft is a modern and stylish ecommerce website that offers a wide range of trendy clothing and accessories for fashion-forward individuals. Our mission is to provide high-quality, affordable fashion that empowers our customers to express their unique style.",

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Soul Craft",
    description:
      "Discover the latest trends in clothing and accessories at Soul Craft. Shop stylish and affordable outfits to express your unique style.",
    url: "https://newfashion.com",
    siteName: "Soul Craft",
    images: [
      {
        url: "https://newfashion.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Soul Craft - Trendy Clothing & Accessories",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Soul Craft",
    description:
      "Shop the latest fashion trends with Soul Craft. Affordable, stylish, and modern clothing for everyone.",
    images: ["https://newfashion.com/og-image.jpg"],
    creator: "@newfashion", // optional
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // SEO extras
  metadataBase: new URL("https://newfashion.com"),
  alternates: {
    canonical: "https://newfashion.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-poppins antialiased ">
        {/* header not show all pages  */}
        <TanstackProvider>
          <HeaderFooterWrapper>{children}</HeaderFooterWrapper>
        </TanstackProvider>
      </body>
    </html>
  );
}
