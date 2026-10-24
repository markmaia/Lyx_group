import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Maximize2, X } from "lucide-react";
import InteriorLayout from "./InteriorLayout";
import { getPublishedProperty, getSimilarProperties } from "../lib/supabase";
import { CurrencyToggle, useCurrency } from "../context/CurrencyContext";
import { WhatsAppIcon } from "../components/WhatsAppBot";

const categoryLabels = {
  residential: "Residential",
  commercial: "Commercial",
  off_plan: "Off-plan",
  land_plot: "Land & plots",
  rental: "Rental",
  holiday_home: "Holiday home",
  luxury: "Luxury property",
};

function SimilarPropertyCard({ property, formatPrice }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = property.image_urls?.[0];
  const href = `/property/${encodeURIComponent(property.slug)}`;
  const location = [property.area, property.city].filter(Boolean).join(", ");

  return (
    <article className="residential-card similar-property-card">
      <div className="residential-gallery">
        {image && !imageFailed
          ? <a className="residential-gallery-link" href={href} aria-label={`View ${property.title}`}><img src={image} alt={property.title} loading="lazy" onError={() => setImageFailed(true)} /></a>
          : <div className="residential-photo-empty">LYX GROUP</div>}
      </div>
      <div className="residential-card-copy">
        <span className="residential-card-tag">{property.transaction_type === "rent" ? "FOR RENT" : "FOR SALE"}</span>
        <h2><a href={href}>{property.title}</a></h2>
        {location && <p className="residential-card-location"><MapPin size={14} />{location}</p>}
        <p className="residential-card-price">{formatPrice(property.price_ksh)}</p>
        <a href={href}>View property details <ArrowUpRight size={15} /></a>
      </div>
    </article>
  );
}

export default function PropertyDetails({ slug }) {
  const { formatPrice } = useCurrency();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [failedImage, setFailedImage] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPublishedProperty(slug)
      .then((item) => { if (active) setProperty(item); })
      .catch((caught) => { if (active) setError(caught.message || "Could not load this property."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!property?.id) return undefined;
    let active = true;
    getSimilarProperties(property)
      .then((items) => { if (active) setSimilarProperties(items); })
      .catch(() => { if (active) setSimilarProperties([]); });
    return () => { active = false; };
  }, [property?.id]);

  const images = property?.image_urls?.filter(Boolean) || [];
  const price = formatPrice(property?.price_ksh);
  const location = property ? [property.area, property.city].filter(Boolean).join(", ") : "";
  const propertyUrl = property ? `${window.location.origin}/property/${encodeURIComponent(property.slug)}` : "";
  const whatsappEnquiry = property
    ? `https://wa.me/254741246659?text=${encodeURIComponent(`Hello, I've seen ${propertyUrl}. My name is [Your Name]. I'm interested in ${property.title}. Could you share more details?`)}`
    : "#";
  const priceLabel = property
    ? property.transaction_type === "rent"
      ? "Rental price"
      : `${categoryLabels[property.property_type] || "Property"} price`
    : "Property price";
  const features = property ? [
    property.bedrooms != null && { label: "Bedrooms", value: property.bedrooms },
    property.bathrooms != null && { label: "Bathrooms", value: property.bathrooms },
    property.floor_area_sqm != null && { label: "Floor area", value: `${property.floor_area_sqm} m²` },
    property.land_area_sqm != null && { label: "Land area", value: `${property.land_area_sqm} m²` },
    { label: "Property type", value: categoryLabels[property.property_type] || property.property_type },
    { label: "Purpose", value: property.transaction_type === "rent" ? "For rent" : "For sale" },
  ].filter(Boolean) : [];

  function moveImage(direction) {
    setActiveImage((current) => (current + direction + images.length) % images.length);
  }

  return (
    <InteriorLayout
      eyebrow={property ? categoryLabels[property.property_type] || "PROPERTY DETAILS" : "PROPERTY DETAILS"}
      title={property?.title || (loading ? "Loading property…" : "Property details")}
      description={property?.summary || (loading ? "Loading property information." : "")}
      headerAddon={property && <section className="property-price-card" aria-label="Property price">
        <div><p className="property-price-amount">{price}</p></div>
        <CurrencyToggle />
      </section>}
    >
      {loading ? <p className="property-detail-message">Loading property details…</p>
        : error ? <p className="property-detail-message">{error}</p>
          : !property ? <div className="property-detail-message"><b>This listing is unavailable.</b><p>It may have been unpublished or removed. Browse current homes on the <a href="/buy/residential">Residential page</a>.</p></div>
            : <>
              <nav className="property-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><ArrowRight size={13} /><a href="/buy/residential">Buy</a><ArrowRight size={13} /><span>{property.title}</span></nav>
              <div className="property-detail-layout">
              <section className="property-detail-gallery" aria-label="Property photos">
                <div className="property-detail-main-image">
                  {images.length && failedImage !== images[activeImage]
                    ? <button className="property-detail-image-button" type="button" onClick={() => setGalleryOpen(true)} aria-label="Open photo gallery"><img src={images[activeImage]} alt={`${property.title}, photo ${activeImage + 1} of ${images.length}`} onError={() => setFailedImage(images[activeImage])} /><span><Maximize2 size={15} /> View photos</span></button>
                    : <div className="property-detail-no-image">{images.length ? "Photo unavailable. Check the property image bucket and uploaded file." : "No photos available"}</div>}
                  {images.length > 1 && <>
                    <button type="button" className="property-detail-arrow property-detail-prev" onClick={() => moveImage(-1)} aria-label="Previous photo"><ArrowLeft size={19} /></button>
                    <button type="button" className="property-detail-arrow property-detail-next" onClick={() => moveImage(1)} aria-label="Next photo"><ArrowRight size={19} /></button>
                    <span className="property-detail-image-count">{activeImage + 1} / {images.length}</span>
                  </>}
                </div>
                {images.length > 1 && <div className="property-detail-thumbnails" aria-label="Choose a photo">
                  {images.map((image, index) => <button key={`${image}-${index}`} type="button" className={index === activeImage ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={`View photo ${index + 1}`} aria-pressed={index === activeImage}><img src={image} alt="" loading="lazy" /></button>)}
                </div>}
              </section>
              <aside className="property-detail-sidebar">
                <span className="property-detail-tag">{property.transaction_type === "rent" ? "FOR RENT" : "FOR SALE"}</span>
                {location && <p className="property-detail-location"><MapPin size={15} />{location}</p>}
                <div className="property-detail-quick-facts">
                  {property.bedrooms != null && <div><b>{property.bedrooms}</b><span>Bedrooms</span></div>}
                  {property.bathrooms != null && <div><b>{property.bathrooms}</b><span>Bathrooms</span></div>}
                  {property.floor_area_sqm != null && <div><b>{property.floor_area_sqm}</b><span>m² floor area</span></div>}
                </div>
                <h2>Property features</h2>
                <dl>{features.map((feature) => <div key={feature.label}><dt>{feature.label}</dt><dd>{feature.value}</dd></div>)}</dl>
                <a className="property-detail-enquire" href={whatsappEnquiry} target="_blank" rel="noreferrer">Enquire about this property <WhatsAppIcon size={18} /></a>
              </aside>
              {property.description && <section className="property-detail-description"><h2>About this property</h2><p>{property.description}</p></section>}
              </div>
              {similarProperties.length > 0 && <section className="similar-properties" aria-labelledby="similar-properties-title">
                <div className="similar-properties-heading"><div><span>EXPLORE MORE</span><h2 id="similar-properties-title">Similar Properties</h2><p>You might also be interested in</p></div></div>
                <div className="residential-grid">{similarProperties.map((similar) => <SimilarPropertyCard key={similar.id} property={similar} formatPrice={formatPrice} />)}</div>
              </section>}
              {galleryOpen && images.length > 0 && <div className="property-lightbox" role="dialog" aria-modal="true" aria-label="Property photo gallery" onClick={(event) => { if (event.target === event.currentTarget) setGalleryOpen(false); }}>
                <button type="button" className="property-lightbox-close" onClick={() => setGalleryOpen(false)} aria-label="Close photo gallery"><X size={22} /></button>
                {images.length > 1 && <button type="button" className="property-lightbox-arrow property-lightbox-prev" onClick={() => moveImage(-1)} aria-label="Previous photo"><ArrowLeft size={22} /></button>}
                {failedImage === images[activeImage] ? <p className="property-lightbox-error">This photo could not be loaded.</p> : <img src={images[activeImage]} alt={`${property.title}, photo ${activeImage + 1} of ${images.length}`} onError={() => setFailedImage(images[activeImage])} />}
                {images.length > 1 && <button type="button" className="property-lightbox-arrow property-lightbox-next" onClick={() => moveImage(1)} aria-label="Next photo"><ArrowRight size={22} /></button>}
                <span className="property-lightbox-count">{activeImage + 1} / {images.length}</span>
              </div>}
            </>}
    </InteriorLayout>
  );
}
