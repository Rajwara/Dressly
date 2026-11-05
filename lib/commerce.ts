/**
 * Store rules shared by the cart, checkout, product page and quick view.
 * Values marked PLACEHOLDER are guesses: confirm them before launch.
 */

export const CURRENCY = "AED";

/** Prices on the site already include VAT. */
export const VAT_RATE = 0.05;
/** The VAT part of a VAT-inclusive amount. */
export const vatIncluded = (gross: number) => Math.round((gross - gross / (1 + VAT_RATE)) * 100) / 100;

export const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"] as const;
export type Emirate = (typeof EMIRATES)[number];

export const DELIVERY = {
  fee: 25, // PLACEHOLDER: AED per order
  freeOver: 300, // PLACEHOLDER: free delivery from this subtotal
  /** PLACEHOLDER: working days from order to delivery, by emirate. */
  days: { Dubai: 1, Sharjah: 1, Ajman: 1, "Abu Dhabi": 2, "Umm Al Quwain": 2, "Ras Al Khaimah": 2, Fujairah: 3 } as Record<Emirate, number>,
  /** Extra working days when an item is tailored to measurements. PLACEHOLDER. */
  tailoredExtraDays: 5,
};

export const deliveryFee = (subtotal: number, pickup = false) => (pickup || subtotal >= DELIVERY.freeOver || subtotal === 0 ? 0 : DELIVERY.fee);

/** Date an order placed now should arrive. Sundays are skipped. */
export function deliveryDate(emirate: Emirate, tailored = false, from = new Date()) {
  let left = DELIVERY.days[emirate] + (tailored ? DELIVERY.tailoredExtraDays : 0);
  const d = new Date(from);
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) left--;
  }
  return d;
}

/** "Thursday" within a week, otherwise "Thu 14 Nov". */
export function deliveryLabel(emirate: Emirate, tailored = false, from = new Date()) {
  const d = deliveryDate(emirate, tailored, from);
  const days = (d.getTime() - from.getTime()) / 86_400_000;
  return days < 6
    ? d.toLocaleDateString("en-GB", { weekday: "long" })
    : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export const RETURNS_DAYS = 7;

/** First-order offer from the sign-up popup, also accepted at checkout. */
export const PROMO = {
  code: "WELCOME10",
  percent: 10,
  validDays: 7, // the code is valid this many days after sign-up
  label: "10% off your first order",
};

export function applyPromo(code: string, subtotal: number) {
  return code.trim().toUpperCase() === PROMO.code ? Math.round(subtotal * PROMO.percent) / 100 : 0;
}

/** Category groups whose pieces can be ready-made or tailored to measurements. */
export const TAILORED_GROUPS = ["Abayas"];
export const isTailorable = (group: string | undefined) => !!group && TAILORED_GROUPS.includes(group);

/** Groups suggested under "Complete the look", in order. */
export const COMPLETE_THE_LOOK = ["ghutra", "egal", "arabic-sandals", "perfumes"];

export const PAYMENT_METHODS = [
  { id: "card", label: "Credit or debit card", note: "Visa, Mastercard, Amex" },
  { id: "apple-pay", label: "Apple Pay", note: "" },
  { id: "google-pay", label: "Google Pay", note: "" },
  { id: "tabby", label: "Tabby", note: "Split into 4 payments, interest-free" },
  { id: "tamara", label: "Tamara", note: "Pay later, interest-free" },
  { id: "cod", label: "Cash on delivery", note: "Pay by cash or card at your door" },
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];
