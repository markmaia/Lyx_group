import { useEffect, useRef, useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Building2, Home, KeyRound, MapPin,
  Menu, Ruler, ShieldCheck, Sparkles, Volume2, VolumeX, X,
} from "lucide-react";
import logo from "../assets/lyx-original-logo.jpeg";
import { getFeaturedProperties, searchProperties } from "../lib/supabase";
import SocialLinks from "../components/SocialLinks";

const propertyTypes = [
  { name: "Residential", icon: Home, href: "/buy/residential", detail: "Homes for the next chapter.", image: "/images/property-categories/residential.jpeg" },
  { name: "Commercial", icon: Building2, href: "/buy/commercial", detail: "Spaces for business and growth.", image: "/images/property-categories/commercial.jpeg" },
  { name: "Off-Plan", icon: Sparkles, href: "/buy/off-plan", detail: "Discover emerging opportunities.", image: "/images/property-categories/off-plan.jpeg" },
  { name: "Land & Plots", icon: Ruler, href: "/buy/land", detail: "Explore land opportunities.", image: "/images/property-categories/land-plots.jpeg" },
  { name: "Rentals", icon: KeyRound, href: "/rent", detail: "Find a place to make your own.", image: "/images/property-categories/rentals.jpeg" },
  { name: "Holiday Homes", icon: MapPin, href: "/holiday-homes", detail: "Ask us about holiday properties.", image: "/images/property-categories/holiday-homes.jpeg" },
];

function PropertySearch() {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [transaction, setTransaction] = useState("Buy");
  const [budget, setBudget] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchRequest = useRef(0);

  async function submitSearch(event) {
    event.preventDefault();
    const requestId = ++searchRequest.current;
    setSearched(true);
    setIsSearching(true);
    setSearchError("");
    try {
      const matches = await searchProperties({ location, propertyType, transaction, budget });
      if (requestId === searchRequest.current) setResults(matches);
    } catch (error) {
      if (requestId === searchRequest.current) {
        setResults([]);
        setSearchError(error.message);
      }
    } finally {
      if (requestId === searchRequest.current) setIsSearching(false);
    }
  }

  function clearSearch() {
    searchRequest.current += 1;
    setLocation("");
    setPropertyType("");
    setTransaction("Buy");
    setBudget("");
    setResults([]);
    setSearchError("");
    setSearched(false);
  }

  return (
    <div className="property-search-wrap">
      <form className="property-search" onSubmit={submitSearch}>
        <label className="search-field">
          <span>Location</span>
          <span className="search-input"><MapPin size={16} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, area or neighborhood" /></span>
        </label>
        <label className="search-field">
          <span>Property type</span>
          <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
            <option value="">Any property</option>
            {propertyTypes.map((type) => <option key={type.name} value={type.name}>{type.name}</option>)}
            <option value="Luxury Properties">Luxury Properties</option>
          </select>
        </label>
        <label className="search-field">
          <span>I'm looking to</span>
          <select value={transaction} onChange={(event) => setTransaction(event.target.value)}>
            <option>Buy</option><option>Rent</option>
          </select>
        </label>
        <label className="search-field">
          <span>Maximum budget (KSh)</span>
          <input type="number" min="0" inputMode="numeric" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Any budget" />
        </label>
        <button className="search-button" type="submit" disabled={isSearching}>{isSearching ? "Searching…" : "Search properties"} {!isSearching && <ArrowRight size={16} />}</button>
      </form>
      {searched && <div className="search-results" role="status" aria-live="polite">
        <div className="search-results-toolbar"><span>{searchError ? "Search unavailable" : isSearching ? "Searching" : `${results.length} ${results.length === 1 ? "match" : "matches"}`}</span><button type="button" onClick={clearSearch}><X size={14} /> Clear search</button></div>
        {searchError ? <p className="search-result">{searchError}</p> : isSearching ? <p className="search-result">Searching published listings…</p> : results.length ? <div className="search-result-list"><PropertyGrid properties={results} /></div> : <p className="search-result">No published listings match those filters yet. <a href="#contact">Ask LYX Group about current opportunities.</a></p>}
      </div>}
    </div>
  );
}

function PropertyPhoto({ property }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = property.image_urls?.[0];
  const detailsUrl = `/property/${encodeURIComponent(property.slug)}`;

  return <a className="listing-photo" href={detailsUrl} aria-label={`View ${property.title}`}>
    {imageUrl && !imageFailed ? <img src={imageUrl} alt={property.title} loading="lazy" onError={() => setImageFailed(true)} /> : <div className="listing-photo-fallback" role="img" aria-label="No property photo available"><Building2 size={28} strokeWidth={1.1} /></div>}
  </a>;
}

function PropertyGrid({ properties }) {
  return <div className="listing-grid">{properties.map((property) => {
    const location = [property.area, property.city].filter(Boolean).join(", ");
    const price = property.price_ksh == null ? "Price on request" : `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(property.price_ksh)}`;
    const facts = [property.bedrooms != null && `${property.bedrooms} beds`, property.bathrooms != null && `${property.bathrooms} baths`, property.floor_area_sqm != null && `${property.floor_area_sqm} m²`].filter(Boolean);
    return <article className="listing-card" key={property.id}>
      <PropertyPhoto property={property} />
      <div className="listing-card-copy">
        <span className="listing-tag">{property.transaction_type === "rent" ? "FOR RENT" : "FOR SALE"}</span>
        <h3><a href={`/property/${encodeURIComponent(property.slug)}`}>{property.title}</a></h3>
        {location && <p className="listing-location"><MapPin size={13} /> {location}</p>}
        <p className="listing-price">{price}</p>
        {facts.length > 0 && <p className="listing-facts">{facts.join("  ·  ")}</p>}
        <a href={`/property/${encodeURIComponent(property.slug)}`}>View property details <ArrowUpRight size={14} /></a>
      </div>
    </article>;
  })}</div>;
}

function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getFeaturedProperties()
      .then((items) => { if (active) setProperties(items); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (properties.length) return <PropertyGrid properties={properties} />;

  return <div className="inventory-empty">
    <span className="empty-mark"><Building2 size={24} strokeWidth={1.2} /></span>
    <p className="luxury-kicker">OUR COLLECTION</p>
    <h3>{loading ? "Loading featured properties…" : error ? "Property listings are not connected yet." : "New opportunities are being prepared."}</h3>
    <p>{loading ? "Checking for published listings." : error || "No featured property records have been published. Contact our team to discuss current availability."}</p>
    <a className="text-link" href="#contact">Enquire with LYX Group <ArrowRight size={16} /></a>
  </div>;
}

const benefits = [
  { icon: ShieldCheck, title: "Professional Property Guidance", text: "Clear support to help you make informed property decisions." },
  { icon: Sparkles, title: "Carefully Presented Opportunities", text: "A considered approach to the homes, spaces, and projects we share." },
  { icon: Home, title: "Support for Every Move", text: "Guidance for buyers, sellers, tenants, and landlords." },
  { icon: Ruler, title: "Property Investment Assistance", text: "Thoughtful support as you explore property investment options." },
];

const impactStats = [
  { value: 1000, suffix: "+", label: "Properties facilitated", icon: Building2 },
  { value: 3000, suffix: "+", label: "Happy clients", icon: Home },
  { value: 50, suffix: "+", label: "Land deals", icon: MapPin },
  { value: 10, suffix: "", label: "Years experience", icon: ShieldCheck },
];

function ImpactCounter({ target, suffix }) {
  const [count, setCount] = useState(1);
  const counterRef = useRef(null);

  useEffect(() => {
    const element = counterRef.current;
    if (!element) return undefined;

    let frameId;
    let started = false;
    const animate = () => {
      if (started) return;
      started = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCount(target);
        return;
      }

      const duration = 1800;
      let startTime;
      const tick = (now) => {
        if (startTime === undefined) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - (1 - progress) ** 4;
        setCount(progress === 1 ? target : Math.max(1, Math.floor(1 + (target - 1) * eased)));
        if (progress < 1) frameId = window.requestAnimationFrame(tick);
      };
      frameId = window.requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      animate();
      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animate();
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [target]);

  return <strong ref={counterRef} aria-label={`${new Intl.NumberFormat("en-US").format(target)}${suffix}`}>{new Intl.NumberFormat("en-US").format(count)}{suffix}</strong>;
}

export default function HomePage() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (video.paused) video.play().catch(() => {});
  }

  return (
    <div className="site luxury-site">
      <header className="navbar">
        <a className="logo" href="#home" aria-label="LYX Group home"><img src={logo} alt="" /><span>LYX GROUP</span></a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <details className="nav-dropdown"><summary>Buy</summary><div className="dropdown-menu"><a href="/buy/commercial" onClick={() => setMenuOpen(false)}>Commercial</a><a href="/buy/residential" onClick={() => setMenuOpen(false)}>Residential</a><a href="/buy/off-plan" onClick={() => setMenuOpen(false)}>Off-plan</a><a href="/buy/land" onClick={() => setMenuOpen(false)}>Land &amp; Plots</a></div></details>
          <a href="/holiday-homes" onClick={() => setMenuOpen(false)}>Holiday Homes</a>
          <a href="/rent" onClick={() => setMenuOpen(false)}>Rent</a>
          <a href="/valuation" onClick={() => setMenuOpen(false)}>Valuation</a>
          <a href="/testimonials" onClick={() => setMenuOpen(false)}>Testimonials</a>
          <details className="nav-dropdown"><summary>Resources</summary><div className="dropdown-menu"><a href="/resources/blog" onClick={() => setMenuOpen(false)}>Blog</a><a href="/resources/faq" onClick={() => setMenuOpen(false)}>FAQ</a></div></details>
        </nav>
        <a className="nav-contact" href="https://wa.me/254741246659?text=Hi%20LYX%20Group%2C%20I%27d%20like%20to%20talk%20about%20a%20property." target="_blank" rel="noreferrer">Let's Talk <ArrowUpRight size={16} /></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>
      <section className="luxury-hero" id="home">
        <video ref={videoRef} className="hero-video" autoPlay muted={muted} loop playsInline preload="metadata" onCanPlay={(event) => event.currentTarget.play().catch(() => {})} aria-hidden="true">
          <source src="/house-tour.mp4" type="video/mp4" />
        </video>
        <div className="luxury-hero-shade" />

        <div className="luxury-hero-content">
          <p className="luxury-eyebrow"><span /> PROPERTY & INVESTMENT · KENYA</p>
          <h1>Discover Exceptional Properties.<br /><em>Invest in Your Future.</em></h1>
          <p className="luxury-hero-copy">Explore premium homes, commercial spaces, and exclusive property investment opportunities across Kenya with LYX Group.</p>
          <div className="luxury-hero-actions">
            <a className="button-gold" href="#categories">Explore Properties <ArrowRight size={16} /></a>
            <a className="button-outline-light" href="#contact">Talk to an Expert <ArrowUpRight size={16} /></a>
          </div>
          <div className="hero-trust-badges" aria-label="What you can expect from LYX Group">
            <span className="hero-trust-badge hero-trust-experts"><ShieldCheck size={20} strokeWidth={2.1} aria-hidden="true" />Trusted Experts</span>
            <span className="hero-trust-badge hero-trust-rated"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z" /></svg>5-Star Rated</span>
            <span className="hero-trust-badge hero-trust-client"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 4.1-8.8 10-8.8 10s-8.8-5.9-8.8-10a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" /></svg>Client-Focused</span>
          </div>
        </div>

        <button className="sound-toggle luxury-sound" onClick={toggleSound} aria-label={muted ? "Turn video sound on" : "Mute video"}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}{muted ? "SOUND OFF" : "SOUND ON"}
        </button>
        <a className="luxury-scroll" href="#categories"><span><ArrowDown size={15} /></span> DISCOVER MORE</a>
        <span className="hero-established">ESTABLISHED 2015</span>
        <PropertySearch />
      </section>

      <section className="luxury-section categories-section" id="categories">
        <div className="section-heading">
          <p className="luxury-kicker">FIND YOUR PLACE</p>
          <h2>Explore Our Properties</h2>
          <p>Find the right property for your lifestyle, business, or investment goals.</p>
        </div>
        <div className="category-grid">
          {propertyTypes.map(({ name, icon: Icon, href, detail, image }, index) => (
            <a className={`category-card category-card-${index + 1}`} href={href} key={name}>
              <div className="category-art"><img className="category-art-image" src={image} alt="" aria-hidden="true" onLoad={(event) => event.currentTarget.parentElement.classList.add("has-image")} onError={(event) => event.currentTarget.remove()} /><span className="category-art-index">0{index + 1}</span><Icon size={36} strokeWidth={1.15} /><span className="category-art-line" /></div>
              <div className="category-card-copy"><div><h3>{name}</h3><p>{detail}</p></div><span className="category-arrow"><ArrowUpRight size={17} /></span></div>
            </a>
          ))}
        </div>
      </section>

      <section className="impact-section" aria-labelledby="impact-title">
        <div className="impact-heading">
          <span className="impact-pill">OUR IMPACT</span>
          <h2 id="impact-title">Numbers That <em>Speak</em></h2>
          <p>Experience and relationships built one property journey at a time.</p>
        </div>
        <div className="impact-grid">
          {impactStats.map(({ value, suffix, label, icon: Icon }, index) => (
            <article className="impact-card" key={label} style={{ "--impact-index": index }}>
              <span className="impact-icon"><Icon size={29} strokeWidth={1.8} aria-hidden="true" /></span>
              <ImpactCounter target={value} suffix={suffix} />
              <span className="impact-label">{label}</span>
              <span className="impact-card-index" aria-hidden="true">0{index + 1}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="luxury-section featured-section" id="featured">
        <div className="section-heading section-heading-row">
          <div><p className="luxury-kicker">A CURATED SELECTION</p><h2>Featured Properties</h2><p>Discover selected properties and opportunities worth exploring.</p></div>
          <a className="text-link" href="#categories">Browse categories <ArrowRight size={16} /></a>
        </div>
        <FeaturedProperties />
      </section>

      <section className="development-band">
        <div className="development-copy"><p className="luxury-kicker">THE NEXT CHAPTER</p><h2>Featured Developments &amp; Investment</h2><p>Explore opportunities with the right guidance, from new developments to long-term property investments.</p><a className="button-gold" href="/buy/off-plan">Explore Off-plan <ArrowUpRight size={16} /></a></div>
        <div className="development-art"><img className="development-art-image" src="/images/featured-development.jpeg" alt="Modern high-rise apartment development at dusk" /><span className="development-art-caption">LYX GROUP · KENYA</span></div>
      </section>

      <section className="luxury-section why-section" id="services">
        <div className="section-heading"><p className="luxury-kicker">THE LYX APPROACH</p><h2>Why Choose LYX Group?</h2><p>Thoughtful real estate guidance, shaped around your goals.</p></div>
        <div className="benefit-grid">{benefits.map(({ icon: Icon, title, text }, index) => <article className="benefit-card" key={title}><span className="benefit-number">0{index + 1}</span><Icon size={26} strokeWidth={1.2} /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="about-band" id="about">
        <div className="about-art" role="img" aria-label="LYX Group gold logo on a black background">
          <img className="about-art-logo" src={logo} alt="LYX Group logo" />
        </div>
        <div className="about-copy"><p className="luxury-kicker">ABOUT LYX GROUP</p><h2>Your Trusted Partner in Real Estate</h2><p>LYX Group helps clients explore property opportunities, from residential homes and commercial spaces to land and developments.</p><a className="text-link" href="/about">Learn More <ArrowRight size={16} /></a></div>
      </section>

      <section className="luxury-section insights-empty">
        <div className="section-heading"><p className="luxury-kicker">THE LYX JOURNAL</p><h2>Insights for Smarter Property Decisions</h2><p>Practical perspectives for your next property move.</p></div>
        <div className="journal-empty"><Sparkles size={22} strokeWidth={1.25} /><p>Property insights will be shared here as they become available.</p><a className="text-link" href="/resources/blog">Visit Resources <ArrowRight size={16} /></a></div>
      </section>

      <section className="contact-cta" id="contact">
        <p className="luxury-kicker">LET'S FIND THE RIGHT OPPORTUNITY</p>
        <h2>Find Your Next Property<br /><em>with LYX Group.</em></h2>
        <p>Whether you're buying, renting, selling, or exploring investment opportunities, our team is ready to assist.</p>
        <div className="contact-cta-actions"><a className="button-gold" href="/contact">Contact Us <ArrowUpRight size={16} /></a><a className="contact-email" href="mailto:lyxrealtygroup@gmail.com">lyxrealtygroup@gmail.com</a></div>
      </section>

      <footer className="luxury-footer">
        <a className="logo" href="#home" aria-label="LYX Group home"><img src={logo} alt="" /><span>LYX GROUP</span></a>
        <p>Thoughtful guidance for every property move.</p>
        <SocialLinks className="footer-social-links" />
        <span className="footer-copyright">LYX GROUP © 2026 · EST. 2015 <span aria-hidden="true">·</span> <a className="footer-credit" href="https://mktechsoln.vercel.app/" target="_blank" rel="noreferrer">Made by MKtech Solution</a></span>
      </footer>
    </div>
  );
}
