import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");
const sitemap = read("app/sitemap.ts");
const robots = read("app/robots.ts");
const metadata = read("lib/site-metadata.ts");
const schema = read("lib/seo-schema.ts");
const layout = read("app/layout.tsx");
const semester = read("app/universities/ggsipu/ba-llb/semester/[semester]/page.tsx");

for (const route of [
  "/ai-law-tutor",
  "/law-exam-preparation",
  "/revision-and-practice",
  "/universities/ggsipu/ba-llb",
]) {
  assert(sitemap.includes(route), `Missing public route from sitemap: ${route}`);
}
assert(sitemap.includes("length: 10"), "Sitemap must enumerate ten semester routes");
assert(semester.includes("length: 10"), "Semester routes must enumerate ten semesters");
assert(semester.includes("notFound()"), "Unknown semester must return 404");
assert(metadata.includes("alternates: { canonical }"), "Canonical metadata required");
assert(schema.includes('"@type": "Organization"'), "Organization JSON-LD required");
assert(schema.includes('"@type": "SoftwareApplication"'), "SoftwareApplication JSON-LD required");
assert(schema.includes('"@type": "BreadcrumbList"'), "Breadcrumb JSON-LD required");
assert(layout.includes("<StructuredData />"), "Global JSON-LD must be mounted");
for (const route of ["/dashboard", "/onboarding", "/study", "/tutor", "/revision", "/mock-exam", "/admin"]) {
  assert(robots.includes(route), `Private route absent from robots policy: ${route}`);
}
for (const path of [
  "app/ai-law-tutor/page.tsx",
  "app/law-exam-preparation/page.tsx",
  "app/revision-and-practice/page.tsx",
  "app/universities/ggsipu/ba-llb/page.tsx",
]) {
  assert(read(path).includes("publicPageMetadata("), `Public page missing metadata: ${path}`);
}
console.log("SEO/GEO source regression checks passed");
