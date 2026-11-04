/**
 * Store policies. DRAFTS written for Dressly: check every timeframe, fee
 * and condition against how the business actually works, and have them
 * reviewed before launch. Edit freely; the page layout reads from here.
 */

export type PolicyBlock = string | { list: string[] };
export type PolicySection = { id: string; title: string; body: PolicyBlock[] };
export type Policy = {
  slug: string;
  tab: string;
  title: string;
  intro: string;
  updated: string; // ISO date
  points: { icon: "return" | "tailor" | "swap" | "truck" | "clock" | "store" | "shield" | "lock" | "user"; title: string; text: string }[];
  sections: PolicySection[];
};

const WHATSAPP = "WhatsApp on +971 56 858 6987";

export const POLICIES: Policy[] = [
  {
    slug: "refund",
    tab: "Returns",
    title: "Returns & Refunds",
    intro: "We want every piece to fit and feel right. If something isn't right, here is how returns, exchanges and refunds work at Dressly.",
    updated: "2026-11-04",
    points: [
      { icon: "return", title: "7-day returns", text: "Return unworn ready-made items within 7 days of delivery for a refund or exchange." },
      { icon: "tailor", title: "Fit adjustments", text: "Made-to-measure pieces are adjusted free of charge if the fit isn't right." },
      { icon: "swap", title: "Easy exchanges", text: "Swap a size or colour at any of our 13 branches, or arrange it on WhatsApp." },
    ],
    sections: [
      {
        id: "overview",
        title: "Overview",
        body: [
          "This policy applies to orders placed on our website, on WhatsApp and in our branches. It does not affect your rights under UAE consumer protection law.",
          `To start a return or exchange, contact us on ${WHATSAPP} or visit any branch with your order number or receipt.`,
        ],
      },
      {
        id: "ready-made",
        title: "Ready-made items",
        body: [
          "You can return or exchange ready-made items within 7 days of delivery or purchase, as long as they are:",
          { list: ["Unworn, unwashed and unaltered", "In their original packaging, with all tags attached", "Returned with the receipt or order number"] },
          "We inspect every return. Items that show signs of wear, perfume, makeup or alteration cannot be accepted.",
        ],
      },
      {
        id: "made-to-measure",
        title: "Made-to-measure and altered pieces",
        body: [
          "Bespoke kanduras and anything cut or altered to your measurements are made only for you, so they cannot be returned or refunded for a change of mind.",
          "If a tailored piece doesn't fit as agreed, tell us within 14 days of delivery and we will adjust it free of charge, in branch or during a home visit. If it can't be put right, we will remake it.",
        ],
      },
      {
        id: "exceptions",
        title: "Items we can't take back",
        body: [
          "For hygiene and safety reasons, the following cannot be returned unless they are faulty:",
          {
            list: [
              "Undergarments: faneela, wuzar, trunks and salwar",
              "Perfumes and oud once the seal or packaging is opened",
              "Gift cards",
              "Items marked as final sale",
            ],
          },
        ],
      },
      {
        id: "faulty",
        title: "Faulty or incorrect items",
        body: [
          "If an item arrives damaged, faulty or different from what you ordered, contact us within 48 hours of delivery with your order number and a photo.",
          "We will collect it at no cost to you and send a replacement, or give a full refund if a replacement isn't available.",
        ],
      },
      {
        id: "how-to-return",
        title: "How to return an item",
        body: [
          {
            list: [
              `Message us on ${WHATSAPP} with your order number and the item you'd like to return.`,
              "Drop the item at any Dressly branch, or ask us to arrange a collection.",
              "We inspect it and confirm your refund or exchange.",
            ],
          },
          "Returns for a change of mind are free when dropped at a branch. If you would like us to collect, a collection fee may apply; we'll confirm it before booking.",
        ],
      },
      {
        id: "refunds",
        title: "Refunds",
        body: [
          "Once your return has been inspected and approved, we process the refund within 5 to 7 working days to your original payment method.",
          "Orders paid in cash on delivery are refunded by bank transfer or as store credit, whichever you prefer. Your bank may take a few more days to show the refund.",
          "Original delivery charges are refunded only when an item is faulty or we sent the wrong item.",
        ],
      },
      {
        id: "exchanges",
        title: "Exchanges",
        body: [
          "You can exchange an eligible item for a different size or colour of the same product, subject to stock. If the new item costs more, you pay the difference; if it costs less, we refund it.",
        ],
      },
    ],
  },
  {
    slug: "shipping",
    tab: "Shipping",
    title: "Shipping & Delivery",
    intro: "We deliver across the UAE, and you can always collect from your nearest branch. Here is what to expect once you've placed an order.",
    updated: "2026-11-04",
    points: [
      { icon: "truck", title: "UAE-wide delivery", text: "We deliver to all seven Emirates, straight to your home, office or majlis." },
      { icon: "clock", title: "1 to 4 working days", text: "For ready-made items in stock. Made-to-measure pieces take a little longer." },
      { icon: "store", title: "Branch pickup", text: "Collect free of charge from any of our 13 branches when your order is ready." },
    ],
    sections: [
      {
        id: "where",
        title: "Where we deliver",
        body: [
          "We deliver to all seven Emirates: Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah and Fujairah.",
          `For deliveries outside the UAE, message us on ${WHATSAPP} and we'll let you know what's possible.`,
        ],
      },
      {
        id: "times",
        title: "Delivery times",
        body: [
          {
            list: [
              "Ready-made items in stock: 1 to 3 working days in Dubai, Sharjah and Ajman, and 2 to 4 working days elsewhere in the UAE.",
              "Made-to-measure kanduras: usually 7 to 10 working days from the day we take your measurements.",
              "Home tailoring orders: we confirm the delivery date with you at the end of your visit.",
            ],
          },
          "Times can be longer before Eid, during Ramadan and on public holidays, when tailoring demand is at its highest. We'll always tell you if your order is going to take longer.",
        ],
      },
      {
        id: "charges",
        title: "Delivery charges",
        body: [
          "Any delivery charge is shown before you confirm your order. Collection from a branch is always free.",
        ],
      },
      {
        id: "tracking",
        title: "Order updates",
        body: [
          "We confirm your order and send delivery updates by WhatsApp or SMS. On the day of delivery the courier will contact you to agree a convenient time.",
        ],
      },
      {
        id: "pickup",
        title: "Collecting from a branch",
        body: [
          "Choose branch pickup and we'll message you when your order is ready. Bring your order number, or the phone number used for the order, to collect.",
          "Orders are held for 14 days. If you need longer, just let us know.",
        ],
      },
      {
        id: "receiving",
        title: "Receiving your order",
        body: [
          "Please check your order when it arrives. If the packaging is damaged, note it with the courier and tell us within 48 hours.",
          "If nobody is available, the courier will try again or contact you to rearrange. After repeated unsuccessful attempts the order returns to us and we'll get in touch.",
        ],
      },
      {
        id: "cod",
        title: "Cash on delivery",
        body: ["Where cash on delivery is offered, please have the exact amount ready. Card payment on delivery may be available on request."],
      },
    ],
  },
  {
    slug: "privacy",
    tab: "Privacy",
    title: "Privacy Policy",
    intro: "This policy explains what personal information Dressly collects, why we collect it and the choices you have. We keep it to what we need to make and deliver your order.",
    updated: "2026-11-04",
    points: [
      { icon: "lock", title: "Only what we need", text: "We collect the details required to tailor, deliver and support your order." },
      { icon: "shield", title: "Never sold", text: "We do not sell your personal information or share it for others' advertising." },
      { icon: "user", title: "You're in control", text: "Ask us at any time to see, correct or delete the information we hold about you." },
    ],
    sections: [
      {
        id: "who-we-are",
        title: "Who we are",
        body: [
          "Dressly is a kandura tailoring business in the United Arab Emirates with branches in Abu Dhabi, Dubai, Sharjah, Ajman and Ras Al Khaimah. In this policy, \"we\" and \"us\" mean Dressly.",
        ],
      },
      {
        id: "what-we-collect",
        title: "What we collect",
        body: [
          {
            list: [
              "Contact details: your name, phone number and email address.",
              "Delivery details: your address and any delivery notes.",
              "Measurements and fit preferences, so we can tailor your kanduras.",
              "Order history, returns and the messages you send us, including on WhatsApp.",
              "Basic website information, such as the pages you visit and the device you use.",
            ],
          },
          "Card payments are handled by our payment provider. We do not see or store your full card number.",
        ],
      },
      {
        id: "how-we-use",
        title: "How we use it",
        body: [
          {
            list: [
              "To make, deliver and support your orders, fittings and home tailoring visits",
              "To keep your measurements on file so reordering is quick",
              "To answer your questions and handle returns",
              "To send offers and news, only if you have agreed, and you can opt out at any time",
              "To keep our website secure and improve how it works",
              "To meet our legal and accounting obligations",
            ],
          },
        ],
      },
      {
        id: "sharing",
        title: "Who we share it with",
        body: [
          "We share information only with companies that help us run the business, and only what they need:",
          { list: ["Delivery couriers, to bring your order to you", "Payment providers, to process payments securely", "Hosting and technology providers that run our website and systems"] },
          "We may also share information when the law requires it. We never sell your personal information.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies and local storage",
        body: [
          "Our website stores a small amount of information in your browser, such as your cart and saved items, so they are still there when you come back. You can clear this at any time in your browser settings.",
        ],
      },
      {
        id: "retention",
        title: "How long we keep it",
        body: [
          "We keep order records for as long as UAE law requires for accounting purposes. We keep your measurements until you ask us to delete them, so we can tailor future orders.",
        ],
      },
      {
        id: "your-rights",
        title: "Your rights",
        body: [
          "Under UAE data protection law, including Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data, you can ask us to:",
          { list: ["Access the personal information we hold about you", "Correct anything that is inaccurate", "Delete your information, where we don't need to keep it by law", "Stop sending you marketing messages"] },
          `To make a request, message us on ${WHATSAPP} or speak to any branch.`,
        ],
      },
      {
        id: "security",
        title: "Keeping it safe",
        body: ["We use reasonable technical and organisational measures to protect your information. No system is completely secure, so please tell us straight away if you think your information has been misused."],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        body: ["We may update this policy from time to time. The date at the top shows when it last changed."],
      },
    ],
  },
  {
    slug: "terms",
    tab: "Terms",
    title: "Terms of Service",
    intro: "These terms apply when you shop with Dressly on our website, on WhatsApp, in our branches or through a home tailoring visit. Please read them before placing an order.",
    updated: "2026-11-04",
    points: [
      { icon: "tailor", title: "Made for you", text: "Tailored orders start once your measurements and fabric are confirmed." },
      { icon: "shield", title: "Fair and clear", text: "Prices are in AED and confirmed with you before your order is placed." },
      { icon: "user", title: "Your rights protected", text: "Nothing here affects your rights under UAE consumer protection law." },
    ],
    sections: [
      {
        id: "about",
        title: "About these terms",
        body: [
          "These terms are an agreement between you and Dressly, a kandura tailoring business in the United Arab Emirates. By placing an order or using our website you agree to them.",
          "They should be read together with our Returns & Refunds, Shipping & Delivery and Privacy policies. Nothing in these terms limits any rights you have under UAE law.",
        ],
      },
      {
        id: "orders",
        title: "Placing an order",
        body: [
          "You can order on our website, by WhatsApp, in any branch or during a home tailoring visit. An order is accepted when we confirm it to you by message, email or receipt.",
          "We may decline or cancel an order, for example if an item is unavailable, a price was shown incorrectly or we cannot deliver to your address. If we cancel, we refund anything you have paid in full.",
        ],
      },
      {
        id: "made-to-measure",
        title: "Made-to-measure orders",
        body: [
          {
            list: [
              "We start tailoring once your measurements, fabric and style details are confirmed with you.",
              "Please check the details we read back to you. Where you provide your own measurements, we make the piece to those measurements.",
              "A deposit may be required for made-to-measure orders. We'll tell you the amount before we begin.",
              "Delivery dates are estimates and can be longer at busy times, such as before Eid. We'll keep you updated.",
            ],
          },
          "Because tailored pieces are made only for you, they cannot be cancelled once cutting has started, and cannot be returned for a change of mind. If the fit isn't right, we will adjust it as set out in our Returns & Refunds policy.",
        ],
      },
      {
        id: "prices",
        title: "Prices and payment",
        body: [
          "Prices are shown in UAE dirhams (AED) and include VAT where it applies. Any delivery charge is shown before you confirm your order.",
          "We accept the payment methods shown at checkout or in branch, which may include card, cash and cash on delivery. Card payments are handled securely by our payment provider.",
          "We try to keep every price and description accurate. If we find a mistake in the price of something you have ordered, we will contact you before it is sent, and you can choose to continue at the correct price or cancel for a full refund.",
        ],
      },
      {
        id: "products",
        title: "Products, fabrics and colours",
        body: [
          "We describe and photograph our products as accurately as we can. Natural fabrics vary slightly from one roll to the next, and colours can look different on screens, so small differences in shade and texture are normal and not a fault.",
          "Measurements in our size guide are a guide only. If you're unsure, ask us, visit a branch or book a home visit.",
        ],
      },
      {
        id: "home-visits",
        title: "Home tailoring visits",
        body: [
          "Home visits are booked by WhatsApp and are subject to availability in your area. Please make sure someone is available at the agreed time and place.",
          "If you need to change or cancel a visit, let us know as early as you can, ideally at least 24 hours in advance.",
        ],
      },
      {
        id: "delivery-returns",
        title: "Delivery and returns",
        body: [
          "Delivery, collection from a branch and returns are covered by our Shipping & Delivery and Returns & Refunds policies, which form part of these terms.",
        ],
      },
      {
        id: "gift-cards",
        title: "Gift cards",
        body: [
          "Gift cards can be used towards purchases from Dressly and cannot be exchanged for cash. Please keep your gift card code safe, as we cannot replace a code that is lost or used by someone else.",
        ],
      },
      {
        id: "website",
        title: "Using our website",
        body: [
          "All content on our website, including text, photographs, logos and designs, belongs to Dressly or is used with permission. You may not copy or reuse it for commercial purposes without our written consent.",
          "Please don't misuse the website, for example by attempting to access it without authorisation or interfering with how it works.",
        ],
      },
      {
        id: "liability",
        title: "Our responsibility to you",
        body: [
          "We are responsible for loss or damage you suffer that is a foreseeable result of us breaking these terms or failing to use reasonable care and skill. We are not responsible for loss that was not foreseeable, or for delays or failures caused by events outside our reasonable control.",
          "Nothing in these terms excludes or limits our liability where it would be unlawful to do so.",
        ],
      },
      {
        id: "law",
        title: "Governing law",
        body: [
          "These terms are governed by the laws of the United Arab Emirates. If a dispute arises, please contact us first so we can try to resolve it; otherwise it will be handled by the competent courts of the UAE.",
        ],
      },
      {
        id: "changes",
        title: "Changes and contact",
        body: [
          "We may update these terms from time to time. The version that applies to your order is the one shown when you placed it; the date at the top shows when they last changed.",
          `If you have any question about these terms, message us on ${WHATSAPP} or visit any branch.`,
        ],
      },
    ],
  },
];

export const getPolicy = (slug: string) => POLICIES.find((p) => p.slug === slug);
