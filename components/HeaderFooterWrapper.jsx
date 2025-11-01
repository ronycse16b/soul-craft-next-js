"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import AuthProviders from "@/app/AuthProviders";
import { Toaster } from "react-hot-toast";

export default function HeaderFooterWrapper({ children }) {
  const pathname = usePathname();

  // Paths where we don’t want Header/Footer
  const hiddenPaths = ['/not-found', "/admin", "/dashboard","/landing-page"];
  const hideLayout = hiddenPaths.some((p) => pathname.startsWith(p));

  return (
    <>
      <AuthProviders>
        {!hideLayout && <Header />}
        <main className="min-h-screen">
          {children}
          <Toaster />
          </main>
        {!hideLayout && (
          <>
            <MobileBottomBar />
            <Footer />
          </>
        )}
      </AuthProviders>
    </>
  );
}
