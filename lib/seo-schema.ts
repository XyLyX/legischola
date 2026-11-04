import { SITE_NAME, SITE_URL } from "./site-metadata";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE_URL + "/#organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: "AI-assisted study platform for law students, with syllabus-organised learning, practice assessments and adaptive revision.",
  };
}

export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": SITE_URL + "/#software",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: "An AI-assisted law study companion offering semester study, guided legal reasoning, Cornell notes, practice exams and adaptive revision.",
    publisher: { "@id": SITE_URL + "/#organization" },
    inLanguage: "en",
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).toString(),
    })),
  };
}
