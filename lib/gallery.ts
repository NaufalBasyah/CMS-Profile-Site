/**
 * Photos for the carousels.
 *
 * Only /img/factory.jpg is a real CMS Chemical photo. Every entry marked
 * `sample: true` is a stand-in: a free Unsplash photo (unsplash.com/license) of a
 * similar plant, lab or product, chosen with no brand names visible. Each one shows
 * a "Sample photo" badge on the site and is not a photo of CMS Chemical. Replace each with a real photo of what its
 * caption describes: put the file in public/img/, set `src` to "/img/<file>",
 * fix width/height and the alt text, and delete `sample: true`.
 */

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** One line shown under the photo in galleries. */
  caption?: string;
  /** True for placeholder photos that must be replaced before launch. */
  sample?: boolean;
};

/** `id` is the Unsplash image id, e.g. "photo-1589725971211-7e86a631e2c2". */
function sample(id: string, caption: string, width = 1600, height = 1000): Photo {
  return {
    src: `https://images.unsplash.com/${id}?w=${width}&h=${height}&fit=crop&q=80`,
    alt: `Sample photo standing in for: ${caption.toLowerCase()}`,
    width,
    height,
    caption,
    sample: true,
  };
}

/** Home hero slideshow. The real plant photo stays first. */
export const HERO_PHOTOS: Photo[] = [
  {
    src: "/img/factory.jpg",
    alt: "The CMS Chemical plant in Medan, with a delivery truck at the gate",
    width: 1287,
    height: 484,
  },
  sample("photo-1736820712641-56badd26f83b", "Amidation reactors at the Medan plant"),
  sample("photo-1785900976288-31f0f42a7364", "HI-LUB beads being bagged for export"),
  sample("photo-1614935151651-0bea6508db6b", "Quality control lab testing a production batch"),
];

/** Home: a walk through the plant. */
export const PLANT_PHOTOS: Photo[] = [
  sample("photo-1589725971211-7e86a631e2c2", "Plant entrance and weighbridge"),
  sample("photo-1790175138991-1898bd553ea4", "Stearic acid storage tanks"),
  sample("photo-1717386255773-1e3037c81788", "Reactor hall during a production run"),
  sample("photo-1670689334015-299d6559b3c3", "Flaking and bead forming line"),
  sample("photo-1602052577122-f73b9710adba", "Quality control laboratory"),
  sample("photo-1689942010216-dc412bb1e7a9", "Finished goods warehouse, ready to ship"),
];

/** Operations: the production steps in order. */
export const PROCESS_PHOTOS: Photo[] = [
  sample("photo-1601467995997-ac1ae9a8fff4", "Stearic acid arriving from North Sumatra mills"),
  sample("photo-1611581372056-30cf28a7bd2e", "Melting and dosing the raw materials"),
  sample("photo-1785234395765-4a82ba26c769", "Amidation with ethylenediamine"),
  sample("photo-1751629663077-67876b0fb818", "Cooling and forming beads"),
  sample("photo-1613620855495-129bee8746b7", "Milling powder grades P130 and P200"),
  sample("photo-1590496793907-4d66e2994b4d", "Loading export containers"),
];

/** Products: where customers use HI-LUB. */
export const APPLICATION_PHOTOS: Photo[] = [
  sample("photo-1737505599025-836fce14b071", "Rigid PVC pipes and profiles"),
  sample("photo-1716193696093-9c54b6a290e5", "ABS housings for appliances"),
  sample("photo-1586013286823-5ba3576ea8d2", "Colour masterbatch pellets"),
  sample("photo-1518181835702-6eef8b4b2113", "Cable and wire compounds"),
  sample("photo-1525909002-1b05e0c869d8", "Powder coatings and inks"),
];

/** About: the joint venture over the years. */
export const COMPANY_PHOTOS: Photo[] = [
  sample("photo-1681505531034-8d67054e07f6", "The joint venture signing in 1999"),
  sample("photo-1709719263381-30553a1d618b", "The Medan team in front of the plant"),
  sample("photo-1758518728641-8668e601cce1", "Partners from Korea visiting the plant"),
  sample("photo-1755377205288-f797e46983c1", "Safety training on the production floor"),
  sample("photo-1758599667729-a6f0f8bd213b", "Community programme in Medan"),
];
