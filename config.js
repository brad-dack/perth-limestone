/* =============================================================================
   SITE CONFIG — Perth Limestone Group.
   Edit this file, then run:
     node bake.js          (regenerate pages + CNAME/robots/sitemap/404/favicon)
     node bake.js --check   (preflight — fails on leftover placeholders)

   POSITIONING LEVEL 2. Real brand, "we" voice, no named individual anywhere,
   no claim to perform trade work. Service pages are written ABOUT the work,
   not about us doing it. The commercial arrangement is described plainly on
   the About page only — no page carries a disclaimer.

   PAGE SET (verified-keyword brief): home, limestone-retaining-walls (council
   approval is a SECTION inside it), limestone-fencing, limestone-wall-repairs,
   cost-guide, about. Plus privacy (legal requirement for a form collecting
   personal information; not a ranking page).

   PRE-LAUNCH: [DATE], every [VERIFY: ...] and
   [NEEDS INPUT: ...] note, plus GA4 id.
============================================================================= */

window.SITE_CONFIG = {

  /* --- Core business identity ---------------------------------------- */
  business: {
    name: "Perth Limestone Group",
    phone: "+61895161538",
    phoneDisplay: "(08) 9516 1538",
    email: "hello@perthlimestonegroup.com.au",
    city: "Perth",
    state: "WA",
    serviceArea: "the Perth metropolitan area",
    hours: "Online enquiries anytime"
  },

  domain: "https://perthlimestonegroup.com.au",

  /* --- Brand ----------------------------------------------------------- */
  brand: {
    color: "#a9702e",         // warm sandstone — reads as limestone
    colorDark: "#8a5a24",
    colorContrast: "#ffffff",
    style: "classic",
    pattern: "none"
  },

  /* --- Tracking / integrations ----------------------------------------- */
  ga4Id: "G-VPF9MGXG4Y",
  formspreeId: "xwleevrl",

  /* --- Structured data -------------------------------------------------- */
  /* Organization, NOT LocalBusiness — there is no physical trade premises,
     and a fabricated address is a hard stop. */
  schema: {
    type: "Organization"
  },

  /* --- Pages -------------------------------------------------------------- */
  pages: {
    home: {
      metaTitle: "Limestone Retaining Walls Perth | Get a Quote",
      metaDescription: "Limestone retaining walls, fencing, repairs and capping across the Perth metro area. Tell us about your job and get a quote. No cost and no obligation.",
      headline: "Limestone retaining walls in Perth",
      subheadline: "Retaining walls, limestone fencing, and wall repairs and capping across the Perth metropolitan area. Tell us about your job and we'll come back to you.",
      ctaText: "Tell us about your job",
      /* AI-generated illustrative image. Generic scene — no real address, no
         identifiable property — and never captioned as completed work.
         Replace with real Perth photography when it exists. */
      image: {
        src: "images/retainingwall434knl.webp",
        alt: "A limestone retaining wall holding back a raised garden bed in a Perth backyard",
        width: 1259,
        height: 747
      },
      sections: [
        {
          heading: "Why limestone, and why Perth in particular",
          body: [
            "Perth sits on the Swan Coastal Plain, which is broadly sand over limestone. The material is quarried locally, and that local supply is much of why limestone is the default retaining material here in a way it is not in other Australian capitals.",
            "**Natural quarried limestone block** varies in size, colour and face. That variation is the aesthetic appeal, and it is also why a natural block wall takes longer to lay. Natural block is lighter than reconstituted, which matters where access is tight.",
            "**Reconstituted limestone block** is manufactured to consistent dimensions. Uniform face, faster to lay, and more predictable to quote.",
            "Neither is the right answer in general. Which one suits depends on the look, the wall height, the access and the budget. There is more on both on the [limestone retaining walls page](limestone-retaining-walls.html)."
          ]
        },
        {
          heading: "Is your wall actually a retaining wall?",
          body: [
            "This matters more than most homeowners expect, because it changes the cost, the construction and whether council or shire approval is likely to be needed.",
            "**If the ground is level on both sides,** it is a boundary or garden wall. It holds up itself and nothing else. Simpler footing, simpler build.",
            "**If the ground is higher on one side,** the wall is retaining soil. It needs a heavier footing, drainage behind the base, and depending on height and load, engineering input. The soil behind it pushes permanently, and it gets heavier when it is wet.",
            "Many Perth blocks fall away enough for this to apply without the owner realising. Levelling a sloping backyard, or building up a pad for a pool or a shed, almost always means retaining."
          ]
        },
        {
          heading: "What drives the price",
          body: [
            "Height, before everything else. Footing depth and engineering requirements step up as the wall gets taller, and they step up faster than the block count does. A wall twice as tall costs considerably more than twice as much.",
            "After height, in rough order of impact:",
            { list: [
              "**Whether it is genuinely retaining,** as above",
              "**Access,** whether a machine can reach the wall line or whether every block goes through a side gate by hand",
              "**Drainage requirements,** including where the water is taken",
              "**Ground conditions** at footing level",
              "**Spoil removal,** because excavated sand has to go somewhere"
            ] },
            "How these interact, and how to read a quote, is set out on the [cost guide](cost-guide.html)."
          ]
        },
        {
          heading: "Drainage is where walls fail",
          body: [
            "When a limestone retaining wall fails in Perth, water is usually involved. The standard approach is agricultural pipe behind the base of the wall, free draining aggregate rather than the sand that came out of the hole, a geotextile layer to stop fines clogging the aggregate, and weep holes or a defined discharge point so the water has somewhere to go.",
            "There is a second reason to care. If a wall changes where stormwater goes and pushes it into a neighbouring property, that is a liability exposure, and it exists whether or not the wall was approved. It is worth asking any quote what the drainage detail is and where the water discharges to."
          ]
        },
        {
          heading: "Fencing, repairs and capping",
          body: [
            "Not every limestone job is a retaining wall. Limestone fencing, wall repairs, capping and cladding are all common in Perth and are a different build with a different cost profile.",
            "Solid limestone fences and pier and infill fencing are covered on the [limestone fencing page](limestone-fencing.html). Repairs to an existing wall, new capping including bullnose, and limestone cladding are on the [wall repairs and capping page](limestone-wall-repairs.html)."
          ]
        },
        {
          heading: "Where we cover",
          body: [
            "The Perth metropolitan area, covering every local government area from Wanneroo and Joondalup in the north to Rockingham and Kwinana in the south, and out to Armadale, Gosnells, Kalamunda and Mundaring in the hills and south-east.",
            "If your job sits outside that, send it through anyway. We read every enquiry and will tell you either way."
          ]
        }
      ]
    },
    about: {
      metaTitle: "About Perth Limestone Group",
      metaDescription: "What Perth Limestone Group is, the area it covers, what happens when you enquire, and how the service is paid for. A plain description of how it works.",
      headline: "About Perth Limestone Group"
    },
    privacy: {
      metaTitle: "Privacy Policy | Perth Limestone Group",
      metaDescription: "How Perth Limestone Group collects, uses and shares the details you submit through this website, and how to access, correct or delete them.",
      headline: "Privacy policy",
      lastUpdated: "[DATE]"
    }
  },

  /* Short value points — each one true before any contractor is attached. */
  valueProps: [
    "Free quotes, no obligation",
    "Perth metropolitan area",
    "Every enquiry gets an answer"
  ],

  /* --- How it works ------------------------------------------------------- */
  howItWorks: [
    {
      icon: "chat",
      title: "Tell us about your job",
      text: "What you need, your suburb, the rough size and your timeframe. It takes about a minute."
    },
    {
      icon: "clipboard",
      title: "We come back to you",
      text: "We read every enquiry. If we can't help with your job we'll say so and point you somewhere useful."
    },
    {
      icon: "check",
      title: "Your job gets quoted",
      text: "A time is arranged to look at the job and price it properly. No cost, and no obligation to go ahead."
    }
  ],

  /* --- Services (3) ------------------------------------------------------- */
  services: [
    {
      page: "limestone-retaining-walls.html",
      name: "Limestone Retaining Walls",
      shortDescription: "How limestone retaining walls are built in Perth, what drives the cost, and the council approval and engineering position.",
      metaTitle: "Limestone Retaining Walls Perth | What to Know First",
      metaDescription: "How limestone retaining walls are built in Perth, what drives the cost, drainage, and whether council or shire approval applies. What to ask before you commit.",
      headline: "Limestone retaining walls in Perth",
      subheadline: "How they are built, what drives the cost, and whether approval applies.",
      ctaText: "Tell us about your job",
      intro: [
        "A limestone retaining wall is doing a structural job. It holds back soil that would otherwise move, and how well it does that comes down to things you cannot see once it is finished: the footing, the drainage and the backfill.",
        "This page is for someone who has worked out they probably need a retaining wall and does not yet know what they are buying. It covers how one is built, what makes one quote different from another, whether approval applies, and what to ask."
      ],
      sections: [
        {
          heading: "What makes a wall a retaining wall",
          body: [
            "A retaining wall holds back soil that would otherwise move. If the finished ground level is higher on one side than the other, the wall is retaining, and it has to be built to resist that load.",
            "The load is not static. Soil is heavier when it is wet, and Perth sand behaves differently saturated than it does dry. A wall designed only for the weight of dry sand is a wall designed for the easy half of the year.",
            "If ground levels are equal on both sides, it is a boundary or garden wall instead. Different footing, different price, usually a different approval position.",
            { image: {
              src: "images/explanatory_diagram_retaining_vs_garden_wall.webp",
              alt: "Diagram comparing a garden wall with level ground on both sides to a retaining wall holding back higher ground",
              width: 1123,
              height: 768,
              caption: "Diagram, not a specific wall or job."
            } }
          ]
        },
        {
          heading: "Natural block or reconstituted block",
          body: [
            "**Natural quarried limestone.** Cut from Perth quarries. Block dimensions, colour and face vary from block to block and pallet to pallet, so each block is selected and placed to suit. That is why the wall looks the way it does and why it takes longer to build. Natural block is also lighter than reconstituted, which makes it easier to place cleanly where access is tight.",
            { note: "[VERIFY: confirm current natural limestone block availability in Perth before stating anything about supply. One competitor claims natural block is back in stock across Perth after roughly three years. Confirm with a Perth quarry or supplier and date the claim, or leave availability unstated.]" },
            "**Reconstituted limestone.** Manufactured block, consistent size and face. Faster to lay because there is no selection process, generally cheaper to install for the same wall, and easier to quote accurately because the labour is predictable.",
            "Height, budget, access and appearance decide it, and it is a question worth settling on site rather than in advance."
          ]
        },
        {
          heading: "How the wall is built",
          body: [
            "Understanding the sequence makes quotes far easier to compare, because you can see what a cheap quote has left out.",
            { olist: [
              "**Set out and excavation.** The wall line is set out and a trench excavated for the footing. Depth depends on wall height and ground conditions.",
              "**Footing.** The footing spreads the load and stops the wall rotating forward. Footing size steps up with wall height. It is invisible when the job is finished, and it is the part most commonly reduced on a cheap quote.",
              "**Laying.** Blocks laid to line and level, usually with a slight backward lean into the retained ground on taller walls, jointed or dry laid depending on block and design.",
              "**Drainage.** Agricultural pipe run behind the base of the wall, surrounded by free draining aggregate, separated with geotextile so fines do not clog the aggregate. The ag pipe has to discharge somewhere sensible.",
              "**Backfill and compaction.** Free draining material immediately behind the wall, then backfill and compaction in layers behind that. Backfilling straight against the wall with the sand that came out of the trench defeats the drainage.",
              "**Finish.** Capping if specified, mortar tidied, spoil removed, site cleaned up."
            ] }
          ]
        },
        {
          heading: "Drainage, in more detail",
          body: [
            "Drainage is the most common cause of retaining wall failure and also the least visible part of the job. Once the wall is backfilled it cannot be inspected.",
            { image: {
              src: "images/Drainage_diagram_836uj4nk.webp",
              alt: "Diagram of a limestone retaining wall showing limestone blocks, gravel backfill and a drainage pipe behind the wall",
              width: 1408,
              height: 768,
              caption: "Diagram, not a specific wall or job."
            } },
            "What should be there:",
            { list: [
              "**Ag pipe** at the base behind the wall, laid to fall",
              "**Free draining aggregate** around it, not sand",
              "**Geotextile** separating the aggregate from surrounding soil so fines do not wash in and block it",
              "**Weep holes or a defined discharge point,** so water leaves the system rather than sitting behind the wall"
            ] },
            "Water that cannot escape adds hydrostatic pressure to the back of the wall on top of the soil load it was designed for. That is how walls lean, bulge and eventually come apart.",
            "There is a neighbour dimension as well. If a wall redirects stormwater onto an adjoining property, there is a liability exposure whether or not the wall was approved and whether or not it stands up. Worth resolving on paper before it is built."
          ]
        },
        {
          heading: "Footings, Perth sand and mortar",
          body: [
            "The footing does the structural work. It is sized to the wall, not to a rule of thumb, and it is where the money goes on a taller wall. Perth's sandy profile drains well, which helps, but it offers different bearing behaviour to clay and it moves when it is not confined.",
            { note: "[VERIFY: obtain footing depth and compaction guidance appropriate to Perth sand profiles, and the concrete strength typically specified for limestone retaining wall footings, from a WA structural engineer or published WA guidance. Publish no figure or grade without a source.]" },
            "One quality difference a homeowner would not know to ask about is mortar colour. A wall can be pointed with default grey mortar, or with mortar tinted to match the limestone. Matched mortar reads as one material; grey mortar reads as block and lines. It is a real and visible difference, and worth raising when comparing quotes."
          ]
        },
        {
          heading: "What drives the cost",
          body: [
            "Ranked by how much it moves the number.",
            { olist: [
              "**Height.** Footing depth, block volume and engineering requirements all step up with height, and they compound. This is the dominant variable.",
              "**Retaining or not.** A retaining wall needs footing, drainage and possibly engineering that a garden wall does not.",
              "**Access.** Whether a machine can reach the wall line, or whether the job is barrows through a side gate.",
              "**Drainage and discharge.** Where the water goes and how far it has to be taken.",
              "**Ground conditions.** What the excavator finds.",
              "**Spoil removal.** Truck movements to take excavated material away.",
              "**Length.** It matters, but less per metre than most people assume, because setup and access costs spread across it."
            ] },
            "Ranges and how to read a quote are on the [cost guide](cost-guide.html)."
          ]
        },
        {
          heading: "Do you need council or shire approval?",
          body: [
            "Retaining walls in Perth are regulated, and the rules are not uniform. They are set by the local government, which may be a city, a town or a shire, and thresholds differ between them. There is no single Perth wide rule, and any page giving one figure for the whole metro area has not checked.",
            "None of this is legal advice. Your council or shire's answer is the authoritative one. Confirm before committing to anything.",
            { subheading: "Why retaining walls are regulated at all" },
            "Above a certain height a failing wall can injure someone and damage structures behind and below it. Changing ground levels changes where stormwater goes. Walls near boundaries affect the neighbour's levels and drainage, which is a common source of dispute. And excavation near sewer, water, gas, power and telecommunications assets is a genuine hazard. None of the rules are arbitrary.",
            { subheading: "Building permit and planning approval are two different things" },
            "A **building permit** is issued under the Building Act 2011 (WA) and the Building Regulations 2012 (WA). It is concerned with whether the structure is sound and compliant, so engineering certification, footing design and structural adequacy sit here.",
            "**Planning approval,** also called development approval, sits under the planning framework: the local planning scheme and, where relevant, the Residential Design Codes. It is concerned with land use, siting, setbacks, and effect on the neighbourhood. A wall can need both, either, or neither, and where planning approval is needed it normally comes first.",
            { subheading: "What generally triggers approval" },
            "Height is the usual trigger. Then proximity to a boundary, supporting a surcharge load such as a driveway or a pool, altering stormwater flow, or forming part of a larger development.",
            { note: "[VERIFY: publish no Perth wide height figure. Obtain each per council or shire threshold and record it in the table below with a source link and a checked date. Do not infer one council's figure from another.]" },
            { subheading: "Council and shire approval reference" },
            "This table is only worth anything if every cell is real, so it is built by contacting each local government individually and dated as it goes.",
            { table: {
              head: ["Local Government", "Approval threshold", "Other triggers", "Council link", "Last checked"],
              rows: [
                ["City of Bayswater", "Planning approval above 0.5m above natural ground level; a building permit is also required where the wall retains soil (cut) affecting adjoining land.", "Retaining/site works over 0.5m on vacant land are generally not approved unless tied to a future development plan or a subdivision condition.", "[Fences and retaining walls](https://www.bayswater.wa.gov.au/home-and-property/renovating-your-home-or-property/fences-and-retaining-walls)", "2026-08-04"],
                ["City of Belmont", "Building permit required where the wall retains ground more than 500mm and protects adjoining land.", "Development approval also triggered in heritage areas, Special Development Precincts and the Swan River Trust Development Control Area; written consent from affected adjoining owners is required for boundary encroachment.", "[Retaining walls](https://www.belmont.wa.gov.au/build/demolishing-and-building/approval-for-buildings-and-structures/i-want-to-build/retaining-wall)", "2026-08-04"],
                ["City of Canning", "Not published, contact council.", "Not published, contact council.", "[Building services](https://www.canning.wa.gov.au/plan-and-build/building-services/)", "2026-08-04"],
                ["City of Fremantle", "Building permit required for walls retaining more than 500mm; every retaining wall, regardless of height, must be designed by a qualified practising structural engineer.", "A separate planning development approval may also be required — confirm with the City's planning team.", "[Fences and retaining walls](https://www.fremantle.wa.gov.au/planning-and-building/planning-and-building-applications/building/fences-and-retaining-walls/)", "2026-08-04"],
                ["City of Melville", "No planning approval needed at or below 500mm; a building permit is required where the wall retains soil over 500mm, is an addition to an existing wall, or (tiered walls) the total retained height exceeds 500mm.", "A building permit may still be required for excavation or cut near adjoining properties even under 500mm.", "[Building a fence or retaining wall](https://www.melvillecity.com.au/planning-and-building/building-or-renovating/building-a-fence-or-retaining-wall)", "2026-08-04"],
                ["City of Nedlands", "Not published, contact council.", "Not published, contact council.", "[Do I need a permit?](https://www.nedlands.wa.gov.au/development/building/do-i-need-a-permit.aspx)", "2026-08-04"],
                ["City of Perth", "Fill or retaining up to 500mm above natural ground level within setback areas is exempt from development approval under City Planning Scheme No. 2, Schedule 7; the building permit threshold beyond this is not clearly published.", "Excavation and fill limits within setback areas are set out in Schedule 7.", "[Schedule 7 — minor development exempt from development approval (PDF)](https://perth.wa.gov.au/-/media/Project/COP/COP/COP/Documents-and-Forms/Develop/Documents/Planning-Framework/Planning-Schemes/City-Planning-Scheme-No-2/Schedule-7---Minor-Development-Exempt-from-Development-Approval.pdf)", "2026-08-04"],
                ["City of South Perth", "Building permit and planning approval required where the wall retains ground over 0.5m.", "Walls or fill over 0.5m within 7.5m of a boundary need screening if overlooking is possible; a BA20 form is required where a wall encroaches across a boundary.", "[Building approvals](https://southperth.wa.gov.au/development/building/building-approvals)", "2026-08-04"],
                ["City of Stirling", "Not published, contact council. (Third-party trade sites quote a 500mm figure for Stirling, but it does not appear on the council's own published pages, so it is not stated here.)", "Not published, contact council.", "[Building documents](https://www.stirling.wa.gov.au/developing-property/building-advice/building-documents)", "2026-08-04"],
                ["City of Subiaco", "Retaining walls under 500mm are exempt from development approval under Local Planning Policy 7.7.", "Not published, contact council for building permit specifics.", "[Building regulations and standards](https://www.subiaco.wa.gov.au/plan-build/build-renovate/building-regulations-and-standards)", "2026-08-04"],
                ["City of Vincent", "Retaining walls up to 0.5m are exempt from development approval; a building permit is generally required over 500mm.", "Where a retaining wall sits beneath a building's wall, it is included in that wall's overall height measurement from natural ground level.", "[Building approval](https://www.vincent.wa.gov.au/develop-build/building/building-applications-and-permits/building-approval.aspx)", "2026-08-04"],
                ["Shire of Peppermint Grove", "Building permit required for any retaining wall greater than 450mm in height.", "An owner changing ground level near a boundary that affects the adjoining lot must build a suitably sized retaining wall wholly within their own lot, including footings; structural engineer certification may be required.", "[Retaining walls](https://www.peppermintgrove.wa.gov.au/development/building/retaining-walls.aspx)", "2026-08-04"],
                ["Town of Bassendean", "Building permit not required if the wall is 500mm or under and does not support another building or structure (required above 500mm, or if it supports a structure).", "Work remains subject to the building standards even where it is exempt from a permit.", "[Building or altering a retaining wall or deck (PDF)](https://www.bassendean.wa.gov.au/Profiles/bassendean/Assets/ClientData/Document-Centre/Building_Services/Information_Sheets/Building_or_Altering_a_Retaining_Wall_or_a_Deck_-_Information_Sheet.pdf)", "2026-08-04"],
                ["Town of Cambridge", "Not published, contact council.", "Not published, contact council.", "[Plan and build](https://www.cambridge.wa.gov.au/Plan-Build/Building)", "2026-08-04"],
                ["Town of Claremont", "Not published, contact council for a standalone figure.", "Development approval must be obtained before a building permit application for retaining walls, per the Town's process.", "[Building](https://www.claremont.wa.gov.au/services/planning-and-building/building/)", "2026-08-04"],
                ["Town of Cottesloe", "Not published, contact council.", "Not published, contact council.", "[Application forms and permits](https://www.cottesloe.wa.gov.au/business-development/building/application-forms-and-permits.aspx)", "2026-08-04"],
                ["Town of East Fremantle", "Not published, contact council for a standalone retaining-wall figure.", "Side boundary fencing including retaining is exempt from approval up to 2.3m above natural ground level; retaining walls associated with swimming pool works may require development approval.", "[When do I need planning approval?](https://www.eastfremantle.wa.gov.au/council-services--town-planning--information-sheets--when-do-i-need-planning-approval.aspx)", "2026-08-04"],
                ["Town of Mosman Park", "Building permit required where associated retaining exceeds 500mm.", "Where retaining forms part of a fence, height is measured from the higher-ground-level side.", "[Dividing fences](https://www.mosmanpark.wa.gov.au/build/building-services/dividing-fences/)", "2026-08-04"],
                ["Town of Victoria Park", "Building permit required where a retaining wall is within 1.0m of a boundary, or 500mm or more in height if not on the boundary.", "Site plans for development approval must show contours at 0.5m intervals and the location and levels of adjoining structures.", "[Building information and FAQs](https://www.victoriapark.wa.gov.au/develop-and-build/building/building-information-and-faqs.aspx)", "2026-08-04"],
                ["City of Kalamunda", "A retaining wall exceeding 500mm within the front setback area requires approval; confirm with Planning outside the setback area.", "Anyone excavating below or filling above natural ground level must provide a suitable retaining wall or embankment maintaining natural ground level and any existing surcharge load at the boundary; a front-setback fence above a retaining wall is capped at 1.5m and 50% permeable.", "[Building information sheet (PDF)](https://www.kalamunda.wa.gov.au/docs/default-source/building/information-sheets/4bldinfosheet.pdf)", "2026-08-04"],
                ["City of Swan", "Not published, contact council.", "Not published, contact council.", "[Useful documents and links](https://www.swan.wa.gov.au/plan-and-build/useful-documents-and-links)", "2026-08-04"],
                ["Shire of Mundaring", "Not published, contact council. (The Shire notes stricter controls where slope, bushfire or soil instability apply, but publishes no clean height figure.)", "Not published, contact council.", "[Fences and retaining walls](https://www.mundaring.wa.gov.au/plan-build/building-and-renovating-structures/fences-retaining-walls.aspx)", "2026-08-04"],
                ["City of Joondalup", "Building permit not required if the wall is 0.5m or under and does not protect adjoining land; planning approval thresholds vary by R-Code density (for example, R20 allows up to 1m within the street setback without approval, higher-density codes cap it at 0.5m).", "Retaining or fill exceeding 0.5m within 7.5m of a side or rear boundary triggers screening requirements.", "[Retaining walls and site works](https://www.joondalup.wa.gov.au/plan-and-build/residential-building-and-renovation-guides/retaining-walls-and-site-works)", "2026-08-04"],
                ["City of Wanneroo", "Building permit required where the wall exceeds 500mm, is an addition to an existing wall, or (tiered walls) the total height exceeds 500mm.", "Planning approval is required regardless of height in non-residential zones; in residential zones only if it does not comply with the Residential Design Codes.", "[Retaining walls](https://www.wanneroo.wa.gov.au/directory_record/106/retaining_walls)", "2026-08-04"],
                ["City of Armadale", "Building permit required for retaining walls over 0.5m.", "Boundary retaining walls may require a building permit regardless of height; planning approval may be required before a building permit can be issued; setbacks follow the Residential Design Codes.", "[What can I build?](https://my.armadale.wa.gov.au/service/planning-and-building/building-services/what-can-i-build/)", "2026-08-04"],
                ["City of Gosnells", "Building permit or development approval may be required for walls more than 0.5m high, or within 1.5m of the property boundary.", "Certified structural engineer drawings are required for walls 500mm or over; development approval should be obtained before applying for a building permit.", "[Retaining walls](https://www.gosnells.wa.gov.au/Your_property/Fences_and_retaining_walls/Retaining_walls)", "2026-08-04"],
                ["Shire of Serpentine-Jarrahdale", "Building permit required for all retaining walls greater than 500mm.", "Also required under 500mm where the wall changes natural site drainage in a way that reduces its effectiveness; an owner excavating below or filling above natural ground level at a boundary must provide a suitable retaining wall or durable embankment.", "[Retaining walls](https://www.sjshire.wa.gov.au/development-services/building/building-advice/retaining-walls.aspx)", "2026-08-04"],
                ["City of Cockburn", "Building permit required where the wall exceeds 500mm above natural ground level (inclusive of embedment), is associated with other building work, or protects the land regardless of height.", "Owners must maintain natural ground level and any existing surcharge load at the lot boundary — a retaining wall must be provided if filling above or excavating below; structural engineer certification is required.", "[Fences and retaining walls](https://www.cockburn.wa.gov.au/Building-Planning-and-Roads/Applications-and-Permits/fences-and-retaining-walls)", "2026-08-04"],
                ["City of Kwinana", "Not published, contact council. (The City states \"large\" retaining walls require a building licence, but publishes no specific height figure.)", "Small retaining walls may not need approval depending on size and impact — contact the City for a site-specific determination.", "[Retaining walls information sheet (PDF)](https://www.kwinana.wa.gov.au/council/documents,-publications-and-forms/publications-and-forms-(all)/information-sheets-and-guides/2025/information-sheet-retaining-walls)", "2026-08-04"],
                ["City of Rockingham", "Building permit required for retaining walls exceeding 500mm (0.5m).", "Also required under 500mm where the wall encroaches beyond the boundary, reduces the adjoining land's bearing capacity, damages or reduces the structural adequacy of adjoining buildings, or changes natural site drainage; written consent of all adjoining landowners is required where encroachment or an adverse effect occurs.", "[Fences and retaining walls](https://rockingham.wa.gov.au/planning-and-building/building-and-renovating/fences-and-retaining-walls)", "2026-08-04"]
              ]
            } },
            { note: "Where a council does not publish a clear threshold, this table records \"not published, contact council\" rather than a guess. Re-check on a fixed schedule — council policy changes without notice." },
            { subheading: "Shared boundaries" },
            "A retaining wall on or near a common boundary raises ownership and cost questions the Building Act does not answer. The Dividing Fences Act 1961 (WA) governs dividing fences and cost sharing between adjoining owners, and a retaining wall is not automatically a dividing fence. Who pays what share, whose land the wall sits on, and the finished levels on both sides are best settled in writing before construction, not after.",
            { subheading: "Engineering and certification" },
            "Where engineering is required, a structural engineer assesses the wall against the retained height, any surcharge loads, ground conditions, footing size, drainage and overall stability. The output is a design and a certification the council or shire will want to see with a building permit application. Two shorter walls terraced up a slope are not automatically the same as one tall wall, and not automatically separate walls either, which is a common way a job that looked exempt turns out not to be.",
            { note: "[VERIFY: obtain the retained height at which engineering certification is typically required, per council or shire, from the council or from a WA structural engineer.]" },
            { subheading: "The $20,000 registration point" },
            "In Western Australia, building work requiring a building permit and contracted at $20,000 or more generally requires the contractor to be registered with Building and Energy. Most domestic retaining wall jobs fall under that figure and larger ones do not. It is worth confirming which side of the line a job sits on, and worth verifying a registration rather than taking it on trust.",
            { note: "Threshold verified 4 August 2026 against Building and Energy (Department of Energy, Mines, Industry Regulation and Safety, WA): [\"Do I need to be a registered building contractor?\"](https://www.wa.gov.au/government/publications/do-i-need-be-registered-building-contractor). $20,000 applies to building work generally; a separate $50,000 threshold applies only to Class 10a structures (garages, carports, sheds), which does not include retaining walls. Check any contractor's current registration on the [Building and Energy licence and registration search](https://www.wa.gov.au/organisation/building-and-energy/building-and-energy-licence-and-registration-search)." },
            { subheading: "What to ask when comparing quotes" },
            { list: [
              "Is any part of this wall retaining, or is it level on both sides?",
              "What is the drainage detail, and where does the ag pipe discharge to?",
              "What footing is allowed for, and what is it sized to?",
              "Who lodges any council or shire application, and is the fee in the price or on top?",
              "Is engineering required, and is it included?",
              "For work contracted at $20,000 or more, is the contractor registered with Building and Energy?"
            ] },
            { note: "Last reviewed: [DATE]. This section is reviewed on a fixed schedule and the date is updated each time." }
          ]
        }
      ],
      faqs: [
        {
          q: "Do I need council approval for a retaining wall in Perth?",
          a: "It depends on the council or shire, the height, where the wall sits on the block and what it holds up. There is no single Perth wide rule. The approval section above explains the triggers; confirm with your own local government before committing."
        },
        {
          q: "What is the difference between a retaining wall and a garden wall?",
          a: "Level ground on both sides is a garden or boundary wall, holding up only itself. Higher ground on one side means the wall is retaining soil, which needs a heavier footing, drainage behind the base and possibly engineering."
        },
        {
          q: "Is limestone cheaper than concrete sleepers?",
          a: "It depends on height, access and whether the block is natural or reconstituted. Limestone's advantage in Perth is local supply and appearance rather than being automatically the cheapest option."
        },
        {
          q: "How long does a limestone retaining wall last?",
          a: "Limestone walls in Perth commonly stand for decades. What shortens that is almost always water: drainage that was never installed properly, or backfill that traps water behind the wall. The drainage detail matters more than the block."
        }
      ]
    },
    {
      page: "limestone-fencing.html",
      name: "Limestone Fencing",
      shortDescription: "Solid limestone fences and pier and infill fencing in Perth, what moves the price, and front fence approval.",
      metaTitle: "Limestone Fencing Perth | Fences, Piers and Infill",
      metaDescription: "Limestone fencing in Perth: solid limestone fences, pier and infill, front fence height limits and setbacks, and what moves the price on a quote.",
      headline: "Limestone fencing in Perth",
      subheadline: "Solid limestone fences, pier and infill, and what moves the price.",
      ctaText: "Tell us about your job",
      image: {
        src: "images/fence463km3e3.webp",
        alt: "A limestone pier and rendered infill fence in a Perth garden",
        width: 1147,
        height: 722
      },
      intro: [
        "A limestone fence is a front or boundary fence, not a retaining wall. With level ground on both sides it holds up only itself, which means a lighter footing, no drainage system behind it, and a different cost profile.",
        "If the ground is higher on one side, the wall is retaining soil and the requirements change substantially. That is covered on the [limestone retaining walls page](limestone-retaining-walls.html)."
      ],
      sections: [
        {
          heading: "Solid limestone or pier and infill",
          body: [
            "There are two common formats, and the choice drives most of the cost.",
            "**Solid limestone fence.** Limestone the full length and height, for privacy, noise and appearance. Perth block sizes and the appetite for solid front walls make this a frequent job. It is the more expensive format per metre because it is block the whole way.",
            "**Pier and infill.** Limestone piers with infill panels between them, commonly steel, aluminium slat, timber or rendered panel. This is the front fence format seen repeatedly across the western and southern suburbs. It costs less across a full frontage because the piers carry the structure and the infill is cheaper per metre.",
            "A limestone pier and slat infill fence still reads as a limestone fence from the street, at a lower cost than solid block."
          ]
        },
        {
          heading: "What moves the price on a fence",
          body: [
            { list: [
              "**Solid versus pier and infill,** the largest single design decision",
              "**Pier spacing.** Fewer piers, more infill, lower cost, different look",
              "**Infill material.** Steel, aluminium slat, timber and rendered panel all sit at different price points",
              "**Height and footing.** Taller piers need deeper footings, and wind load matters more on solid infill than on slats",
              "**Block type.** Natural or reconstituted, and whether it is rendered",
              "**Gates.** Vehicle gates carry cost that has nothing to do with limestone, including motors, posts and electrical work",
              "**Access and length,** as with any limestone job"
            ] },
            { note: "[VERIFY: obtain typical pier spacing and any span limits for limestone pier and infill fencing in Perth from a WA structural engineer or an established limestone contractor. Publish no spacing figure without a source.]" }
          ]
        },
        {
          heading: "Natural or reconstituted for fencing",
          body: [
            "Appearance carries more weight on a fence than on a retaining wall, because a fence is usually visible from the street.",
            "**Natural block** gives the varied quarried face and more character, and is lighter to handle. Slower to lay, and generally the more expensive install for the same fence.",
            "**Reconstituted block** is uniform and faster to lay. It suits rendered finishes and contemporary designs, because a uniform substrate renders more predictably.",
            "Mortar colour matters here too. Tinted mortar matched to the limestone reads as one material; default grey mortar shows every joint. On a street-facing fence the difference is obvious once it is pointed out, and it is worth raising when comparing quotes."
          ]
        },
        {
          heading: "Front fence approval and setbacks",
          body: [
            "A front fence is not automatically exempt from approval just because it is not retaining. Height limits for front fences, sight line requirements at driveways and corners, and local planning policy on street walls all commonly apply, and they are set by the council or shire.",
            { image: {
              src: "images/Fencing3j5b4k.webp",
              alt: "A limestone and rendered front fence with piers, in a Perth street setting",
              width: 1183,
              height: 768
            } },
            "Front fence provisions in particular catch people out, because the height allowed within the front setback is often lower than elsewhere on the block, and there are sometimes requirements about visual permeability, meaning how much can be seen through the fence.",
            { note: "[VERIFY: obtain per council or shire front fence height limits, visual permeability requirements and sight line requirements at driveways and corner lots. Link to the specific council page, not a generic building landing page.]" },
            "The building permit and planning approval distinction is explained in the approval section on the [retaining walls page](limestone-retaining-walls.html), and it applies to fencing as much as to retaining."
          ]
        },
        {
          heading: "Fences on a shared boundary",
          body: [
            "A limestone fence on a common boundary is a shared asset and a shared cost question. The Dividing Fences Act 1961 (WA) governs dividing fences and cost sharing between adjoining owners.",
            "Who pays what share, whose land the fence sits on, and who maintains it are best settled in writing before construction."
          ]
        }
      ],
      faqs: [
        {
          q: "Is a limestone fence cheaper than a solid limestone wall?",
          a: "Pier and infill generally costs less per metre than solid limestone at the same height, because the infill material is cheaper than block and faster to install. How much less depends on pier spacing and infill choice."
        },
        {
          q: "Can a limestone fence be rendered?",
          a: "Yes, and reconstituted block is generally the better substrate because the uniform face renders more predictably."
        },
        {
          q: "Do I need approval for a front fence?",
          a: "Often, yes. Front fence height limits and visual permeability rules are set by the council or shire, and the limit within the front setback is often lower than elsewhere on the block. Check the front fence section above."
        },
        {
          q: "Can a limestone fence be built on the boundary?",
          a: "Usually, subject to the council or shire's provisions and the neighbour question. Cost sharing sits under the Dividing Fences Act 1961 (WA) and is best agreed in writing first."
        }
      ]
    },
    {
      page: "limestone-wall-repairs.html",
      name: "Wall Repairs and Capping",
      shortDescription: "Limestone wall repairs, new capping including bullnose, and cladding in Perth. What fails, why, and when repair makes sense.",
      metaTitle: "Limestone Wall Repairs Perth | Capping and Cladding",
      metaDescription: "Limestone wall repairs, capping and bullnose capping, and limestone cladding in Perth. What fails and why, repair versus rebuild, and what to ask on a quote.",
      headline: "Limestone wall repairs and capping in Perth",
      subheadline: "What fails, why it fails, and when a repair is worth doing.",
      ctaText: "Tell us about your job",
      image: {
        src: "images/Repairs_er54ne.webp",
        alt: "Close-up of a weathered limestone wall showing surface erosion and mortar wear",
        width: 1152,
        height: 768
      },
      intro: [
        "Limestone walls last a long time, but they are not maintenance free. Repairs to an existing wall, new capping, and limestone cladding are distinct jobs from building a new wall, and they are quoted differently.",
        "This page explains what typically goes wrong, how to tell a repair from a rebuild, and what capping and cladding actually do."
      ],
      sections: [
        {
          heading: "Why limestone walls fail or need work",
          body: [
            "Most limestone wall problems trace back to one of a few causes, and knowing which one matters because the cause decides whether a repair will hold.",
            { list: [
              "**Drainage.** The most common cause of retaining wall movement. Water building up behind a wall that cannot drain pushes it out of line. A repair that does not fix the drainage will not last.",
              "**Footing or ground movement.** Settlement, or a footing that was undersized for the wall, lets it lean, crack or step.",
              "**Mortar erosion.** Over years, mortar joints weather and wash out, particularly where water runs over them.",
              "**Impact or added load.** A vehicle, tree roots, or a surcharge load the wall was never designed for, such as a driveway or paving added later.",
              "**Cosmetic weathering.** Staining, surface wear or a tired grey mortar line, where the block itself is sound."
            ] },
            "Diagnosing the cause before quoting the repair is the difference between a fix and a patch."
          ]
        },
        {
          heading: "Repair or rebuild",
          body: [
            "Not every damaged wall is worth repairing, and not every leaning wall needs rebuilding.",
            "A localised problem, a few eroded joints or a small section pushed out of line by a blocked drain, is usually a repair. A wall that has moved along its full length, or where the footing or drainage was wrong from the start, is often better rebuilt, because a patch repair on a bad footing fails again.",
            "The honest test is whether the underlying cause can be fixed without taking the wall apart. If it can, repair. If it cannot, a rebuild that gets the footing and drainage right is usually cheaper over ten years than repairing the same wall twice."
          ]
        },
        {
          heading: "Capping and bullnose capping",
          body: [
            "Capping is the finishing course along the top of a limestone wall. It is not only cosmetic. It sheds water off the top of the wall rather than letting it soak into the joints, which is a genuine durability difference.",
            "**Bullnose capping** has a rounded front edge rather than a square one. It is a common Perth finish, it softens the look of the wall, and it leaves no sharp edge along the top.",
            "Capping is sometimes included in a wall quote and sometimes an extra, so it is worth confirming which. Recapping an existing wall, where the original capping has cracked, lifted or was never installed, is a job on its own."
          ]
        },
        {
          heading: "Limestone cladding",
          body: [
            "Cladding is a limestone face applied over an existing structure, a besser block wall, a pier or a rendered wall, rather than a structural limestone wall in its own right.",
            "It is a finish, not a retaining element, so it is priced differently. It is a way to get the limestone look on an existing wall without rebuilding it, provided the wall behind is sound and can carry the cladding."
          ]
        },
        {
          heading: "Mortar colour matching",
          body: [
            "On any repair, mortar colour is the difference between work that disappears and work that announces itself.",
            "Mortar can be left the default grey, or tinted to match the limestone. Matched mortar reads as one material and the wall looks like stone. Grey mortar reads as block and lines. On a repair it matters more than on a new wall, because fresh grey mortar against weathered limestone stands out permanently.",
            "It is worth asking directly whether mortar colour will be matched to the existing wall."
          ]
        },
        {
          heading: "What drives the cost of a repair",
          body: [
            { list: [
              "**The cause,** and whether it has to be fixed as well as the visible damage",
              "**Extent,** a few joints versus a full section rebuilt",
              "**Matching the existing wall,** block colour, face and mortar, which is harder on an older wall",
              "**Access,** the same machine versus barrow question as any limestone job",
              "**Whether drainage or footing work is involved,** which turns a cosmetic repair into a structural one"
            ] },
            "How cost works across limestone jobs generally is on the [cost guide](cost-guide.html)."
          ]
        }
      ],
      faqs: [
        {
          q: "Can a leaning limestone retaining wall be repaired, or does it need rebuilding?",
          a: "It depends on the cause. A small section pushed out by a blocked drain is often a repair. A wall that has moved along its full length, usually because of drainage or footing, is often better rebuilt, because a patch on a bad footing fails again."
        },
        {
          q: "What is bullnose capping?",
          a: "Capping is the finishing course along the top of a wall, and it sheds water off the top rather than letting it soak into the joints. Bullnose capping has a rounded front edge rather than a square one, a common Perth finish."
        },
        {
          q: "Is limestone cladding the same as a limestone wall?",
          a: "No. Cladding is a limestone face applied over an existing structure. It is a finish rather than a structural or retaining wall, and it is priced differently."
        },
        {
          q: "Why does mortar colour matter on a repair?",
          a: "Mortar tinted to match the limestone reads as one material, while default grey mortar shows every joint. On a repair it matters more, because fresh grey mortar against a weathered wall stands out permanently."
        }
      ]
    }
  ],

  /* --- Service-area pages (none — suburb pages failed the keyword test and
     would be scaled content if the only difference were the suburb name) --- */
  areas: [],

  /* --- Long-form guide pages (Article schema, tables) --------------------- */
  guides: [
    {
      slug: "cost-guide",
      name: "Cost guide",
      metaTitle: "Limestone Retaining Wall Cost Perth | What Drives It",
      metaDescription: "What a limestone retaining wall costs in Perth, what makes one quote different from another, and how to read a quote without getting caught by exclusions.",
      headline: "What a limestone retaining wall costs in Perth",
      /* No author or byline: no individual is named anywhere on this site.
         bake.js falls back to the Organization as the Article author. */
      datePublished: "2026-07-27",
      dateModified: "2026-07-27",
      lastReviewed: "[DATE]",
      intro: [
        "Most cost pages give a per metre figure and stop. That figure is close to useless on its own, because the same wall on two different blocks can differ substantially in price for reasons that have nothing to do with its length.",
        "This page explains what actually moves the number, so that when quotes arrive you can tell the difference between one that is cheap and one that has left something out."
      ],
      sections: [
        {
          heading: "The single biggest variable is height",
          body: [
            "Cost does not rise in a straight line with height. It steps.",
            "A retaining wall's footing has to resist the soil pushing it over. As retained height increases, lateral pressure increases and so does the leverage, so the footing has to get wider and deeper faster than the wall gets taller. Above roughly waist height the footing and engineering requirements change, which is where the cost steps up.",
            "Practically, a wall at 1.2m can cost considerably more than twice a wall at 600mm over the same length. Where budget is tight, the most effective single change is usually to reduce height, sometimes by terracing into two lower walls rather than one taller one, though terracing carries its own approval considerations.",
            { image: {
              src: "images/heights436m4d.webp",
              alt: "Diagram showing three limestone wall categories: garden or boundary wall, retaining wall, and taller engineered wall",
              width: 1408,
              height: 768,
              caption: "Diagram, not a specific wall or job. It shows categories only — no heights, and no prices."
            } },
            { note: "[VERIFY: obtain the retained heights at which footing size and engineering requirements step up, from a WA structural engineer. State the source.]" }
          ]
        },
        {
          heading: "The cost drivers, ranked",
          body: [
            { olist: [
              "**Height.** As above. Dominant.",
              "**Retaining or not retaining.** A wall with level ground on both sides has no drainage system and a lighter footing. Same block, same length, materially different price. See the [retaining walls page](limestone-retaining-walls.html).",
              "**Access.** Whether an excavator and a truck can reach the wall line. A rear yard reached only through a narrow side gate turns a machine job into a barrow job, and labour hours are the largest component of most quotes. This is the driver that most often explains why two quotes for the same wall differ.",
              "**Drainage and discharge.** Ag pipe, aggregate, geotextile, and where the water is taken. A discharge point a few metres away is a different job to one piped around the house to the front verge.",
              "**Ground conditions.** Perth's sand is generally straightforward to excavate, but limestone shelf, rock, fill, existing footings or services in the wall line all add time.",
              "**Spoil removal.** Excavated material has to go somewhere. Truck movements and tip fees are real costs, and spoil remaining on site versus spoil removed is a common source of quote difference.",
              "**Block type.** Natural block generally costs more to install than reconstituted for the same wall, because selection and fitting take longer.",
              "**Length.** It matters, but less than people expect on a per metre basis, because mobilisation, setup and access costs spread across it.",
              "**Approval and engineering.** Application fees, engineering fees and the time to lodge. Sometimes in the price, sometimes on top."
            ] }
          ]
        },
        {
          heading: "What is commonly excluded from a quote",
          body: [
            "More useful than a price range, because these are the items that turn an accepted quote into a larger invoice.",
            { list: [
              "**Spoil removal.** Whether excavated sand is taken away or left on the block",
              "**Council or shire application fees,** and who lodges the application",
              "**Engineering fees** and certification",
              "**Site clearing,** removal of an existing wall, fence, tree or paving in the wall line",
              "**Service location and protection,** and work required if services are found in the wall line",
              "**Drainage discharge,** particularly where it has to be piped a long way",
              "**Reinstatement,** turf, paving, irrigation and garden beds disturbed during the works",
              "**Capping,** sometimes included, sometimes extra",
              "**Fencing or infill on top of the wall,** often a different trade",
              "**Gates, motors and electrical work** on fencing jobs"
            ] },
            "It is reasonable to ask for each of these to be addressed explicitly in writing, as included or excluded."
          ]
        },
        {
          heading: "How to read the quotes you get",
          body: [
            "Get more than one quote and read them on the following, not on the total:",
            "**Footing.** What size and depth, and what it is sized to. If one quote is materially cheaper and the footing is smaller, that is the difference.",
            "**Drainage.** Ag pipe, aggregate type, geotextile, discharge point. A quote with no drainage line item on a retaining wall is not a cheaper quote, it is a different wall.",
            "**Backfill.** Free draining aggregate immediately behind the wall, or the sand out of the trench.",
            "**Mortar colour.** Whether the mortar is tinted to match the limestone or left default grey. It is a visible quality difference that rarely appears on a quote unless asked about.",
            "**Inclusions.** Work through the exclusion list above item by item.",
            "**Approval.** Who lodges, who pays the fee, whether engineering is included.",
            "**Registration.** For work contracted at $20,000 or more, whether the contractor is registered with Building and Energy. See the approval section on the [retaining walls page](limestone-retaining-walls.html).",
            "The cheapest quote is often the one that has excluded the most, and the exclusions are usually below ground where they cannot be seen."
          ]
        },
        {
          heading: "Where cost can genuinely be reduced",
          body: [
            { list: [
              "**Reduce height** where the design allows. The largest lever by a wide margin",
              "**Improve access** before the job, by removing an obstruction or arranging temporary access through a neighbour",
              "**Reconstituted block** instead of natural, where appearance permits",
              "**Pier and infill** instead of solid, on non retaining fencing. See [limestone fencing](limestone-fencing.html)",
              "**Do your own reinstatement,** turf, garden beds and irrigation, if you are willing",
              "**Keep the spoil** if there is a genuine use for the sand on the block"
            ] },
            "What not to reduce: footing size and drainage. They determine whether the wall is still standing and still straight in ten years, and they are the two components that cannot be inspected once the job is finished."
          ]
        }
      ],
      faqs: [
        {
          q: "How much does a limestone retaining wall cost per metre in Perth?",
          a: "The per metre figure depends heavily on height and access, and a single number would mislead more readers than it helps. This page explains what drives the number; ranges will be published here once there is a real, dated set of Perth quotes behind them."
        },
        {
          q: "Is limestone cheaper than concrete sleepers?",
          a: "It depends on height, access and block type. Limestone's advantage in Perth is local supply and appearance rather than automatically being the lowest cost option."
        },
        {
          q: "Why are two quotes for the same wall so different?",
          a: "Usually footing size, drainage, spoil removal, mortar finish or access assumptions. Compare the line items rather than the totals."
        },
        {
          q: "Does a taller wall cost proportionally more?",
          a: "No, it costs more than proportionally. Footing depth and engineering requirements step up with height rather than scaling smoothly, so a wall twice as tall generally costs considerably more than twice as much."
        }
      ]
    }
  ],

  /* --- Site-wide FAQ (rendered in full on the homepage) -------------------- */
  faqs: [
    {
      q: "Does an enquiry cost anything?",
      a: "No. Sending an enquiry and getting a quote costs you nothing, and there is no obligation to go ahead."
    },
    {
      q: "Do you cover my suburb?",
      a: "We cover the Perth metropolitan area, including every local government area from Wanneroo and Joondalup in the north to Rockingham and Kwinana in the south, and out to Armadale, Gosnells, Kalamunda and Mundaring in the hills and south-east. If your job is outside that, send it through anyway and we will tell you."
    },
    {
      q: "Can I get a price over the phone?",
      a: "Not accurately. Height, access and ground conditions move the number too much for a phone estimate to be worth anything. The cost guide explains what drives it, and looking at the job settles it."
    },
    {
      q: "What do you need to know about my job?",
      a: "What you need, your suburb, the rough size, and your timeframe. Height and length matter most, and it helps to say whether the ground is higher on one side and whether a machine can reach the wall line."
    },
    {
      q: "Do I need council approval?",
      a: "It depends on your council or shire, the height of the wall, where it sits on the block and what it holds up. There is no single Perth wide rule. The retaining walls page has a section on what triggers approval."
    }
  ],

  /* --- About page ----------------------------------------------------------
     The only page that describes the commercial arrangement. Written as a
     plain description of how the business works, not as a disclaimer. */
  about: {
    sections: [
      {
        heading: "What Perth Limestone Group is",
        body: [
          "Perth Limestone Group is a limestone walling enquiry service covering the Perth metropolitan area. We take enquiries from homeowners about limestone retaining walls, fencing, and wall repairs and capping, and we get those jobs in front of a limestone contractor working in that part of Perth.",
          "We are not a building company. We do not build, excavate, lay block, attend site or certify anything. What we do is take the details of a job, get it to someone who can price and build it, and make sure every enquiry gets an answer.",
          "The other thing we do is publish. The material on this site, including the approval section on the [retaining walls page](limestone-retaining-walls.html) and the [cost guide](cost-guide.html), is written for homeowners who have never bought a limestone wall and do not yet know what to ask."
        ]
      },
      {
        heading: "What happens when you enquire",
        body: [
          "You send through the details of the job: what you need, your suburb, the rough size and your timeframe.",
          "We read it, and pass it to a limestone contractor working in your area, who comes back to you to arrange a time to look at the job and quote it. If it is not something we can help with, we tell you and point you somewhere useful rather than leaving you without an answer."
        ]
      },
      {
        heading: "How the service is paid for",
        body: [
          "The contractor pays for the enquiry. You do not.",
          "There is no cost to you at any point, the quote is free, and there is no obligation to go ahead with the work. There is nothing unusual in the model: it is how referral services are generally funded, free to the person making the enquiry and paid for by the business that receives it.",
          "How your details are handled is set out in the [privacy policy](privacy.html)."
        ]
      },
      {
        heading: "Where we cover",
        body: [
          "The Perth metropolitan area, covering every local government area from Wanneroo and Joondalup in the north to Rockingham and Kwinana in the south, and out to Armadale, Gosnells, Kalamunda and Mundaring in the hills and south-east.",
          "If a job sits outside that area, send it through anyway. We will tell you if we cannot help."
        ]
      },
      {
        heading: "Business details",
        body: [
          "Perth Limestone Group",
          "ABN 78 538 005 810",
          "Phone (08) 9516 1538"
        ]
      }
    ]
  },

  /* --- Privacy policy -------------------------------------------------------
     DRAFT — [VERIFY]: review against actual obligations before publishing. A
     business that discloses personal information to a third party FOR A
     BENEFIT may fall outside the Privacy Act 1988 (Cth) small-business
     exemption (s6D / s6DA). Confirm whether the Australian Privacy Principles
     apply in full before relying on any exemption. */
  privacy: {
    sections: [
      {
        body: [
          "This policy explains what this website collects, why, and who it is shared with. Perth Limestone Group, ABN 78 538 005 810, operates this site."
        ]
      },
      {
        heading: "What we collect",
        body: [
          "When you submit the enquiry form we collect what you enter: what you need, your suburb, a rough description of the job, your timeframe, and your name, phone number and email address. If you phone or email us, we have whatever you choose to tell us. There are no accounts or logins on this site.",
          "The site may use basic analytics to understand how many people visit and which pages they read. That data is aggregated and is not used to identify you."
        ]
      },
      {
        heading: "Why we collect it, and who it goes to",
        body: [
          "We collect your enquiry for one purpose: to get your job quoted.",
          "**Your details are passed to a limestone contractor working in your area** so they can contact you about the job and arrange a quote. Perth Limestone Group has a commercial arrangement with that contractor, under which the contractor pays for the enquiry. You pay nothing.",
          "What we do not do:",
          { list: [
            "We do not sell or broadcast your details to a list of businesses. One contractor receives your enquiry.",
            "We do not use your details to market unrelated products or services.",
            "We do not pass your details to anyone other than the contractor handling your enquiry, except where required by law."
          ] },
          "The enquiry form is delivered by Formspree, a form handling service, so your details pass through their servers to reach us. Their own privacy policy is on their website."
        ]
      },
      {
        heading: "How long it is kept",
        body: [
          "Enquiry details are kept only as long as needed to handle the enquiry, and for a reasonable period afterwards for our own records. If you would like your details removed, contact us and we will remove them."
        ]
      },
      {
        heading: "Accessing or correcting your details",
        body: [
          "You can ask what details we hold about you, ask us to correct them, or ask us to delete them. Contact us on (08) 9516 1538 or at hello@perthlimestonegroup.com.au."
        ]
      },
      {
        heading: "Complaints",
        body: [
          "If you are concerned about how your details have been handled, contact us first and we will try to resolve it. You can also contact the Office of the Australian Information Commissioner at oaic.gov.au."
        ]
      },
      {
        heading: "Changes to this policy",
        body: [
          "This policy may be updated. The review date at the top shows when it was last changed."
        ]
      }
    ]
  },

  /* --- Enquiry form --------------------------------------------------------
     Fields: service (What do you need?), suburb, rough size, timeframe, name,
     phone, email. Rendered on every page — see enquirySection in main.js. */
  contact: {
    formHeadline: "Tell us about your job",
    reassurance: "We'll come back to you.",
    formNote: "We read every enquiry and come back to you either way. If we can't help with your job we'll tell you, and point you somewhere useful. Your details are used to get your job quoted and are handled as set out in our [privacy policy](privacy.html).",
    step1Label: "What do you need?",
    step2Label: "Your job and contact details",
    otherServiceLabel: "Not sure",
    sizeLabel: "Rough size",
    sizePlaceholder: "e.g. 12m long, about 900mm high, sloping block",
    timeframeLabel: "Timeframe",
    timeframeOptions: ["ASAP", "Within a month", "1 to 3 months", "Just researching"],
    submitText: "Send my job details",
    successMessage: "Thanks, your enquiry is in. We'll come back to you.",
    errorMessage: "Something went wrong sending your enquiry. Please call us directly and we'll sort it out."
  },

  /* --- Testimonials / photos --------------------------------------------------
     [NEEDS INPUT: real photographs taken around Perth, and real testimonials
     from real customers, once they exist. These arrays stay EMPTY until then,
     and the sections stay hidden. Never invent names, ratings or project
     references.] */
  testimonials: [],
  photos: []
};
