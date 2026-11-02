import PropertyCollection from "./PropertyCollection";

export default function Residential() {
  return <PropertyCollection 
    eyebrow="BUY PROPERTY" 
    title="Residential" 
    description="Explore homes for today and ongoing developments for the future." 
    propertyType="residential" 
    transactionType="sale" 
    collectionTitle="Residential properties" 
    emptyLabel="residential properties" 
    allowFilter={true} 
  />;
}