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
    '  <link rel="stylesheet" href="css/styles.css">',
    "  <style>" + brandCss() + "</style>",
    "  " + jsonLd(bizSchema),
    faqs && faqs.length ? "  " + jsonLd(faqSchema(faqs)) : null,
    ...(extraSchemas || []).map(s => "  " + jsonLd(s)),
    '  <script src="config.js" defer></' + "script>",
    '  <script src="js/main.js" defer></' + "script>"
  ].filter(Boolean).join("\n");
}

const noscript =
  '<noscript><p class="noscript-warning">This site&#8217;s content needs JavaScript. ' +
  esc(cfg.business.name) + ' &mdash; call <a href="tel:' + cfg.business.phone + '">' +
  esc(cfg.business.phoneDisplay) + "</a> for a free quote.</p></noscript>";

// Hero pages (home, services, areas): static H1 inside the hero; main.js
// fills .hero-dynamic and #page-content around it.
const heroMain = headline => `    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <h1>${esc(headline)}</h1>
          <div class="hero-dynamic"></div>
        </div>
      </div>
    </section>
    <div id="page-content"></div>`;

// Simple pages (faq/about/privacy): static H1 in the page header band.
const pageHeadMain = headline => `    <section class="page-head">
      <div class="container"><h1>${esc(headline)}</h1></div>
    </section>
    <div id="page-content"></div>`;

const page = (dataPage, headHtml, mainInner) => `<!DOCTYPE html>
<html lang="en" data-style="${themeStyle()}" data-pattern="${themePattern()}">
<head>
${headHtml}
</head>
<body data-page="${dataPage}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${noscript}
  <header id="site-header"></header>
  <main id="main">
${mainInner}
  </main>
  <footer id="site-footer"></footer>
</body>
</html>
`;

/* ---------- page list (single source of truth for pages + sitemap) ------- */

function buildPages() {
  const files = [];

  files.push(["index.html", page("home",
    head({ title: cfg.pages.home.metaTitle, description: cfg.pages.home.metaDescription, file: "index.html" }),
    heroMain(cfg.pages.home.headline))]);

  for (const svc of cfg.services) {
    files.push([svc.page, page("service",
      head({
        title: svc.metaTitle, description: svc.metaDescription, file: svc.page, faqs: svc.faqs,
        extraSchemas: [
          serviceSchema(svc, canonicalFor(svc.page)),
          breadcrumbSchema(svc.name, canonicalFor(svc.page))
        ]
      }),
      heroMain(svc.headline))]);
  }

  for (const area of cfg.areas || []) {
    const file = areaFile(area);
    files.push([file, page("area",
      head({
        title: area.metaTitle, description: area.metaDescription, file: file, faqs: area.faqs,
        extraSchemas: [breadcrumbSchema(area.name, canonicalFor(file))]
      }),
      heroMain(area.headline))]);
  }

  for (const guide of cfg.guides || []) {
    const file = guideFile(guide);
    files.push([file, page("guide",
      head({
        title: guide.metaTitle, description: guide.metaDescription, file: file, faqs: guide.faqs,
        extraSchemas: [
          articleSchema(guide, canonicalFor(file)),
          breadcrumbSchema(guide.name, canonicalFor(file))
        ]
      }),
      pageHeadMain(guide.headline))]);
  }

  files.push(["about.html", page("about",
    head({
      title: cfg.pages.about.metaTitle, description: cfg.pages.about.metaDescription, file: "about.html",
      extraSchemas: [breadcrumbSchema(cfg.pages.about.headline, canonicalFor("about.html"))]
    }),
    pageHeadMain(cfg.pages.about.headline))]);

  files.push(["privacy.html", page("privacy",
    head({
      title: cfg.pages.privacy.metaTitle, description: cfg.pages.privacy.metaDescription, file: "privacy.html",
      extraSchemas: [breadcrumbSchema(cfg.pages.privacy.headline, canonicalFor("privacy.html"))]
    }),
    pageHeadMain(cfg.pages.privacy.headline))]);

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
  if (!cfg.formspreeId || cfg.formspreeId.indexOf("YOUR_") === 0) {
    errors.push("formspreeId is unset or a placeholder — the site CANNOT capture web form leads");
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
