/* =============================================================================
   Render engine — builds every page from window.SITE_CONFIG (config.js).
   You should NOT need to edit this file when swapping niche/city.

   The only text living here is generic UI labels (section titles, button
   fallbacks) that don't change between niches. Niche-specific content —
   names, cities, services, prices, FAQs — all comes from config.js.
============================================================================= */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG;
  if (!cfg) {
    document.title = "Configuration missing";
    return;
  }

  /* Generic UI labels (not niche-specific). */
  var UI = {
    howItWorks: "How It Works",
    services: "Our Services",
    faqTitle: "Frequently Asked Questions",
    faqPreviewTitle: "Common Questions",
    faqSeeAll: "See all questions",
    serviceDetails: "Pricing & details",
    included: "What's included",
    pricing: "Typical Pricing",
    ctaBandTitle: "Ready to get started?",
    callLabel: "Call",
    orText: "or",
    testimonialsTitle: "What Customers Say",
    photosTitle: "Recent Work",
    contactTitle: "About & Contact",
    serviceAreaLabel: "Service area",
    hoursLabel: "Hours",
    backHome: "Back to homepage",
    menuLabel: "Menu",
    sending: "Sending…",
    areasTitle: "Areas We Serve",
    servicesInPrefix: "Services available in"
  };

  /* Inline SVG icon set for how-it-works steps (referenced by name from
     config.js). Inline = zero extra requests, colored via currentColor. */
  var ICONS = {
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

  /* ---------- helpers ------------------------------------------------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function currentFile() {
    var f = window.location.pathname.split("/").pop();
    return f && f.length ? f : "index.html";
  }

  function telHref() {
    return "tel:" + cfg.business.phone;
  }

  function callButton(extraClass) {
    return '<a class="btn btn-outline ' + (extraClass || "") + '" href="' + telHref() + '">' +
      UI.callLabel + " " + esc(cfg.business.phoneDisplay) + "</a>";
  }

  /* The enquiry form is rendered on every page, so CTAs scroll to it in place
     rather than bouncing the visitor to another page. */
  function quoteButton(text, extraClass) {
    return '<a class="btn btn-primary ' + (extraClass || "") + '" href="#quote">' +
      esc(text) + "</a>";
  }

  /* Builds an <img> from a config image object ({src, alt, width, height}).
     Returns "" when no image is configured, so sections degrade cleanly.

     Optional `widths` + `sizes` add a srcset over the resized variants that
     live beside the original as <name>-<width>.webp — the full-size file
     stays in the list as the largest candidate. Mirrored in bake.js, which
     bakes the same markup into the hero. */
  function srcsetAttr(image) {
    if (!image.widths || !image.widths.length) return "";
    var dot = image.src.lastIndexOf(".");
    var base = image.src.slice(0, dot), ext = image.src.slice(dot);
    var set = image.widths.map(function (w) {
      return esc(base + "-" + w + ext) + " " + w + "w";
    });
    if (image.width) set.push(esc(image.src) + " " + image.width + "w");
    return ' srcset="' + set.join(", ") + '"' +
      (image.sizes ? ' sizes="' + esc(image.sizes) + '"' : "");
  }

  function imgTag(image, className, lazy) {
    if (!image || !image.src) return "";
    return '<img class="' + (className || "") + '" src="' + esc(image.src) + '"' +
      srcsetAttr(image) +
      ' alt="' + esc(image.alt || "") + '"' +
      (image.width ? ' width="' + image.width + '"' : "") +
      (image.height ? ' height="' + image.height + '"' : "") +
      (lazy ? ' loading="lazy"' : ' fetchpriority="high"') + ">";
  }

  function faqItems(list) {
    return list.map(function (f) {
      return '<details class="faq-item"><summary>' + esc(f.q) + "</summary>" +
        '<div class="faq-answer"><p>' + esc(f.a) + "</p></div></details>";
    }).join("");
  }

  /* Light inline formatting for guide/section copy: escapes HTML first, then
     re-applies **bold** and [text](href) markdown. Used only by the long-form
     guide renderer — service/area/faq copy stays plain-escaped. */
  function inline(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  /* Renders one content block. A block is either a string (paragraph) or an
     object with exactly one of: list, olist, table, subheading, note, image. */
  function blockHtml(b) {
    if (b == null) return "";
    if (typeof b === "string") return "<p>" + inline(b) + "</p>";
    if (b.subheading) return "<h3>" + inline(b.subheading) + "</h3>";
    if (b.note) return '<p class="guide-note">' + inline(b.note) + "</p>";
    /* Inline figure. Same {src, alt, width, height} shape as pages.home.image,
       rendered through imgTag; optional caption follows the photos array. */
    if (b.image) {
      var fig = imgTag(b.image, "guide-img", true);
      if (!fig) return "";
      return '<figure class="photo guide-figure">' + fig +
        (b.image.caption ? "<figcaption>" + esc(b.image.caption) + "</figcaption>" : "") +
        "</figure>";
    }
    if (b.list) {
      return '<ul class="check-list">' +
        b.list.map(function (i) { return "<li>" + inline(i) + "</li>"; }).join("") + "</ul>";
    }
    if (b.olist) {
      return '<ol class="guide-steps">' +
        b.olist.map(function (i) { return "<li>" + inline(i) + "</li>"; }).join("") + "</ol>";
    }
    if (b.table) {
      var t = b.table;
      var thead = "<thead><tr>" +
        (t.head || []).map(function (h) { return "<th>" + inline(h) + "</th>"; }).join("") +
        "</tr></thead>";
      var tbody = "<tbody>" +
        (t.rows || []).map(function (row) {
          return "<tr>" + row.map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody>";
      return '<div class="table-wrap"><table class="guide-table">' + thead + tbody + "</table></div>";
    }
    return "";
  }

  /* Renders an ordered list of {heading, body[]} sections (shared by guides
     and, when present, service pages). */
  function sectionsHtml(sections) {
    return (sections || []).map(function (sec) {
      return (sec.heading ? "<h2>" + inline(sec.heading) + "</h2>" : "") +
        (sec.body || []).map(blockHtml).join("");
    }).join("");
  }

  /* ---------- head: brand + analytics ----------------------------------
     NOTE: title, meta description, canonical, OG tags, and JSON-LD schema
     are baked into each page's static <head> (sourced from config at
     file-generation time) so crawlers see them before any JS runs. The H1
     is likewise static in each page's <main>. After changing headlines or
     meta text in config.js, regenerate the baked values with `node bake.js`
     — see README. */

  /* Color math mirrors bake.js — the baked <style> block in each page's
     head already carries these values; this re-derives them from config at
     load time so a config edit shows up even before re-baking. */
  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, w) {
    var ra = hexToRgb(a), rb = hexToRgb(b);
    return "#" + ra.map(function (v, i) {
      return ("0" + Math.round(v * w + rb[i] * (1 - w)).toString(16)).slice(-2);
    }).join("");
  }
  function rgba(hex, alpha) {
    var c = hexToRgb(hex);
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + alpha + ")";
  }

  function applyBrand() {
    var r = document.documentElement.style;
    var c = cfg.brand.color;
    r.setProperty("--brand", c);
    r.setProperty("--brand-dark", cfg.brand.colorDark);
    r.setProperty("--brand-contrast", cfg.brand.colorContrast);
    if (/^#[0-9a-fA-F]{6}$/.test(c)) {
      r.setProperty("--brand-soft", mix(c, "#ffffff", 0.10));
      r.setProperty("--brand-softer", mix(c, "#ffffff", 0.055));
      r.setProperty("--brand-border", mix(c, "#ffffff", 0.30));
      r.setProperty("--brand-glow", rgba(c, 0.30));
      r.setProperty("--brand-glow-soft", rgba(c, 0.15));
      r.setProperty("--footer-bg", mix(c, "#10161d", 0.16));
    }
    /* Theme attributes are baked onto <html> by bake.js; config wins here
       so a style/pattern change previews correctly before re-baking. */
    document.documentElement.setAttribute("data-style", cfg.brand.style || "classic");
    document.documentElement.setAttribute("data-pattern", cfg.brand.pattern || "none");
  }

  /* Deferred to idle time: gtag.js is ~90 KB of third-party JavaScript that
     competes with rendering for the main thread. Nothing on the page depends
     on it, so it waits until the browser is free (or 3s, whichever is first).
     The page_view still fires — just after the visitor can see the page. */
  function injectGA4() {
    var id = cfg.ga4Id;
    if (!id || id.indexOf("XXXX") !== -1 || !/^G-[A-Z0-9]+$/.test(id)) return;
    /* Queue immediately so a click_to_call in the first second still counts —
       gtag.js replays dataLayer when it finally loads. */
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    if (window.requestIdleCallback) {
      window.requestIdleCallback(loadGA4, { timeout: 1500 });
    } else {
      setTimeout(loadGA4, 1200);
    }

    function loadGA4() {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
      document.head.appendChild(s);
      window.gtag("js", new Date());
      window.gtag("config", id);
    }
  }

  /* Click-to-call tracking: fires a GA4 event for any tel: link. gtag only
     exists when injectGA4 ran (i.e. a real measurement ID is configured),
     so this is a silent no-op while the placeholder ID is in place. */
  function trackPhoneClicks() {
    document.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
      if (!link || typeof window.gtag !== "function") return;
      window.gtag("event", "click_to_call", {
        phone_number: link.getAttribute("href").replace("tel:", ""),
        link_text: (link.textContent || "").trim(),
        page_location: window.location.href
      });
    });
  }

  /* ---------- header / footer ------------------------------------------ */

  function renderHeader() {
    var file = currentFile();
    var links = [
      { href: "index.html", label: "Home" },
      { href: "index.html#services", label: "Services" },
      { href: "cost-guide.html", label: "Cost Guide" },
      { href: "about.html", label: "About" }
    ];
    var nav = links.map(function (l) {
      var active = l.href === file ? ' class="active"' : "";
      return "<li><a" + active + ' href="' + l.href + '">' + l.label + "</a></li>";
    }).join("");

    document.getElementById("site-header").innerHTML =
      '<div class="container header-inner">' +
        '<a class="logo" href="index.html">' + esc(cfg.business.name) + "</a>" +
        '<div class="header-actions">' +
          '<a class="btn btn-primary nav-phone" href="' + telHref() + '">' +
            UI.callLabel + " " + esc(cfg.business.phoneDisplay) + "</a>" +
          '<button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="' + UI.menuLabel + '">' +
            '<span></span><span></span><span></span>' +
          "</button>" +
        "</div>" +
        '<nav id="site-nav" class="site-nav" aria-label="Main">' +
          "<ul>" + nav + "</ul>" +
        "</nav>" +
      "</div>";

    var toggle = document.querySelector(".nav-toggle");
    var navEl = document.getElementById("site-nav");
    toggle.addEventListener("click", function () {
      var open = navEl.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function renderFooter() {
    var serviceLinks = cfg.services.map(function (s) {
      return '<li><a href="' + esc(s.page) + '">' + esc(s.name) + "</a></li>";
    }).join("");

    document.getElementById("site-footer").innerHTML =
      '<div class="container footer-grid">' +
        "<div>" +
          '<p class="footer-brand">' + esc(cfg.business.name) + "</p>" +
          '<p><a href="' + telHref() + '">' + esc(cfg.business.phoneDisplay) + "</a><br>" +
          '<a href="mailto:' + esc(cfg.business.email) + '">' + esc(cfg.business.email) + "</a></p>" +
          "<p>" + UI.serviceAreaLabel + ": " + esc(cfg.business.serviceArea) + "<br>" +
          UI.hoursLabel + ": " + esc(cfg.business.hours) + "</p>" +
        "</div>" +
        "<div><p class=\"footer-title\">" + UI.services + "</p><ul>" + serviceLinks + "</ul></div>" +
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
  }

  /* ---------- shared sections ------------------------------------------ */

  /* Fills the static hero (H1 is baked into the page HTML for SEO — this
     adds the sub-headline, CTAs, value props, and optional hero image).
     subheadline and ctaText are optional (area pages may omit them). */
  function fillHero(h, image) {
    var dyn = document.querySelector(".hero-dynamic");
    if (!dyn) return;
    /* Already baked into the page HTML by bake.js — leave it alone. Re-writing
       it here would tear down and re-request the hero image after first paint,
       which is exactly what LCP punishes. Hero copy changes therefore need
       `node bake.js`, same as the H1 and meta tags above. */
    if (dyn.children.length) return;
    dyn.innerHTML =
      (h.subheadline ? '<p class="hero-sub">' + esc(h.subheadline) + "</p>" : "") +
      '<div class="hero-actions">' +
        quoteButton(h.ctaText || cfg.pages.home.ctaText) + callButton() +
      "</div>" +
      '<ul class="value-props">' +
        cfg.valueProps.map(function (v) { return "<li>" + esc(v) + "</li>"; }).join("") +
      "</ul>";
    var media = imgTag(image, "hero-img");
    if (media) {
      document.querySelector(".hero").classList.add("has-media");
      document.querySelector(".hero-grid").insertAdjacentHTML(
        "beforeend", '<div class="hero-media">' + media + "</div>");
    }
  }

  function howItWorksSection(compact) {
    if (!cfg.howItWorks || !cfg.howItWorks.length) return "";
    var steps = cfg.howItWorks.map(function (s, i) {
      var badge = s.icon && iconSvg(s.icon)
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
        "<h2>" + UI.howItWorks + "</h2>" +
        '<ol class="steps">' + steps + "</ol>" +
      "</div></section>";
  }

  /* Enquiry form section — rendered on every page (home, service, guide,
     about) so the form and phone are always reachable without a page change.
     Call wireQuoteForm() after the containing innerHTML is set. */
  function enquirySection() {
    var note = cfg.contact.formNote
      ? '<p class="form-note">' + inline(cfg.contact.formNote) + "</p>"
      : "";
    return '<section class="section section-alt" id="quote"><div class="container narrow">' +
      "<h2>" + esc(cfg.contact.formHeadline) + "</h2>" +
      '<p class="reassurance">' + esc(cfg.contact.reassurance) + "</p>" +
      renderQuoteFormHtml() + note +
    "</div></section>";
  }

  function ctaBand(ctaText) {
    return '<section class="cta-band"><div class="container">' +
      "<h2>" + UI.ctaBandTitle + "</h2>" +
      "<p>" + UI.callLabel + ' <a href="' + telHref() + '">' + esc(cfg.business.phoneDisplay) +
      "</a> " + UI.orText + " request your free quote online.</p>" +
      quoteButton(ctaText, "btn-invert") +
    "</div></section>";
  }

  /* Testimonials/photos stay hidden until real evidence exists in config.
     This is intentional — see the CONTENT CONSTRAINT note in config.js. */
  function testimonialsSection() {
    if (!cfg.testimonials || !cfg.testimonials.length) return "";
    var items = cfg.testimonials.map(function (t) {
      return '<figure class="testimonial"><blockquote>' + esc(t.quote) + "</blockquote>" +
        "<figcaption>" + esc(t.name) + (t.detail ? " — " + esc(t.detail) : "") + "</figcaption></figure>";
    }).join("");
    return '<section class="section"><div class="container">' +
      "<h2>" + UI.testimonialsTitle + '</h2><div class="grid-3">' + items + "</div></div></section>";
  }

  function photosSection() {
    if (!cfg.photos || !cfg.photos.length) return "";
    var items = cfg.photos.map(function (p) {
      return '<figure class="photo"><img loading="lazy" src="' + esc(p.src) + '" alt="' + esc(p.alt) + '">' +
        (p.caption ? "<figcaption>" + esc(p.caption) + "</figcaption>" : "") + "</figure>";
    }).join("");
    return '<section class="section"><div class="container">' +
      "<h2>" + UI.photosTitle + '</h2><div class="grid-3">' + items + "</div></div></section>";
  }

  /* Service link cards — used by the homepage grid and by area pages
     (internal links from each area back to the service pages). */
  function serviceCards(services) {
    return services.map(function (s) {
      return '<article class="card">' +
        '<h3><a href="' + esc(s.page) + '">' + esc(s.name) + "</a></h3>" +
        "<p>" + esc(s.shortDescription) + "</p>" +
        '<a class="card-link" href="' + esc(s.page) + '">' + UI.serviceDetails + " &rarr;</a>" +
      "</article>";
    }).join("");
  }

  /* Homepage links out to every area page. Renders nothing while the
     areas array in config.js is empty. */
  function areasSection() {
    if (!cfg.areas || !cfg.areas.length) return "";
    var links = cfg.areas.map(function (a) {
      return '<li><a href="' + esc(a.slug) + '.html">' + esc(a.name) + "</a></li>";
    }).join("");
    return '<section class="section" id="areas"><div class="container">' +
      "<h2>" + UI.areasTitle + '</h2><ul class="area-links">' + links + "</ul>" +
    "</div></section>";
  }

  /* ---------- pages ------------------------------------------------------ */

  function renderHome(content) {
    var p = cfg.pages.home;
    fillHero(p, p.image);

    var homeSections = (p.sections && p.sections.length)
      ? '<section class="section"><div class="container narrow prose guide">' +
          sectionsHtml(p.sections) +
        "</div></section>"
      : "";

    content.innerHTML =
      '<section class="section" id="services"><div class="container">' +
        "<h2>" + UI.services + '</h2><div class="grid-3">' + serviceCards(cfg.services) + "</div></div></section>" +
      homeSections +
      areasSection() +
      howItWorksSection(false) +
      testimonialsSection() +
      '<section class="section"><div class="container narrow">' +
        "<h2>" + UI.faqTitle + "</h2>" +
        faqItems(cfg.faqs) +
      "</div></section>" +
      enquirySection() +
      ctaBand(p.ctaText);

    wireQuoteForm();
  }

  function renderService(content) {
    var file = currentFile();
    var svc = cfg.services.find(function (s) { return s.page === file; });

    if (!svc) {
      // Unmapped stub: replace the whole <main> so the stale baked H1 goes too.
      document.getElementById("main").innerHTML =
        '<section class="section"><div class="container narrow">' +
        "<h1>Page not in use</h1>" +
        "<p>This service page isn't mapped to a service in config.js. " +
        'Add a service entry with <code>page: "' + esc(file) + '"</code>, or delete this file.</p>' +
        '<p><a class="btn btn-primary" href="index.html">' + UI.backHome + "</a></p>" +
      "</div></section>";
      return;
    }

    fillHero(svc);

    var svcMedia = imgTag(svc.image, "service-img", true);

    // Optional "What's included / Typical pricing" block — only rendered when
    // the service supplies an `included` list (short service-style pages).
    var includedBlock = (svc.included && svc.included.length)
      ? '<section class="section section-alt"><div class="container narrow">' +
          '<div class="grid-2">' +
            "<div><h2>" + UI.included + '</h2><ul class="check-list">' +
              svc.included.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") +
            "</ul></div>" +
            '<div><h2>' + UI.pricing + '</h2><p class="price-note">' +
              esc(svc.priceNote || "") + "</p>" + quoteButton(svc.ctaText) +
          "</div></div>" +
        "</div></section>"
      : "";

    // Optional rich body — long-form service pages (multiple H2 sections,
    // lists, tables) use `sections` instead of the included/pricing block.
    var sectionsBlock = (svc.sections && svc.sections.length)
      ? '<section class="section"><div class="container narrow prose guide">' +
          sectionsHtml(svc.sections) +
        "</div></section>"
      : "";

    content.innerHTML =
      '<section class="section"><div class="container' + (svcMedia ? " intro-grid" : " narrow") + '">' +
        '<div class="intro-copy">' +
          svc.intro.map(function (t) { return '<p class="lead">' + esc(t) + "</p>"; }).join("") +
        "</div>" +
        (svcMedia ? '<div class="intro-media">' + svcMedia + "</div>" : "") +
      "</div></section>" +
      includedBlock +
      sectionsBlock +
      howItWorksSection(true) +
      testimonialsSection() +
      '<section class="section"><div class="container narrow">' +
        "<h2>" + esc(svc.name) + ": " + UI.faqTitle + "</h2>" +
        faqItems(svc.faqs) +
      "</div></section>" +
      enquirySection() +
      ctaBand(svc.ctaText);

    wireQuoteForm();
  }

  function renderArea(content) {
    var file = currentFile();
    var area = (cfg.areas || []).find(function (a) { return a.slug + ".html" === file; });

    if (!area) {
      // Unmapped area page (removed from config): replace the whole <main>
      // so the stale baked H1 goes too — same treatment as service stubs.
      document.getElementById("main").innerHTML =
        '<section class="section"><div class="container narrow">' +
        "<h1>Page not in use</h1>" +
        "<p>This area page isn't mapped to an entry in the areas array in config.js. " +
        "Add an entry with <code>slug: \"" + esc(file.replace(/\.html$/, "")) + "\"</code>, or delete this file.</p>" +
        '<p><a class="btn btn-primary" href="index.html">' + UI.backHome + "</a></p>" +
      "</div></section>";
      return;
    }

    fillHero(area);

    // localDetail accepts a single string or an array of paragraphs.
    var detail = area.localDetail
      ? [].concat(area.localDetail).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("")
      : "";

    // Feature the configured subset of services, or all of them.
    var featured = area.services && area.services.length
      ? cfg.services.filter(function (s) { return area.services.indexOf(s.page) !== -1; })
      : cfg.services;

    content.innerHTML =
      '<section class="section"><div class="container narrow">' +
        area.intro.map(function (t) { return '<p class="lead">' + esc(t) + "</p>"; }).join("") +
        detail +
      "</div></section>" +
      '<section class="section section-alt"><div class="container">' +
        "<h2>" + UI.servicesInPrefix + " " + esc(area.name) + "</h2>" +
        '<div class="grid-3">' + serviceCards(featured) + "</div>" +
        '<p class="center"><a class="text-link" href="index.html">' + UI.backHome + " &rarr;</a></p>" +
      "</div></section>" +
      howItWorksSection(true) +
      (area.faqs && area.faqs.length
        ? '<section class="section section-alt"><div class="container narrow">' +
            "<h2>" + esc(area.name) + " — " + UI.faqTitle + "</h2>" +
            faqItems(area.faqs) +
          "</div></section>"
        : "") +
      ctaBand(area.ctaText || cfg.pages.home.ctaText);
  }

  function renderFaq(content) {
    content.innerHTML =
      '<section class="section"><div class="container narrow">' +
        faqItems(cfg.faqs) +
      "</div></section>" +
      ctaBand(cfg.pages.home.ctaText);
  }

  function renderAbout(content) {
    // Rich, sectioned About body (with markdown links) when provided; falls
    // back to the plain paragraph list for a generic template deployment.
    var body = (cfg.about.sections && cfg.about.sections.length)
      ? '<div class="prose guide">' + sectionsHtml(cfg.about.sections) + "</div>"
      : (cfg.about.paragraphs || []).map(function (t) {
          return '<p class="lead">' + esc(t) + "</p>";
        }).join("");

    content.innerHTML =
      '<section class="section"><div class="container narrow">' +
        body +
        '<p class="contact-lines">' +
          "<strong>" + UI.callLabel + ":</strong> " +
          '<a href="' + telHref() + '">' + esc(cfg.business.phoneDisplay) + "</a><br>" +
          "<strong>Email:</strong> " +
          '<a href="mailto:' + esc(cfg.business.email) + '">' + esc(cfg.business.email) + "</a><br>" +
          "<strong>" + UI.serviceAreaLabel + ":</strong> " + esc(cfg.business.serviceArea) + "<br>" +
          "<strong>" + UI.hoursLabel + ":</strong> " + esc(cfg.business.hours) +
        "</p>" +
      "</div></section>" +
      photosSection() +
      enquirySection();

    wireQuoteForm();
  }

  function renderPrivacy(content) {
    var p = cfg.pages.privacy;
    var name = esc(cfg.business.name);

    // Config-driven policy (with markdown links) when provided; otherwise the
    // generic default below so the template still works for any niche.
    if (cfg.privacy && cfg.privacy.sections && cfg.privacy.sections.length) {
      content.innerHTML =
        '<section class="section"><div class="container narrow prose guide">' +
          (p.lastUpdated ? '<p class="guide-reviewed">Last reviewed: ' + esc(p.lastUpdated) + "</p>" : "") +
          sectionsHtml(cfg.privacy.sections) +
        "</div></section>";
      return;
    }

    content.innerHTML =
      '<section class="section"><div class="container narrow prose">' +
        "<p><em>Last updated: " + esc(p.lastUpdated) + "</em></p>" +
        "<h2>What this website collects</h2>" +
        "<p>When you use the quote form on this site, we collect three things: your <strong>name</strong>, your <strong>phone number</strong>, and the <strong>service you need</strong>. That's it — the form has no other fields.</p>" +
        "<h2>How it's used</h2>" +
        "<p>Your details are used for one purpose: to contact you about your quote request. They are not sold, shared with advertisers, or added to any marketing list.</p>" +
        "<h2>Who processes the form</h2>" +
        "<p>The form is delivered by <a href=\"https://formspree.io\" rel=\"noopener\">Formspree</a>, a form-handling service. When you submit the form, your details pass through Formspree's servers to reach us. Formspree's own privacy policy is available on their website.</p>" +
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

  function renderGuide(content) {
    var file = currentFile();
    var g = (cfg.guides || []).find(function (x) { return x.slug + ".html" === file; });

    if (!g) {
      // Unmapped guide page (removed from config): replace the whole <main>
      // so the stale baked H1 goes too — same treatment as service/area stubs.
      document.getElementById("main").innerHTML =
        '<section class="section"><div class="container narrow">' +
        "<h1>Page not in use</h1>" +
        "<p>This guide page isn't mapped to an entry in the guides array in config.js. " +
        "Add an entry with <code>slug: \"" + esc(file.replace(/\.html$/, "")) + "\"</code>, or delete this file.</p>" +
        '<p><a class="btn btn-primary" href="index.html">' + UI.backHome + "</a></p>" +
      "</div></section>";
      return;
    }

    var byline = g.byline ? '<p class="guide-byline">' + inline(g.byline) + "</p>" : "";
    var reviewed = g.lastReviewed
      ? '<p class="guide-reviewed">Last reviewed: ' + esc(g.lastReviewed) + "</p>" : "";
    var intro = (g.intro || []).map(function (t) {
      return '<p class="lead">' + inline(t) + "</p>";
    }).join("");

    content.innerHTML =
      '<section class="section"><div class="container narrow prose guide">' +
        byline + reviewed + intro +
        sectionsHtml(g.sections) +
        (g.faqs && g.faqs.length
          ? "<h2>" + UI.faqTitle + "</h2>" + faqItems(g.faqs)
          : "") +
      "</div></section>" +
      enquirySection() +
      ctaBand(g.cta || cfg.pages.home.ctaText);

    wireQuoteForm();
  }

  /* ---------- two-step quote form ---------------------------------------- */

  function renderQuoteFormHtml() {
    var options = cfg.services.map(function (s) { return s.name; })
      .concat([cfg.contact.otherServiceLabel]);
    var radios = options.map(function (name, i) {
      return '<label class="service-option">' +
        '<input type="radio" name="service" value="' + esc(name) + '" required>' +
        "<span>" + esc(name) + "</span>" +
      "</label>";
    }).join("");

    var tfOpts = (cfg.contact.timeframeOptions || [])
      .map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + "</option>"; })
      .join("");

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
        '<button class="btn btn-primary btn-block" type="submit">' + esc(cfg.contact.submitText) + "</button>" +
      "</fieldset>" +
      '<p class="form-status" id="form-status" role="status" aria-live="polite"></p>' +
    "</form>";
  }

  function wireQuoteForm() {
    var form = document.getElementById("quote-form");
    if (!form) return;
    var step2 = document.getElementById("form-step-2");
    var status = document.getElementById("form-status");

    form.addEventListener("change", function (e) {
      if (e.target.name === "service" && step2.hidden) {
        step2.hidden = false;
        document.getElementById("qf-suburb").focus();
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var service = form.querySelector('input[name="service"]:checked');
      var suburb = document.getElementById("qf-suburb");
      var size = document.getElementById("qf-size");
      var timeframe = document.getElementById("qf-timeframe");
      var name = document.getElementById("qf-name");
      var phone = document.getElementById("qf-phone");
      var email = document.getElementById("qf-email");
      if (!service || !suburb.value.trim() || !timeframe.value ||
          !name.value.trim() || !phone.value.trim() || !email.value.trim()) {
        status.textContent = "Please tell us what you need, your suburb and timeframe, and your name, phone and email.";
        status.className = "form-status error";
        return;
      }

      var id = cfg.formspreeId;
      if (!id || id.indexOf("YOUR_") === 0) {
        // Owner hasn't configured Formspree yet — fail gracefully for visitors.
        console.warn("Formspree ID not set in config.js — form cannot submit.");
        showError();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.textContent = UI.sending;
      status.className = "form-status";

      var data = new FormData();
      data.append("service", service.value);
      data.append("suburb", suburb.value.trim());
      data.append("size", size.value.trim());
      data.append("timeframe", timeframe.value);
      data.append("name", name.value.trim());
      data.append("phone", phone.value.trim());
      data.append("email", email.value.trim());
      data.append("_subject", "New job enquiry: " + service.value + " — " + suburb.value.trim());

      fetch("https://formspree.io/f/" + id, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.innerHTML = '<p class="form-status success">' + esc(cfg.contact.successMessage) + "</p>";
        } else {
          btn.disabled = false;
          showError();
        }
      }).catch(function () {
        btn.disabled = false;
        showError();
      });

      function showError() {
        status.innerHTML = esc(cfg.contact.errorMessage) +
          ' <a href="' + telHref() + '">' + esc(cfg.business.phoneDisplay) + "</a>";
        status.className = "form-status error";
      }
    });
  }

  /* ---------- motion ------------------------------------------------------
     Purely decorative. Both helpers bail out cleanly when the browser lacks
     support or the user prefers reduced motion — content is always visible
     because the hidden state only exists under html.anim (see styles.css). */

  function initHeaderShadow() {
    var header = document.getElementById("site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("anim");

    var targets = document.querySelectorAll(
      ".card, .step, .faq-item, .testimonial, .photo, .section h2, " +
      ".price-note, .intro-copy, .intro-media, .contact-lines, " +
      "#quote-form, .area-links li"
    );
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    targets.forEach(function (el) {
      // Stagger siblings (e.g. cards in a grid) by their position.
      var idx = el.parentNode
        ? Array.prototype.indexOf.call(el.parentNode.children, el)
        : 0;
      el.style.transitionDelay = (idx % 6) * 70 + "ms";
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ---------- boot --------------------------------------------------------- */

  applyBrand();
  injectGA4();
  trackPhoneClicks();
  renderHeader();
  renderFooter();
  initHeaderShadow();

  var content = document.getElementById("page-content");
  var page = document.body.getAttribute("data-page");
  var renderers = {
    home: renderHome,
    service: renderService,
    area: renderArea,
    guide: renderGuide,
    faq: renderFaq,
    about: renderAbout,
    privacy: renderPrivacy
  };
  if (renderers[page] && content) renderers[page](content);
  initReveal();

  /* If the URL has a hash (e.g. about.html#quote), re-scroll after render
     since the target element didn't exist at initial page load. */
  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target) target.scrollIntoView();
  }
})();
