"""First-run content.

Figures for production, sales, capacity, product grades and clients come from the
company profile deck. Items marked SAMPLE below (contact details, certifications,
news, extra copy) are mockup content for demonstration and should be replaced
with confirmed information in the admin panel before the site goes public.
"""
import os
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import hash_password
from .models import (
    Advantage, Application, Certification, Client, Market, Milestone,
    MonthlyStat, NewsPost, Product, Setting, User, YearlyStat,
)

SETTINGS = [
    # key, label, group, kind, value
    ("company_name", "Company name", "Company", "text", "PT. Choyang Mopoli Samsung Chemical Indonesia"),
    ("short_name", "Short name", "Company", "text", "PT. CMS Chem Indonesia"),
    ("tagline", "Tagline", "Company", "text", "Ethylene bis stearamide from Sumatran palm oil"),
    ("founded", "Year founded", "Company", "text", "1999"),
    ("capacity_tons", "Annual capacity (tons)", "Company", "text", "60,000"),
    ("location", "Location", "Company", "text", "Medan, North Sumatra, Indonesia"),
    ("market_share", "Global market share", "Company", "text", "20–30%"),
    ("hero_title", "Home: headline", "Home page", "textarea",
     "Ethylene bis stearamide, made from Sumatran palm since 1999."),
    ("hero_intro", "Home: introduction", "Home page", "textarea",
     "We were Indonesia's first E.B.S. manufacturer. Our HI-LUB grades lubricate, release and disperse "
     "in ABS, PVC, nylon and polyolefins for chemical companies across Asia."),
    ("about_intro", "About: introduction", "About page", "textarea",
     "PT. Choyang Mopoli Samsung Chemical Indonesia was founded in 1999 as a joint venture of Choyang "
     "Fine Chemical Co., Ltd. (Korea), PT. Mopoli Raya (Indonesia) and Samsung Corporation (Korea). "
     "The three partners gave the company its name and its strengths: Korean process know-how, local "
     "palm-oil supply, and a global trading network."),
    ("facility_text", "About: facility", "About page", "textarea",
     "Our factory sits in a bonded zone in Medan and runs equipment supplied by experienced Korean "
     "engineering companies. Capacity is 60,000 tons a year and is being increased in stages. Raw "
     "material arrives from local stearic acid producers, and three shifts a day keep the reactors running."),
    ("vision", "Vision", "About page", "textarea",
     "To be the partner of first choice for palm-based polymer additives in Asia."),
    ("mission", "Mission", "About page", "textarea",
     "Supply E.B.S. of consistent quality, on schedule, from responsibly sourced palm feedstock, "
     "and grow with customers through technical support and long-term agreements."),
    ("partnership_intro", "Partnership: introduction", "Partnership page", "textarea",
     "We work with resin producers, compounders and distributors on supply agreements, toll "
     "manufacturing and new grade development. Tell us what you need and our sales team will reply "
     "within two working days."),
    # SAMPLE contact details
    ("address", "Address", "Contact", "textarea",
     "Kawasan Industri Medan (KIM), Jl. Pulau Sumatra\nMedan 20242, North Sumatra, Indonesia"),
    ("phone", "Phone", "Contact", "text", "+62 61 6874 000"),
    ("email", "Sales email", "Contact", "text", "sales@cms-chem.example"),
    ("office_hours", "Office hours", "Contact", "text", "Monday to Friday, 08:00–17:00 WIB"),
    ("show_demo_notice", "Show the sample-content notice in the footer", "Site", "bool", "1"),
]

PRODUCTS = [
    dict(name="HI-LUB B50", grade="B-50", physical_form="Bead", particle_size="Min 90% pass 10 mesh",
         acid_value="Max 10", amine_value="Max 3", melting_point="141–146 °C", color="White to off-white",
         packing="Paper bag 25 kg\nJumbo bag 500 / 600 / 1,200 kg",
         best_for="Dust-free dosing in masterbatch and compounding lines; ABS and PS internal lubrication.", sort=1),
    dict(name="HI-LUB B80", grade="B-80", physical_form="Bead", particle_size="Min 90% pass 16 mesh",
         acid_value="Max 10", amine_value="Max 3", melting_point="141–146 °C", color="White to off-white",
         packing="Paper bag 25 kg\nJumbo bag 500 / 600 / 1,200 kg",
         best_for="Finer beads for faster melt-in; rigid PVC, nylon and engineering plastics.", sort=2),
    dict(name="HI-LUB P130", grade="P-130", physical_form="Powder", particle_size="Min 85% pass 140 mesh",
         acid_value="Max 10", amine_value="Max 3", melting_point="141–146 °C", color="White",
         packing="Paper bag 20 kg",
         best_for="Dry blending with resin powders; release agent and pigment dispersant.", sort=3),
    dict(name="HI-LUB P200", grade="P-200", physical_form="Powder", particle_size="Min 85% pass 200 mesh",
         acid_value="Max 10", amine_value="Max 3", melting_point="141–146 °C", color="White",
         packing="Paper bag 20 kg",
         best_for="Finest grade for coatings, inks, paper coating and powder metallurgy.", sort=4),
]

APPLICATIONS = [
    ("Automotive", "Interior trim, dashboards and under-hood parts moulded in ABS, PP and nylon release cleanly and keep a smooth surface."),
    ("Electronics and appliances", "Housings for televisions, washing machines and small appliances flow better into thin-walled moulds."),
    ("Medical devices", "Consistent lubricity for precision-moulded components where surface finish matters."),
    ("3D printing", "Smoother extrusion of filament and better layer flow in ABS and PLA blends."),
    ("PVC pipe and profile", "Internal and external lubricant for rigid PVC, lowering power use during extrusion."),
    ("Masterbatch and pigments", "Pigment dispersant for faster blending and more uniform colour."),
    ("Rubber, asphalt and waxes", "Processing aid and anti-sticking agent in rubber, asphalt and wax blends."),
    ("Coatings, inks and paper", "Slip and anti-blocking in paint lacquer, enamel, ink and paper coating."),
    ("Ceramics, crayons and candles", "Binder and release aid for ceramics, pastels, coloured pencils and high-grade candles."),
]

MILESTONES = [  # 2001 entry is SAMPLE
    ("1999", "Company founded", "Joint venture of Choyang Fine Chemical, PT. Mopoli Raya and Samsung Corporation. Indonesia's first E.B.S. manufacturer."),
    ("2001", "First export shipment", "First containers of HI-LUB shipped to resin producers in South Korea and Taiwan."),
    ("2006", "Start of rapid growth", "Sales grew by about 20% a year on average between 2006 and 2016 (audited financial reports)."),
    ("2012", "25,000 tons produced", "Annual production passes 25,000 tons for the first time."),
    ("2021", "Record production", "Production reaches a record of almost 39,000 tons."),
    ("2022", "Record sales revenue", "Sales revenue peaks at around US$69 million."),
    ("Today", "60,000 tons capacity", "Capacity of 60,000 tons a year, being increased in stages."),
]

ADVANTAGES = [
    ("Next to the raw material", "Medan sits at the centre of the world's largest palm-oil producing region, with large oleochemical capacity close by. Stearic acid supply is stable and easy to handle."),
    ("Thirty years of E.B.S. know-how", "Our Korean founding partner has produced E.B.S. for more than three decades. We were the first manufacturer in Indonesia and keep relationships with major chemical companies worldwide."),
    ("Round-the-clock production", "Competitive labour costs allow three shifts a working day, so we can hold lead times when demand rises."),
    ("Bonded-zone export", "Our bonded-zone facility simplifies customs for imported equipment and exported product."),
]

YEARLY = [  # year, production tons, sales tons, sales US$
    (2012, 25400, 25427, 42.8e6), (2013, 28100, 28605, 41.0e6), (2014, 33300, 33781, 50.3e6),
    (2015, 35300, 35944, 43.3e6), (2016, 34400, 34147, 42.9e6), (2017, 27500, 27750, 36.7e6),
    (2018, 33000, 32197, 42.0e6), (2019, 35900, 35052, 41.0e6), (2020, 36600, 37598, 44.8e6),
    (2021, 38900, 38694, 60.6e6), (2022, 32800, 32665, 69.0e6), (2023, 31200, 31011, 44.7e6),
    (2024, 33900, 33032, 43.0e6),
]

MONTHLY = {  # month index 1-12: (production tons, sales tons, sales US$)
    2025: [(3550, 3486, 5.20e6), (3020, 3524, 5.35e6), (2840, 2592, 3.92e6), (3210, 2356, 3.52e6),
           (2050, 2727, 4.02e6), (1550, 1864, 2.72e6), (2620, 2504, 3.40e6), (2800, 3055, 3.08e6),
           (2770, 2349, 3.28e6), (2480, 2762, 3.83e6), (1740, 2306, 3.24e6), (720, 1052, 1.48e6)],
    2026: [(1700, 983, 1.33e6), (3100, 3048, 4.15e6), (2370, 1564, 2.12e6)],
}

MARKETS = [
    ("China", 45, "Largest market"), ("South Korea", 25, ""), ("Taiwan", 21, ""),
    ("Japan", 3, ""), ("Vietnam", 2, ""), ("Thailand", 1.5, ""), ("India", 1, ""),
    ("Malaysia", 1, ""), ("Other", 0.5, ""),
]

CLIENTS = [
    ("CHIMEI", "Taiwan", "ABS and styrenics"), ("LG Chem", "South Korea", "petrochemicals"),
    ("LG Chem (Huizhou)", "China", "petrochemicals"), ("CNOOC", "China", "petrochemicals"),
    ("Formosa Plastics", "Taiwan", "PVC and plastics"), ("Toray", "Japan", "engineering plastics"),
    ("INEOS Styrolution", "Global", "styrenics"), ("Lotte Chemical", "South Korea", "petrochemicals"),
    ("StarBetter", "China", "plastics"), ("Sinochem", "China", "chemicals"),
    ("Hincol", "Malaysia", "lubricants"),
]

CERTIFICATIONS = [  # SAMPLE
    ("ISO 9001:2015", "Quality management for the manufacture of ethylene bis stearamide.", "2004"),
    ("ISO 14001:2015", "Environmental management at the Medan plant.", "2011"),
    ("RSPO Supply Chain Certification", "Mass-balance sourcing of palm-based stearic acid.", "2018"),
    ("Halal certification", "HI-LUB grades certified for use in halal supply chains.", "2016"),
    ("REACH pre-registration", "Ethylene bis stearamide pre-registered for export to the EU.", "2010"),
]

NEWS = [  # SAMPLE
    dict(slug="capacity-expansion-phase-2", title="Second-phase capacity expansion begins in Medan",
         category="Company", published_on=date(2026, 9, 15),
         summary="A new reactor line will add capacity in stages toward our 60,000-ton annual target.",
         body="Construction has started on the second phase of our capacity programme in Medan.\n\n"
              "The new line uses the same Korean-supplied reactor design as our existing plant, so customers "
              "receive identical product from both lines. Commissioning is planned in stages to keep "
              "current deliveries on schedule.\n\nCustomers interested in reserving volume from the new line "
              "can contact our sales team through the partnership page."),
    dict(slug="hi-lub-p200-for-coatings", title="HI-LUB P200 finds new use in powder coatings",
         category="Product", published_on=date(2026, 6, 2),
         summary="Trials with coating formulators show P200 improves slip and anti-blocking at low dosage.",
         body="Our finest powder grade, HI-LUB P200, has completed trials with two powder-coating formulators "
              "in Southeast Asia.\n\nAt low dosage the grade improved surface slip and reduced blocking during "
              "storage without affecting gloss. Technical data and samples are available on request."),
    dict(slug="chinaplas-2026", title="Meet us at Chinaplas 2026 in Shanghai",
         category="Events", published_on=date(2026, 3, 10),
         summary="Our sales and technical team will be at the National Exhibition and Convention Center.",
         body="We will be exhibiting at Chinaplas 2026 in Shanghai. Our team will be available to discuss "
              "supply agreements, grade selection and technical support.\n\nTo book a meeting, send us a "
              "message through the partnership page."),
    dict(slug="rspo-supply-chain", title="Renewed RSPO supply chain certification",
         category="Sustainability", published_on=date(2025, 11, 20),
         summary="Our mass-balance certification has been renewed for another five-year term.",
         body="Our RSPO supply chain certification has been renewed following an independent audit.\n\n"
              "The certification covers the purchase of palm-based stearic acid and the production of "
              "HI-LUB at our Medan plant."),
]


def seed(db: Session) -> None:
    existing = {s.key for s in db.scalars(select(Setting))}
    for i, (key, label, group, kind, value) in enumerate(SETTINGS):
        if key not in existing:
            db.add(Setting(key=key, label=label, group=group, kind=kind, value=value, sort=i))

    if not db.scalar(select(User).limit(1)):
        db.add(User(username=os.getenv("ADMIN_USERNAME", "admin"),
                    password_hash=hash_password(os.getenv("ADMIN_PASSWORD", "change-me-now"))))

    if db.scalar(select(Product).limit(1)):
        db.commit()
        return  # content already seeded

    db.add_all(Product(**p) for p in PRODUCTS)
    db.add_all(Application(name=n, description=d, sort=i) for i, (n, d) in enumerate(APPLICATIONS))
    db.add_all(Milestone(year=y, title=t, description=d, sort=i) for i, (y, t, d) in enumerate(MILESTONES))
    db.add_all(Advantage(title=t, description=d, sort=i) for i, (t, d) in enumerate(ADVANTAGES))
    db.add_all(YearlyStat(year=y, production_tons=p, sales_tons=s, sales_usd=u) for y, p, s, u in YEARLY)
    for year, rows in MONTHLY.items():
        db.add_all(MonthlyStat(year=year, month=m, production_tons=p, sales_tons=s, sales_usd=u)
                   for m, (p, s, u) in enumerate(rows, start=1))
    db.add_all(Market(country=c, share_pct=s, note=n, sort=i) for i, (c, s, n) in enumerate(MARKETS))
    db.add_all(Client(name=n, country=c, sector=s, sort=i) for i, (n, c, s) in enumerate(CLIENTS))
    db.add_all(Certification(name=n, scope=s, since=y, sort=i) for i, (n, s, y) in enumerate(CERTIFICATIONS))
    db.add_all(NewsPost(**n) for n in NEWS)
    db.commit()
