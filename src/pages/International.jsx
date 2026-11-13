import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import InteriorLayout from "./InteriorLayout";
import { searchInternationalProperties } from "../lib/supabase";

function InternationalCard({ property }) {
  const image = property.image_urls?.[0];
  const href = `/property/${encodeURIComponent(property.slug)}`;
  const price = property.price_ksh == null ? "Price on request" : `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(property.price_ksh)}`;
  const location = [property.area, property.city, property.country].filter(Boolean).join(", ");

  return (
    <article className="residential-card">
      <div className="residential-gallery">
        <a className="residential-gallery-link" href={href}>
          {image ? <img src={image} alt={property.title} /> : <div className="residential-photo-empty">LYX GROUP</div>}
        </a>
      </div>
      <div className="residential-card-copy">
        <span className="residential-card-tag">{property.transaction_type === "rent" ? "FOR RENT" : "FOR SALE"}</span>
        <h2><a href={href}>{property.title}</a></h2>
        {location && <p className="residential-card-location"><MapPin size={14} />{location}</p>}
        <p className="residential-card-price">{price}</p>
        <a href={href}>View property details</a>
      </div>
    </article>
  );
}

export default function International() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load ALL international properties on first load
  useEffect(() => {
    setLoading(true);
    searchInternationalProperties("") // Empty string gets everything
      .then((data) => setResults(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setSearched(true);
    setLoading(true);
    
    try {
      const data = await searchInternationalProperties(query);
      setResults(data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <InteriorLayout 
      eyebrow="GLOBAL DESTINATIONS" 
      title="International Properties" 
      description="Discover our curated portfolio of international real estate opportunities."
      seoTitle="International Properties for Sale | Zanzibar & Dubai | LYX Group"
      seoDescription="Buy property in Zanzibar, beachfront villas in Tanzania, and international real estate investment opportunities."
    >
      {/* Search Section */}
      <div style={{ marginBottom: "40px", padding: "30px", background: "#f8f5ee", border: "1px solid #e0dfd5", borderRadius: "8px", maxWidth: "600px" }}>
        <h3 style={{ margin: "0 0 15px", fontFamily: "Georgia, serif", fontSize: "20px", color: "#173d2d" }}>Where are you looking?</h3>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="Type a country (e.g. Zanzibar, Dubai)" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
          />
          <button type="submit" style={{ padding: "12px 20px", background: "#173d2d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <p>Loading properties...</p>
      ) : results.length > 0 ? (
        <div>
          <p style={{ marginBottom: "20px", fontWeight: "bold", color: "#173d2d" }}>
            {searched ? `Found ${results.length} properties in "${query}"` : `All International Properties (${results.length})`}
          </p>
          <div className="residential-grid">
            {results.map(p => <InternationalCard key={p.id} property={p} />)}
          </div>
        </div>
      ) : (
        <div style={{ padding: "40px", textAlign: "center", background: "#fff", border: "1px solid #e0dfd5", borderRadius: "8px" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#173d2d", marginBottom: "10px" }}>
            {searched ? `No properties currently listed in "${query}"` : "No international properties available at the moment."}
          </h3>
          <p style={{ color: "#5b6a5f", marginBottom: "20px" }}>Don't worry, we have a vast network of international partners.</p>
          <a href={`https://wa.me/254741246659?text=${encodeURIComponent(`Hi Lyx Realty Group, I am looking for a property in ${query || "your international portfolio"}. Do you have any available or can you help me find one?`)}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: "12px 24px", background: "#173d2d", color: "#fff", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" }}>
            Inquire with LYX Group
          </a>
        </div>
      )}
    </InteriorLayout>
  );
}