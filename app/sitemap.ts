import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  // Include only public editorial/help pages, not account or study records.
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/student-guide", priority: 0.8 },
    { path: "/faq", priority: 0.7 },
    { path: "/founders-note", priority: 0.6 },
    { path: "/referral", priority: 0.6 },
    { path: "/pricing", priority: 0.4 },
    { path: "/privacy", priority: 0.3 },
  ];

  return pages.map(({ path, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly" as const,
    priority,
  }));
}
