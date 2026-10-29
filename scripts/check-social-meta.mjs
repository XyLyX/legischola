// Compile-time release assertions for LegiSchola public social metadata.
// A passing source check supplements (not replaces) the Next build and a
// live crawler/preview fetch once the deployment becomes publicly reachable.
import assert from "node:assert/strict";
import fs from "node:fs";
const read = (path) =>
  fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");
const site = read("lib/site-metadata.ts");
const root = read("app/layout.tsx");
const home = read("app/page.tsx");
const og = read("app/og-legischola-2026.png/route.tsx");
const invite = read("app/invite/[code]/page.tsx");
const robots = read("app/robots.ts");
const sitemap = read("app/sitemap.ts");
const login = read("app/login/layout.tsx");

assert.match(site, /https:\/\/legischola\.com/);
assert.match(root, /metadataBase:\s*new URL\(SITE_URL\)/);
assert.match(root, /summary_large_image/);
assert.match(root, /openGraph:/);
assert.match(root, /SOCIAL_IMAGE_ALT/);
assert.match(root, /locale:\s*"en_IN"/);
assert.match(home, /canonical:\s*SITE_URL/);
assert.match(site, /\/og-legischola-2026\.png/);
assert.match(og, /APPROVED_ARTWORK/);
assert.match(og, /data:image\/webp;base64/);
assert.match(og, /width: 1200/);
assert.match(og, /height: 630/);
assert.match(og, /legischola\.com/);
assert.match(invite, /\/og-legischola-2026\.png/);
assert(!fs.existsSync(new URL("../app/opengraph-image.tsx", import.meta.url)), "Legacy auto-discovered gradient card must be removed");
for (const src of [site, root, og]) {
  assert(!src.includes("legischola.netlify.app"), "Remove legacy Netlify share domain");
}
const publicPaths = {
  "app/about/page.tsx": "/about",
  "app/faq/page.tsx": "/faq",
  "app/student-guide/page.tsx": "/student-guide",
  "app/founders-note/page.tsx": "/founders-note",
  "app/privacy/page.tsx": "/privacy",
};
for (const [file, pathname] of Object.entries(publicPaths)) {
  const page = read(file);
  assert(
    page.includes("publicPageMetadata(") && page.includes('"' + pathname + '"'),
    file + " must have route-specific canonical and share metadata"
  );
  assert(sitemap.includes('"' + pathname + '"'), "Public route absent from sitemap: " + pathname);
}
assert.match(robots, /sitemap:\s*SITE_URL \+ "\/sitemap\.xml"/);
for (const privateRoute of ["/api/", "/dashboard", "/onboarding", "/study", "/academic-review"]) {
  assert(robots.includes('"' + privateRoute + '"'), "Private path missing from robots rules: " + privateRoute);
}
assert.match(login, /index:\s*false/);
assert.match(login, /follow:\s*false/);
console.log("LegiSchola social, canonical and crawl metadata source checks passed.");
