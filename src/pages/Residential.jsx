import PropertyCollection from "./PropertyCollection";

export default function Residential() {
  return <PropertyCollection 
    eyebrow="BUY PROPERTY" 
    title="Residential Properties" 
    description="Explore homes for today and ongoing developments for the future." 
    propertyType="residential" 
    transactionType="sale" 
    collectionTitle="Residential properties" 
    emptyLabel="residential properties" 
    allowFilter={true} 
    seoTitle="Residential Properties for Sale in Kenya | LYX Group"
    seoDescription="Browse our collection of residential homes and apartments for sale in Nairobi, Kenya. Find your dream home in Kileleshwa, Westlands, and more."
  />;
}