import { useEffect } from "react";

const DEFAULT_IMAGE = "/images/lyx-group-og.jpg";
const ORGANIZATION_SCHEMA_ID = "lyx-organization-schema";
const PAGE_SCHEMA_ID = "lyx-page-schema";

function upsertMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  element.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function upsertSchema(id, data) {
  let element = document.getElementById(id);
  if (!data) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

function siteOrigin() {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  return window.location.origin;
}

export default function useSeo(metadata) {
  const {
    title,
    description,
    path,
    noindex = false,
    image = DEFAULT_IMAGE,
    type = "website",
    pageSchema,
  } = metadata || {};
  useEffect(() => {
    if (!title || !description) return;

    const origin = siteOrigin();
    const pathname = path || window.location.pathname;
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const canonical = new URL(normalizedPath, `${origin}/`).href;
    const imageUrl = new URL(image, `${origin}/`).href;

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description" }, description);
    upsertMeta('meta[name="robots"]', { name: "robots" }, noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, type);
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, "LYX Group");
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, title);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonical);
    upsertMeta('meta[property="og:image"]', { property: "og:image" }, imageUrl);
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }, "LYX Group real estate in Kenya");
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, title);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, imageUrl);

    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "LYX Group",
      url: `${origin}/`,
      logo: `${origin}/lyx-original-logo.jpeg`,
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
    const pageNodes = [{
      "@type": "WebSite",
      name: "LYX Group",
      url: `${origin}/`,
    }];
    if (pageSchema) {
      const pageNode = { ...pageSchema };
      delete pageNode["@context"];
      pageNodes.push(pageNode);
    }
    upsertSchema(ORGANIZATION_SCHEMA_ID, organization);
    upsertSchema(PAGE_SCHEMA_ID, { "@context": "https://schema.org", "@graph": pageNodes });
  }, [description, image, noindex, pageSchema, path, title, type]);
}
