import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import InteriorLayout from "./InteriorLayout";
import { getPublishedArticle, getPublishedArticles } from "../lib/supabase";
import useSeo from "../lib/useSeo";
import "../Blog.css";

function ArticleBody({ content }) {
  const blocks = (content || "").trim().split(/\n\s*\n/).filter(Boolean);
  return <div className="blog-article-body">{blocks.map((block, index) => {
    const lines = block.split("\n");
    const text = lines.join(" ").trim();
    if (lines[0].startsWith("## ")) return <h2 key={index}>{lines[0].slice(3)}{lines.length > 1 ? ` ${lines.slice(1).join(" ")}` : ""}</h2>;
    if (lines[0].startsWith("# ")) return <h2 key={index}>{lines[0].slice(2)}{lines.length > 1 ? ` ${lines.slice(1).join(" ")}` : ""}</h2>;
    if (lines.every((line) => line.startsWith("- "))) return <ul key={index}>{lines.map((line, itemIndex) => <li key={itemIndex}>{line.slice(2)}</li>)}</ul>;
    return <p key={index}>{text}</p>;
  })}</div>;
}

export default function Blog({ slug }) {
  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useSeo(slug ? article ? {
    title: `${article.title} | LYX Journal | LYX Group`,
    description: article.excerpt || `Property insights from LYX Group: ${article.title}`,
    path: `/resources/blog/${encodeURIComponent(article.slug)}`,
    type: "article",
    image: article.cover_image_url || undefined,
    pageSchema: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.excerpt || `Property insights from LYX Group: ${article.title}`,
      datePublished: article.published_at || undefined,
      image: article.cover_image_url || undefined,
      mainEntityOfPage: typeof window !== "undefined" ? window.location.href : undefined,
      author: { "@type": "Organization", name: "LYX Group" },
      publisher: { "@type": "Organization", name: "LYX Group" },
    },
  } : {
    title: "Article unavailable | LYX Journal | LYX Group",
    description: "This article is not available. Browse the LYX Group property journal for more insights.",
    noindex: true,
  } : null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const request = slug ? getPublishedArticle(slug) : getPublishedArticles();
    request.then((result) => {
      if (!active) return;
      if (slug) setArticle(result);
      else setArticles(result || []);
    }).catch((caught) => {
      if (active) setError(caught.message || "Articles are unavailable right now.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (slug) return (
    <InteriorLayout eyebrow="LYX JOURNAL" title={article?.title || (loading ? "Loading article…" : "Article unavailable")} description={article?.excerpt || "Ideas and guidance from the LYX Group team."}>
      {error ? <div className="interior-note">{error}</div> : loading ? <div className="interior-note">Loading this article…</div> : !article ? <div className="interior-note">This article is not available. <a href="/resources/blog">Browse the LYX Journal.</a></div> : <article className="blog-article">
        {article.cover_image_url && <img className="blog-article-cover" src={article.cover_image_url} alt={`Cover image for ${article.title}`} decoding="async" />}
        {article.published_at && <p className="blog-article-date">{new Date(article.published_at).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</p>}
        <ArticleBody content={article.body_markdown} />
      </article>}
    </InteriorLayout>
  );

  return (
    <InteriorLayout eyebrow="LYX JOURNAL" title="Ideas for your next property move." description="Practical perspectives on buying, renting, investing, and making confident property decisions.">
      {error ? <div className="interior-note">{error}</div> : loading ? <div className="interior-note">Loading the latest articles…</div> : articles.length ? <div className="blog-list">{articles.map((item) => <article className="blog-card" key={item.id}>
        {item.cover_image_url && <a href={`/resources/blog/${encodeURIComponent(item.slug)}`}><img src={item.cover_image_url} alt={`Cover image for ${item.title}`} loading="lazy" decoding="async" /></a>}
        <div><span className="blog-article-date">{item.published_at && new Date(item.published_at).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</span><h2><a href={`/resources/blog/${encodeURIComponent(item.slug)}`}>{item.title}</a></h2><p>{item.excerpt}</p><a className="blog-read-more" href={`/resources/blog/${encodeURIComponent(item.slug)}`}>Read article <ArrowRight size={15} /></a></div>
      </article>)}</div> : <div className="interior-note">More insights coming soon.</div>}
    </InteriorLayout>
  );
}
