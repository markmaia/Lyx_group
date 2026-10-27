import { useEffect, useState } from "react";
import "./WhatsAppBot.css";

const PHONE = "254741246659";

const OPTIONS = [
  {
    label: "Buying a property",
    message: "Hi Lyx Realty Group, I'm interested in buying a property. Could you help me with available options?",
  },
  {
    label: "Looking to rent",
    message: "Hi Lyx Realty Group, I'm looking for a rental. Could you share what's currently available?",
  },
  {
    label: "Property valuation",
    message: "Hi Lyx Realty Group, I'd like to request a property valuation.",
  },
  {
    label: "Off-plan / investment",
    message: "Hi Lyx Realty Group, I'm interested in off-plan developments or investment opportunities.",
  },
  {
    label: "Talk to a person",
    message: "Hi Lyx Realty Group, I'd like to speak with someone about a property.",
  },
];

export function WhatsAppIcon({ size = 26 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M16.04 3C8.86 3 3.04 8.82 3.04 16c0 2.29.6 4.52 1.74 6.49L3 29l6.67-1.74A12.94 12.94 0 0 0 16.04 29C23.22 29 29.04 23.18 29.04 16S23.22 3 16.04 3zm0 23.7c-2.05 0-4.05-.55-5.79-1.58l-.42-.24-4.04 1.06 1.08-3.94-.27-.44A10.7 10.7 0 0 1 5.33 16c0-5.9 4.8-10.7 10.71-10.7 5.9 0 10.7 4.8 10.7 10.7s-4.8 10.7-10.7 10.7zm5.88-8.01c-.32-.16-1.9-.94-2.2-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37z" />
    </svg>
  );
}

export default function WhatsAppBot() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function openChat(message) {
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <>
      {open && (
        <button
          type="button"
          className="wa-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close WhatsApp chat"
        />
      )}

      <aside
        className={open ? "wa-bot open" : "wa-bot"}
        aria-label="Chat with Lyx Realty Group on WhatsApp"
        aria-hidden={!open}
      >
        <header className="wa-bot-header">
          <span className="wa-bot-avatar"><WhatsAppIcon size={22} /></span>
          <div>
            <strong>Lyx Realty Group</strong>
            <small>Typically replies within minutes</small>
          </div>
        </header>

        <div className="wa-bot-body">
          <p className="wa-bot-greeting">Hi 👋 Welcome to Lyx Realty Group. What can we help you with today?</p>
          <div className="wa-bot-options">
            {OPTIONS.map((option) => (
              <button key={option.label} type="button" className="wa-bot-option" onClick={() => openChat(option.message)}>
                {option.label}
              </button>
            ))}
          </div>
          <p className="wa-bot-footnote">Messages open in WhatsApp. We reply during business hours.</p>
        </div>
      </aside>

      <button
        type="button"
        className={open ? "wa-fab active" : "wa-fab"}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close WhatsApp chat" : "Chat with Lyx Realty Group on WhatsApp"}
        aria-expanded={open}
      >
        {open ? <span className="wa-fab-close" aria-hidden="true">✕</span> : <WhatsAppIcon size={28} />}
      </button>
    </>
  );
}
