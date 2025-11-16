"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import AuthProviders from "@/app/AuthProviders";
import { Toaster } from "react-hot-toast";

// 🧩 Redux + Persist imports
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/redux/store/store";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";


import dynamic from "next/dynamic";

// Lazy load ProductCard (client-only)
const AOSInit = dynamic(() => import("./animation/AOSInit"), {ssr: false});




export default function HeaderFooterWrapper({ children }) {
  const pathname = usePathname();

  // Paths where Header/Footer should be hidden
  const hiddenPaths = ["/not-found", "/admin", "/dashboard", "/landing-page"];
  const hideLayout = hiddenPaths.some((p) => pathname.startsWith(p));

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProviders>
          {!hideLayout && <Header />}

          <main className="min-h-screen">
            
            {children}
            <AOSInit />
            <Toaster  reverseOrder={false} />
            <WhatsAppFloatingButton />
          </main>

          {!hideLayout && (
            <>
              <MobileBottomBar />
              <Footer />
            </>
          )}
        </AuthProviders>
      </PersistGate>
    </Provider>
  );
}
