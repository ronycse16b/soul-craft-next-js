import HeaderFooterWrapper from "@/components/HeaderFooterWrapper";
import "./globals.css";
import TanstackProvider from "@/TanstackProvider";
import MarketingManager from "@/components/marketing/MarketingManager";
import CookieConsent from "@/components/marketing/CookieConsent";
import Script from "next/script";

export const metadata = {
  title: {
    template: "%s | Soul Craft",
    default: "Soul Craft",
  },
  description:
    "Soul Craft is a modern ecommerce website offering trendy clothing and accessories. High-quality, stylish, and affordable fashion for everyone.",

  openGraph: {
    title: "Soul Craft",
    description:
      "Discover the latest trends in clothing and accessories at Soul Craft. Shop stylish and affordable outfits to express your unique style.",
    url: "https://soulcraftbd.com",
    siteName: "Soul Craft",
    images: [
      {
        url: "https://soulcraftbd.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Soul Craft - Trendy Clothing & Accessories",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Soul Craft",
    description:
      "Shop the latest fashion trends with Soul Craft. Affordable, stylish, and modern clothing for everyone.",
    images: ["https://soulcraftbd.com/og-image.jpg"],
    creator: "@SoulCraftBD",
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  metadataBase: new URL("https://soulcraftbd.com"),
  alternates: {
    canonical: "https://soulcraftbd.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-poppins antialiased">
        <TanstackProvider>
          <HeaderFooterWrapper>{children}</HeaderFooterWrapper>
        </TanstackProvider>

        {/* Marketing & Tracking Scripts */}
        <MarketingManager />
        <CookieConsent />

        {/* Structured Data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Soul Craft",
              url: "https://soulcraftbd.com",
              logo: "https://soulcraftbd.com/logo.png",
              sameAs: [
                "https://www.facebook.com/SoulCraftBD",
                "https://www.instagram.com/SoulCraftBD",
                "https://www.linkedin.com/company/soulcraftbd",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
