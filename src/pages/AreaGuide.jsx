import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import InteriorLayout from "./InteriorLayout";
import { getPublishedProperties } from "../lib/supabase";

async function fetchAreaData(slug) {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`${url}/rest/v1/areas?slug=eq.${slug}&limit=1`, {
    headers: { apikey: key, Accept: "application/json" }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

export default function AreaGuide({ slug }) {
  const [area, setArea] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    Promise.all([
      fetchAreaData(slug),
      getPublishedProperties({}) 
    ])
    .then(([areaData, propsData]) => {
      if (!active) return;
      
      if (areaData) {
        setArea(areaData);
        
        const searchName = areaData.name.toLowerCase().trim();
        
        const filteredProps = (propsData || []).filter(p => {
          const pTitle = (p.title || "").toLowerCase().trim();
          const pArea = (p.area || "").toLowerCase().trim();
          const pCity = (p.city || "").toLowerCase().trim();
          const pCountry = (p.country || "").toLowerCase().trim();
          
          return pTitle.includes(searchName) || 
                 pArea.includes(searchName) || 
                 pCity.includes(searchName) || 
                 pCountry.includes(searchName);
        });
        
        setProperties(filteredProps);

        document.title = `Properties in ${areaData.name} | LYX Group`;
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = "description";
          document.head.appendChild(metaDescription);
        }
        const shortDesc = areaData.description ? areaData.description.substring(0, 157) + "..." : `Explore properties in ${areaData.name}.`;
        metaDescription.content = shortDesc;

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = "canonical";
          document.head.appendChild(canonical);
        }
        canonical.href = window.location.href.split('?')[0];
      }
    })
    .catch(console.error)
    .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [slug]);

  if (loading) return <InteriorLayout title="Loading..."><p>Loading area...</p></InteriorLayout>;
  if (!area) return <InteriorLayout title="Not Found"><p>Area guide not found.</p></InteriorLayout>;

  return (
    <InteriorLayout
      eyebrow="AREA GUIDE"
      title={`Properties in ${area.name}`}
      description={`Discover homes, apartments, and investments in ${area.name}.`}
    >
      <section style={{ maxWidth: "800px", marginBottom: "60px" }}>
        {area.image_url && (
          <img src={area.image_url} alt={area.name} style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "8px", marginBottom: "30px" }} />
        )}
        <div style={{ fontSize: "16px", lineHeight: "1.8", color: "#5b6a5f", whiteSpace: "pre-line" }}>
          {area.description}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px", borderBottom: "1px solid #e0dfd5", paddingBottom: "15px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#173d2d", margin: 0 }}>
            Available Properties in {area.name}
          </h2>
          <span style={{ background: "#173d2d", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
            {properties.length}
          </span>
        </div>

        {properties.length > 0 ? (
          <div className="residential-grid">
            {properties.map((property) => (
              <article className="residential-card" key={property.id}>
                <div className="residential-gallery">
                   <a href={`/property/${property.slug}`} className="residential-gallery-link">
                     {property.image_urls?.[0] ? (
                       <img src={property.image_urls[0]} alt={`${property.title} in ${property.area}, ${property.city}`} />
                     ) : (
                       <div className="residential-photo-empty">LYX GROUP</div>
                     )}
                   </a>
                </div>
                <div className="residential-card-copy">
                  <span className="residential-card-tag">{property.transaction_type === "rent" ? "FOR RENT" : "FOR SALE"}</span>
                  <h2><a href={`/property/${property.slug}`}>{property.title}</a></h2>
                  <p className="residential-card-location"><MapPin size={14} />{[property.area, property.city].filter(Boolean).join(", ")}</p>
                  <p className="residential-card-price">KSh {Number(property.price_ksh).toLocaleString()}</p>
                  <a href={`/property/${property.slug}`}>View property details</a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ padding: "40px", background: "#f8f5ee", textAlign: "center", borderRadius: "8px" }}>
            <p>No properties listed in {area.name} right now. Contact us for upcoming opportunities.</p>
          </div>
        )}
      </section>
    </InteriorLayout>
  );
}