import logo from "../assets/lyx-original-logo.jpeg";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SocialLinks from "../components/SocialLinks";
import "../InteriorLayout.css";

export default function InteriorLayout({ eyebrow, title, description, children, action, headerAddon }) {
  return (
    <div className="site interior-page">
      <header className="inner-header">
        <a className="logo" href="/" aria-label="LYX Group home">
          <img src={logo} alt="LYX Group" />
          <span>LYX GROUP</span>
        </a>
        <nav className="inner-nav" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <details className="nav-dropdown">
            <summary>Buy</summary>
            <div className="dropdown-menu">
              <a href="/buy/commercial">Commercial</a>
              <a href="/buy/residential">Residential</a>
              <a href="/buy/off-plan">Off-plan</a>
              <a href="/buy/land">Land &amp; Plots</a>
            </div>
          </details>
          <a href="/holiday-homes">Holiday Homes</a>
          <a href="/rent">Rent</a>
          <a href="/valuation">Valuation</a>
          <a href="/testimonials">Testimonials</a>
          <details className="nav-dropdown">
            <summary>Resources</summary>
            <div className="dropdown-menu">
              <a href="/resources/blog">Blog</a>
              <a href="/resources/faq">FAQ</a>
            </div>
          </details>
        </nav>
        <a className="nav-contact" href="/#contact">Let's Talk <ArrowUpRight size={16} /></a>
      </header>
      <main className="interior-content">
        <p className="small-heading">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="interior-lead">{description}</p>
        {headerAddon}
        {children}
        {action && <a className="button-primary" href="/#contact">{action} <ArrowUpRight size={16} /></a>}
        <a className="interior-back" href="/"><ArrowRight size={16} /> Back to home</a>
      </main>
      <footer className="footer">
        <a className="logo" href="/" aria-label="LYX Group home"><img src={logo} alt="LYX Group" /><span>LYX GROUP</span></a>
        <p>Built for a new perspective.</p>
        <SocialLinks className="footer-social-links" />
        <a className="footer-credit" href="https://mktechsoln.vercel.app/" target="_blank" rel="noreferrer">Made by MKtech Solution</a>
      </footer>
    </div>
  );
}
