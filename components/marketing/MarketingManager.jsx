"use client";
import { useEffect, useState } from "react";
import GTMProvider from "./GTMProvider";
import MetaPixelProvider from "./MetaPixelProvider";
import AnalyticsProvider from "./AnalyticsProvider";

export default function MarketingManager() {
  const [cfg, setCfg] = useState({ gtmId: null, ga4Id: null, pixelId: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/marketing-config`);
        if (!res.ok) throw new Error("No marketing config");
        const json = await res.json();
        const d = json?.data || {};
        if (!mounted) return;
        setCfg({
          gtmId: d.gtmId || null,
          ga4Id: d.ga4Id || null,
          pixelId: d.metaPixelId || null,
        });
        // optionally set window.dataLayer initial values
        if (typeof window !== "undefined" && !window.dataLayer)
          window.dataLayer = [];
      } catch (err) {
        console.warn("MarketingManager:", err.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <GTMProvider gtmId={cfg.gtmId} />
      <MetaPixelProvider pixelId={cfg.pixelId} />
      <AnalyticsProvider gaId={cfg.ga4Id} />
    </>
  );
}
