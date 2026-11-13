import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Maximize2, X, CheckCircle2 } from "lucide-react";
import InteriorLayout from "./InteriorLayout";
import { getPublishedProperty } from "../lib/supabase";

const categoryLabels = {
  apartments: "Apartment",
  commercial: "Commercial",
  off_plan: "Off-Plan",
  land_plot: "Land & Plots",
  rental: "Rental",
  holiday_home: "Holiday Home",
  luxury: "Luxury Property",
};

async function fetchPropertyUnits(propertyId) {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  
  const res = await fetch(`${url}/rest/v1/property_units?property_id=eq.${propertyId}&order=price_ksh.asc`, {
    headers: { apikey: key, Accept: "application/json" }
  });
  if (!res.ok) return [];
  return res.json();
}

export default function PropertyDetails({ slug }) {
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [failedImage, setFailedImage] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [currency, setCurrency] = useState("KES");
  const RATE = 130;

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    getPublishedProperty(slug)
      .then(async (item) => {
        if (!active) return;
        setProperty(item);
        
        if (item) {
          // 1. Page Title
          document.title = `${item.title} | ${item.area}, ${item.city} | LYX Group`;
          
          // 2. Meta Description
          let metaDescription = document.querySelector('meta[name="description"]');
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            document.head.appendChild(metaDescription);
          }
          metaDescription.content = item.summary || `View ${item.title} in ${item.area}, ${item.city} on LYX Group.`;

          // 3. Canonical URL
          let canonical = document.querySelector('link[rel="canonical"]');
          if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
          }
          canonical.href = window.location.href.split('?')[0];

          // 4. JSON-LD Schema (Rich Snippets)
          let schemaScript = document.getElementById("property-schema");
          if (!schemaScript) {
            schemaScript = document.createElement("script");
            schemaScript.id = "property-schema";
            schemaScript.type = "application/ld+json";
            document.head.appendChild(schemaScript);
          }
          
          const schemaData = {
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "name": item.title,
            "description": item.summary,
            "url": window.location.href,
            "image": item.image_urls?.[0] || "",
            "offers": {
              "@type": "Offer",
              "price": item.price_ksh || 0,
              "priceCurrency": "KES"
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": item.area,
              "addressRegion": item.city,
              "addressCountry": "KE"
            }
          };
          schemaScript.textContent = JSON.stringify(schemaData);

          // 5. Open Graph Tags
          const ogTags = [
            { property: "og:title", content: `${item.title} | LYX Group` },
            { property: "og:description", content: item.summary || `View ${item.title} in ${item.area}.` },
            { property: "og:image", content: item.image_urls?.[0] || "" },
            { property: "og:url", content: window.location.href.split('?')[0] },
            { property: "og:type", content: "article" },
          ];

          ogTags.forEach(({ property, content }) => {
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (!tag) {
              tag = document.createElement("meta");
              tag.setAttribute("property", property);
              document.head.appendChild(tag);
            }
            tag.setAttribute("content", content);
          });
        }

        if (item?.id) {
          const unitData = await fetchPropertyUnits(item.id);
          if (active) setUnits(unitData);
        }
      })
      .catch((caught) => { if (active) setError(caught.message || "Could not load this property."); })
      .finally(() => { if (active) setLoading(false); });
      
    return () => { active = false; };
  }, [slug]);
  
  const images = property?.image_urls?.filter(Boolean) || [];
  const location = property ? [property.area, property.city].filter(Boolean).join(", ") : "";
  
  const formatPrice = (amountInKes) => {
    if (amountInKes == null) return "Price on request";
    if (currency === "USD") {
      return `$ ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amountInKes / RATE)}`;
    }
    return `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(amountInKes)}`;
  };

  const price = formatPrice(property?.price_ksh);
  
  const features = property ? [
    property.bedrooms != null && { label: "Bedrooms", value: property.bedrooms },
    property.bathrooms != null && { label: "Bathrooms", value: property.bathrooms },
    property.floor_area_sqm != null && { label: "Floor area", value: `${property.floor_area_sqm} m²` },
    property.land_area_sqm != null && { label: "Land area", value: `${property.land_area_sqm} m²` },
  ].filter(Boolean) : [];

  function moveImage(direction) {
    setActiveImage((current) => (current + direction + images.length) % images.length);
  }

  if (loading) return <InteriorLayout title="Loading…" description=""><p className="property-detail-message">Loading property details…</p></InteriorLayout>;
  if (error || !property) return <InteriorLayout title="Not found" description=""><p className="property-detail-message">{error || "Property not found."}</p></InteriorLayout>;

  return (
    <InteriorLayout
      eyebrow={categoryLabels[property.property_type] || "PROPERTY DETAILS"}
      title={property.title}
      description={property.summary}
      headerAddon={
        <section className="property-price-card" aria-label="Property price">
          <div>
            <span>{property.transaction_type === "rent" ? "MONTHLY RENT" : "STARTING FROM"}</span>
            <p className="property-price-amount">{price}</p>
          </div>
          
          <div style={{ display: "flex", gap: "4px", border: "1px solid #ccc", padding: "2px", borderRadius: "4px" }}>
            <button onClick={() => setCurrency("KES")} style={{ padding: "4px 8px", background: currency === "KES" ? "#173d2d" : "transparent", color: currency === "KES" ? "#fff" : "#173d2d", border: "none", cursor: "pointer", borderRadius: "2px", fontSize: "11px", fontWeight: "bold" }}>KES</button>
            <button onClick={() => setCurrency("USD")} style={{ padding: "4px 8px", background: currency === "USD" ? "#173d2d" : "transparent", color: currency === "USD" ? "#fff" : "#173d2d", border: "none", cursor: "pointer", borderRadius: "2px", fontSize: "11px", fontWeight: "bold" }}>USD</button>
          </div>
        </section>
      }
    >
      <nav className="property-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <ArrowRight size={13} />
        <a href="/buy/apartments">Apartments</a>
        <ArrowRight size={13} />
        <span>{property.title}</span>
      </nav>

      <div className="property-detail-layout">
        <section className="property-detail-gallery" aria-label="Property photos">
          <div className="property-detail-main-image">
            {images.length && failedImage !== images[activeImage]
              ? <button className="property-detail-image-button" type="button" onClick={() => setGalleryOpen(true)} aria-label="Open photo gallery">
                  <img src={images[activeImage]} alt={`${property.title} in ${property.area}, ${property.city} - Photo ${activeImage + 1}`} onError={() => setFailedImage(images[activeImage])} />
                  <span><Maximize2 size={15} /> View photos</span>
                </button>
              : <div className="property-detail-no-image">No photos available</div>}
            {images.length > 1 && <>
              <button type="button" className="property-detail-arrow property-detail-prev" onClick={() => moveImage(-1)}><ArrowLeft size={19} /></button>
              <button type="button" className="property-detail-arrow property-detail-next" onClick={() => moveImage(1)}><ArrowRight size={19} /></button>
              <span className="property-detail-image-count">{activeImage + 1} / {images.length}</span>
            </>}
          </div>
          {images.length > 1 && <div className="property-detail-thumbnails">
            {images.map((image, index) => 
              <button key={index} type="button" className={index === activeImage ? "active" : ""} onClick={() => setActiveImage(index)}>
                <img src={image} alt={`${property.title} in ${property.area} - Thumbnail ${index + 1}`} loading="lazy" />
              </button>
            )}
          </div>}
        </section>

        <aside className="property-detail-sidebar">
          <span className="property-detail-tag">{property.transaction_type === "rent" ? "FOR RENT" : "FOR SALE"}</span>
          {location && <p className="property-detail-location"><MapPin size={15} />{location}</p>}
          
          <div className="property-detail-quick-facts">
            {features.map((f) => (
              <div key={f.label}><b>{f.value}</b><span>{f.label}</span></div>
            ))}
          </div>
          
          <h2>Listing Purpose</h2>
          <p style={{ fontWeight: 600, color: "#173d2d", textTransform: "capitalize", fontSize: "16px", marginTop: "5px" }}>
            {property.transaction_type === "rent" ? "For Rent" : "For Sale"}
          </p>

          <a className="property-detail-enquire" href={`https://wa.me/254741246659?text=${encodeURIComponent(`Hi Lyx Realty Group, I'm interested in ${property.title}. Here is the link: ${window.location.href}`)}`} target="_blank" rel="noreferrer">
  Enquire via WhatsApp <ArrowUpRight size={16} />
</a>
        </aside>

        {property.description && (
          <section className="property-detail-description">
            <h2>About this property</h2>
            <p>{property.description}</p>
          </section>
        )}

        {units.length > 0 && (
          <section className="property-units-section">
            <h2>Available Unit Types</h2>
            <p>View the available configurations, sizes, and starting prices.</p>
            
            <div className="property-units-table">
              <div className="property-units-header">
                <span>Unit Type</span>
                <span>Beds</span>
                <span>Size</span>
                <span>Starting Price</span>
              </div>
              {units.map((unit) => (
                <div className="property-units-row" key={unit.id}>
                  <span className="unit-name">{unit.unit_name}</span>
                  <span>{unit.beds || "-"}</span>
                  <span>{unit.size_sqm ? `${unit.size_sqm} sqm` : "-"}</span>
                  <span className="unit-price">
                    {formatPrice(unit.price_ksh)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {property.amenities && (
          <section className="property-detail-amenities">
            <h2>Amenities</h2>
            <div className="amenities-grid">
              {property.amenities.split(",").map((amenity, index) => (
                <span key={index}>
                  <CheckCircle2 size={16} /> {amenity.trim()}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {galleryOpen && images.length > 0 && <div className="property-lightbox" onClick={(e) => { if (e.target === e.currentTarget) setGalleryOpen(false); }}>
        <button type="button" className="property-lightbox-close" onClick={() => setGalleryOpen(false)}><X size={22} /></button>
        {images.length > 1 && <button type="button" className="property-lightbox-arrow property-lightbox-prev" onClick={() => moveImage(-1)}><ArrowLeft size={22} /></button>}
        <img src={images[activeImage]} alt={`${property.title} in ${property.area} - Full screen photo`} />
        {images.length > 1 && <button type="button" className="property-lightbox-arrow property-lightbox-next" onClick={() => moveImage(1)}><ArrowRight size={22} /></button>}
        <span className="property-lightbox-count">{activeImage + 1} / {images.length}</span>
      </div>}
    </InteriorLayout>
  );
}