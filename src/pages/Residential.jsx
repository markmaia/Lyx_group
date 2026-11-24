import { useEffect, useState } from "react";
import PropertyCollection from "./PropertyCollection";

export default function Residential() {
  const [initialStatus, setInitialStatus] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInitialStatus(params.get("status") || "all");
  }, []);

  const lockStatus = initialStatus !== "all";

  return <PropertyCollection 
    eyebrow="BUY PROPERTY" 
    title="Residential Properties" 
    description="Explore homes for today and ongoing developments for the future." 
    propertyType="residential" 
    transactionType="sale" 
    collectionTitle="Residential properties" 
    emptyLabel="residential properties" 
    allowFilter={true}
    initialStatus={initialStatus}
    lockStatus={lockStatus}
    seoTitle="Residential Properties for Sale in Kenya | LYX Group"
    seoDescription="Browse our collection of residential homes and apartments for sale in Nairobi, Kenya. Find your dream home in Kileleshwa, Westlands, and more."
  />;
}