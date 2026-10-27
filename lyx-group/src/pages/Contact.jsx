import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import InteriorLayout from "./InteriorLayout";
import "../Contact.css";
import { submitEnquiryRequest } from "../lib/supabase";
import { WhatsAppIcon } from "../components/WhatsAppBot";

function PhoneIcon({ size = 23 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.56 3.57.56.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.56 3.57a1 1 0 0 1-.25 1.02l-2.19 2.2z" /></svg>;
}

function EmailIcon({ size = 23 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v.4l10 6.25L22 6.4V6a2 2 0 0 0-2-2zM2 8.76V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.76l-9.47 5.92a1 1 0 0 1-1.06 0L2 8.76z" /></svg>;
}

const phoneNumber = "+254741246659";
const whatsappMessage = encodeURIComponent("Hi Lyx Realty Group, I'd like to speak with your team about a property.");

const contactMethods = [
  {
    title: "Call our team",
    detail: "+254 741 246 659",
    description: "Speak directly with our team about your property plans.",
    href: `tel:${phoneNumber}`,
    action: "Call now",
    Icon: PhoneIcon,
    iconTone: "phone",
  },
  {
    title: "Chat on WhatsApp",
    detail: "Message Lyx Realty Group",
    description: "Start a WhatsApp conversation about buying, renting, or investing.",
    href: `https://wa.me/${phoneNumber.replace("+", "")}?text=${whatsappMessage}`,
    action: "Message us",
    Icon: WhatsAppIcon,
    iconTone: "whatsapp",
    external: true,
  },
  {
    title: "Send us an email",
    detail: "lyxrealtygroup@gmail.com",
    description: "Email your questions or tell us what kind of property you are looking for.",
    href: "mailto:lyxrealtygroup@gmail.com",
    action: "Email us",
    Icon: EmailIcon,
    iconTone: "email",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", description: "", consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function updateForm(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await submitEnquiryRequest({
        enquiry_type: "general",
        contact_name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        message: form.description.trim(),
        consent_to_contact: form.consent,
      });
      setSent(true);
      setForm({ fullName: "", phone: "", email: "", description: "", consent: false });
    } catch (caught) {
      setError(caught.message || "We could not send your message. Please contact us by phone or WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <InteriorLayout
      eyebrow="GET IN TOUCH"
      title="Contact Lyx Realty Group"
      description="Tell us what you are looking for. Choose the easiest way to reach our team and we’ll be glad to help."
    >
      <section className="contact-method-grid" aria-label="Ways to contact Lyx Realty Group">
        {contactMethods.map(({ title, detail, description, href, action, Icon, external, iconTone }) => (
          <article className="contact-method-card" key={title}>
            <span className={`contact-method-icon contact-method-icon-${iconTone}`}><Icon size={21} strokeWidth={1.8} /></span>
            <h2>{title}</h2>
            <p className="contact-method-detail">{detail}</p>
            <p className="contact-method-description">{description}</p>
            <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
              {action} <ArrowUpRight size={15} />
            </a>
          </article>
        ))}
      </section>
      <section className="web-lead-section" aria-labelledby="web-lead-title">
        <div className="web-lead-intro">
          <p className="contact-form-kicker">WEB LEAD FORM</p>
          <h2 id="web-lead-title">Get in Touch</h2>
          <p><strong>Fill out this form and one of our property consultants will contact you shortly for a detailed consultation.</strong></p>
        </div>
        {sent && <p className="contact-form-success" role="status">Thank you. Your enquiry has been sent, and a property consultant will be in touch shortly.</p>}
        {error && <p className="contact-form-error" role="alert">{error}</p>}
        <form className="web-lead-form" onSubmit={submitForm}>
          <label>Full Name <span>*</span><input name="fullName" value={form.fullName} onChange={updateForm} autoComplete="name" required minLength={2} maxLength={120} /></label>
          <label>Phone <span>*</span><input name="phone" type="tel" value={form.phone} onChange={updateForm} autoComplete="tel" required maxLength={40} /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={updateForm} autoComplete="email" maxLength={254} /></label>
          <label className="web-lead-message">Description <span>*</span><textarea name="description" value={form.description} onChange={updateForm} required minLength={10} maxLength={5000} rows={5} /></label>
          <label className="web-lead-consent"><input name="consent" type="checkbox" checked={form.consent} onChange={updateForm} required /><span>I agree that Lyx Realty Group may contact me about this enquiry.</span></label>
          <button className="web-lead-submit" type="submit" disabled={busy}>{busy ? "Sending..." : "Send enquiry"} {!busy && <ArrowUpRight size={16} />}</button>
        </form>
      </section>
    </InteriorLayout>
  );
}
