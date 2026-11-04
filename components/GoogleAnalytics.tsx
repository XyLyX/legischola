"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Script from "next/script";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const lastPage = useRef<string | null>(null);

  useEffect(() => {
    const page = pathname + (query ? `?${query}` : "");
    if (lastPage.current === null) {
      lastPage.current = page;
      return; // Initial page view is emitted by gtag('config').
    }
    if (lastPage.current === page) return;
    lastPage.current = page;
    if (measurementId && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: page,
        page_location: window.location.href,
      });
    }
  }, [pathname, query]);

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${measurementId}');
      `}</Script>
    </>
  );
}
