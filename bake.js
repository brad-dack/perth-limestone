/* =============================================================================
   bake.js — manual helper, NOT a build step.

   Two modes:

       node bake.js           Regenerates every derived file from config.js:
                              all page HTML (baked title/meta/canonical/OG/
                              JSON-LD/H1/noscript), plus CNAME, robots.txt,
                              sitemap.xml, 404.html, and favicon.svg.
                              config.js is the only file you edit by hand.

       node bake.js --check   Preflight. Writes nothing. Fails loudly (exit 1)
                              listing every leftover placeholder, broken file
                              reference, sitemap drift, domain mismatch, or
                              duplicate meta tag it finds. Run before launch.

   Run these yourself after editing config.js, then commit the regenerated
   files. Nothing runs automatically — the deployed site is plain static
   files with no pipeline. Plain Node, no dependencies.
============================================================================= */
const fs = require("fs");
const path = require("path");

global.window = {};
require(path.join(__dirname, "config.js"));
const cfg = global.window.SITE_CONFIG;

const esc = s => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// <-escape so "</script>" can never appear inside the JSON-LD block
const jsonLd = obj =>
  '<script type="application/ld+json">' +
  JSON.stringify(obj).replace(/</g, "\\u003c") +
  "</" + "script>";

// "https://example.com" -> "example.com"
const hostOf = url => String(url || "")
  .replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();

/* ---------- theme ---------------------------------------------------------
   Valid values for brand.style / brand.pattern in config.js. The chosen
   pair is baked onto the <html> tag; css/styles.css keys off it. */
const STYLES = ["classic", "bold", "soft", "sharp", "elegant"];
const PATTERNS = ["none", "dots", "grid", "diagonal", "crosshatch"];
const themeStyle = () => cfg.brand.style || "classic";
const themePattern = () => cfg.brand.pattern || "none";

function validateTheme() {
  const problems = [];
  for (const key of ["color", "colorDark", "colorContrast"]) {
    if (!/^#[0-9a-fA-F]{6}$/.test(cfg.brand[key] || "")) {
      problems.push("brand." + key + ' must be a 6-digit hex color (got "' +
        cfg.brand[key] + '") — derived tints can\'t be computed from it');
    }
  }
  if (!STYLES.includes(themeStyle())) {
    problems.push('brand.style "' + themeStyle() + '" is not one of: ' + STYLES.join(", "));
  }
  if (!PATTERNS.includes(themePattern())) {
    problems.push('brand.pattern "' + themePattern() + '" is not one of: ' + PATTERNS.join(", "));
  }
  return problems;
}

/* Color math for the derived palette (tints, glows, footer). */
const hexToRgb = hex => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
// mix(a, b, w) = w parts color a, (1-w) parts color b
const mix = (a, b, w) => {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  return "#" + ra.map((v, i) =>
    Math.round(v * w + rb[i] * (1 - w)).toString(16).padStart(2, "0")).join("");
};
const rgba = (hex, alpha) => {
  const [r, g, b] = hexToRgb(hex);
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
};

/* The full brand palette as a CSS block, baked into each page's <head> so
   crawlers and first paint see final colors with no JS and no flash.
   main.js re-derives the same values at runtime as a fallback. */
function brandCss() {
  const c = cfg.brand.color;
  return ":root{" +
    "--brand:" + c + ";" +
    "--brand-dark:" + cfg.brand.colorDark + ";" +
    "--brand-contrast:" + cfg.brand.colorContrast + ";" +
    "--brand-soft:" + mix(c, "#ffffff", 0.10) + ";" +
    "--brand-softer:" + mix(c, "#ffffff", 0.055) + ";" +
    "--brand-border:" + mix(c, "#ffffff", 0.30) + ";" +
    "--brand-glow:" + rgba(c, 0.30) + ";" +
    "--brand-glow-soft:" + rgba(c, 0.15) + ";" +
    "--footer-bg:" + mix(c, "#10161d", 0.16) + ";" +
    "}";
}

/* css/styles.css, inlined into every page's <head> instead of linked.
   The stylesheet is render-blocking by nature, so linking it costs a full
   extra round trip before anything can paint — on a phone that was ~380ms of
   blank screen. It gzips to well under 10 KB inline, and css/styles.css stays
   the single file you edit. Comments and indentation are stripped; nothing
   else is touched, because the file contains no url(), string or data-URI
   that a heavier minifier could break. */
function inlineCss() {
  const raw = fs.readFileSync(path.join(__dirname, "css", "styles.css"), "utf8");
  const css = raw
    .replace(/\/\*[\s\S]*?\*\//g, "")   // comments
    .replace(/^[ \t]+/gm, "")           // indentation
    .replace(/\n\s*\n/g, "\n")          // blank lines
    .trim();
  if (/<\/style/i.test(css)) {
    throw new Error("css/styles.css contains '</style' — it can't be inlined safely");
  }
  return css;
}

/* Core pages that always exist; area slugs must not collide with these. */
const CORE_PAGES = ["index.html", "faq.html", "about.html", "privacy.html", "404.html"];

const areaFile = area => area.slug + ".html";
const guideFile = guide => guide.slug + ".html";

/* ---------- schema builders --------------------------------------------- */

const bizSchema = {
  "@context": "https://schema.org",
  "@type": cfg.schema.type || "LocalBusiness",
  "name": cfg.business.name,
  "telephone": cfg.business.phone,
  "email": cfg.business.email,
  "url": cfg.domain + "/",
  "priceRange": cfg.schema.priceRange,
  "description": cfg.pages.home.metaDescription,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": cfg.business.city,
    "addressRegion": cfg.business.state
  },
  "areaServed": cfg.business.serviceArea
};

const faqSchema = faqs => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
});

const serviceSchema = (svc, canonical) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": svc.name,
  "serviceType": svc.name,
  "description": svc.metaDescription,
  "url": canonical,
  "areaServed": cfg.business.serviceArea,
  "provider": {
    "@type": cfg.schema.type || "LocalBusiness",
    "name": cfg.business.name,
    "telephone": cfg.business.phone,
    "url": cfg.domain + "/"
  }
});

/* Article schema for long-form guide pages (approval guide, cost guide).
   Author is a Person; publisher is the site business. Dates come from the
   guide entry — they may still be placeholders pre-launch. */
const articleSchema = (guide, canonical) => {
  const s = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.headline,
    "description": guide.metaDescription,
    "url": canonical,
    "author": { "@type": "Person", "name": guide.author || cfg.business.name },
    "publisher": {
      "@type": cfg.schema.type || "LocalBusiness",
      "name": cfg.business.name,
      "url": cfg.domain + "/"
    }
  };
  if (guide.datePublished) s.datePublished = guide.datePublished;
  if (guide.dateModified || guide.datePublished) {
    s.dateModified = guide.dateModified || guide.datePublished;
  }
  return s;
};

const breadcrumbSchema = (name, canonical) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": cfg.domain + "/" },
    { "@type": "ListItem", "position": 2, "name": name, "item": canonical }
  ]
});

/* ---------- page templates ----------------------------------------------- */

const canonicalFor = file =>
  cfg.domain + "/" + (file === "index.html" ? "" : file);

function head({ title, description, file, faqs, extraSchemas }) {
  const canonical = canonicalFor(file);
  return [
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    "  <title>" + esc(title) + "</title>",
    '  <meta name="description" content="' + esc(description) + '">',
    '  <meta name="theme-color" content="' + cfg.brand.color + '">',
    '  <link rel="canonical" href="' + canonical + '">',
    '  <link rel="icon" href="favicon.svg" type="image/svg+xml">',
    '  <meta property="og:title" content="' + esc(title) + '">',
    '  <meta property="og:description" content="' + esc(description) + '">',
    '  <meta property="og:url" content="' + canonical + '">',
    '  <meta property="og:type" content="website">',
    '  <meta property="og:image" content="' + cfg.domain + '/images/og-image.png">',
    '  <meta property="og:image:width" content="1200">',
    '  <meta property="og:image:height" content="630">',
    '  <meta name="twitter:card" content="summary_large_image">',
    "  <style>" + inlineCss() + "\n" + brandCss() + "</style>",
    "  " + jsonLd(bizSchema),
    faqs && faqs.length ? "  " + jsonLd(faqSchema(faqs)) : null,
    ...(extraSchemas || []).map(s => "  " + jsonLd(s)),
    '  <script src="config.js" defer></' + "script>",
    '  <script src="js/main.js" defer></' + "script>",
    cfg.turnstileSiteKey
      ? '  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></' + "script>"
      : null
  ].filter(Boolean).join("\n");
}

const noscript =
  '<noscript><p class="noscript-warning">This site&#8217;s content needs JavaScript. ' +
  esc(cfg.business.name) + ' &mdash; call <a href="tel:' + cfg.business.phone + '">' +
  esc(cfg.business.phoneDisplay) + "</a> for a free quote.</p></noscript>";

/* ---------- baked hero ---------------------------------------------------
   Everything above the fold is baked: headline, sub-headline, both CTAs, the
   value props and the hero image. It used to be written by main.js after
   config.js downloaded and parsed, which meant the visitor's most important
   screen waited on ~120 KB of JavaScript, and the hero image wasn't even
   discoverable by the preload scanner until then.

   These builders mirror main.js (fillHero, imgTag, callButton, quoteButton)
   — the markup must match, because main.js still renders the hero on any
   page that hasn't been baked. main.js skips .hero-dynamic when it already
   has children, so nothing is rendered twice. */

const telHref = () => "tel:" + cfg.business.phone;

const heroActions = ctaText =>
  '<div class="hero-actions">' +
    '<a class="btn btn-primary" href="#quote">' + esc(ctaText) + "</a>" +
    '<a class="btn btn-outline" href="' + telHref() + '">Call ' +
      esc(cfg.business.phoneDisplay) + "</a>" +
  "</div>";

const valueProps = () =>
  '<ul class="value-props">' +
    cfg.valueProps.map(v => "<li>" + esc(v) + "</li>").join("") +
  "</ul>";

/* Mirrors imgTag()/srcsetAttr() in main.js: optional `widths` become a srcset
   over the images/<name>-<width>.webp variants, with the full-size file as
   the largest candidate. */
function heroImg(image) {
  if (!image || !image.src) return "";
  const dot = image.src.lastIndexOf(".");
  const base = image.src.slice(0, dot), ext = image.src.slice(dot);
  const set = (image.widths || []).map(w => base + "-" + w + ext + " " + w + "w");
  if (set.length && image.width) set.push(image.src + " " + image.width + "w");
  return '<img class="hero-img" src="' + esc(image.src) + '"' +
    (set.length ? ' srcset="' + esc(set.join(", ")) + '"' : "") +
    (set.length && image.sizes ? ' sizes="' + esc(image.sizes) + '"' : "") +
    ' alt="' + esc(image.alt || "") + '"' +
    (image.width ? ' width="' + image.width + '"' : "") +
    (image.height ? ' height="' + image.height + '"' : "") +
    ' fetchpriority="high">';
}

/* Hero pages (home, services, areas). `p` is the page/service/area entry;
   `image` is passed only for the homepage — a service's own image belongs to
   its intro section (.service-img), which main.js still renders, not to the
   hero. This mirrors main.js: fillHero(p, p.image) on home, fillHero(svc)
   everywhere else. */
function heroMain(p, image, contentHtml) {
  const media = heroImg(image);
  const sub = p.subheadline
    ? '<p class="hero-sub">' + esc(p.subheadline) + "</p>" : "";
  return `    <section class="hero${media ? " has-media" : ""}">
      <div class="container hero-grid">
        <div class="hero-copy">
          <h1>${esc(p.headline)}</h1>
          <div class="hero-dynamic">${sub}${heroActions(p.ctaText || cfg.pages.home.ctaText)}${valueProps()}</div>
        </div>${media ? `
        <div class="hero-media">${media}</div>` : ""}
      </div>
    </section>
    <div id="page-content">${contentHtml || ""}</div>`;
}

// Simple pages (faq/about/privacy): static H1 in the page header band.
const pageHeadMain = (headline, contentHtml) => `    <section class="page-head">
      <div class="container"><h1>${esc(headline)}</h1></div>
    </section>
    <div id="page-content">${contentHtml || ""}</div>`;

/* ---------- baked footer -------------------------------------------------
   The footer is baked for the same reason the hero is, but the payoff is
   crawlability rather than LCP: it holds the only links to the service pages,
   and until it was baked those links existed nowhere in the served HTML —
   Googlebot had to render ~120 KB of JavaScript before it could discover that
   the service pages existed at all.

   This mirrors renderFooter() in main.js and the markup must match exactly.
   main.js skips #site-footer when it already has children, so nothing is
   rendered twice. Footer copy changes therefore need `node bake.js`.

   CHROME_UI duplicates the generic labels renderHeader()/renderFooter() read
   off the UI object in main.js. Keep them in step. */
const CHROME_UI = {
  services: "Our Services",
  serviceAreaLabel: "Service area",
  hoursLabel: "Hours",
  callLabel: "Call",
  menuLabel: "Menu"
};

/* Mirrors renderHeader() in main.js, including the per-page `active` class —
   which is why this takes the page's filename. main.js skips the innerHTML
   write when #site-header already has children, but still wires the
   .nav-toggle click handler against this markup, so the mobile menu keeps
   working. Change one and you must change the other. */
const bakedHeader = file => {
  const links = [
    { href: "index.html", label: "Home" },
    { href: "index.html#services", label: "Services" },
    { href: "cost-guide.html", label: "Cost Guide" },
    { href: "about.html", label: "About" }
  ];
  const nav = links.map(l =>
    "<li><a" + (l.href === file ? ' class="active"' : "") +
    ' href="' + l.href + '">' + l.label + "</a></li>").join("");

  return '<div class="container header-inner">' +
      '<a class="logo" href="index.html">' + esc(cfg.business.name) + "</a>" +
      '<div class="header-actions">' +
        '<a class="btn btn-primary nav-phone" href="' + telHref() + '">' +
          CHROME_UI.callLabel + " " + esc(cfg.business.phoneDisplay) + "</a>" +
        '<button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="' +
          CHROME_UI.menuLabel + '">' +
          "<span></span><span></span><span></span>" +
        "</button>" +
      "</div>" +
      '<nav id="site-nav" class="site-nav" aria-label="Main">' +
        "<ul>" + nav + "</ul>" +
      "</nav>" +
    "</div>";
};

/* The year is frozen at bake time. `node bake.js --check` fails once it falls
   behind the current year, so a stale copyright line can't reach production
   unnoticed. */
const bakedFooter = () => {
  const serviceLinks = cfg.services
    .map(s => '<li><a href="' + esc(s.page) + '">' + esc(s.name) + "</a></li>")
    .join("");

  return '<div class="container footer-grid">' +
      "<div>" +
        '<p class="footer-brand">' + esc(cfg.business.name) + "</p>" +
        '<p><a href="' + telHref() + '">' + esc(cfg.business.phoneDisplay) + "</a><br>" +
        '<a href="mailto:' + esc(cfg.business.email) + '">' + esc(cfg.business.email) + "</a></p>" +
        "<p>" + CHROME_UI.serviceAreaLabel + ": " + esc(cfg.business.serviceArea) + "<br>" +
        CHROME_UI.hoursLabel + ": " + esc(cfg.business.hours) + "</p>" +
      "</div>" +
      '<div><p class="footer-title">' + CHROME_UI.services + "</p><ul>" + serviceLinks + "</ul></div>" +
      '<div><p class="footer-title">Pages</p><ul>' +
        '<li><a href="index.html">Home</a></li>' +
        '<li><a href="cost-guide.html">Cost Guide</a></li>' +
        '<li><a href="about.html">About</a></li>' +
        '<li><a href="privacy.html">Privacy Policy</a></li>' +
      "</ul></div>" +
    "</div>" +
    '<div class="container footer-bottom">' +
      "<p>&copy; " + new Date().getFullYear() + " " + esc(cfg.business.name) +
      ". Serving " + esc(cfg.business.city) + ", " + esc(cfg.business.state) + ".</p>" +
    "</div>";
};

/* ---------- baked page content ---------------------------------------
   Everything that used to live only in <div id="page-content"></div>,
   filled in by main.js after config.js parsed and JS ran. Baked for the
   same crawlability reason as the hero and footer above: Google's first
   pass sees the page shell — nearly identical across every page — but not
   the content that actually differentiates one page from another, so
   service/guide pages read as thin near-duplicates before JS ever runs.

   These builders mirror the render* functions in js/main.js — the markup
   must match exactly, because main.js still renders content on any page
   that hasn't been baked (or whose config entry is missing). main.js skips
   #page-content when it already has children, same as it does for the
   hero and footer, so nothing is rendered twice. Content changes therefore
   need `node bake.js`, same as everywhere else in this file.

   The one exception is the quote form's hidden `_id` field: it has to be a
   fresh value per page LOAD (it's the idempotency key retries dedupe on),
   so it can't be meaningfully baked. It's baked empty and main.js's
   wireQuoteForm() unconditionally overwrites it on load, baked or not. */

/* Duplicates the generic labels UI reads in main.js — same duplication
   CHROME_UI above does for the header/footer. Keep them in step. */
const CONTENT_UI = {
  howItWorks: "How It Works",
  services: "Our Services",
  faqTitle: "Frequently Asked Questions",
  serviceDetails: "Pricing & details",
  included: "What's included",
  pricing: "Typical Pricing",
  ctaBandTitle: "Ready to get started?",
  callLabel: "Call",
  orText: "or",
  testimonialsTitle: "What Customers Say",
  photosTitle: "Recent Work",
  serviceAreaLabel: "Service area",
  hoursLabel: "Hours",
  areasTitle: "Areas We Serve",
  servicesInPrefix: "Services available in",
  backHome: "Back to homepage"
};

// Mirrors the ICONS map in main.js (how-it-works step icons).
const ICONS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
};

function iconSvg(name) {
  if (!name || !ICONS[name]) return "";
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>";
}

// Escapes first, then re-applies **bold** and [text](href) — mirrors inline() in main.js.
function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

const faqItems = list => list.map(f =>
  '<details class="faq-item"><summary>' + esc(f.q) + "</summary>" +
  '<div class="faq-answer"><p>' + esc(f.a) + "</p></div></details>"
).join("");

const quoteButtonHtml = (text, extraClass) =>
  '<a class="btn btn-primary ' + (extraClass || "") + '" href="#quote">' + esc(text) + "</a>";

/* Mirrors imgTag() in main.js — content images (service intro, guide
   figures, photos). The hero has its own heroImg() above because it's
   always fetchpriority=high and never lazy; content images are the
   opposite, so this always sets loading="lazy". */
function contentImg(image, className) {
  if (!image || !image.src) return "";
  const dot = image.src.lastIndexOf(".");
  const base = image.src.slice(0, dot), ext = image.src.slice(dot);
  const set = (image.widths || []).map(w => base + "-" + w + ext + " " + w + "w");
  if (set.length && image.width) set.push(image.src + " " + image.width + "w");
  return '<img class="' + (className || "") + '" src="' + esc(image.src) + '"' +
    (set.length ? ' srcset="' + esc(set.join(", ")) + '"' : "") +
    (set.length && image.sizes ? ' sizes="' + esc(image.sizes) + '"' : "") +
    ' alt="' + esc(image.alt || "") + '"' +
    (image.width ? ' width="' + image.width + '"' : "") +
    (image.height ? ' height="' + image.height + '"' : "") +
    ' loading="lazy">';
}

// Renders one content block: a string (paragraph) or {list|olist|table|subheading|note|image}.
function blockHtml(b) {
  if (b == null) return "";
  if (typeof b === "string") return "<p>" + inline(b) + "</p>";
  if (b.subheading) return "<h3>" + inline(b.subheading) + "</h3>";
  if (b.note) return '<p class="guide-note">' + inline(b.note) + "</p>";
  if (b.image) {
    const fig = contentImg(b.image, "guide-img");
    if (!fig) return "";
    return '<figure class="photo guide-figure">' + fig +
      (b.image.caption ? "<figcaption>" + esc(b.image.caption) + "</figcaption>" : "") +
      "</figure>";
  }
  if (b.list) {
    return '<ul class="check-list">' +
      b.list.map(i => "<li>" + inline(i) + "</li>").join("") + "</ul>";
  }
  if (b.olist) {
    return '<ol class="guide-steps">' +
      b.olist.map(i => "<li>" + inline(i) + "</li>").join("") + "</ol>";
  }
  if (b.table) {
    const t = b.table;
    const thead = "<thead><tr>" +
      (t.head || []).map(h => "<th>" + inline(h) + "</th>").join("") + "</tr></thead>";
    const tbody = "<tbody>" +
      (t.rows || []).map(row =>
        "<tr>" + row.map(c => "<td>" + inline(c) + "</td>").join("") + "</tr>"
      ).join("") + "</tbody>";
    return '<div class="table-wrap"><table class="guide-table">' + thead + tbody + "</table></div>";
  }
  return "";
}

const sectionsHtml = sections => (sections || []).map(sec =>
  (sec.heading ? "<h2>" + inline(sec.heading) + "</h2>" : "") +
  (sec.body || []).map(blockHtml).join("")
).join("");

function howItWorksSection(compact) {
  if (!cfg.howItWorks || !cfg.howItWorks.length) return "";
  const steps = cfg.howItWorks.map((s, i) => {
    const badge = s.icon && iconSvg(s.icon)
      ? '<span class="step-num" aria-hidden="true">' + iconSvg(s.icon) + "</span>" +
        '<span class="step-label">Step ' + (i + 1) + "</span>"
      : '<span class="step-num" aria-hidden="true">' + (i + 1) + "</span>";
    return '<li class="step">' + badge +
      "<h3>" + esc(s.title) + "</h3>" +
      "<p>" + esc(s.text) + "</p>" +
    "</li>";
  }).join("");
  return '<section class="section how-it-works' + (compact ? " compact" : "") + '" id="how-it-works">' +
    '<div class="container">' +
      "<h2>" + CONTENT_UI.howItWorks + "</h2>" +
      '<ol class="steps">' + steps + "</ol>" +
    "</div></section>";
}

function testimonialsSection() {
  if (!cfg.testimonials || !cfg.testimonials.length) return "";
  const items = cfg.testimonials.map(t =>
    '<figure class="testimonial"><blockquote>' + esc(t.quote) + "</blockquote>" +
    "<figcaption>" + esc(t.name) + (t.detail ? " — " + esc(t.detail) : "") + "</figcaption></figure>"
  ).join("");
  return '<section class="section"><div class="container">' +
    "<h2>" + CONTENT_UI.testimonialsTitle + '</h2><div class="grid-3">' + items + "</div></div></section>";
}

function photosSection() {
  if (!cfg.photos || !cfg.photos.length) return "";
  const items = cfg.photos.map(p =>
    '<figure class="photo"><img loading="lazy" src="' + esc(p.src) + '" alt="' + esc(p.alt) + '">' +
    (p.caption ? "<figcaption>" + esc(p.caption) + "</figcaption>" : "") + "</figure>"
  ).join("");
  return '<section class="section"><div class="container">' +
    "<h2>" + CONTENT_UI.photosTitle + '</h2><div class="grid-3">' + items + "</div></div></section>";
}

const serviceCards = services => services.map(s =>
  '<article class="card">' +
    '<h3><a href="' + esc(s.page) + '">' + esc(s.name) + "</a></h3>" +
    "<p>" + esc(s.shortDescription) + "</p>" +
    '<a class="card-link" href="' + esc(s.page) + '">' + CONTENT_UI.serviceDetails + " &rarr;</a>" +
  "</article>"
).join("");

function areasSection() {
  if (!cfg.areas || !cfg.areas.length) return "";
  const links = cfg.areas.map(a =>
    '<li><a href="' + esc(a.slug) + '.html">' + esc(a.name) + "</a></li>"
  ).join("");
  return '<section class="section" id="areas"><div class="container">' +
    "<h2>" + CONTENT_UI.areasTitle + '</h2><ul class="area-links">' + links + "</ul>" +
  "</div></section>";
}

const ctaBand = ctaText => '<section class="cta-band"><div class="container">' +
  "<h2>" + CONTENT_UI.ctaBandTitle + "</h2>" +
  "<p>" + CONTENT_UI.callLabel + ' <a href="' + telHref() + '">' + esc(cfg.business.phoneDisplay) +
  "</a> " + CONTENT_UI.orText + " request your free quote online.</p>" +
  quoteButtonHtml(ctaText, "btn-invert") +
"</div></section>";

/* Baked with an empty `_id` — see the note at the top of this section.
   Everything else mirrors renderQuoteFormHtml() in main.js exactly. */
function quoteFormHtml() {
  const options = cfg.services.map(s => s.name).concat([cfg.contact.otherServiceLabel]);
  const radios = options.map(name =>
    '<label class="service-option">' +
      '<input type="radio" name="service" value="' + esc(name) + '" required>' +
      "<span>" + esc(name) + "</span>" +
    "</label>"
  ).join("");
  const tfOpts = (cfg.contact.timeframeOptions || [])
    .map(t => '<option value="' + esc(t) + '">' + esc(t) + "</option>").join("");

  return '<form id="quote-form" novalidate>' +
    '<fieldset class="form-step" id="form-step-1">' +
      "<legend>" + esc(cfg.contact.step1Label) + "</legend>" +
      '<div class="service-options">' + radios + "</div>" +
    "</fieldset>" +
    '<fieldset class="form-step" id="form-step-2" hidden>' +
      "<legend>" + esc(cfg.contact.step2Label) + "</legend>" +
      '<div class="form-field"><label for="qf-suburb">Suburb</label>' +
      '<input id="qf-suburb" name="suburb" type="text" autocomplete="address-level2" required></div>' +
      '<div class="form-field"><label for="qf-size">' + esc(cfg.contact.sizeLabel || "Rough size") + "</label>" +
      '<input id="qf-size" name="size" type="text"' +
        (cfg.contact.sizePlaceholder ? ' placeholder="' + esc(cfg.contact.sizePlaceholder) + '"' : "") +
      "></div>" +
      '<div class="form-field"><label for="qf-timeframe">' + esc(cfg.contact.timeframeLabel || "Timeframe") + "</label>" +
      '<select id="qf-timeframe" name="timeframe" required>' +
        '<option value="" disabled selected>Choose one</option>' + tfOpts +
      "</select></div>" +
      '<div class="form-field"><label for="qf-name">Name</label>' +
      '<input id="qf-name" name="name" type="text" autocomplete="name" required></div>' +
      '<div class="form-field"><label for="qf-phone">Phone</label>' +
      '<input id="qf-phone" name="phone" type="tel" autocomplete="tel" required></div>' +
      '<div class="form-field"><label for="qf-email">Email</label>' +
      '<input id="qf-email" name="email" type="email" autocomplete="email" required></div>' +
      '<input type="text" id="qf-gotcha" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" ' +
        'style="position:absolute;left:-9999px;top:-9999px">' +
      '<input type="hidden" id="qf-id" name="_id" value="">' +
      (cfg.turnstileSiteKey ? '<div id="turnstile-widget"></div>' : "") +
      '<button class="btn btn-primary btn-block" type="submit">' + esc(cfg.contact.submitText) + "</button>" +
    "</fieldset>" +
    '<p class="form-status" id="form-status" role="status" aria-live="polite"></p>' +
  "</form>";
}

function enquirySection() {
  const note = cfg.contact.formNote ? '<p class="form-note">' + inline(cfg.contact.formNote) + "</p>" : "";
  return '<section class="section section-alt" id="quote"><div class="container narrow">' +
    "<h2>" + esc(cfg.contact.formHeadline) + "</h2>" +
    '<p class="reassurance">' + esc(cfg.contact.reassurance) + "</p>" +
    quoteFormHtml() + note +
  "</div></section>";
}

/* ---- per-page-type content (mirrors renderHome/renderService/renderArea/
   renderGuide/renderAbout/renderPrivacy in main.js) ---- */

function homeContent() {
  const p = cfg.pages.home;
  const homeSections = (p.sections && p.sections.length)
    ? '<section class="section"><div class="container narrow prose guide">' +
        sectionsHtml(p.sections) +
      "</div></section>"
    : "";
  return '<section class="section" id="services"><div class="container">' +
      "<h2>" + CONTENT_UI.services + '</h2><div class="grid-3">' + serviceCards(cfg.services) + "</div></div></section>" +
    homeSections +
    areasSection() +
    howItWorksSection(false) +
    testimonialsSection() +
    '<section class="section"><div class="container narrow">' +
      "<h2>" + CONTENT_UI.faqTitle + "</h2>" +
      faqItems(cfg.faqs) +
    "</div></section>" +
    enquirySection() +
    ctaBand(p.ctaText);
}

function serviceContent(svc) {
  const svcMedia = contentImg(svc.image, "service-img");
  const includedBlock = (svc.included && svc.included.length)
    ? '<section class="section section-alt"><div class="container narrow">' +
        '<div class="grid-2">' +
          "<div><h2>" + CONTENT_UI.included + '</h2><ul class="check-list">' +
            svc.included.map(i => "<li>" + esc(i) + "</li>").join("") +
          "</ul></div>" +
          '<div><h2>' + CONTENT_UI.pricing + '</h2><p class="price-note">' +
            esc(svc.priceNote || "") + "</p>" + quoteButtonHtml(svc.ctaText) +
        "</div></div>" +
      "</div></section>"
    : "";
  const sectionsBlock = (svc.sections && svc.sections.length)
    ? '<section class="section"><div class="container narrow prose guide">' +
        sectionsHtml(svc.sections) +
      "</div></section>"
    : "";
  return '<section class="section"><div class="container' + (svcMedia ? " intro-grid" : " narrow") + '">' +
      '<div class="intro-copy">' +
        svc.intro.map(t => '<p class="lead">' + esc(t) + "</p>").join("") +
      "</div>" +
      (svcMedia ? '<div class="intro-media">' + svcMedia + "</div>" : "") +
    "</div></section>" +
    includedBlock +
    sectionsBlock +
    howItWorksSection(true) +
    testimonialsSection() +
    '<section class="section"><div class="container narrow">' +
      "<h2>" + esc(svc.name) + ": " + CONTENT_UI.faqTitle + "</h2>" +
      faqItems(svc.faqs) +
    "</div></section>" +
    enquirySection() +
    ctaBand(svc.ctaText);
}

function areaContent(area) {
  const detail = area.localDetail
    ? [].concat(area.localDetail).map(t => "<p>" + esc(t) + "</p>").join("")
    : "";
  const featured = area.services && area.services.length
    ? cfg.services.filter(s => area.services.indexOf(s.page) !== -1)
    : cfg.services;
  return '<section class="section"><div class="container narrow">' +
      area.intro.map(t => '<p class="lead">' + esc(t) + "</p>").join("") +
      detail +
    "</div></section>" +
    '<section class="section section-alt"><div class="container">' +
      "<h2>" + CONTENT_UI.servicesInPrefix + " " + esc(area.name) + "</h2>" +
      '<div class="grid-3">' + serviceCards(featured) + "</div>" +
      '<p class="center"><a class="text-link" href="index.html">' + CONTENT_UI.backHome + " &rarr;</a></p>" +
    "</div></section>" +
    howItWorksSection(true) +
    (area.faqs && area.faqs.length
      ? '<section class="section section-alt"><div class="container narrow">' +
          "<h2>" + esc(area.name) + " — " + CONTENT_UI.faqTitle + "</h2>" +
          faqItems(area.faqs) +
        "</div></section>"
      : "") +
    ctaBand(area.ctaText || cfg.pages.home.ctaText);
}

function guideContent(g) {
  const byline = g.byline ? '<p class="guide-byline">' + inline(g.byline) + "</p>" : "";
  const reviewed = g.lastReviewed
    ? '<p class="guide-reviewed">Last reviewed: ' + esc(g.lastReviewed) + "</p>" : "";
  const intro = (g.intro || []).map(t => '<p class="lead">' + inline(t) + "</p>").join("");
  return '<section class="section"><div class="container narrow prose guide">' +
      byline + reviewed + intro +
      sectionsHtml(g.sections) +
      (g.faqs && g.faqs.length
        ? "<h2>" + CONTENT_UI.faqTitle + "</h2>" + faqItems(g.faqs)
        : "") +
    "</div></section>" +
    enquirySection() +
    ctaBand(g.cta || cfg.pages.home.ctaText);
}

function aboutContent() {
  const body = (cfg.about.sections && cfg.about.sections.length)
    ? '<div class="prose guide">' + sectionsHtml(cfg.about.sections) + "</div>"
    : (cfg.about.paragraphs || []).map(t => '<p class="lead">' + esc(t) + "</p>").join("");
  return '<section class="section"><div class="container narrow">' +
      body +
      '<p class="contact-lines">' +
        "<strong>" + CONTENT_UI.callLabel + ":</strong> " +
        '<a href="' + telHref() + '">' + esc(cfg.business.phoneDisplay) + "</a><br>" +
        "<strong>Email:</strong> " +
        '<a href="mailto:' + esc(cfg.business.email) + '">' + esc(cfg.business.email) + "</a><br>" +
        "<strong>" + CONTENT_UI.serviceAreaLabel + ":</strong> " + esc(cfg.business.serviceArea) + "<br>" +
        "<strong>" + CONTENT_UI.hoursLabel + ":</strong> " + esc(cfg.business.hours) +
      "</p>" +
    "</div></section>" +
    photosSection() +
    enquirySection();
}

function privacyContent() {
  const p = cfg.pages.privacy;
  if (cfg.privacy && cfg.privacy.sections && cfg.privacy.sections.length) {
    return '<section class="section"><div class="container narrow prose guide">' +
      (p.lastUpdated ? '<p class="guide-reviewed">Last reviewed: ' + esc(p.lastUpdated) + "</p>" : "") +
      sectionsHtml(cfg.privacy.sections) +
    "</div></section>";
  }
  const name = esc(cfg.business.name);
  return '<section class="section"><div class="container narrow prose">' +
    "<p><em>Last updated: " + esc(p.lastUpdated) + "</em></p>" +
    "<h2>What this website collects</h2>" +
    "<p>When you use the quote form on this site, we collect three things: your <strong>name</strong>, your <strong>phone number</strong>, and the <strong>service you need</strong>. That's it — the form has no other fields.</p>" +
    "<h2>How it's used</h2>" +
    "<p>Your details are used for one purpose: to contact you about your quote request. They are not sold, shared with advertisers, or added to any marketing list.</p>" +
    "<h2>Who processes the form</h2>" +
    "<p>The form is delivered directly to our own systems for handling enquiries. A free security check (Cloudflare Turnstile) runs in the background to filter out automated spam submissions before your enquiry reaches us.</p>" +
    "<h2>Analytics</h2>" +
    "<p>This site may use Google Analytics to understand how visitors find and use it (for example, which pages are viewed). Google Analytics uses cookies and collects anonymous usage data such as your general location and device type. It does not see anything you type into the quote form.</p>" +
    "<h2>Phone calls</h2>" +
    "<p>If you call the number on this site, standard call records apply. We don't record calls.</p>" +
    "<h2>Your choices</h2>" +
    "<p>If you'd like the details you submitted to be deleted, call " +
    '<a href="' + telHref() + '">' + esc(cfg.business.phoneDisplay) + "</a> or email " +
    '<a href="mailto:' + esc(cfg.business.email) + '">' + esc(cfg.business.email) + "</a> and ask — they'll be removed.</p>" +
    "<h2>Contact</h2>" +
    "<p>Questions about this policy can be sent to " + name + " at " +
    '<a href="mailto:' + esc(cfg.business.email) + '">' + esc(cfg.business.email) + "</a>.</p>" +
  "</div></section>";
}

const page = (dataPage, file, headHtml, mainInner) => `<!DOCTYPE html>
<html lang="en" data-style="${themeStyle()}" data-pattern="${themePattern()}">
<head>
${headHtml}
</head>
<body data-page="${dataPage}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${noscript}
  <header id="site-header">${bakedHeader(file)}</header>
  <main id="main">
${mainInner}
  </main>
  <footer id="site-footer">${bakedFooter()}</footer>
</body>
</html>
`;

/* ---------- page list (single source of truth for pages + sitemap) ------- */

function buildPages() {
  const files = [];

  files.push(["index.html", page("home", "index.html",
    head({ title: cfg.pages.home.metaTitle, description: cfg.pages.home.metaDescription, file: "index.html" }),
    heroMain(cfg.pages.home, cfg.pages.home.image, homeContent()))]);

  for (const svc of cfg.services) {
    files.push([svc.page, page("service", svc.page,
      head({
        title: svc.metaTitle, description: svc.metaDescription, file: svc.page, faqs: svc.faqs,
        extraSchemas: [
          serviceSchema(svc, canonicalFor(svc.page)),
          breadcrumbSchema(svc.name, canonicalFor(svc.page))
        ]
      }),
      heroMain(svc, undefined, serviceContent(svc)))]);
  }

  for (const area of cfg.areas || []) {
    const file = areaFile(area);
    files.push([file, page("area", file,
      head({
        title: area.metaTitle, description: area.metaDescription, file: file, faqs: area.faqs,
        extraSchemas: [breadcrumbSchema(area.name, canonicalFor(file))]
      }),
      heroMain(area, undefined, areaContent(area)))]);
  }

  for (const guide of cfg.guides || []) {
    const file = guideFile(guide);
    files.push([file, page("guide", file,
      head({
        title: guide.metaTitle, description: guide.metaDescription, file: file, faqs: guide.faqs,
        extraSchemas: [
          articleSchema(guide, canonicalFor(file)),
          breadcrumbSchema(guide.name, canonicalFor(file))
        ]
      }),
      pageHeadMain(guide.headline, guideContent(guide)))]);
  }

  files.push(["about.html", page("about", "about.html",
    head({
      title: cfg.pages.about.metaTitle, description: cfg.pages.about.metaDescription, file: "about.html",
      extraSchemas: [breadcrumbSchema(cfg.pages.about.headline, canonicalFor("about.html"))]
    }),
    pageHeadMain(cfg.pages.about.headline, aboutContent()))]);

  files.push(["privacy.html", page("privacy", "privacy.html",
    head({
      title: cfg.pages.privacy.metaTitle, description: cfg.pages.privacy.metaDescription, file: "privacy.html",
      extraSchemas: [breadcrumbSchema(cfg.pages.privacy.headline, canonicalFor("privacy.html"))]
    }),
    pageHeadMain(cfg.pages.privacy.headline, privacyContent()))]);

  return files;
}

/* Area slugs must not overwrite core pages or service pages. */
function validateAreaSlugs() {
  const servicePages = cfg.services.map(s => s.page);
  const seen = new Set();
  const problems = [];
  for (const area of cfg.areas || []) {
    if (!area.slug || !/^[a-z0-9][a-z0-9-]*$/.test(area.slug)) {
      problems.push('area "' + (area.name || "?") + '" has an invalid slug: "' + area.slug +
        '" (lowercase letters, digits, hyphens only)');
      continue;
    }
    const file = areaFile(area);
    if (CORE_PAGES.includes(file) || servicePages.includes(file)) {
      problems.push('area slug "' + area.slug + '" collides with existing page ' + file);
    }
    if (seen.has(file)) {
      problems.push('duplicate area slug "' + area.slug + '"');
    }
    seen.add(file);
  }
  return problems;
}

/* Guide slugs must not overwrite core, service, area, or each other's pages. */
function validateGuideSlugs() {
  const servicePages = cfg.services.map(s => s.page);
  const areaFiles = (cfg.areas || []).map(areaFile);
  const seen = new Set();
  const problems = [];
  for (const guide of cfg.guides || []) {
    if (!guide.slug || !/^[a-z0-9][a-z0-9-]*$/.test(guide.slug)) {
      problems.push('guide "' + (guide.name || "?") + '" has an invalid slug: "' + guide.slug +
        '" (lowercase letters, digits, hyphens only)');
      continue;
    }
    const file = guideFile(guide);
    if (CORE_PAGES.includes(file) || servicePages.includes(file) || areaFiles.includes(file)) {
      problems.push('guide slug "' + guide.slug + '" collides with existing page ' + file);
    }
    if (seen.has(file)) {
      problems.push('duplicate guide slug "' + guide.slug + '"');
    }
    seen.add(file);
  }
  return problems;
}

/* ---------- derived static files ----------------------------------------- */

const cnameContent = () => hostOf(cfg.domain) + "\n";

const robotsContent = () => "User-agent: *\nAllow: /\n\nSitemap: " +
  cfg.domain + "/sitemap.xml\n";

const sitemapContent = pageNames =>
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pageNames.map(f => "  <url><loc>" + canonicalFor(f) + "</loc></url>").join("\n") +
  "\n</urlset>\n";

/* Self-contained on purpose: GitHub Pages serves 404.html for ANY missing
   path (including nested ones), so it uses absolute URLs and inline styles
   and loads no JS. */
const notFoundContent = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Not Found | ${esc(cfg.business.name)}</title>
  <meta name="robots" content="noindex">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                   "Helvetica Neue", Arial, sans-serif;
      color: #1b2430;
      background: ${mix(cfg.brand.color, "#ffffff", 0.055)};
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
      line-height: 1.6;
    }
    .card {
      background: #ffffff;
      border: 1px solid #dfe4e9;
      border-radius: 12px;
      padding: 40px 32px;
      max-width: 460px;
    }
    h1 { font-size: 1.7rem; margin: 0 0 0.5em; }
    p { margin: 0 0 1em; color: #55606e; }
    .brand { font-weight: 800; color: #1b2430; }
    a.btn {
      display: inline-block;
      background: ${cfg.brand.color};
      color: ${cfg.brand.colorContrast};
      font-weight: 700;
      text-decoration: none;
      padding: 13px 24px;
      border-radius: 10px;
      margin-top: 6px;
    }
    a.tel { color: ${cfg.brand.color}; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Page not found</h1>
    <p>That page doesn&#8217;t exist or has moved &mdash; but we&#8217;re still easy to reach.</p>
    <p><span class="brand">${esc(cfg.business.name)}</span><br>
       Call <a class="tel" href="tel:${cfg.business.phone}">${esc(cfg.business.phoneDisplay)}</a></p>
    <a class="btn" href="/">Back to homepage</a>
  </div>
</body>
</html>
`;

/* Favicon corner radius follows the theme style so even the tab icon
   matches the site's personality. */
const FAVICON_RX = { classic: 13, bold: 18, soft: 26, sharp: 5, elegant: 10 };

const faviconContent = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <!-- Generated by bake.js from the brand color + style in config.js. -->
  <rect width="64" height="64" rx="${FAVICON_RX[themeStyle()] || 13}" fill="${cfg.brand.color}"/>
  <path d="M15 31 L32 17 L49 31" fill="none" stroke="${cfg.brand.colorContrast}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21 32 V45 A3 3 0 0 0 24 48 H40 A3 3 0 0 0 43 45 V32" fill="none" stroke="${cfg.brand.colorContrast}" stroke-width="5" stroke-linecap="round"/>
</svg>
`;

/* ---------- bake (write mode) --------------------------------------------- */

function bake() {
  const problems = [...validateTheme(), ...validateAreaSlugs(), ...validateGuideSlugs()];
  if (problems.length) {
    console.error("Cannot bake — fix these entries in config.js first:");
    problems.forEach(p => console.error("  ✖ " + p));
    process.exitCode = 1;
    return;
  }

  const pages = buildPages();
  for (const [name, html] of pages) {
    fs.writeFileSync(path.join(__dirname, name), html, "utf8");
    console.log("baked " + name);
  }

  const pageNames = pages.map(([name]) => name);
  const aux = [
    ["CNAME", cnameContent()],
    ["robots.txt", robotsContent()],
    ["sitemap.xml", sitemapContent(pageNames)],
    ["404.html", notFoundContent()],
    ["favicon.svg", faviconContent()]
  ];
  for (const [name, content] of aux) {
    fs.writeFileSync(path.join(__dirname, name), content, "utf8");
    console.log("baked " + name);
  }

  // Flag leftover pages (e.g. an area removed from config, or a renamed
  // service stub) — they aren't in the sitemap and should be deleted.
  const expected = new Set([...pageNames, "404.html"]);
  const stale = fs.readdirSync(__dirname)
    .filter(f => f.endsWith(".html") && !expected.has(f));
  if (stale.length) {
    console.warn("\n⚠ Stale pages on disk not generated from config (delete them?):");
    stale.forEach(f => console.warn("  - " + f));
  }

  console.log("\nDone. Commit the regenerated files.");
  console.log("Before launch, run:  node bake.js --check");
}

/* ---------- preflight (--check mode) --------------------------------------
   Writes nothing. Checks config + the files on disk as they are. */

function runCheck() {
  const errors = [];
  const warnings = [];
  const read = f => {
    try { return fs.readFileSync(path.join(__dirname, f), "utf8"); }
    catch (e) { return null; }
  };
  const exists = f => fs.existsSync(path.join(__dirname, f));

  /* -- 1. placeholder scan over every string VALUE in config -------------- */
  const PLACEHOLDER_PATTERNS = [
    [/yourdomain/i, "placeholder domain"],
    [/\bSpringfield\b/, "placeholder city \"Springfield\""],
    [/\(?555\)?[ .\-]?\d{3}[ .\-]?\d{4}|\+?1?555\d{7}/, "555 placeholder phone number"],
    [/YOUR_/, "\"YOUR_\" placeholder"],
    [/lorem\s+ipsum/i, "lorem-ipsum filler"],
    [/\b(?:TODO|TBD|FIXME)\b/, "TODO/TBD/FIXME filler"],
    [/\[VERIFY\b/, "[VERIFY] unresolved content marker"],
    [/\[NEEDS INPUT\b/, "[NEEDS INPUT] unresolved content marker"],
    [/\[DATE\]/, "[DATE] placeholder"],
    [/\[PHONE\]/, "[PHONE] placeholder — business phone not set"],
    [/\[EMAIL\]/, "[EMAIL] placeholder — business email not set"],
    [/\[ABN\]/, "[ABN] placeholder — business ABN not set"],
    [/\[SUBURBS SERVICED\]/, "[SUBURBS SERVICED] placeholder"]
  ];
  /* -- 1b. author-voice scan over every string VALUE in config -------------
     Notes written to the operator rather than to a reader: decision logs,
     "not urgent", "no source found yet", internal marker jargon. Every
     string value in config is rendered to the public site, so this kind of
     working note belongs in a "TODO (Brad):" code comment instead.

     The patterns are deliberately narrow — a hit should mean real
     author-voice copy, not a pattern that needs loosening. If one ever
     fires on legitimate reader copy, reword the copy. Note there is
     deliberately no pattern on "worth doing" / "worth getting": those are
     ordinary reader copy ("when a repair is worth doing") and
     false-positive in practice. */
  const AUTHOR_VOICE_PATTERNS = [
    [/\bDecision \(\d/, "dated decision log"],
    [/\bnot urgent\b/i, "priority note"],
    [/\bat some point\b/i, "deferred-work note"],
    [/\bpending (?:real )?data\b/i, "outstanding-research note"],
    [/\bno (?:[A-Za-z-]+ )?source (?:has been )?found\b/i, "outstanding-research note"],
    [/\bis (?:still )?not sourced\b/i, "outstanding-research note"],
    [/\bstock or generated\b/i, "imagery-sourcing note"],
    [/\bcredibility upgrade\b/i, "editorial commentary"],
    [/\btracked separately\b/i, "internal tracking note"],
    /* A review cadence is something only the operator has. A reader-facing
       caveat says "re-check before relying on this row"; a note to self says
       "re-check on a fixed schedule". Both council-table notes keep the
       former and must keep passing. */
    [/\bon a fixed schedule\b/i, "maintenance-cadence note"],
    [/\bdate is updated each time\b/i, "maintenance-cadence note"],
    [/\bmarker\b/i, "internal marker jargon"],
    [/\b(?:config|bake)\.js\b/, "reference to the site's own source files"]
  ];
  (function walk(node, trail) {
    if (typeof node === "string") {
      for (const [re, label] of PLACEHOLDER_PATTERNS) {
        if (re.test(node)) {
          errors.push("config " + trail + ": " + label +
            ' — "' + (node.length > 60 ? node.slice(0, 57) + "..." : node) + '"');
        }
      }
      for (const [re, label] of AUTHOR_VOICE_PATTERNS) {
        if (re.test(node)) {
          errors.push("config " + trail + ": author-voice note in reader-facing " +
            "copy (" + label + ") — move it to a code comment — \"" +
            (node.length > 60 ? node.slice(0, 57) + "..." : node) + '"');
          break;   // one report per string, not one per pattern
        }
      }
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, trail + "[" + i + "]"));
    } else if (node && typeof node === "object") {
      Object.keys(node).forEach(k => walk(node[k], trail ? trail + "." + k : k));
    }
  })(cfg, "");

  /* -- 2. tracking / form IDs unset --------------------------------------- */
  if (!cfg.ga4Id || /X{4,}/.test(cfg.ga4Id) || !/^G-[A-Z0-9]+$/.test(cfg.ga4Id)) {
    errors.push("ga4Id is unset or a placeholder — analytics and click_to_call tracking are OFF");
  }
  if (!cfg.ingestUrl || !cfg.ingestSecret || cfg.ingestUrl.indexOf("YOUR_") === 0) {
    errors.push("ingestUrl/ingestSecret is unset or a placeholder — the site CANNOT capture web form leads");
  }
  if (!cfg.turnstileSiteKey) {
    errors.push("turnstileSiteKey is unset — the form has no spam protection");
  }

  /* -- baked header/footer/page-content are present and current ------------ */
  {
    const year = String(new Date().getFullYear());
    for (const name of buildPages().map(([n]) => n)) {
      const raw = read(name);
      if (raw === null) continue; // reported separately below (file missing)
      if (/<header id="site-header">\s*<\/header>/.test(raw)) {
        errors.push(name + " has an empty <header id=\"site-header\"> — the" +
          " nav renders only in JavaScript (run node bake.js)");
      }
      if (/<footer id="site-footer">\s*<\/footer>/.test(raw)) {
        errors.push(name + " has an empty <footer id=\"site-footer\"> — the" +
          " service-page links exist only in JavaScript (run node bake.js)");
      } else if (raw.indexOf("&copy; " + year) === -1) {
        errors.push(name + ": baked footer copyright year is stale (expected " + year +
          ") — run node bake.js");
      }
      if (/<div id="page-content">\s*<\/div>/.test(raw)) {
        errors.push(name + " has an empty <div id=\"page-content\"> — the" +
          " page body renders only in JavaScript (run node bake.js)");
      }
    }
  }

  /* -- 3. service page files <-> config ------------------------------------ */
  const servicePages = cfg.services.map(s => s.page);
  for (const p of servicePages) {
    if (!exists(p)) errors.push("service page file missing from disk: " + p +
      " (run node bake.js)");
  }
  const stubsOnDisk = fs.readdirSync(__dirname)
    .filter(f => /^service-\d+\.html$/.test(f));
  for (const stub of stubsOnDisk) {
    if (!servicePages.includes(stub)) {
      errors.push("orphaned service stub with no config entry: " + stub + " (delete it?)");
    }
  }

  /* -- area slug + theme validity ------------------------------------------- */
  validateAreaSlugs().forEach(p => errors.push(p));
  validateGuideSlugs().forEach(p => errors.push(p));
  validateTheme().forEach(p => errors.push(p));

  /* -- 4. sitemap <-> disk -------------------------------------------------- */
  const expectedPages = buildPages().map(([name]) => name);
  const sitemapRaw = read("sitemap.xml");
  if (sitemapRaw === null) {
    errors.push("sitemap.xml is missing (run node bake.js)");
  } else {
    const locs = [...sitemapRaw.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const locFiles = locs.map(u => {
      const p = u.replace(/^https?:\/\/[^/]+\/?/, "");
      return p === "" ? "index.html" : p;
    });
    for (const f of locFiles) {
      if (!exists(f)) errors.push("sitemap.xml lists a page that doesn't exist on disk: " + f);
    }
    const htmlOnDisk = fs.readdirSync(__dirname)
      .filter(f => f.endsWith(".html") && f !== "404.html");
    for (const f of htmlOnDisk) {
      if (!locFiles.includes(f)) errors.push("page on disk missing from sitemap.xml: " + f);
    }
    for (const f of expectedPages) {
      if (!locFiles.includes(f)) errors.push("config expects page " + f +
        " but it's not in sitemap.xml (run node bake.js)");
    }
  }

  /* -- 5. domain consistency across config / CNAME / sitemap / robots ------ */
  const cfgHost = hostOf(cfg.domain);
  const cname = read("CNAME");
  if (cname === null) errors.push("CNAME is missing (run node bake.js)");
  else if (cname.trim() !== cfgHost) {
    errors.push("domain mismatch: CNAME has \"" + cname.trim() + "\" but config.js domain is \"" + cfgHost + "\"");
  }
  const robots = read("robots.txt");
  if (robots === null) errors.push("robots.txt is missing (run node bake.js)");
  else {
    const m = robots.match(/Sitemap:\s*(\S+)/);
    if (!m) errors.push("robots.txt has no Sitemap line");
    else if (hostOf(m[1]) !== cfgHost) {
      errors.push("domain mismatch: robots.txt sitemap points at \"" + hostOf(m[1]) + "\" but config.js domain is \"" + cfgHost + "\"");
    }
  }
  if (sitemapRaw !== null) {
    const badLoc = [...sitemapRaw.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(m => m[1]).find(u => hostOf(u) !== cfgHost);
    if (badLoc) errors.push("domain mismatch: sitemap.xml contains " + badLoc +
      " but config.js domain is \"" + cfgHost + "\"");
  }

  /* -- 6 + 7. image references: exist on disk, have width/height ----------- */
  (function walkImages(node, trail) {
    if (Array.isArray(node)) {
      node.forEach((v, i) => walkImages(v, trail + "[" + i + "]"));
    } else if (node && typeof node === "object") {
      if (typeof node.src === "string") {
        if (!exists(node.src)) errors.push("config " + trail + ": image file not found: " + node.src);
        if (!node.width || !node.height) {
          errors.push("config " + trail + ": image entry missing width/height (" + node.src + ")");
        }
        /* Responsive variants must exist too, or the browser 404s the srcset
           candidate it picked and shows a broken hero. */
        for (const w of node.widths || []) {
          const dot = node.src.lastIndexOf(".");
          const variant = node.src.slice(0, dot) + "-" + w + node.src.slice(dot);
          if (!exists(variant)) {
            errors.push("config " + trail + ": srcset variant not found: " + variant +
              " (listed in widths)");
          }
        }
        if ((node.widths || []).length && !node.sizes) {
          errors.push("config " + trail + ": image has widths but no sizes — " +
            "the browser would assume 100vw and pick a file that's too big");
        }
      }
      Object.keys(node).forEach(k => walkImages(node[k], trail ? trail + "." + k : k));
    }
  })(cfg, "");
  if (!exists("images/og-image.png")) errors.push("images/og-image.png is missing (referenced by every page's og:image)");
  if (!exists("favicon.svg")) errors.push("favicon.svg is missing (run node bake.js)");

  /* -- 8. duplicate metaTitle / metaDescription across pages --------------- */
  const metas = [["home", cfg.pages.home],
    ["about", cfg.pages.about], ["privacy", cfg.pages.privacy]]
    .concat(cfg.services.map(s => [s.page, s]))
    .concat((cfg.areas || []).map(a => [areaFile(a), a]))
    .concat((cfg.guides || []).map(g => [guideFile(g), g]));
  for (const field of ["metaTitle", "metaDescription"]) {
    const byValue = {};
    for (const [label, obj] of metas) {
      const v = obj[field];
      if (!v) { errors.push(label + " is missing " + field); continue; }
      (byValue[v] = byValue[v] || []).push(label);
    }
    for (const v of Object.keys(byValue)) {
      if (byValue[v].length > 1) {
        errors.push("duplicate " + field + " shared by " + byValue[v].join(", ") +
          ': "' + (v.length > 60 ? v.slice(0, 57) + "..." : v) + '"');
      }
    }
  }

  /* -- 9. testimonials / photos populated (warn — must be REAL content) ---- */
  if (cfg.testimonials && cfg.testimonials.length) {
    warnings.push("testimonials is non-empty (" + cfg.testimonials.length +
      " entries) — make sure these are REAL, verifiable testimonials, never invented ones");
  }
  if (cfg.photos && cfg.photos.length) {
    warnings.push("photos is non-empty (" + cfg.photos.length +
      " entries) — make sure these are REAL photos from the actual business");
  }

  /* -- report --------------------------------------------------------------- */
  if (errors.length) {
    console.error("PREFLIGHT FAILED — " + errors.length + " problem(s):\n");
    errors.forEach(e => console.error("  ✖ " + e));
  }
  if (warnings.length) {
    console.warn((errors.length ? "\n" : "") + "Warnings:\n");
    warnings.forEach(w => console.warn("  ⚠ " + w));
  }
  if (!errors.length) {
    console.log((warnings.length ? "\n" : "") + "Preflight passed" +
      (warnings.length ? " with " + warnings.length + " warning(s)." : " — no problems found."));
  } else {
    console.error("\nFix the issues in config.js, run node bake.js, then re-run node bake.js --check.");
    process.exitCode = 1;
  }
}

/* ---------- entry ---------------------------------------------------------- */

if (process.argv.includes("--check")) {
  runCheck();
} else {
  bake();
}
