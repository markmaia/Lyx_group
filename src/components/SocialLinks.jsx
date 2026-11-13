import "./SocialLinks.css";

const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/immaculate.karanja.75", path: "M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.3H7.7v3.1h2.7v8h3.1Z" },
  { name: "Instagram", href: "https://www.instagram.com/lyx_realty_group/", path: "M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10a4.2 4.2 0 0 1-4.2 4.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8Zm0 1.8A2.4 2.4 0 0 0 4.6 7v10A2.4 2.4 0 0 0 7 19.4h10a2.4 2.4 0 0 0 2.4-2.4V7A2.4 2.4 0 0 0 17 4.6H7Zm5 2.1a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6Zm0 1.8a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.5-2.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" },
  { name: "LinkedIn", href: "https://ke.linkedin.com/in/immaculate-karanja", path: "M5.2 8.4a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM3.7 10h3v10h-3V10Zm5 0h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.6V20h-3v-5c0-1.2 0-2.8-1.8-2.8s-2.1 1.3-2.1 2.7V20h-3V10Z" },
];

function BrandIcon({ path }) {
  return <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="currentColor"><path d={path} /></svg>;
}

function TikTokIcon() {
  return <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="currentColor"><path d="M19.6 7.2a6.4 6.4 0 0 1-3.8-1.3v8.2a6.1 6.1 0 1 1-5.3-6.1v3.2a2.9 2.9 0 1 0 2.1 2.8V1.5h3.2c.2 2 1.6 3.7 3.8 4.1v1.6Z" /></svg>;
}

export default function SocialLinks({ className = "" }) {
  return (
    <nav className={`social-links ${className}`} aria-label="Lyx Realty Group social media">
      {socialLinks.map(({ name, href, path }) => (
        <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={`Lyx Realty Group on ${name}`} title={name}>
          <BrandIcon path={path} />
        </a>
      ))}
      <a href="https://www.tiktok.com/@lyx.realty.group" target="_blank" rel="noreferrer" aria-label="Lyx Realty Group on TikTok" title="TikTok">
        <TikTokIcon />
      </a>
      <a href="mailto:lyxrealtygroup@gmail.com" aria-label="Email Lyx Realty Group at lyxrealtygroup@gmail.com" title="lyxrealtygroup@gmail.com">
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </a>
    </nav>
  );
}
