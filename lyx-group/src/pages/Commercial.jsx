import PropertyCollection from "./PropertyCollection";

export default function Commercial() {
  return <PropertyCollection 
    eyebrow="COMMERCIAL PROPERTY" 
    title="Commercial spaces." 
    description="Find commercial spaces for your business, whether you are looking to buy or rent, ready to move or ongoing." 
    propertyType="commercial" 
    collectionTitle="Commercial property" 
    emptyLabel="commercial properties" 
    allowFilter={true} 
  />;
}