/**
 * Start the production Next server after the build and inspect the actual
 * social PNG response plus the rendered Open Graph/X/canonical tags.
 * This guards against passing source/TypeScript checks while returning a
 * broken image or stale URL at runtime.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 34373;
const base = "http://127.0.0.1:" + port;
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ztfjrjviejtxubwvixsf.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "ci-placeholder",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
next.stdout.on("data", chunk => output += chunk.toString().slice(0, 2000));
next.stderr.on("data", chunk => output += chunk.toString().slice(0, 2000));
const fetchLocal = (path) => fetch(base + path, { signal: AbortSignal.timeout(5000) });

try {
  let online = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (next.exitCode !== null) throw Error("Next production server exited early: " + output);
    try {
      const response = await fetchLocal("/");
      if (response.ok) { online = true; break; }
    } catch {}
    await delay(300);
  }
  assert(online, "Next production server did not start: " + output);

  for (const path of ["/", "/about", "/student-guide", "/faq", "/founders-note", "/referral", "/pricing", "/contact", "/invite/JIYA001"]) {
    const response = await fetchLocal(path);
    assert.equal(response.status, 200, path + " must render");
    const html = await response.text();
    assert(html.includes("og-legischola-2026.png"), path + " must use the new social image");
    assert(html.includes('twitter:card'), path + " must include a Twitter/X card");
    assert(html.includes('og:image'), path + " must include an Open Graph image");
    assert(html.includes("https://legischola.com"), path + " must use the canonical domain");
    assert(!html.includes("legischola.netlify.app"), path + " must not expose the legacy share host");
  }

  // Restricted administrative APIs must not return data to anonymous visitors.
  for(const protectedPath of ["/api/admin/access","/api/admin/overview","/api/admin/inbox"]){
    const denied=await fetchLocal(protectedPath);
    assert.equal(denied.status,403,protectedPath+" must fail closed without bearer authentication");
  }
  const badPublic=await fetch(base+"/api/enquiries",{method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({name:"A",email:"bad",subject:"",message:"",consent:false}),
    signal:AbortSignal.timeout(5000)});
  assert.equal(badPublic.status,400,"Invalid anonymous enquiry must be rejected before reaching the database");
  const dashboard=await fetchLocal("/admin");
  assert.equal(dashboard.status,200,"Admin shell may render without exposing user data");
  const dashHtml=await dashboard.text();
  assert(/<meta[^>]+name="robots"[^>]+noindex/.test(dashHtml),
    "Restricted admin dashboard must include noindex robots metadata");
  assert(!dashHtml.includes("SUPABASE_SERVICE_ROLE_KEY"),"Secret names should not be rendered in HTML");

  for(const route of ["/login","/account/security","/account/forgot-password","/account/reset-password"]){
    const response=await fetchLocal(route);
    assert.equal(response.status,200,route+" must render without auth credentials");
    const html=await response.text();
    assert(/<meta[^>]+name="robots"[^>]+noindex/.test(html),
      route+" must be private from search-engine indexing");
  }
  const loginPage=await fetchLocal("/login");
  const loginHtml=await loginPage.text();
  assert(loginHtml.includes("Create your student account"),
    "Password registration page must render");
  assert(loginHtml.includes("account-password"),
    "SSR HTML should contain password field markup");

  const response = await fetchLocal("/og-legischola-2026.png");
  assert.equal(response.status, 200, "Social card must return HTTP 200");
  assert(response.headers.get("content-type")?.startsWith("image/png"), "Social card must have image/png content type");
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.length > 20000, "Social card must be a rendered artwork, not a tiny placeholder");
  assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), "Social card must be a valid PNG");
  assert.equal(bytes.readUInt32BE(16), 1200, "Social card width");
  assert.equal(bytes.readUInt32BE(20), 630, "Social card height");

  console.log("Production HTML OG/X tags and approved branded 1200×630 PNG passed HTTP smoke test.");
} finally {
  next.kill("SIGTERM");
}
