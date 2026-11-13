import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { publicSeoRoutes } from "../src/lib/seoRoutes.js";

const dist = path.resolve("dist");
const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
const urlEntries = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const htmlEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);
assert.ok(sitemap.startsWith("<?xml version="), "sitemap.xml must be an XML document");
assert.ok(robots.includes("User-agent: *") && robots.includes("Allow: /"), "robots.txt must allow crawling");

const origin = new URL(urlEntries[0]).origin;
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`), "robots.txt must identify the sitemap");

for (const page of publicSeoRoutes) {
  const routePath = page.path === "/" ? "" : page.path.slice(1);
  const htmlPath = routePath ? path.join(dist, routePath, "index.html") : path.join(dist, "index.html");
  const html = await readFile(htmlPath, "utf8");
  const expectedCanonical = new URL(page.path, `${origin}/`).href;
  assert.ok(html.includes(`<title>${htmlEscape(page.title)}</title>`), `${page.path} must have its unique title`);
  assert.ok(html.includes(`href="${expectedCanonical}"`), `${page.path} must have a matching canonical`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.path} must start with one H1`);
  assert.ok(html.includes('name="robots" content="index, follow"'), `${page.path} should be indexable`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${page.path} must have one canonical`);
  assert.ok(html.includes(`property="og:image" content="${origin}/images/lyx-group-og.jpg"`), `${page.path} must have an absolute Open Graph image`);
  assert.ok(urlEntries.includes(expectedCanonical), `${page.path} must appear in the sitemap`);
  for (const [, jsonLd] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    assert.doesNotThrow(() => JSON.parse(jsonLd), `${page.path} JSON-LD must be valid JSON`);
  }
}

const knownRoutes = new Set([...publicSeoRoutes.map((page) => page.path), "/admin"]);
async function checkInternalLinks(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      await checkInternalLinks(file);
      continue;
    }
    if (!entry.name.endsWith(".jsx")) continue;
    const source = await readFile(file, "utf8");
    for (const [, href] of source.matchAll(/href=["'](\/(?:[^"'#?]*)?)(?:[?#][^"']*)?["']/g)) {
      const pathname = href.replace(/\/+$/, "") || "/";
      const isKnown = knownRoutes.has(pathname)
        || /^\/property\/[^/]+$/.test(pathname)
        || /^\/resources\/blog\/[^/]+$/.test(pathname);
      assert.ok(isKnown, `${path.relative(process.cwd(), file)} links to unknown route ${pathname}`);
    }
  }
}
await checkInternalLinks(path.resolve("src"));

const vercelConfig = JSON.parse(await readFile(path.resolve("../vercel.json"), "utf8"));
assert.ok(!vercelConfig.rewrites.some((rewrite) => rewrite.source === "/(.*)"), "unknown routes must be allowed to reach the Vercel 404");
for (const page of publicSeoRoutes.filter((route) => route.path !== "/")) {
  assert.ok(vercelConfig.rewrites.some((rewrite) => rewrite.source === page.path), `${page.path} must have a Vercel deep-link rewrite`);
}
assert.ok(vercelConfig.rewrites.some((rewrite) => rewrite.source === "/property/:slug" && rewrite.destination === "/index.html"), "future published property links must still resolve in the SPA");
assert.ok(vercelConfig.headers.some((rule) => rule.source === "/(.*)" && rule.headers.some((header) => header.key === "Strict-Transport-Security")), "Vercel must send HSTS");

const admin = await readFile(path.join(dist, "admin", "index.html"), "utf8");
assert.ok(admin.includes('name="robots" content="noindex, nofollow"'), "admin must be noindex");
assert.ok(!urlEntries.some((url) => new URL(url).pathname.startsWith("/admin")), "admin must not be in the sitemap");

const notFound = await readFile(path.join(dist, "404.html"), "utf8");
assert.ok(notFound.includes('name="robots" content="noindex, follow"'), "404 must be noindex");

const image = await stat(path.join(dist, "images", "lyx-group-og.jpg"));
assert.ok(image.size > 10_000, "Open Graph image must be present and non-empty");
const routeFiles = [
  "about/index.html", "contact/index.html", "buy/residential/index.html", "buy/commercial/index.html",
  "buy/off-plan/index.html", "buy/land/index.html", "holiday-homes/index.html", "rent/index.html",
  "valuation/index.html", "testimonials/index.html", "resources/blog/index.html", "resources/faq/index.html",
];
for (const file of routeFiles) await stat(path.join(dist, file));

console.log(`SEO build verification passed: ${publicSeoRoutes.length} indexed routes, ${urlEntries.length} sitemap entries, admin/404 excluded, ${image.size}-byte OG image.`);
