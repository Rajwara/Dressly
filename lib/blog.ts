/**
 * Blog posts. Starter articles written for Dressly; edit, replace or add freely.
 * `image` / figure images are paths under public/ without the extension; a
 * .webp/.jpg/.png with the same name is used automatically.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "figure"; image: string; caption: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO yyyy-mm-dd
  image: string;
  featured?: boolean;
  body: Block[];
};

export const AUTHOR = {
  name: "Dressly Team",
  bio: "Notes from our tailors and stylists on fit, fabric and traditional dress, from 13 branches across the UAE.",
};

export const CATEGORIES = ["Style Guides", "Fabric & Care", "Occasions", "Tailoring", "Heritage"];

export const POSTS: Post[] = [
  {
    slug: "how-to-choose-the-right-kandura-fit",
    title: "How to Choose the Right Kandura Fit",
    excerpt: "Shoulders, length, sleeves and collar: the four details that decide whether a kandura looks made for you.",
    category: "Style Guides",
    date: "2026-10-28",
    image: "images/categories/kandura-thobes",
    featured: true,
    body: [
      { type: "p", text: "A kandura is simple in shape, which is exactly why fit matters so much. With no tailoring seams to hide behind, small differences in length or shoulder width are easy to see." },
      { type: "p", text: "Whether you buy ready-to-wear or have one made to measure, these are the details our tailors check first." },
      { type: "h2", text: "Start with the shoulders" },
      { type: "p", text: "The shoulder seam should sit at the edge of your shoulder, not hang past it. Too wide and the kandura looks borrowed; too narrow and it pulls across the back when you reach forward." },
      { type: "p", text: "If you are between sizes, choose the one that fits the shoulders and let a tailor adjust the rest." },
      { type: "quote", text: "“A good kandura should move with you: sit, kneel, reach, and it should fall straight back into place.”" },
      { type: "h2", text: "Length, sleeves and collar" },
      { type: "p", text: "Length is personal and regional, but a clean rule is to finish just above the ankle so the hem clears your sandals without showing too much of them." },
      {
        type: "list",
        items: [
          "Length: just above the ankle bone, measured while wearing sandals.",
          "Sleeves: ending at the wrist bone with your arm relaxed.",
          "Chest: room to fold your arms without the fabric pulling.",
          "Collar: comfortable with one finger's space at the neck.",
        ],
      },
      { type: "figure", image: "images/categories/traditional-kandura", caption: "A traditional kandura with a round collar and tarboosh." },
      { type: "h2", text: "Ready-made or made to measure?" },
      { type: "p", text: "Ready-made kanduras suit most people well with small adjustments. If you are tall, broad-shouldered or want a particular collar or cuff, made to measure is worth it." },
      { type: "p", text: "Visit any of our branches to be measured, or book a home tailoring visit and we will bring the fabrics and tape to you." },
    ],
  },
  {
    slug: "keep-white-kanduras-bright",
    title: "Caring for White Kanduras: Keep Them Bright",
    excerpt: "Washing, drying and ironing habits that keep white fabric crisp, season after season.",
    category: "Fabric & Care",
    date: "2026-10-21",
    image: "images/categories/summer-thobes",
    body: [
      { type: "p", text: "White is the colour most kanduras are worn in, and the one that shows every mark. The good news is that most yellowing and dullness comes from habits that are easy to change." },
      { type: "h2", text: "Washing" },
      {
        type: "list",
        items: [
          "Wash whites only with whites, ideally after every one or two wears.",
          "Use cool to warm water; very hot water can set sweat stains.",
          "Treat collars and cuffs before washing, where marks build up first.",
          "Go easy on bleach: too much weakens fibres and can turn them yellow.",
        ],
      },
      { type: "h2", text: "Drying and ironing" },
      { type: "p", text: "Dry in the shade where you can. Strong sun bleaches unevenly and stiffens some fabrics. Iron while the kandura is very slightly damp, at the temperature the fabric label recommends." },
      { type: "quote", text: "“Hang it straight after ironing. Folding a warm kandura sets creases you will be ironing out again tomorrow.”" },
      { type: "h2", text: "Storing" },
      { type: "p", text: "Store kanduras clean, on broad hangers, with a little space between them so air can move. A breathable cotton cover protects occasion pieces between wears." },
    ],
  },
  {
    slug: "ghutra-shimagh-yashmagh-explained",
    title: "Ghutra, Shimagh and Yashmagh Explained",
    excerpt: "Three headscarves, three looks. What sets them apart and when each one is worn.",
    category: "Style Guides",
    date: "2026-10-14",
    image: "images/categories/shimagh-ghutra",
    body: [
      { type: "p", text: "The words are sometimes used interchangeably, but in the Gulf each usually means something specific. Knowing the difference helps you choose the right one for the day." },
      { type: "h2", text: "Ghutra" },
      { type: "p", text: "The ghutra is the plain white headscarf, usually in cotton or a fine blend. It is the everyday choice across the UAE and the classic partner to a white kandura." },
      { type: "h2", text: "Shimagh and yashmagh" },
      { type: "p", text: "The shimagh is the red-and-white checked scarf, often heavier and slightly larger. Yashmagh is a closely related name, also used for checked scarves in black and white or red and white." },
      { type: "list", items: ["Ghutra: plain white, light, everyday.", "Shimagh: red and white check, a little heavier.", "Yashmagh: checked, in red or black with white."] },
      { type: "figure", image: "images/categories/yashmagh", caption: "A checked yashmagh, folded." },
      { type: "h2", text: "Finishing the look" },
      { type: "p", text: "All three are worn folded into a triangle and held with an egal. Choose the egal's thickness to suit the scarf: slimmer for a light ghutra, fuller for a heavier shimagh." },
    ],
  },
  {
    slug: "what-to-wear-for-eid",
    title: "What to Wear for Eid: A Simple Guide",
    excerpt: "From a fresh kandura to the right sandals and oud, how to plan an Eid outfit without the last-minute rush.",
    category: "Occasions",
    date: "2026-10-07",
    image: "images/hero/hero-new",
    body: [
      { type: "p", text: "Eid is when most families want something new, and when tailors are busiest. Planning a few weeks ahead means your kandura is ready, fitted and pressed in time." },
      { type: "h2", text: "Start with the kandura" },
      { type: "p", text: "White is the traditional choice, but cream, sand and soft greys are popular for family visits. Choose a slightly finer fabric than your everyday kandura so it feels like an occasion." },
      { type: "h2", text: "Then the details" },
      {
        type: "list",
        items: [
          "A fresh ghutra, pressed, with a matching egal.",
          "Clean leather sandals, or a new pair for the day.",
          "A bisht for formal gatherings and evening visits.",
          "A light oud or attar, applied before you dress.",
        ],
      },
      { type: "quote", text: "“Order early: Eid is the one week every tailor in the country is booked.”" },
      { type: "h2", text: "Dressing the boys" },
      { type: "p", text: "Children's kanduras are easy to forget until the last minute. Order them at the same time as yours, allowing a little extra length for growth." },
    ],
  },
  {
    slug: "choosing-kandura-fabric-for-summer",
    title: "Choosing Kandura Fabric for UAE Summers",
    excerpt: "Weight, weave and colour all change how cool a kandura feels. Here is what to look for when the heat arrives.",
    category: "Fabric & Care",
    date: "2026-09-30",
    image: "images/categories/adult-thobes",
    body: [
      { type: "p", text: "In summer the fabric matters more than anything else. Two kanduras can look identical on the hanger and feel completely different after an hour outdoors." },
      { type: "h2", text: "What keeps you cool" },
      {
        type: "list",
        items: [
          "Lighter weight fabrics that let air pass through.",
          "Natural fibres such as cotton, or blends with a high cotton content.",
          "An open, breathable weave rather than a dense, shiny one.",
          "Lighter colours, which reflect more of the sun.",
        ],
      },
      { type: "p", text: "Very lightweight fabric can be slightly sheer, so many men wear a faneela (undershirt) beneath it. That also protects the kandura from sweat marks." },
      { type: "h2", text: "Try before you choose" },
      { type: "p", text: "Ask to feel the fabric against your arm and hold it up to the light. Our tailors can show you the summer weights side by side, in store or during a home visit." },
    ],
  },
  {
    slug: "what-happens-at-a-home-tailoring-visit",
    title: "What Happens at a Home Tailoring Visit",
    excerpt: "Booking on WhatsApp, choosing fabric in your majlis and being measured on the spot: a visit, step by step.",
    category: "Tailoring",
    date: "2026-09-23",
    image: "images/content/story",
    body: [
      { type: "p", text: "A home visit brings the tailoring counter to you. It is ideal for busy schedules, for measuring several family members at once, or simply for choosing fabric in your own space." },
      { type: "h2", text: "Booking" },
      { type: "p", text: "Send us a WhatsApp message with your preferred date, time and area. We will confirm a slot and the tailor who will visit." },
      { type: "h2", text: "During the visit" },
      {
        type: "list",
        items: [
          "Your tailor brings fabric swatches and a measuring tape.",
          "You choose fabric, collar and cuff style together.",
          "Measurements are taken and noted for your next order too.",
          "You agree the details and timing before the tailor leaves.",
        ],
      },
      { type: "quote", text: "“Once we have your measurements, reordering is just a message away.”" },
      { type: "h2", text: "Delivery" },
      { type: "p", text: "Once your kanduras are ready they are delivered to your door. If anything needs adjusting, let us know and we will arrange it." },
    ],
  },
  {
    slug: "the-bisht-craft-and-when-to-wear-it",
    title: "The Bisht: Craft, Gold Trim and When to Wear It",
    excerpt: "The cloak worn over the kandura for the most important moments, and what to look for when choosing one.",
    category: "Heritage",
    date: "2026-09-16",
    image: "images/categories/bisht",
    body: [
      { type: "p", text: "The bisht is the formal outer cloak worn over a kandura. It marks occasions: weddings, Eid gatherings, graduations and official events." },
      { type: "h2", text: "The details that matter" },
      { type: "p", text: "Look closely at the trim along the front edges and collar. The finish of that embroidery, and how evenly it is applied, is what sets a fine bisht apart." },
      {
        type: "list",
        items: [
          "Black and dark brown are classic for evening and formal events.",
          "Camel and lighter shades suit daytime occasions.",
          "Lightweight bishts are easier to wear in warmer months.",
        ],
      },
      { type: "figure", image: "images/categories/bisht", caption: "Gold trim along the front edge of a bisht." },
      { type: "h2", text: "Wearing it well" },
      { type: "p", text: "A bisht sits best over a well-fitted, freshly pressed kandura. Let it rest on the shoulders and fall open at the front so the trim frames the kandura beneath." },
    ],
  },
];

const WORDS_PER_MINUTE = 200;
export function readTime(p: Post) {
  const text = p.body.map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : b.caption)).join(" ");
  return Math.max(2, Math.round(text.split(/\s+/).length / WORDS_PER_MINUTE) + 1);
}

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
