import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import InteriorLayout from "./InteriorLayout";
import { getPublishedProperties, isSupabaseConfigured } from "../lib/supabase";

function ListingCard({ property, purpose }) {
  const images = property.image_urls?.filter(Boolean) || [];
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState([]);
  const image = images[activeImage];
  const href = `/property/${encodeURIComponent(property.slug)}`;
  const location = [property.area, property.city].filter(Boolean).join(", ");
  const price = property.price_ksh == null ? "Price on request" : `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(property.price_ksh)}`;
  const facts = [
    property.bedrooms != null && `${property.bedrooms} beds`,
    property.bathrooms != null && `${property.bathrooms} baths`,
    property.floor_area_sqm != null && `${property.floor_area_sqm} m²`,
  ].filter(Boolean);
  const moveImage = (direction) => setActiveImage((current) => (current + direction + images.length) % images.length);

  return (
    <article className="residential-card">
      <div className="residential-gallery">
        {image && !failedImages.includes(image)
          ? <a className="residential-gallery-link" href={href} aria-label={`View details for ${property.title}`}><img src={image} alt={`${property.title}${images.length > 1 ? `, photo ${activeImage + 1}` : ""}`} loading="lazy" onError={() => setFailedImages((current) => [...current, image])} /></a>
          : <div className="residential-photo-empty">Lyx Realty Group</div>}
        {images.length > 1 && <>
          <button className="residential-gallery-arrow residential-gallery-previous" type="button" onClick={() => moveImage(-1)} aria-label="Previous photo"><ArrowLeft size={17} /></button>
          <button className="residential-gallery-arrow residential-gallery-next" type="button" onClick={() => moveImage(1)} aria-label="Next photo"><ArrowRight size={17} /></button>
          <span className="residential-gallery-count">{activeImage + 1} / {images.length}</span>
        </>}
      </div>
      <div className="residential-card-copy">
        <span className="residential-card-tag">{purpose === "rent" ? "FOR RENT" : "FOR SALE"}</span>
        <h2><a href={href}>{property.title}</a></h2>
        {location && <p className="residential-card-location"><MapPin size={14} />{location}</p>}
        <p className="residential-card-price">{price}</p>
        {facts.length > 0 && <p className="residential-card-facts">{facts.join(" · ")}</p>}
        {property.summary && <p className="residential-card-summary">{property.summary}</p>}
        <a href={href}>View property details <ArrowUpRight size={15} /></a>
      </div>
    </article>
  );
}

export default function PropertyCollection({ eyebrow, title, description, propertyType, transactionType, collectionTitle, emptyLabel }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPublishedProperties({ propertyType, transactionType })
      .then((items) => { if (active) setProperties(items); })
      .catch((caught) => { if (active) setError(caught.message || "Could not load property listings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [propertyType, transactionType]);

  return (
    <InteriorLayout eyebrow={eyebrow} title={title} description={description}>
      <section className="residential-results" aria-live="polite">
        <div className="residential-results-heading">
          <div><span>Lyx Realty Group collection</span><h2>{collectionTitle}</h2></div>
          {!loading && !error && <p>{properties.length} {properties.length === 1 ? "listing" : "listings"}</p>}
        </div>
        {loading ? <p className="residential-results-message">Loading available listings…</p>
          : error ? <p className="residential-results-message">{error}</p>
            : properties.length ? <div className="residential-grid">{properties.map((property) => <ListingCard key={property.id} property={property} purpose={property.transaction_type} />)}</div>
              : <div className="residential-results-message"><b>{isSupabaseConfigured ? `${emptyLabel} are not available at the moment.` : "Properties are not available at the moment."}</b><p>Please check back soon or contact our team for assistance.</p></div>}
      </section>
    </InteriorLayout>
  );
}
