import HomePage from "./pages/HomePage";
import Commercial from "./pages/Commercial";
import Residential from "./pages/Residential";
import OffPlan from "./pages/OffPlan";
import Land from "./pages/Land";
import HolidayHomes from "./pages/HolidayHomes";
import Rent from "./pages/Rent";
import Valuation from "./pages/Valuation";
import Testimonials from "./pages/Testimonials";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import Admin from "./pages/Admin";
import About from "./pages/About";
import PropertyDetails from "./pages/PropertyDetails";
import { CurrencyProvider } from "./context/CurrencyContext";
import WhatsAppBot from "./components/WhatsAppBot";
import Contact from "./pages/Contact";
import "./App.css";
import "./HomePage.css";

const routes = {
  "/admin": Admin,
  "/about": About,
  "/contact": Contact,
  "/buy/commercial": Commercial,
  "/buy/residential": Residential,
  "/buy/off-plan": OffPlan,
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
  const propertyMatch = pathname.match(/^\/property\/([^/]+)$/);
  const articleMatch = pathname.match(/^\/resources\/blog\/([^/]+)$/);
  const Page = routes[pathname];
  const content = propertyMatch
    ? <PropertyDetails slug={decodeURIComponent(propertyMatch[1])} />
    : articleMatch ? <Blog slug={decodeURIComponent(articleMatch[1])} />
    : Page ? <Page /> : <HomePage />;
  return <CurrencyProvider>{content}<WhatsAppBot /></CurrencyProvider>;
}
