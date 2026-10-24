const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);

async function readTable(table, params) {
  if (!isSupabaseConfigured) {
    throw new Error("Add the Supabase URL and publishable key to .env.local to connect the property database.");
  }

  const query = new URLSearchParams(params);
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: publishableKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`The Supabase ${table} request failed (HTTP ${response.status}). Apply the database migration and check the table policies.`);
  }

  return response.json();
}

const propertyTypeValues = {
  Residential: "residential",
  Commercial: "commercial",
  "Off-Plan": "off_plan",
  "Land & Plots": "land_plot",
  Rentals: "rental",
  "Holiday Homes": "holiday_home",
  "Luxury Properties": "luxury",
};

const propertyFields = "id,slug,title,summary,property_type,transaction_type,price_ksh,city,area,bedrooms,bathrooms,floor_area_sqm,image_urls,featured";

export function getFeaturedProperties() {
  return readTable("properties", {
    select: propertyFields,
    status: "eq.published",
    featured: "eq.true",
    order: "created_at.desc",
    limit: "6",
  });
}

export function getResidentialProperties() {
  return getPublishedProperties({ propertyType: "residential", transactionType: "sale" });
}

export function getPublishedProperties({ propertyType, transactionType } = {}) {
  const params = {
    select: propertyFields,
    status: "eq.published",
    order: "featured.desc,created_at.desc",
    limit: "48",
  };
  if (propertyType) params.property_type = `eq.${propertyType}`;
  if (transactionType) params.transaction_type = `eq.${transactionType}`;
  return readTable("properties", params);
}

export function getSimilarProperties(property) {
  if (!property?.id || !property.property_type || !property.transaction_type) return Promise.resolve([]);
  return readTable("properties", {
    select: propertyFields,
    status: "eq.published",
    property_type: `eq.${property.property_type}`,
    transaction_type: `eq.${property.transaction_type}`,
    id: `neq.${property.id}`,
    order: "featured.desc,created_at.desc",
    limit: "3",
  });
}

export async function getPublishedProperty(slug) {
  const rows = await readTable("properties", {
    select: "id,slug,title,summary,description,property_type,transaction_type,price_ksh,city,area,bedrooms,bathrooms,floor_area_sqm,land_area_sqm,image_urls,featured",
    slug: `eq.${slug}`,
    status: "eq.published",
    limit: "1",
  });
  return rows[0] || null;
}

export function searchProperties({ location, propertyType, transaction, budget }) {
  const params = {
    select: propertyFields,
    status: "eq.published",
    order: "featured.desc,created_at.desc",
    limit: "24",
  };

  if (propertyType && propertyTypeValues[propertyType]) {
    params.property_type = `eq.${propertyTypeValues[propertyType]}`;
  }
  if (transaction) {
    params.transaction_type = transaction === "Rent" ? "eq.rent" : "eq.sale";
  }
  if (budget && Number.isFinite(Number(budget)) && Number(budget) >= 0) {
    params.price_ksh = `lte.${Math.floor(Number(budget))}`;
  }
  if (location.trim()) {
    const safeLocation = location.trim().replace(/[,*%()]/g, " ").replace(/\s+/g, " ");
    params.or = `(city.ilike.*${safeLocation}*,area.ilike.*${safeLocation}*)`;
  }

  return readTable("properties", params);
}

export function getPublishedDevelopments() {
  return readTable("developments", {
    select: "id,slug,name,description,city,area,starting_price_ksh,construction_status,expected_completion,image_urls,featured",
    status: "eq.published",
    order: "featured.desc,created_at.desc",
    limit: "6",
  });
}

export function getPublishedArticles() {
  return readTable("articles", {
    select: "id,slug,title,excerpt,cover_image_url,published_at",
    status: "eq.published",
    order: "published_at.desc",
    limit: "48",
  });
}

export async function getPublishedArticle(slug) {
  const rows = await readTable("articles", {
    select: "id,slug,title,excerpt,body_markdown,cover_image_url,published_at",
    slug: `eq.${slug}`,
    status: "eq.published",
    limit: "1",
  });
  return rows[0] || null;
}
// ---------- Valuation helpers ----------

export function getPriceGuides() {
  return readTable("area_price_guides", {
    select: "area_name,property_type,unit,price_per_unit_ksh",
    order: "area_name.asc",
  });
}

export function getPriceGuide({ areaName, propertyType, unit }) {
  return readTable("area_price_guides", {
    select: "price_per_unit_ksh",
    area_name: `eq.${areaName}`,
    property_type: `eq.${propertyType}`,
    unit: `eq.${unit}`,
    limit: "1",
  });
}

export async function submitValuationRequest(payload) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/valuation_requests`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Valuation request failed (HTTP ${response.status})`);
  }
}

export async function submitEnquiryRequest(payload) {
  if (!isSupabaseConfigured) {
    throw new Error("The contact form is temporarily unavailable. Please call or message us directly.");
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/enquiries`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    let detail = text;
    try {
      const data = text ? JSON.parse(text) : null;
      detail = data?.message || data?.details || data?.hint || text;
    } catch { /* The service may return plain text. */ }
    throw new Error(detail || `Your message could not be sent (HTTP ${response.status}). Please contact us by phone or WhatsApp.`);
  }
}
