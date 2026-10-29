import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private student and administration routes have no public crawl value.
      // /login stays accessible so referral links can render social previews.
      disallow: [
        "/api/",
        "/dashboard",
        "/onboarding",
        "/study",
        "/tutor",
        "/revision",
        "/mock-exam",
        "/exam-readiness",
        "/research-studio",
        "/academic-review",
        "/semester",
        "/rewards",
        "/admin",
        "/data-requests",
      ],
    },
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL,
  };
}
