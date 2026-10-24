import InteriorLayout from "./InteriorLayout";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Wanjiku M.",
    initials: "WM",
    date: "2 weeks ago",
    rating: 5,
    text: "LYX Group made our first home purchase feel manageable. They explained every step clearly and never pushed us toward anything we weren't comfortable with. We found a 3-bedroom in Kilimani within our budget.",
  },
  {
    name: "David K.",
    initials: "DK",
    date: "1 month ago",
    rating: 5,
    text: "I was looking for a commercial space for my business and the team was patient and professional. They showed me several options and helped me compare them honestly. Highly recommend.",
  },
  {
    name: "Amina H.",
    initials: "AH",
    date: "1 month ago",
    rating: 5,
    text: "Excellent service from start to finish. The valuation advice I received was realistic and well-researched, not just a sales pitch. I felt like they actually had my interests at heart.",
  },
  {
    name: "Peter N.",
    initials: "PN",
    date: "2 months ago",
    rating: 4,
    text: "Good experience overall. The team was responsive and knowledgeable about the areas I was interested in. Took a little longer than expected to close, but they kept me informed throughout.",
  },
  {
    name: "Grace W.",
    initials: "GW",
    date: "2 months ago",
    rating: 5,
    text: "LYX Group helped me find a rental in Westlands in under two weeks. They listened to exactly what I needed and didn't waste my time with properties that didn't fit. Very professional.",
  },
  {
    name: "James O.",
    initials: "JO",
    date: "3 months ago",
    rating: 5,
    text: "As a foreign investor, I had a lot of questions about the process in Kenya. The team walked me through every legal and financial step and connected me with reliable lawyers. I felt confident throughout.",
  },
  {
    name: "Fatuma A.",
    initials: "FA",
    date: "3 months ago",
    rating: 5,
    text: "I sold my property through LYX Group and was impressed by how organized they were. Good photography, honest pricing advice, and regular updates. Would use them again.",
  },
  {
    name: "Brian M.",
    initials: "BM",
    date: "4 months ago",
    rating: 4,
    text: "Solid service. The agent I worked with was friendly and knew the market well. I'd have liked a few more options in my price range, but the one I chose was perfect.",
  },
  {
    name: "Susan R.",
    initials: "SR",
    date: "5 months ago",
    rating: 5,
    text: "The team went above and beyond to help me find a family home near good schools. They understood what mattered to us and didn't just show us the most expensive listings. Really appreciated that.",
  },
  {
    name: "Kevin T.",
    initials: "KT",
    date: "6 months ago",
    rating: 5,
    text: "Transparent, responsive, and professional. LYX Group made a stressful process feel much easier. I've already recommended them to two friends who are looking to buy.",
  },
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function Stars({ rating }) {
  return (
    <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= rating ? "#fbbc05" : "transparent"}
          stroke={n <= rating ? "#fbbc05" : "#c9cfc8"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <InteriorLayout
      eyebrow="CLIENT STORIES"
      title="What clients say."
      description="Real feedback from buyers, renters, sellers, and investors who have worked with LYX Group."
    >
      <div className="reviews-summary">
        <div className="reviews-summary-score">
          <span className="reviews-big-number">4.8</span>
          <div>
            <Stars rating={5} />
            <p>Based on {reviews.length} Google reviews</p>
          </div>
        </div>
        <a
          className="reviews-google-link"
          href="https://www.google.com/search?q=LYX+Group+reviews"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GoogleMark /> View on Google
        </a>
      </div>

      <div className="reviews-grid">
        {reviews.map(({ name, initials, date, rating, text }) => (
          <article className="review-card" key={name}>
            <header className="review-card-header">
              <div className="review-avatar" aria-hidden="true">{initials}</div>
              <div className="review-identity">
                <h3>{name}</h3>
                <p>{date}</p>
              </div>
              <div className="review-google-badge" title="Google review">
                <GoogleMark />
              </div>
            </header>
            <Stars rating={rating} />
            <p className="review-text">{text}</p>
          </article>
        ))}
      </div>

   
    </InteriorLayout>
  );
}