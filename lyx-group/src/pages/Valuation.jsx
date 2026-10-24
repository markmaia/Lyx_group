import { useEffect, useState } from "react";
import InteriorLayout from "./InteriorLayout";
import {
  getPriceGuides,
  getPriceGuide,
  submitValuationRequest,
} from "../lib/supabase";

const PROPERTY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial",  label: "Commercial" },
  { value: "land_plot",   label: "Land & Plots" },
  { value: "off_plan",    label: "Off-plan" },
];

function formatKsh(n) {
  return `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Math.round(n))}`;
}

export default function Valuation() {
  const [guides, setGuides] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    area_name: "",
    property_type: "residential",
    unit: "sqm",
    size: "",
    bedrooms: "",
    bathrooms: "",
    message: "",
  });
  const [estimate, setEstimate] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Load available areas once
  useEffect(() => {
    getPriceGuides()
      .then(setGuides)
      .catch(() => setGuides([]));
  }, []);

  const areaNames = Array.from(new Set(guides.map((g) => g.area_name))).sort();

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "area_name" || key === "property_type") setEstimate(null);
  }

  async function calculate() {
    setError("");
    setEstimate(null);

    const size = Number(form.size);
    if (!form.area_name) return setError("Choose an area.");
    if (!size || size <= 0) return setError("Enter a size greater than 0.");

    setBusy(true);
    try {
      const rows = await getPriceGuide({
        areaName: form.area_name,
        propertyType: form.property_type,
        unit: form.unit,
      });
      if (!rows.length) {
        setError(
          `We don't have a price guide for ${form.property_type.replace("_", " ")} in ${form.area_name}. Contact us for a manual valuation.`
        );
        return;
      }
      const perUnit = Number(rows[0].price_per_unit_ksh);
      const mid = perUnit * size;
      const low = mid * 0.9;
      const high = mid * 1.1;
      setEstimate({ low, mid, high, perUnit, size, unit: form.unit });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitRequest(e) {
    e.preventDefault();
    setError("");
    if (!estimate) return setError("Calculate your estimate first.");
    setBusy(true);
    try {
      await submitValuationRequest({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        area_name: form.area_name,
        property_type: form.property_type,
        unit: form.unit,
        size: Number(form.size),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        estimated_low_ksh: Math.round(estimate.low),
        estimated_mid_ksh: Math.round(estimate.mid),
        estimated_high_ksh: Math.round(estimate.high),
        message: form.message || null,
      });
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <InteriorLayout
      eyebrow="PROPERTY VALUATION"
      title="Understand your property's value."
      description="Get an instant indicative estimate based on current price guides, then request a full valuation from our team."
    >
      {done ? (
        <div className="interior-note">
          <strong>Thank you — your valuation request has been received.</strong>
          <p>Our team will review your details and contact you within one business day with a full valuation.</p>
        </div>
      ) : (
        <div style={{ maxWidth: 720 }}>
          {/* Section 1 — Calculate */}
          <h3 style={{ fontFamily: "Georgia, serif", marginBottom: 12 }}>1. Calculate an estimate</h3>
          <div className="admin-form-grid">
            <label>
              Area
              <select value={form.area_name} onChange={(e) => update("area_name", e.target.value)}>
                <option value="">Select an area</option>
                {areaNames.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
            <label>
              Property type
              <select value={form.property_type} onChange={(e) => update("property_type", e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label>
              Unit
              <select value={form.unit} onChange={(e) => update("unit", e.target.value)}>
                <option value="sqm">Square metres (m²)</option>
                <option value="acre">Acres</option>
              </select>
            </label>
            <label>
              Size
              <input type="number" min="0" step="0.01" value={form.size}
                onChange={(e) => update("size", e.target.value)}
                placeholder={form.unit === "acre" ? "e.g. 0.5" : "e.g. 250"} />
            </label>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="button-primary" type="button" onClick={calculate} disabled={busy}>
              {busy ? "Calculating…" : "Calculate estimate"}
            </button>
          </div>

          {estimate && (
            <div className="interior-note" style={{ marginTop: 24 }}>
              <strong>Indicative estimate: {formatKsh(estimate.low)} – {formatKsh(estimate.high)}</strong>
              <p>
                Midpoint: <b>{formatKsh(estimate.mid)}</b><br />
                Based on {formatKsh(estimate.perUnit)} per {estimate.unit === "acre" ? "acre" : "m²"} × {estimate.size} {estimate.unit}.
                This is a guide, not a formal valuation.
              </p>
            </div>
          )}

          {/* Section 2 — Request full valuation */}
          <h3 style={{ fontFamily: "Georgia, serif", margin: "36px 0 12px" }}>2. Request a full valuation</h3>
          <form onSubmit={submitRequest}>
            <div className="admin-form-grid">
              <label>
                Full name
                <input required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
              </label>
              <label>
                Email
                <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              </label>
              <label>
                Phone (optional)
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </label>
              <label>
                Bedrooms (optional)
                <input type="number" min="0" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
              </label>
              <label>
                Bathrooms (optional)
                <input type="number" min="0" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
              </label>
              <label className="admin-span-2">
                Message (optional)
                <textarea rows="3" value={form.message} onChange={(e) => update("message", e.target.value)}
                  placeholder="Anything else we should know about the property?" />
              </label>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="button-primary" type="submit" disabled={busy || !estimate}>
                {busy ? "Sending…" : "Request full valuation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </InteriorLayout>
  );
}