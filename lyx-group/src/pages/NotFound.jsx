import InteriorLayout from "./InteriorLayout";
import useSeo from "../lib/useSeo";

export default function NotFound() {
  useSeo({
    title: "Page not found | Lyx Realty Group",
    description: "This page could not be found. Browse Lyx Realty Group property listings or contact our team.",
    noindex: true,
  });

  return (
    <InteriorLayout
      eyebrow="PAGE NOT FOUND"
      title="We couldn’t find that page."
      description="The page may have moved. Browse current property opportunities or contact our team for help."
    >
      <p><a href="/">Return to the Lyx Realty Group homepage</a></p>
      <p><a href="/buy/residential">Browse residential properties</a></p>
    </InteriorLayout>
  );
}
