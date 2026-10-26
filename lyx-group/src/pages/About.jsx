import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Eye,
  Handshake,
  House,
  MapPinned,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import InteriorLayout from "./InteriorLayout";
import "../About.css";

const principles = [
  {
    icon: Target,
    label: "OUR MISSION",
    title: "Make property investment simple, intelligent, and trustworthy.",
    text: "We combine rigorous property selection, transparent guidance, and end-to-end support — from your first conversation to handover and beyond.",
  },
  {
    icon: Eye,
    label: "OUR VISION",
    title: "Become Kenya's most trusted property partner.",
    text: "A one-stop destination for buyers, renters, and investors seeking clarity, quality, and long-term value across the Kenyan property market.",
  },
  {
    icon: ShieldCheck,
    label: "OUR VALUES",
    title: "Trust comes first.",
    text: "We only recommend opportunities we would consider ourselves. We use technology to enhance — not replace — human guidance, because informed clients make better decisions.",
  },
  {
    icon: Users,
    label: "OUR RESOURCES",
    title: "People, partners, and process.",
    text: "We work with vetted developers, trusted legal professionals, and experienced property managers — so every transaction is guided, monitored, and protected from start to finish.",
  },
];

const services = [
  { icon: House, title: "Residential property", text: "Explore homes, apartments, and residential opportunities around your needs.", href: "/buy/residential" },
  { icon: Building2, title: "Commercial property", text: "Find commercial spaces and property opportunities for business or investment.", href: "/buy/commercial" },
  { icon: MapPinned, title: "Land and developments", text: "Discover land and off-plan opportunities, with clear information for your next step.", href: "/buy/land" },
];

const teamMembers = [
  {
    name: "LYX Group CEO",
    role: "Chief Executive Officer",
    photo: "/team/ceo.jpeg",
  },
  {
    name: "LYX Group Marketing",
    role: "Head of Marketing",
    photo: "/team/head-of-marketing.jpeg",
  },
];

export default function About() {
  return (
    <InteriorLayout
      eyebrow="ABOUT LYX GROUP - ESTABLISHED 2015"
      title="A clearer way to find your place."
      description="LYX Group is a prominent Kenyan real estate company known for its innovation, integrity, and commitment to excellence. Since 2015, we have grown into a trusted name in residential, commercial, and investment property."
      action="Talk to our team"
    >
      <section className="about-page-intro">
        <p className="about-page-label">PROPERTY, WITH PEOPLE IN MIND</p>
        <h2>Good property decisions start with the right conversation.</h2>
        <p>
          LYX Group is a Kenyan real estate company focused on helping people find and evaluate property
          opportunities. Since 2015, our goal has been to make each step clearer through thoughtful
          service and useful information.
        </p>
        <p>
          Every search has a different goal. We take time to understand what matters to you, share
          relevant options, and help you move through the process with more clarity.
        </p>
      </section>

      <section className="about-page-services" aria-labelledby="about-principles-title">
        <div className="about-page-section-heading">
          <p className="about-page-label">WHAT GUIDES US</p>
          <h2 id="about-principles-title">Our mission, vision, and values.</h2>
        </div>
        <div className="about-page-card-grid">
          {principles.map(({ icon: Icon, label, title, text }) => (
            <article className="about-page-card" key={label}>
              <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
              <p className="about-page-label">{label}</p>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page-team" aria-labelledby="about-team-title">
        <div className="about-page-section-heading">
          <p className="about-page-label">THE PEOPLE BEHIND LYX</p>
          <h2 id="about-team-title">Meet the team.</h2>
        </div>
        <figure className="about-page-team-feature">
          <img src="/team/lyx-team.jpeg" alt="The LYX Group team together in their office" loading="lazy" decoding="async" />
          <figcaption><span>LYX GROUP</span><strong>People who make every move matter.</strong></figcaption>
        </figure>
        {teamMembers.length ? (
          <div className="about-page-team-grid">
            {teamMembers.map(({ name, role, bio, photo }) => (
              <article className="about-page-team-card" key={name}>
                <div className="about-page-team-photo">
                  {photo ? <img src={photo} alt={name} loading="lazy" /> : <div className="about-page-team-initials" aria-hidden="true">{name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div>}
                </div>
                <h3>{name}</h3>
                <p className="about-page-team-role">{role}</p>
                {bio && <p className="about-page-team-bio">{bio}</p>}
              </article>
            ))}
          </div>
        ) : (
          <div className="about-page-team-empty">
            <Users size={24} strokeWidth={1.4} aria-hidden="true" />
            <div>
              <h3>Our team profiles are coming soon.</h3>
              <p>We will introduce the people who help clients make their next move here.</p>
            </div>
          </div>
        )}
      </section>

      <section className="about-page-services" aria-labelledby="about-services-title">
        <div className="about-page-section-heading">
          <p className="about-page-label">ONE-STOP PROPERTY SHOP</p>
          <h2 id="about-services-title">Real estate for your next move.</h2>
        </div>
        <div className="about-page-service-grid">
          {services.map(({ icon: Icon, title, text, href }) => (
            <article className="about-page-card" key={title}>
              <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
              <a href={href}>Explore {title.toLowerCase()} <ArrowRight size={15} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page-promise">
        <Handshake size={24} strokeWidth={1.4} aria-hidden="true" />
        <div>
          <p className="about-page-label">OUR APPROACH</p>
          <h2>Clear guidance. Thoughtful service.</h2>
          <p>We aim to make each step easier to understand, from narrowing down the options to arranging a conversation about a property.</p>
        </div>
      </section>

      <section className="about-page-talk" aria-labelledby="about-talk-title">
        <div>
          <p className="about-page-label">READY WHEN YOU ARE</p>
          <h2 id="about-talk-title">Let's talk about your next property move.</h2>
          <p>Whether you are buying, renting, selling, or exploring investment opportunities, our team is ready to help.</p>
        </div>
        <a className="about-page-contact" href="/contact">
          Contact the team <ArrowUpRight size={16} />
        </a>
      </section>
    </InteriorLayout>
  );
}
