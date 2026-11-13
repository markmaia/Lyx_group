import { createContext, useContext, useMemo, useState } from "react";

const CurrencyContext = createContext(null);
const STORAGE_KEY = "lyx-display-currency";
const KES_PER_USD = 130;

function readCurrency() {
  try { return localStorage.getItem(STORAGE_KEY) === "USD" ? "USD" : "KES"; }
  catch { return "KES"; }
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(readCurrency);

  function setCurrency(nextCurrency) {
    if (nextCurrency !== "KES" && nextCurrency !== "USD") return;
    setCurrencyState(nextCurrency);
    try { localStorage.setItem(STORAGE_KEY, nextCurrency); } catch { /* Storage may be disabled. */ }
  }

  const value = useMemo(() => ({
    currency,
    setCurrency,
    formatPrice(amountKes) {
      if (amountKes == null || !Number.isFinite(Number(amountKes))) return "Price on request";
      if (currency === "USD") {
        const amountUsd = Number(amountKes) / KES_PER_USD;
        return `USD ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amountUsd)}`;
      }
      return `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Number(amountKes))}`;
    },
  }), [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="currency-toggle" role="group" aria-label="Display prices in">
      {["KES", "USD"].map((option) => (
        <button key={option} type="button" className={currency === option ? "active" : ""} aria-pressed={currency === option} onClick={() => setCurrency(option)} title={option === "USD" ? "Converted at 1 USD = 130 KES" : "Display prices in Kenyan shillings"}>
          {option}
        </button>
      ))}
    </div>
  );
}
