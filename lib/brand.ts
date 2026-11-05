/**
 * Dressly brand details and copy, adapted from the store's existing website.
 * Edit here to update the header, footer, home page, About, Branches and Contact.
 */

export const BRAND = "Dressly";
export const TAGLINE = "Kandura tailoring since 1998 · United Arab Emirates";

export const PHONE_DISPLAY = "+971 56 858 6987";
export const PHONE_TEL = "+971568586987";
export const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=971568586987";
export const whatsapp = (text: string) => `${WHATSAPP_URL}&text=${encodeURIComponent(text)}`;
export const HOME_VISIT_URL = whatsapp("Hello Dressly, I would like to book a home tailoring visit.");

export const SOCIALS = [
  { name: "Instagram", href: "https://www.instagram.com/dressly", icon: "instagram" },
  { name: "TikTok", href: "https://www.tiktok.com/@dressly", icon: "tiktok" },
  { name: "WhatsApp", href: WHATSAPP_URL, icon: "whatsapp" },
] as const;

export const STATS = [
  { value: "1998", label: "Founded" },
  { value: "13", label: "Branches" },
  { value: "5", label: "Emirates" },
  { value: "40+", label: "Years of craft" },
];

export const HERO = {
  eyebrow: "Est. 1998 · United Arab Emirates",
  title: "The Art of the Kandura, Perfected.",
  text: "Since 1998, Dressly has dressed the men of the UAE in kanduras cut with precision and finished to a standard we have spent a generation refining. Today we are proud to be one of the UAE's leading names in kandura textile and tailoring.",
};

export const WHO_WE_ARE = {
  eyebrow: "Who we are",
  title: "Tailoring built on trust, not shortcuts.",
  paragraphs: [
    "Since 1998, Dressly has been dedicated to delivering exceptional service and building lasting relationships through personal attention to every client's needs. A seamless, customer-first approach, paired with expert craftsmanship, has earned us a trusted reputation across the UAE's tailoring industry.",
    "What began as a single store has grown into a name found in almost every emirate, while our focus has never moved from the fit, fabric and finish of every piece we make.",
  ],
  quote: "Precision in fit, honesty in fabric.",
};

export const STORY = {
  eyebrow: "Our story",
  title: "A family craft, grown into a national name.",
  steps: [
    {
      when: "1998",
      title: "A Tailor's Beginning",
      text: "A master tailor from a family of tailors opened Dressly's first store, bringing decades of craft to the men of the UAE.",
    },
    {
      when: "Growth",
      title: "Setting the Standard",
      text: "Word spread quickly. A commitment to the finest fabrics and meticulous stitching made Dressly a favourite in the local community.",
    },
    {
      when: "Today",
      title: "A Name Across the Emirates",
      text: "13 branches across Abu Dhabi, Dubai, Sharjah, Ajman and Ras Al Khaimah, and one of the most recognised names in UAE tailoring.",
    },
  ],
};

export const SERVICES = {
  eyebrow: "What we offer",
  title: "Every detail, tailored on purpose.",
  items: [
    {
      title: "Bespoke Kanduras",
      text: "Precision-tailored kanduras made from the finest fabrics, blending traditional design with modern craftsmanship for a perfect fit.",
      href: "/category/kandura-thobes",
      image: "images/categories/kandura-thobes",
    },
    {
      title: "Army & Police Uniforms",
      text: "Trusted to outfit uniformed services, with uniforms held to the same exacting standard of precision as our kanduras.",
      href: "/contact",
      image: "images/categories/kandura-jackets",
    },
    {
      title: "Sandals & Accessories",
      text: "A curated selection of Arabic sandals and kandura accessories, completing a full traditional look.",
      href: "/category/arabic-sandals",
      image: "images/categories/arabic-sandals",
    },
  ],
};

export const HOME_VISIT = {
  eyebrow: "Home tailoring · We come to you",
  title: "We Come to You.",
  text: "Prefer to be fitted at home or in your majlis? Our tailors bring the fabrics, the measuring tape and decades of craft straight to your door.",
  steps: [
    { icon: "whatsapp", title: "Request on WhatsApp", text: "Message us your preferred date, time and area." },
    { icon: "home", title: "We Visit Your Home or Majlis", text: "A tailor arrives at your chosen time, anywhere across the Emirates we serve." },
    { icon: "fabric", title: "Fabrics & Measurements", text: "Browse fabric swatches in person and get measured precisely on the spot." },
    { icon: "check", title: "Delivered to Your Door", text: "Once tailored to perfection, your kanduras are delivered straight to you." },
  ],
};

/* ---------------------------------------------------------------- contact */

/** Legal / trading name shown on the Contact page. PLACEHOLDER: confirm. */
export const COMPANY = "Dressly";
/** Customer service email. PLACEHOLDER: set a real inbox before launch. */
export const EMAIL = "hello@dressly.ae";
/** Head office address. PLACEHOLDER: leave empty to hide it. */
export const HEAD_OFFICE = "";
/**
 * Reply-time promise on the Contact page. PLACEHOLDER: only promise what the
 * team can keep every day; set to "" to hide it.
 */
export const REPLY_TIME = "We reply on WhatsApp within 1 hour during opening hours.";
/** Customer-service opening hours (phone and WhatsApp). PLACEHOLDER. */
export const HOURS = [
  { days: "Saturday – Thursday", time: "10:00 – 22:00" },
  { days: "Friday", time: "16:00 – 22:00" },
];

/* ---------------------------------------------------------------- branches */

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
/** "10:00-22:00" (24h, local UAE time) or "closed". Overnight ranges like 16:00-01:00 are allowed. */
export type BranchHours = Partial<Record<Weekday, string>>;

/** Services every branch offers unless a branch lists its own. */
export const BRANCH_SERVICES = ["Measurements", "Fabric selection", "Ready-made pickup", "Alterations"];

export type Branch = {
  id: string;
  name: string;
  area: string;
  /** Map position. APPROXIMATE (placed by area); replace with each store's exact pin. */
  lat: number;
  lng: number;
  /** Direct branch number, e.g. "+971 4 123 4567". Empty: the main line is shown. */
  phone?: string;
  /** Full street address. */
  address?: string;
  /** Opening hours per weekday. Empty: "Hours coming soon" is shown and "Open now" is disabled. */
  hours?: BranchHours;
  /** Services at this branch; defaults to BRANCH_SERVICES. */
  services?: string[];
  /** e.g. "Free mall parking, level P1". */
  parking?: string;
};

/**
 * Branch names and areas as read from the existing website.
 * Before launch: check them, add each phone number, and set exact lat/lng
 * (in Google Maps, right-click the store and copy the coordinates).
 * A photo at public/images/branches/<id>.webp is shown when the pin is hovered.
 */
export const BRANCHES: { emirate: string; branches: Branch[] }[] = [
  {
    emirate: "Abu Dhabi",
    branches: [
      { id: "al-falah-central-mall", name: "Al Falah Central Mall", area: "Al Falah", lat: 24.44, lng: 54.712 },
      { id: "bani-yas-community-market", name: "Bani Yas Community Market", area: "Bani Yas", lat: 24.312, lng: 54.629 },
    ],
  },
  {
    emirate: "Dubai",
    branches: [
      { id: "jumeirah-road", name: "Jumeirah Road", area: "Umm Suqeim 1", lat: 25.155, lng: 55.215 },
      { id: "umm-suqeim-road", name: "Umm Suqeim Road", area: "Al Barsha 2", lat: 25.104, lng: 55.206 },
      { id: "arabian-center", name: "Arabian Center", area: "Al Khawaneej", lat: 25.237, lng: 55.437 },
      { id: "al-mizhar", name: "Al Mizhar", area: "Al Mizhar 1", lat: 25.244, lng: 55.419 },
    ],
  },
  {
    emirate: "Sharjah",
    branches: [
      { id: "nasiri-street", name: "Nasiri Street", area: "Sharjah", lat: 25.357, lng: 55.398 },
      { id: "al-wahda-street", name: "Al Wahda Street", area: "Bu Daniq", lat: 25.322, lng: 55.398 },
      { id: "university-city-road", name: "University City Road", area: "Muwaileh", lat: 25.3, lng: 55.455 },
      { id: "sharjah-co-op", name: "Sharjah Co-op", area: "Al Qarayen", lat: 25.293, lng: 55.476 },
      { id: "maliha-road", name: "Maliha Road", area: "Sharjah", lat: 25.262, lng: 55.52 },
    ],
  },
  { emirate: "Ajman", branches: [{ id: "ajman-sheikh-zayed-street", name: "Sheikh Zayed Street", area: "Ajman", lat: 25.4, lng: 55.48 }] },
  {
    emirate: "Ras Al Khaimah",
    branches: [{ id: "rak-sheikh-mohamed-bin-salem-road", name: "Sheikh Mohamed Bin Salem Road", area: "Ras Al Khaimah", lat: 25.752, lng: 55.965 }],
  },
];

export const directions = (b: Pick<Branch, "lat" | "lng">, from?: { lat: number; lng: number }) =>
  `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}${from ? `&origin=${from.lat},${from.lng}` : ""}`;

/** Sign-up popup with a countdown. Shown once per visitor until closed or joined. */
export const OFFER = {
  title: "Welcome to Dressly",
  delaySeconds: 15, // opens after this long, or when the visitor has scrolled half the page
  hideForDays: 3, // after "close", stay hidden this long
  points: [
    "Kandura tailoring since 1998",
    "13 branches across 5 Emirates",
    "Home tailoring visits at your door",
    "Finest fabrics, precision fit",
    "Order easily on WhatsApp",
  ],
};

/** Rotating messages in the bar above the header. */
export const ANNOUNCEMENTS: { icon: string; text: string; href?: string }[] = [
  { icon: "check", text: "Kandura tailoring since 1998" },
  { icon: "home", text: "Home tailoring: we come to you", href: "/#home-tailoring" },
  { icon: "pin", text: "13 branches across 5 Emirates", href: "/branches" },
  { icon: "whatsapp", text: `Order on WhatsApp ${PHONE_DISPLAY}`, href: WHATSAPP_URL },
];

/**
 * Short vertical videos on the home page ("Shop the Look" row).
 * Files live in public/videos/community/ (MP4, 540x960) with a poster frame of
 * the same name in public/images/community/. List the products that appear in
 * each clip. Only set `verified: true` for accounts Instagram has verified.
 */
export const COMMUNITY = {
  eyebrow: "Behind the craft",
  text: "Follow @dressly on Instagram for more, and tag us wearing Dressly to be featured in our community showcase.",
  instagram: "https://www.instagram.com/dressly",
  clips: [
    { handle: "@dressly", video: "/videos/community/desert-walk.mp4", poster: "images/community/desert-walk", verified: false,
      products: ["classic-round-collar-kandura-ivory", "crisp-cotton-ghutra-white", "classic-braided-egal-black"] },
    { handle: "@dressly", video: "/videos/community/bisht-trim.mp4", poster: "images/community/bisht-trim", verified: false,
      products: ["occasion-bisht-black", "formal-trim-bisht-dark-brown", "lightweight-bisht-camel"] },
    { handle: "@dressly", video: "/videos/community/perfume-blending.mp4", poster: "images/community/perfume-blending", verified: false,
      products: ["oud-reserve-eau-de-parfum-amber", "citrus-musk-eau-de-parfum-gold", "rose-amber-eau-de-parfum-rose"] },
    { handle: "@dressly", video: "/videos/community/sandal-making.mp4", poster: "images/community/sandal-making", verified: false,
      products: ["classic-leather-sandal-brown", "hand-stitched-sandal-tan", "double-strap-sandal-black"] },
    { handle: "@dressly", video: "/videos/community/shopping-day.mp4", poster: "images/community/shopping-day", verified: false,
      products: ["heritage-tassel-kandura-white", "plain-everyday-ghutra-white", "digital-gift-card-ivory"] },
    { handle: "@dressly", video: "/videos/community/wallet-stitching.mp4", poster: "images/community/wallet-stitching", verified: false,
      products: ["leather-bifold-wallet-brown", "travel-zip-wallet-dark-brown"] },
    { handle: "@dressly", video: "/videos/community/sandal-strap.mp4", poster: "images/community/sandal-strap", verified: false,
      products: ["hand-stitched-sandal-tan", "kids-leather-sandal-tan"] },
    { handle: "@dressly", video: "/videos/community/leather-roll.mp4", poster: "images/community/leather-roll", verified: false,
      products: ["classic-leather-sandal-brown", "leather-bifold-wallet-brown"] },
    { handle: "@dressly", video: "/videos/community/wallet-assembly.mp4", poster: "images/community/wallet-assembly", verified: false,
      products: ["slim-card-wallet-black", "leather-bifold-wallet-brown"] },
  ],
};
