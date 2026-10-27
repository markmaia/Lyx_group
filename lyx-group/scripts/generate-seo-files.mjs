import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicSeoRoutes } from "../src/lib/seoRoutes.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");

function readEnvFile(contents = "") {
  return Object.fromEntries(contents.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) return [];
    const value = match[2].replace(/^(["'])(.*)\1$/, "$2");
    return [[match[1], value]];
  }));
}

let localEnv = {};
try {
  localEnv = readEnvFile(await readFile(path.join(projectRoot, ".env.local"), "utf8"));
} catch {
  // Local env files are optional; Vercel injects its environment at build time.
}

const rawSiteUrl = process.env.VITE_SITE_URL
  || localEnv.VITE_SITE_URL
  || process.env.VERCEL_PROJECT_PRODUCTION_URL
  || "";

if (!rawSiteUrl) {
  console.warn("SEO files were not generated: set VITE_SITE_URL locally or enable VERCEL_PROJECT_PRODUCTION_URL on Vercel.");
  process.exit(0);
}

const siteOrigin = new URL(rawSiteUrl.includes("://") ? rawSiteUrl : `https://${rawSiteUrl}`).origin;
const ogImagePath = "/images/lyx-group-og.jpg";
const defaultOgImage = new URL(ogImagePath, `${siteOrigin}/`).href;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function escapeXml(value = "") {
  return escapeHtml(value).replace(/&#39;/g, "&apos;");
}

function toPlainText(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/[#*_`>-]/g, " ").replace(/\s+/g, " ").trim();
}

function slugPath(value = "") {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function metaTag(html, attribute, name, content) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escapedName}["'][^>]*>`, "i");
  const tag = `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n  </head>`);
}

function setSeo(html, page, { origin = siteOrigin, image = defaultOgImage, type = "website", schema } = {}) {
  const route = page.path || "/";
  const canonical = new URL(route, `${origin}/`).href;
  let output = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(page.title)}</title>`);
  output = metaTag(output, "name", "description", page.description);
  output = metaTag(output, "name", "robots", page.noindex ? "noindex, nofollow" : "index, follow");
  output = metaTag(output, "property", "og:type", type);
  output = metaTag(output, "property", "og:site_name", "Lyx Realty Group");
  output = metaTag(output, "property", "og:title", page.title);
  output = metaTag(output, "property", "og:description", page.description);
  output = metaTag(output, "property", "og:url", canonical);
  output = metaTag(output, "property", "og:image", image);
  output = metaTag(output, "property", "og:image:alt", "Lyx Realty Group real estate in Kenya");
  output = metaTag(output, "name", "twitter:card", "summary_large_image");
  output = metaTag(output, "name", "twitter:title", page.title);
  output = metaTag(output, "name", "twitter:description", page.description);
  output = metaTag(output, "name", "twitter:image", image);

  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  const canonicalPattern = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  output = canonicalPattern.test(output) ? output.replace(canonicalPattern, canonicalTag) : output.replace("</head>", `  ${canonicalTag}\n  </head>`);
  const organization = {
    "@type": "Organization",
    name: "Lyx Realty Group",
    url: `${siteOrigin}/`,
    logo: { "@type": "ImageObject", url: `${siteOrigin}/lyx-original-logo.jpeg` },
    email: "lyxrealtygroup@gmail.com",
    telephone: "+254741246659",
    foundingDate: "2015",
    areaServed: { "@type": "Country", name: "Kenya" },
    sameAs: [
      "https://www.facebook.com/immaculate.karanja.75",
      "https://ke.linkedin.com/in/immaculate-karanja",
      "https://www.instagram.com/lyx_realty_group/",
      "https://www.tiktok.com/@lyx.realty.group",
    ],
  };
  const graph = [
    organization,
    { "@type": "WebSite", name: "Lyx Realty Group", url: `${siteOrigin}/` },
  ];
  if (schema) {
    const pageNode = { ...schema };
    delete pageNode["@context"];
    graph.push(pageNode);
  }
  const jsonLd = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
  output = output.replace("</head>", `  ${jsonLd}\n  </head>`);
  return output;
}

function fallbackRoot(html, heading, description) {
  const content = `<main class="seo-fallback"><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(description)}</p></main>`;
  return html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

const indexTemplate = await readFile(path.join(distRoot, "index.html"), "utf8");
const sitemapPaths = new Set();

async function emitPage(page, options = {}) {
  const pagePath = page.path || "/";
  const output = setSeo(fallbackRoot(indexTemplate, page.heading || page.title, page.description), page, options);
  if (pagePath === "/") {
    await writeFile(path.join(distRoot, "index.html"), output);
  } else {
    const folder = path.join(distRoot, ...pagePath.split("/").filter(Boolean));
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, "index.html"), output);
  }
  if (!page.noindex) sitemapPaths.add(new URL(pagePath, `${siteOrigin}/`).href);
}

for (const page of publicSeoRoutes) await emitPage(page);

const adminPage = {
  path: "/admin",
  title: "Admin | Lyx Realty Group",
  description: "Private Lyx Realty Group listing and content administration.",
  heading: "Admin sign in",
  noindex: true,
};
await emitPage(adminPage);

const env = { ...localEnv, ...process.env };
const supabaseUrl = (env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

async function fetchPublished(table, select) {
  if (process.env.LYX_SEO_SKIP_REMOTE === "1" || !supabaseUrl || !supabaseKey) return [];
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.search = new URLSearchParams({
    select,
    status: "eq.published",
    slug: "not.is.null",
    limit: "500",
  });
  try {
    const response = await fetch(url, { headers: { apikey: supabaseKey, Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Could not add published ${table} to the sitemap: ${error.message}`);
    return [];
  }
}

const [properties, articles] = await Promise.all([
  fetchPublished("properties", "slug,title,summary,description,area,city,image_urls,property_type,transaction_type,price_ksh"),
  fetchPublished("articles", "slug,title,excerpt,cover_image_url,published_at"),
]);

for (const property of properties) {
  if (!property.slug) continue;
  const location = [property.area, property.city].filter(Boolean).join(", ");
  const pathName = `/property/${slugPath(property.slug)}`;
  const text = toPlainText(property.summary || property.description || `${property.title} property listing in Kenya.`);
  const page = {
    path: pathName,
    title: `${property.title}${location ? ` in ${location}` : ""} | Lyx Realty Group`,
    description: text.length > 155 ? `${text.slice(0, 152).trimEnd()}...` : text,
    heading: property.title,
  };
  let image = defaultOgImage;
  if (property.image_urls?.[0]) {
    try { image = new URL(property.image_urls[0], `${siteOrigin}/`).href; } catch { /* use the site preview image */ }
  }
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: new URL(pathName, `${siteOrigin}/`).href,
    ...(property.image_urls?.[0] ? { primaryImageOfPage: { "@type": "ImageObject", contentUrl: property.image_urls[0] } } : {}),
  };
  await emitPage(page, { image, schema });
}

for (const article of articles) {
  if (!article.slug) continue;
  const pathName = `/resources/blog/${slugPath(article.slug)}`;
  const text = toPlainText(article.excerpt || article.title);
  const page = {
    path: pathName,
    title: `${article.title} | Lyx Journal | Lyx Realty Group`,
    description: text.length > 155 ? `${text.slice(0, 152).trimEnd()}...` : text,
    heading: article.title,
  };
  let image = defaultOgImage;
  if (article.cover_image_url) {
    try { image = new URL(article.cover_image_url, `${siteOrigin}/`).href; } catch { /* use the site preview image */ }
  }
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: page.description,
    datePublished: article.published_at || undefined,
    image: article.cover_image_url || undefined,
    mainEntityOfPage: new URL(pathName, `${siteOrigin}/`).href,
    author: { "@type": "Organization", name: "Lyx Realty Group" },
    publisher: { "@type": "Organization", name: "Lyx Realty Group", logo: { "@type": "ImageObject", url: `${siteOrigin}/lyx-original-logo.jpeg` } },
  };
  await emitPage(page, { image, type: "article", schema });
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...sitemapPaths].map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
  '</urlset>',
].join("\n");
await writeFile(path.join(distRoot, "sitemap.xml"), `${sitemap}\n`);
await writeFile(path.join(distRoot, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`);

const notFoundHtml = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><title>Page not found | Lyx Realty Group</title><meta name="description" content="This page could not be found. Browse Lyx Realty Group property listings or contact our team."><style>body{margin:0;background:#f7f6f1;color:#173d2d;font:16px/1.7 Arial,sans-serif}.wrap{max-width:760px;margin:14vh auto;padding:40px 24px}p{color:#5c6a60}a{display:inline-block;margin:12px 18px 0 0;padding:11px 16px;background:#173d2d;color:white;text-decoration:none}small{color:#92784b;font-weight:bold;letter-spacing:.16em}</style></head><body><main class="wrap"><small>Lyx Realty Group</small><h1>We couldn’t find that page.</h1><p>The page may have moved. Browse current property opportunities or contact our team for help.</p><a href="/">Go to homepage</a><a href="/buy/residential">Browse homes</a><a href="/contact">Contact us</a></main></body></html>`;
await writeFile(path.join(distRoot, "404.html"), notFoundHtml);

console.log(`Generated sitemap.xml and robots.txt with ${sitemapPaths.size} public URLs for ${siteOrigin}.`);
