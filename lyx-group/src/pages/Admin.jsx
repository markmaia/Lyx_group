import { useEffect, useMemo, useState } from "react";
import "../Admin.css";
import "../AdminBlog.css";

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const bucket = "property-images";
const emptyForm = {
  title: "", slug: "", summary: "", description: "", property_type: "residential",
  transaction_type: "sale", status: "published", price_ksh: "", city: "Nairobi", area: "", image_urls: [],
  bedrooms: "", bathrooms: "", floor_area_sqm: "", land_area_sqm: "", featured: false,
};
const emptyArticleForm = { title: "", slug: "", excerpt: "", body_markdown: "", cover_image_url: "", status: "draft" };
const types = [
  ["residential", "Residential"], ["commercial", "Commercial"], ["off_plan", "Off-plan"],
  ["land_plot", "Land & plots"], ["rental", "Rental"], ["holiday_home", "Holiday home"], ["luxury", "Luxury"],
];
const fields = "id,slug,title,summary,description,property_type,transaction_type,status,price_ksh,city,area,bedrooms,bathrooms,floor_area_sqm,land_area_sqm,image_urls,featured,created_at";

function readSession() {
  try { return JSON.parse(sessionStorage.getItem("lyx-admin-session") || "null"); } catch { return null; }
}

async function request(path, { token, method = "GET", body, headers = {} } = {}) {
  const response = await fetch(`${projectUrl}${path}`, {
    method,
    headers: { apikey: publicKey, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    ...(body !== undefined ? { body: typeof body === "string" || body instanceof Blob ? body : JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error(data?.msg || data?.message || data?.error_description || data?.details || data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mapForm(record = emptyForm) {
  return Object.fromEntries(Object.entries(emptyForm).map(([key, fallback]) => [key, record[key] ?? fallback]));
}

function numericOrNull(value) {
  return value === "" ? null : Number(value);
}

function displayPrice(value) {
  return value == null ? "Price on request" : `KES ${Number(value).toLocaleString("en-KE")}`;
}

export default function Admin() {
  const [session, setSession] = useState(readSession);
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(() => Boolean(readSession() && projectUrl && publicKey));
  const [listings, setListings] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesError, setEnquiriesError] = useState("");
  const [articles, setArticles] = useState([]);
  const [articlesError, setArticlesError] = useState("");
  const [articleForm, setArticleForm] = useState(emptyArticleForm);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const publicImageCount = useMemo(() => listings.reduce((sum, item) => sum + (item.image_urls?.length || 0), 0), [listings]);
  const newValuations = useMemo(() => valuations.filter((v) => v.status === "new").length, [valuations]);
  const newEnquiries = useMemo(() => enquiries.filter((enquiry) => enquiry.status === "new").length, [enquiries]);

  function signOut(message = "") {
    sessionStorage.removeItem("lyx-admin-session");
    setSession(null); setUser(null); setAuthorized(false); setListings([]); setValuations([]); setEnquiries([]);
    setEnquiriesError("");
    setNotice(message); setChecking(false);
  }

  async function requestWithSession(path, options = {}, activeSession = session) {
    const currentSession = readSession() || activeSession;
    try {
      return await request(path, { ...options, token: currentSession.access_token });
    } catch (caught) {
      const expiredToken = /exp claim timestamp check failed|jwt expired|token is expired|invalid jwt/i.test(caught.message || "");
      const authRejected = caught.status === 401 || caught.status === 403;
      if ((!expiredToken && !authRejected) || !currentSession.refresh_token) throw caught;

      const refreshed = await request("/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        body: { refresh_token: currentSession.refresh_token },
        headers: { "Content-Type": "application/json" },
      });
      const nextSession = { access_token: refreshed.access_token, refresh_token: refreshed.refresh_token };
      sessionStorage.setItem("lyx-admin-session", JSON.stringify(nextSession));
      setSession(nextSession);

      return request(path, { ...options, token: nextSession.access_token });
    }
  }

  async function loadListings(activeSession) {
    const data = await requestWithSession(`/rest/v1/properties?select=${fields}&order=created_at.desc`, {}, activeSession);
    setListings(data || []);
  }

  async function loadValuations(activeSession) {
    const data = await requestWithSession(`/rest/v1/valuation_requests?select=*&order=created_at.desc`, {}, activeSession);
    setValuations(data || []);
  }

  async function loadEnquiries(activeSession) {
    const data = await requestWithSession(`/rest/v1/enquiries?select=*&order=created_at.desc`, {}, activeSession);
    setEnquiries(data || []);
    setEnquiriesError("");
  }

  async function loadArticles(activeSession) {
    const data = await requestWithSession("/rest/v1/articles?select=id,slug,title,excerpt,body_markdown,cover_image_url,status,published_at,created_at&order=created_at.desc", {}, activeSession);
    setArticles(data || []);
    setArticlesError("");
  }

  useEffect(() => {
    if (!session || !projectUrl || !publicKey) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = await requestWithSession("/auth/v1/user", {}, session);
        const activeSession = readSession() || session;
        const access = await requestWithSession(`/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(profile.id)}`, {}, activeSession);
        if (!access?.length) throw new Error("This account does not have admin access. Ask the project owner to add it to admin_users.");
        const latestSession = readSession() || activeSession;
        await loadListings(latestSession);
        await loadValuations(readSession() || latestSession);
        try { await loadEnquiries(readSession() || latestSession); }
        catch { if (!cancelled) setEnquiriesError("Apply the contact form migration to view new web enquiries here."); }
        try { await loadArticles(readSession() || latestSession); }
        catch { if (!cancelled) setArticlesError("Blog management is unavailable. Check that the articles table and admin policies are installed."); }
        if (!cancelled) { setUser(profile); setAuthorized(true); }
      } catch (caught) {
        if (!cancelled) signOut(caught.message || "Your sign-in has expired. Please sign in again.");
      } finally { if (!cancelled) setChecking(false); }
    })();
    return () => { cancelled = true; };
  }, [session]);

  async function signIn(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      if (!projectUrl || !publicKey) throw new Error("Supabase is not configured. Check the project URL and publishable key in .env.local.");
      const result = await request("/auth/v1/token?grant_type=password", {
        method: "POST", body: { email, password }, headers: { "Content-Type": "application/json" },
      });
      const nextSession = { access_token: result.access_token, refresh_token: result.refresh_token };
      sessionStorage.setItem("lyx-admin-session", JSON.stringify(nextSession));
      setSession(nextSession); setUser(result.user); setChecking(true);
    } catch (caught) { setError(caught.message || "Could not sign in. Check your email and password."); }
    finally { setBusy(false); }
  }

  function startNew() {
    setEditingId(null); setForm(emptyForm); setPhotos([]); setError(""); setNotice("");
    document.getElementById("listing-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function editListing(listing) {
    setEditingId(listing.id); setForm(mapForm(listing)); setPhotos([]); setError(""); setNotice("");
    document.getElementById("listing-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function uploadPhotos(existing) {
    const urls = [...existing];
    for (const photo of photos) {
      if (!photo.type.startsWith("image/")) throw new Error(`${photo.name} is not an image.`);
      if (photo.size > 5 * 1024 * 1024) throw new Error(`${photo.name} is larger than the 5 MB upload limit.`);
      const safeName = photo.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-|-$/g, "") || "photo";
      const objectPath = `${crypto.randomUUID()}-${safeName}`;
      await requestWithSession(`/storage/v1/object/${bucket}/${encodeURIComponent(objectPath)}`, {
        method: "POST", body: photo,
        headers: { "Content-Type": photo.type, "x-upsert": "false" },
      });
      urls.push(`${projectUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(objectPath)}`);
    }
    return urls;
  }

  async function saveListing(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const existing = listings.find((item) => item.id === editingId);
      const image_urls = await uploadPhotos(existing?.image_urls || []);
      const body = {
        ...form,
        slug: slugify(form.slug || form.title),
        price_ksh: numericOrNull(form.price_ksh),
        bedrooms: numericOrNull(form.bedrooms),
        bathrooms: numericOrNull(form.bathrooms),
        floor_area_sqm: numericOrNull(form.floor_area_sqm),
        land_area_sqm: numericOrNull(form.land_area_sqm),
        published_at: form.status === "published" ? (existing?.published_at || new Date().toISOString()) : null,
        image_urls,
      };
      delete body.id; delete body.created_at;
      if (!body.title.trim()) throw new Error("Enter a listing title.");
      if (!body.slug) throw new Error("Add a title that can be used to create a URL slug.");
      if (editingId) {
        await requestWithSession(`/rest/v1/properties?id=eq.${encodeURIComponent(editingId)}`, {
          method: "PATCH", body,
          headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        });
      } else {
        await requestWithSession("/rest/v1/properties", {
          method: "POST", body,
          headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        });
      }
      await loadListings(session); setNotice(editingId ? "Listing updated." : "Listing created.");
      setEditingId(null); setForm(emptyForm); setPhotos([]);
    } catch (caught) { setError(caught.message || "Could not save this listing."); }
    finally { setBusy(false); }
  }

  async function deleteListing(listing) {
    if (!window.confirm(`Delete “${listing.title}”? This cannot be undone.`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await requestWithSession(`/rest/v1/properties?id=eq.${encodeURIComponent(listing.id)}`, { method: "DELETE" });
      setListings((current) => current.filter((item) => item.id !== listing.id));
      if (editingId === listing.id) startNew();
      setNotice("Listing deleted.");
    } catch (caught) { setError(caught.message || "Could not delete the listing."); }
    finally { setBusy(false); }
  }

  async function updateValuationStatus(valuation, nextStatus) {
    setBusy(true); setError(""); setNotice("");
    try {
      await requestWithSession(`/rest/v1/valuation_requests?id=eq.${encodeURIComponent(valuation.id)}`, {
        method: "PATCH", body: { status: nextStatus },
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      });
      setValuations((current) => current.map((v) => v.id === valuation.id ? { ...v, status: nextStatus } : v));
      setNotice(`Valuation marked as ${nextStatus}.`);
    } catch (caught) { setError(caught.message || "Could not update the valuation."); }
    finally { setBusy(false); }
  }

  async function updateEnquiryStatus(enquiry, nextStatus) {
    setBusy(true); setError(""); setNotice("");
    try {
      await requestWithSession(`/rest/v1/enquiries?id=eq.${encodeURIComponent(enquiry.id)}`, {
        method: "PATCH", body: { status: nextStatus },
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      });
      setEnquiries((current) => current.map((item) => item.id === enquiry.id ? { ...item, status: nextStatus } : item));
      setNotice(`Enquiry marked as ${nextStatus.replace("_", " ")}.`);
    } catch (caught) { setError(caught.message || "Could not update the enquiry."); }
    finally { setBusy(false); }
  }

  function changeForm(key, value) {
    setForm((current) => ({ ...current, [key]: value, ...(key === "title" && !editingId ? { slug: slugify(value) } : {}) }));
  }

  function changeArticleForm(key, value) {
    setArticleForm((current) => ({ ...current, [key]: value, ...(key === "title" && !editingArticleId ? { slug: slugify(value) } : {}) }));
  }

  function startNewArticle() {
    setEditingArticleId(null);
    setArticleForm(emptyArticleForm);
    setError("");
    setNotice("");
    document.getElementById("article-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function editArticle(article) {
    setEditingArticleId(article.id);
    setArticleForm({ ...emptyArticleForm, ...article });
    setError("");
    setNotice("");
    document.getElementById("article-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveArticle(event) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const slug = slugify(articleForm.slug || articleForm.title);
      if (!articleForm.title.trim()) throw new Error("Enter a blog post title.");
      if (!slug) throw new Error("Add a title that can be used to create the post URL.");
      if (!articleForm.body_markdown.trim()) throw new Error("Write the blog post content before saving.");
      const existing = articles.find((article) => article.id === editingArticleId);
      const body = {
        title: articleForm.title.trim(), slug, excerpt: articleForm.excerpt.trim() || null,
        body_markdown: articleForm.body_markdown.trim(), cover_image_url: articleForm.cover_image_url.trim() || null,
        status: articleForm.status,
        published_at: articleForm.status === "published" ? (existing?.published_at || new Date().toISOString()) : null,
      };
      if (editingArticleId) {
        await requestWithSession(`/rest/v1/articles?id=eq.${encodeURIComponent(editingArticleId)}`, { method: "PATCH", body, headers: { "Content-Type": "application/json", Prefer: "return=minimal" } });
      } else {
        await requestWithSession("/rest/v1/articles", { method: "POST", body, headers: { "Content-Type": "application/json", Prefer: "return=minimal" } });
      }
      await loadArticles(session);
      setNotice(editingArticleId ? "Blog post updated." : "Blog post saved.");
      setEditingArticleId(null); setArticleForm(emptyArticleForm);
    } catch (caught) { setError(caught.message || "Could not save this blog post."); }
    finally { setBusy(false); }
  }

  async function deleteArticle(article) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await requestWithSession(`/rest/v1/articles?id=eq.${encodeURIComponent(article.id)}`, { method: "DELETE" });
      setArticles((current) => current.filter((item) => item.id !== article.id));
      if (editingArticleId === article.id) { setEditingArticleId(null); setArticleForm(emptyArticleForm); }
      setNotice("Blog post deleted.");
    } catch (caught) { setError(caught.message || "Could not delete this blog post."); }
    finally { setBusy(false); }
  }

  if (checking) return <main className="admin-page"><div className="admin-shell admin-state"><span className="admin-kicker">Lyx Realty Group · ADMIN</span><h1>Checking access</h1><p>Verifying your admin account with Supabase…</p></div></main>;

  if (!authorized) return (
    <main className="admin-page admin-login-page">
      <a className="admin-brand" href="/">Lyx <span>Realty Group</span></a>
      <form className="admin-login" onSubmit={signIn}>
        <span className="admin-kicker">Lyx Realty Group · LISTING DESK</span>
        <h1>Admin sign in</h1>
        <p>Sign in with the staff account created in your Supabase project.</p>
        {notice && <div className="admin-notice">{notice}</div>}{error && <div className="admin-error">{error}</div>}
        <label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <button className="admin-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <a className="admin-back" href="/">← Return to Lyx Realty Group</a>
      </form>
    </main>
  );

  return (
    <main className="admin-page">
      <header className="admin-topbar"><a className="admin-brand" href="/">Lyx <span>Realty Group</span></a><div className="admin-account"><span>{user?.email}</span><button onClick={() => signOut()}>Sign out</button></div></header>
      <div className="admin-shell">
        <div className="admin-heading"><div><span className="admin-kicker">Lyx Realty Group · LISTING DESK</span><h1>Property listings</h1><p>Create and maintain the properties shown across your website.</p></div><button className="admin-primary admin-new-button" onClick={startNew}>＋ New listing</button></div>
        {notice && <div className="admin-notice">{notice}</div>}{error && <div className="admin-error">{error}</div>}
        <a className="admin-blog-shortcut" href="#article-editor">Write a blog post <span aria-hidden="true">↗</span></a>
        <div className="admin-stats">
          <div><b>{listings.length}</b><span>Total listings</span></div>
          <div><b>{listings.filter((item) => item.status === "published").length}</b><span>Published</span></div>
          <div><b>{listings.filter((item) => item.status === "draft").length}</b><span>Drafts</span></div>
          <div><b>{publicImageCount}</b><span>Listing photos</span></div>
          <div><b>{valuations.length}</b><span>Valuation requests</span></div>
          <div><b>{newValuations}</b><span>New valuations</span></div>
          <div><b>{enquiries.length}</b><span>Website enquiries</span></div>
          <div><b>{newEnquiries}</b><span>New enquiries</span></div>
        </div>
        <section className="admin-panel admin-editor" id="listing-editor"><div className="admin-panel-title"><div><span className="admin-kicker">LISTING DETAILS</span><h2>{editingId ? "Edit listing" : "Create a listing"}</h2></div>{editingId && <button className="admin-text-button" type="button" onClick={startNew}>Cancel edit</button>}</div>
          <form onSubmit={saveListing}>
            <div className="admin-form-grid">
              <label className="admin-span-2">Listing title<input required value={form.title} onChange={(event) => changeForm("title", event.target.value)} placeholder="e.g. Contemporary villa in Karen" /></label>
              <label>URL slug<input required value={form.slug} onChange={(event) => changeForm("slug", event.target.value)} placeholder="contemporary-villa-karen" /></label>
              <label>Property category<select value={form.property_type} onChange={(event) => changeForm("property_type", event.target.value)}>{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Listing purpose<select value={form.transaction_type} onChange={(event) => changeForm("transaction_type", event.target.value)}><option value="sale">For sale</option><option value="rent">For rent</option></select></label>
              <label>Price (KES)<input type="number" min="0" step="1" value={form.price_ksh} onChange={(event) => changeForm("price_ksh", event.target.value)} placeholder="Leave empty for price on request" /></label>
              <label>City<input value={form.city} onChange={(event) => changeForm("city", event.target.value)} /></label>
              <label>Area / neighbourhood<input value={form.area} onChange={(event) => changeForm("area", event.target.value)} placeholder="e.g. Karen" /></label>
              <label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={(event) => changeForm("bedrooms", event.target.value)} /></label>
              <label>Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={(event) => changeForm("bathrooms", event.target.value)} /></label>
              <label>Floor area (m²)<input type="number" min="0" step="0.01" value={form.floor_area_sqm} onChange={(event) => changeForm("floor_area_sqm", event.target.value)} /></label>
              <label>Land area (m²)<input type="number" min="0" step="0.01" value={form.land_area_sqm} onChange={(event) => changeForm("land_area_sqm", event.target.value)} /></label>
              <label className="admin-span-2">Short summary<textarea rows="2" value={form.summary} onChange={(event) => changeForm("summary", event.target.value)} placeholder="A concise description for property cards" /></label>
              <label className="admin-span-2">Full description<textarea rows="5" value={form.description} onChange={(event) => changeForm("description", event.target.value)} placeholder="Add the details buyers and renters need to know" /></label>
              <label className="admin-span-2">Property photos<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => { const selected = Array.from(event.target.files || []); event.target.value = ""; setPhotos((current) => { const keys = new Set(current.map((photo) => `${photo.name}:${photo.size}:${photo.lastModified}`)); return [...current, ...selected.filter((photo) => { const key = `${photo.name}:${photo.size}:${photo.lastModified}`; if (keys.has(key)) return false; keys.add(key); return true; })]; }); }} /><small>Select several photos at once, or add more in another selection. JPG, PNG, WebP or AVIF; maximum 5 MB per photo.</small></label>
              {(form.image_urls || []).length > 0 && <div className="admin-span-2 admin-photo-list"><small>Current photos (kept when you save):</small><div>{form.image_urls.map((url) => <img key={url} src={url} alt="Current listing" />)}</div></div>}
              {photos.length > 0 && <p className="admin-span-2 admin-file-count">{photos.length} new photo{photos.length === 1 ? "" : "s"} selected. They will be added to this listing on save. <button type="button" className="admin-text-button" onClick={() => setPhotos([])}>Clear selection</button></p>}
              <label>Publication<select value={form.status} onChange={(event) => changeForm("status", event.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
              <label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(event) => changeForm("featured", event.target.checked)} /> Feature on the homepage</label>
            </div>
            <div className="admin-form-actions"><button className="admin-primary" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Create listing"}</button></div>
          </form>
        </section>

        <section className="admin-panel admin-listings"><div className="admin-panel-title"><div><span className="admin-kicker">YOUR INVENTORY</span><h2>All listings <span className="admin-count">{listings.length}</span></h2></div></div>
          {listings.length === 0 ? <div className="admin-empty"><b>No listings yet</b><p>Create your first property listing above. It will show on the public site when you publish it.</p><button className="admin-text-button" onClick={startNew}>Create a listing →</button></div> : <div className="admin-table-wrap"><table><thead><tr><th>Property</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>{listings.map((listing) => <tr key={listing.id}><td><div className="admin-property-cell">{listing.image_urls?.[0] ? <img src={listing.image_urls[0]} alt="" /> : <div className="admin-no-photo">Lyx</div>}<div><b>{listing.title}</b><small>{types.find(([value]) => value === listing.property_type)?.[1]} · {listing.transaction_type === "rent" ? "Rent" : "Sale"}</small></div></div></td><td>{[listing.area, listing.city].filter(Boolean).join(", ") || "—"}</td><td>{displayPrice(listing.price_ksh)}</td><td><span className={`admin-status admin-status-${listing.status}`}>{listing.status}</span>{listing.featured && <small className="admin-featured">Featured</small>}</td><td><div className="admin-row-actions"><button onClick={() => editListing(listing)}>Edit</button><button className="admin-delete" onClick={() => deleteListing(listing)} disabled={busy}>Delete</button></div></td></tr>)}</tbody></table></div>}
        </section>

        <section className="admin-panel" id="article-editor">
          <div className="admin-panel-title">
            <div><span className="admin-kicker">Lyx Realty Group Journal</span><h2>{editingArticleId ? "Edit blog post" : "Write a blog post"}</h2></div>
            <button className="admin-primary" type="button" onClick={startNewArticle}>＋ New post</button>
          </div>
          <form onSubmit={saveArticle}>
            <div className="admin-form-grid">
              <label className="admin-span-2">Post title<input required value={articleForm.title} onChange={(event) => changeArticleForm("title", event.target.value)} placeholder="e.g. What to know before buying land in Kenya" /></label>
              <label>URL slug<input required value={articleForm.slug} onChange={(event) => changeArticleForm("slug", event.target.value)} placeholder="buying-land-in-kenya" /></label>
              <label>Publication<select value={articleForm.status} onChange={(event) => changeArticleForm("status", event.target.value)}><option value="draft">Save as draft</option><option value="published">Publish now</option><option value="archived">Archive</option></select></label>
              <label className="admin-span-2">Short introduction<textarea rows="2" value={articleForm.excerpt} onChange={(event) => changeArticleForm("excerpt", event.target.value)} placeholder="A short summary shown in the blog list" /></label>
              <label className="admin-span-2">Cover image URL<input type="url" value={articleForm.cover_image_url} onChange={(event) => changeArticleForm("cover_image_url", event.target.value)} placeholder="https://… (optional)" /></label>
              <label className="admin-span-2">Blog content<textarea required rows="12" value={articleForm.body_markdown} onChange={(event) => changeArticleForm("body_markdown", event.target.value)} placeholder="Write your article here. Separate paragraphs with a blank line. You can use Markdown headings such as ## Buying with confidence." /></label>
            </div>
            <div className="admin-form-actions"><button className="admin-primary" disabled={busy}>{busy ? "Saving…" : articleForm.status === "published" ? "Save and publish" : "Save blog post"}</button>{editingArticleId && <button className="admin-text-button" type="button" onClick={startNewArticle}>Cancel edit</button>}</div>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title"><div><span className="admin-kicker">PUBLISHED ON YOUR WEBSITE</span><h2>Blog posts <span className="admin-count">{articles.length}</span></h2></div></div>
          {articlesError ? <div className="admin-empty"><b>Posts are not connected yet</b><p>{articlesError}</p></div>
            : articles.length === 0 ? <div className="admin-empty"><b>No blog posts yet</b><p>Write a post above, save it as a draft, or publish it to your website.</p></div>
              : <div className="admin-table-wrap"><table><thead><tr><th>Post</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>{articles.map((article) => <tr key={article.id}><td><b>{article.title}</b><br /><small>/{article.slug}</small></td><td><span className={`admin-status admin-status-${article.status}`}>{article.status}</span></td><td>{new Date(article.created_at).toLocaleDateString()}</td><td><div className="admin-row-actions"><button type="button" onClick={() => editArticle(article)}>Edit</button>{article.status === "published" && <a href={`/resources/blog/${encodeURIComponent(article.slug)}`} target="_blank" rel="noreferrer">View</a>}<button type="button" className="admin-delete" onClick={() => deleteArticle(article)} disabled={busy}>Delete</button></div></td></tr>)}</tbody></table></div>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div><span className="admin-kicker">WEB LEAD FORM</span><h2>Contact enquiries <span className="admin-count">{enquiries.length}</span></h2></div>
          </div>
          {enquiriesError ? <div className="admin-empty"><b>Enquiries are not connected yet</b><p>{enquiriesError}</p></div>
            : enquiries.length === 0 ? <div className="admin-empty"><b>No contact enquiries yet</b><p>New messages from the Contact Us form will appear here.</p></div>
              : <div className="admin-table-wrap"><table><thead><tr><th>Contact</th><th>Message</th><th>Status</th><th>Received</th><th>Actions</th></tr></thead><tbody>{enquiries.map((enquiry) => <tr key={enquiry.id}><td><b>{enquiry.contact_name}</b><br /><a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>{enquiry.email && <><br /><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a></>}</td><td className="admin-enquiry-message">{enquiry.message}</td><td><span className={`admin-status admin-status-${enquiry.status}`}>{enquiry.status.replace("_", " ")}</span></td><td>{new Date(enquiry.created_at).toLocaleDateString()}</td><td><div className="admin-row-actions">{enquiry.status === "new" && <button onClick={() => updateEnquiryStatus(enquiry, "in_progress")} disabled={busy}>Mark in progress</button>}{enquiry.status !== "closed" && <button onClick={() => updateEnquiryStatus(enquiry, "closed")} disabled={busy}>Close</button>}{enquiry.status === "closed" && <button onClick={() => updateEnquiryStatus(enquiry, "new")} disabled={busy}>Reopen</button>}</div></td></tr>)}</tbody></table></div>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <span className="admin-kicker">VALUATION REQUESTS</span>
              <h2>Inbound valuations <span className="admin-count">{valuations.length}</span></h2>
            </div>
          </div>
          {valuations.length === 0 ? (
            <div className="admin-empty">
              <b>No valuation requests yet</b>
              <p>They will appear here when visitors submit the valuation form on the public site.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr><th>Contact</th><th>Property</th><th>Estimate</th><th>Status</th><th>Received</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {valuations.map((v) => (
                    <tr key={v.id}>
                      <td><b>{v.full_name}</b><br /><small>{v.email}{v.phone ? ` · ${v.phone}` : ""}</small></td>
                      <td>{v.area_name} · {v.property_type.replace("_", " ")}<br /><small>{v.size} {v.unit}</small></td>
                      <td>{v.estimated_low_ksh && v.estimated_high_ksh ? <>KSh {Number(v.estimated_low_ksh).toLocaleString()} – {Number(v.estimated_high_ksh).toLocaleString()}</> : "—"}</td>
                      <td><span className={`admin-status admin-status-${v.status === "new" ? "draft" : "published"}`}>{v.status}</span></td>
                      <td>{new Date(v.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-row-actions">
                          {v.status !== "contacted" && <button onClick={() => updateValuationStatus(v, "contacted")} disabled={busy}>Mark contacted</button>}
                          {v.status !== "closed" && <button onClick={() => updateValuationStatus(v, "closed")} disabled={busy}>Close</button>}
                          {v.status !== "new" && <button onClick={() => updateValuationStatus(v, "new")} disabled={busy}>Reopen</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="admin-footer"><a href="/">← View public website</a><span>Listing photos are public and displayed on property pages.</span></footer>
      </div>
    </main>
  );
}
