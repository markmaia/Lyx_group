import InteriorLayout from "./InteriorLayout";

const faqGroups = [
  {
    title: "Ownership & Legalities",
    items: [
      {
        q: "Why should I work with LYX Group instead of other agencies?",
        a: "LYX Group is built on trust, professionalism, and a commitment to delivering value-driven property decisions. We research the market carefully and conduct due diligence on every property we present, so that what you see is strategically located, legally compliant, and positioned for long-term value.",
      },
      {
        q: "What are the requirements for a foreigner to own real estate in Kenya?",
        a: "To own real estate in Kenya as a foreigner, you will need a valid passport, a Kenyan tax ID known as a KRA PIN (obtained during the transaction with the help of our lawyers), and sufficient funds or financing to complete the purchase. Foreigners typically acquire property on a leasehold basis rather than freehold.",
      },
      {
        q: "What taxes are involved in owning property in Kenya?",
        a: "If you rent out your property, you are subject to rental income tax of 7.5% monthly on the gross income generated. This is an income tax, not a property tax. Other costs — such as land rates and service charges — depend on the property and its location.",
      },
    ],
  },
  {
    title: "Property Types & Terms",
    items: [
      {
        q: "What is the difference between freehold and leasehold properties?",
        a: "Freehold ownership gives permanent and absolute control over the property. Leasehold ownership grants the right to use the property for a specific period, subject to the terms of the lease agreement. Freehold is generally only available to Kenyan citizens. Foreigners can own land in Kenya on a leasehold basis for up to 99 years, which is renewable.",
      },
      {
        q: "Are foreigners allowed to own real estate in Kenya?",
        a: "Yes. Kenya welcomes foreign investors. Foreigners can own property on a leasehold basis (up to 99 years, renewable), and can also own units in sectional-title developments such as apartments and gated communities.",
      },
    ],
  },
  {
    title: "Buying Process & Procedures",
    items: [
      {
        q: "Can you break down the buying process for a property in Kenya?",
        a: "Buying a property in Kenya typically follows these steps: (1) Engage a reputable agent to identify a property that matches your needs. (2) The agent connects you with the developer or owner, who prepares an offer letter outlining the terms of the purchase. (3) The offer letter — valid for about 7 days — is accompanied by documents such as the title deed, company registration, property search, and NEMA approvals. (4) You conduct due diligence during that window. (5) You sign the offer letter and pay a deposit, typically 20–30% of the property value. (6) You agree a payment schedule — monthly, quarterly, or every six months — aligned with the project completion period. (7) The developer prepares a legally binding sale agreement, which you sign and return. (8) On completion and full payment, the unit is handed over, and you receive a sectional title as proof of ownership.",
      },
      {
        q: "What are the closing costs involved in a property purchase?",
        a: "Closing costs in Kenya typically include: standard legal fees of around 1% of the property value; stamp duty of 2–4% depending on whether the property is urban or rural; and additional charges such as six months of service charges, transfer and registration of title, formation of a management company, and installation of electric and water meters. In total, closing costs usually amount to approximately 6% of the property value, and should be factored into your budget.",
      },
      {
        q: "What documentation or proof do I receive to confirm ownership?",
        a: "On purchase, you receive a sectional title under the Sectional Properties Act of 2015. This confirms ownership of your specific unit and shared ownership of communal areas such as swimming pools, gardens, and access roads in apartment complexes or gated communities.",
      },
      {
        q: "After buying a unit, do you offer property management services?",
        a: "Yes. We offer property management through trusted partners. Management fees typically range from 7% to 10% of the property's net income, depending on whether the property is furnished and on the level of service required.",
      },
    ],
  },
  {
    title: "Costs & Financing",
    items: [
      {
        q: "What payment options are available?",
        a: "In Nairobi, payment options typically include cash payable within 30–60 days, instalment plans of 24–30 months (some developers offer up to 5 years), and mortgage financing. Rent-to-own options also exist — you make a deposit and live in the unit while making monthly payments until ownership transfers — though this is still relatively uncommon in the market. The length of instalments usually depends on the project completion date.",
      },
      {
        q: "Can foreigners get financing for real estate investments in Kenya?",
        a: "Foreigners can qualify for a loan or mortgage in Kenya by demonstrating stable income or assets in the country — for example, local employment, an existing property, or a locally operating business that can serve as collateral. If those criteria are not met, it is often more practical to approach an international bank in your home country for financing. Eligibility and requirements vary between financial institutions.",
      },
      {
        q: "What is the average return on investment for properties in Kenya?",
        a: "Real estate in Kenya typically offers an average ROI of 9% to 20%, depending on factors such as size, location, and whether the property is furnished. Returns vary considerably by area and property type, so we advise evaluating any investment on its own merits rather than relying on averages alone.",
      },
      {
        q: "Can I make a down payment and start living in the property while paying it off?",
        a: "Ownership is generally transferred only after full payment. However, rent-to-own arrangements do exist — you make a deposit, live in the unit, and continue monthly payments until ownership transfers. This concept is still relatively new in Kenya and not widely adopted, so it should be assessed case by case.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <InteriorLayout
      eyebrow="RESOURCES"
      title="Frequently asked questions."
      description="A practical guide to rules, laws, and important information relating to buying, renting, and investing in property in Kenya."
    >
      <div style={{ maxWidth: 780 }}>
        {faqGroups.map((group) => (
          <section key={group.title} style={{ marginBottom: 42 }}>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 24,
                fontWeight: 500,
                color: "#0b2d1e",
                marginBottom: 14,
                paddingBottom: 10,
                borderBottom: "1px solid #bdc9bd",
              }}
            >
              {group.title}
            </h2>
            <div className="interior-faq">
              {group.items.map((item) => (
                <details className="faq-item" key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="interior-note">
          <strong>Still have a question?</strong>
          <p>
            Our team is happy to help with anything not covered here.{" "}
            <a href="/#contact" style={{ color: "#123f2b", fontWeight: 700 }}>
              Contact LYX Group
            </a>
            .
          </p>
        </div>
      </div>
    </InteriorLayout>
  );
}