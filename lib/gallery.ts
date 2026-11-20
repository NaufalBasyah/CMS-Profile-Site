/**
 * Photos for the carousels.
 *
 * Only /img/factory.jpg is a real CMS Chemical photo. Every entry marked
 * `sample: true` is a stand-in from picsum.photos (random free photos) and shows a
 * "Sample photo" badge on the site. Replace each with a real photo of what its
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

function sample(seed: string, caption: string, width = 1600, height = 1000): Photo {
  return {
    src: `https://picsum.photos/seed/cms-${seed}/${width}/${height}`,
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
  sample("hero-reactors", "Amidation reactors at the Medan plant"),
  sample("hero-packing", "HI-LUB beads being bagged for export"),
  sample("hero-lab", "Quality control lab testing a production batch"),
];

/** Home: a walk through the plant. */
export const PLANT_PHOTOS: Photo[] = [
  sample("plant-gate", "Plant entrance and weighbridge"),
  sample("plant-tanks", "Stearic acid storage tanks"),
  sample("plant-reactor", "Reactor hall during a production run"),
  sample("plant-flaker", "Flaking and bead forming line"),
  sample("plant-lab", "Quality control laboratory"),
  sample("plant-warehouse", "Finished goods warehouse, ready to ship"),
];

/** Operations: the production steps in order. */
export const PROCESS_PHOTOS: Photo[] = [
  sample("proc-delivery", "Stearic acid arriving from North Sumatra mills"),
  sample("proc-melt", "Melting and dosing the raw materials"),
  sample("proc-reaction", "Amidation with ethylenediamine"),
  sample("proc-beads", "Cooling and forming beads"),
  sample("proc-milling", "Milling powder grades P130 and P200"),
  sample("proc-container", "Loading export containers"),
];

/** Products: where customers use HI-LUB. */
export const APPLICATION_PHOTOS: Photo[] = [
  sample("app-pvc", "Rigid PVC pipes and profiles"),
  sample("app-abs", "ABS housings for appliances"),
  sample("app-masterbatch", "Colour masterbatch pellets"),
  sample("app-cable", "Cable and wire compounds"),
  sample("app-coatings", "Powder coatings and inks"),
];

/** About: the joint venture over the years. */
export const COMPANY_PHOTOS: Photo[] = [
  sample("co-meeting", "The joint venture signing in 1999"),
  sample("co-team", "The Medan team in front of the plant"),
  sample("co-visit", "Partners from Korea visiting the plant"),
  sample("co-training", "Safety training on the production floor"),
  sample("co-community", "Community programme in Medan"),
];
