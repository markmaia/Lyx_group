import HomePage from "./pages/HomePage";
import Commercial from "./pages/Commercial";
import Residential from "./pages/Residential";
import Land from "./pages/Land";
import HolidayHomes from "./pages/HolidayHomes";
import Rent from "./pages/Rent";
import Valuation from "./pages/Valuation";
import Testimonials from "./pages/Testimonials";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PropertyDetails from "./pages/PropertyDetails";
import International from "./pages/International";
import AreaGuide from "./pages/AreaGuide"; // <-- ADDED AREA GUIDE IMPORT
import WhatsAppBot from "./components/WhatsAppBot";
import { CurrencyProvider } from "./context/CurrencyContext";
import "./App.css";
import "./HomePage.css";

const routes = {
  "/admin": Admin,
  "/about": About,
  "/contact": Contact,
  "/international": International,
  "/buy/commercial": Commercial,
  "/buy/residential": Residential,
  "/buy/land": Land,
  "/holiday-homes": HolidayHomes,
  "/rent": Rent,
  "/valuation": Valuation,
  "/testimonials": Testimonials,
  "/resources/blog": Blog,
  "/resources/faq": FAQ,
};

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, "");
  
  // Match property URLs (e.g., /property/my-property)
  const propertyMatch = pathname.match(/^\/property\/([^/]+)$/);
  
  // Match area guide URLs (e.g., /areas/kileleshwa)
  const areaMatch = pathname.match(/^\/areas\/([^/]+)$/);

  const Page = routes[pathname];
  
  let content;
  if (propertyMatch) {
    content = <PropertyDetails slug={decodeURIComponent(propertyMatch[1])} />;
  } else if (areaMatch) {
    content = <AreaGuide slug={decodeURIComponent(areaMatch[1])} />;
  } else {
    content = Page ? <Page /> : <HomePage />;
  }

  return (
    <CurrencyProvider>
      {content}
      {pathname !== "/admin" && <WhatsAppBot />}
    </CurrencyProvider>
  );
}