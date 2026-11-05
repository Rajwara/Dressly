"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BRANCHES, whatsapp, WHATSAPP_URL } from "@/lib/brand";
import {
  applyPromo,
  DELIVERY,
  deliveryFee,
  deliveryLabel,
  EMIRATES,
  PAYMENT_METHODS,
  PROMO,
  RETURNS_DAYS,
  vatIncluded,
  type Emirate,
  type PaymentMethod,
} from "@/lib/commerce";
import { money } from "@/lib/format";
import type { CardProduct } from "@/lib/types";
import { useStore } from "../StoreProvider";
import "./checkout.css";

type Mode = "delivery" | "pickup";
type Measure = "saved" | "home-visit" | "branch" | "manual";

const MEASURE_OPTIONS: { id: Measure; label: string; note: string }[] = [
  { id: "saved", label: "Use my saved measurements", note: "We'll match your order to the measurements we hold for your mobile number." },
  { id: "home-visit", label: "Book a home visit", note: "A tailor comes to your home or majlis to measure you. We'll confirm a time on WhatsApp." },
  { id: "branch", label: "Visit a branch", note: "Be measured at any of our 13 branches, then we start tailoring." },
  { id: "manual", label: "Enter them myself", note: "Measure with a soft tape, in centimetres." },
];
const MEASURE_FIELDS = ["Chest", "Shoulder", "Sleeve", "Length", "Neck"] as const;

const BRANCH_LIST = BRANCHES.flatMap((e) => e.branches.map((b) => ({ ...b, emirate: e.emirate })));

type Errors = Partial<Record<string, string>>;

function orderRef() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DR-${ymd}-${rand}`;
}

export default function Checkout({ products, tailorable }: { products: CardProduct[]; tailorable: string[] }) {
  const { cart, removeLine } = useStore();
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const lines = cart.map((line) => ({ line, p: bySlug.get(line.slug) })).filter((l): l is { line: typeof l.line; p: CardProduct } => !!l.p);

  const [phone, setPhone] = useState("+971 ");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("delivery");
  const [emirate, setEmirate] = useState<Emirate | "">("");
  const [area, setArea] = useState("");
  const [building, setBuilding] = useState("");
  const [makani, setMakani] = useState("");
  const [branch, setBranch] = useState("");
  const [measure, setMeasure] = useState<Measure | "">("");
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<{ ref: string; payment: PaymentMethod; url: string } | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  // The cart loads from storage after hydration; wait for it before showing "empty".
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const tailoredSet = new Set(tailorable);
  const isTailored = (l: (typeof lines)[number]) => tailoredSet.has(l.p.categorySlug) && /tailored/i.test(l.line.options);
  const needsMeasurements = lines.some(isTailored);

  const subtotal = lines.reduce((a, { line, p }) => a + p.price * line.qty, 0);
  const discount = applyPromo(promo, subtotal);
  const fee = deliveryFee(subtotal - discount, mode === "pickup");
  const total = subtotal - discount + fee;
  const pickupBranch = BRANCH_LIST.find((b) => b.id === branch);
  const estimateEmirate = (mode === "pickup" ? pickupBranch?.emirate : emirate) as Emirate | undefined;
  const estimate = estimateEmirate && EMIRATES.includes(estimateEmirate) ? deliveryLabel(estimateEmirate, needsMeasurements) : "";

  if (done) {
    return (
      <div className="co">
        <div className="co-wrap co-done">
          <span className="co-eyebrow">*Order received</span>
          <h1>Thank you, {name.split(" ")[0] || "and welcome"}</h1>
          <p className="co-ref">
            Order reference <b>{done.ref}</b>
          </p>
          <p>
            We opened WhatsApp with your order details. Please press <b>send</b> so our team receives it, and we&apos;ll confirm within working hours.
            {done.payment === "cod"
              ? " You'll pay by cash or card when your order arrives."
              : " A secure payment link will be sent to you on WhatsApp to complete payment."}
          </p>
          <p>
            WhatsApp didn&apos;t open?{" "}
            <a href={done.url} target="_blank" rel="noopener noreferrer" className="co-link">
              Send the order on WhatsApp
            </a>
          </p>
          <div className="co-account">
            <h2>Save your details for next time</h2>
            <p>Create an account to keep your measurements, track orders and book home visits. It&apos;s optional.</p>
            <Link className="btn" href="/account?signup=1">
              Create an account
            </Link>
            <Link className="co-link" href="/shop">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) return <div className="co" aria-busy="true" />;

  if (!lines.length) {
    return (
      <div className="co">
        <div className="co-wrap co-empty">
          <h1>Checkout</h1>
          <p>Your cart is empty.</p>
          <Link className="btn" href="/shop">
            Shop all categories
          </Link>
        </div>
      </div>
    );
  }

  function applyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!promoInput.trim()) return;
    if (applyPromo(promoInput, subtotal) > 0) {
      setPromo(promoInput.trim().toUpperCase());
      setPromoMsg(`${PROMO.label} applied.`);
    } else {
      setPromo("");
      setPromoMsg("That code isn't valid.");
    }
  }

  function validate(): Errors {
    const e: Errors = {};
    const digits = phone.replace(/\D/g, "");
    if (!name.trim()) e.name = "Please enter your full name.";
    if (!/^971(5\d{8}|[234679]\d{7})$/.test(digits)) e.phone = "Enter a UAE mobile number, e.g. +971 50 123 4567.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = "Enter a valid email address, or leave it empty.";
    if (mode === "delivery") {
      if (!emirate) e.emirate = "Choose your emirate.";
      if (!area.trim()) e.area = "Enter your area.";
      if (!building.trim()) e.building = "Enter your building or villa.";
    } else if (!branch) e.branch = "Choose a branch to pick up from.";
    if (needsMeasurements) {
      if (!measure) e.measure = "Choose how we get your measurements.";
      else if (measure === "manual" && MEASURE_FIELDS.some((f) => !(Number(sizes[f]) > 0)))
        e.measure = "Enter all five measurements in centimetres.";
    }
    return e;
  }

  function placeOrder(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector(`[data-field="${Object.keys(e)[0]}"]`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const ref = orderRef();
    const pay = PAYMENT_METHODS.find((m) => m.id === payment)!;
    const msg = [
      `New order ${ref}`,
      "",
      ...lines.map(({ line, p }) => `• ${line.qty} × ${p.name}${line.options ? ` (${line.options})` : ""} = ${money(p.price * line.qty)}`),
      "",
      `Subtotal: ${money(subtotal)}`,
      discount ? `Promo ${promo}: -${money(discount)}` : "",
      `Delivery: ${fee ? money(fee) : "Free"}`,
      `Total: ${money(total)} (incl. VAT ${money(vatIncluded(total))})`,
      "",
      `Name: ${name}`,
      `Mobile: ${phone}`,
      email ? `Email: ${email}` : "",
      mode === "delivery"
        ? `Delivery to: ${building}, ${area}, ${emirate}${makani ? ` (Makani ${makani})` : ""}`
        : `Pick up at: ${pickupBranch?.name}, ${pickupBranch?.area}, ${pickupBranch?.emirate}`,
      needsMeasurements
        ? `Measurements: ${MEASURE_OPTIONS.find((m) => m.id === measure)?.label}${
            measure === "manual" ? ` (${MEASURE_FIELDS.map((f) => `${f} ${sizes[f]} cm`).join(", ")})` : ""
          }`
        : "",
      `Payment: ${pay.label}`,
    ]
      .filter((l, i, a) => l !== "" || a[i - 1] !== "")
      .join("\n");
    const url = whatsapp(msg);
    window.open(url, "_blank", "noopener,noreferrer");
    for (let i = cart.length - 1; i >= 0; i--) removeLine(i);
    setDone({ ref, payment, url });
    window.scrollTo({ top: 0 });
  }

  const err = (k: string) => (errors[k] ? <p className="co-error">{errors[k]}</p> : null);

  const summary = (
    <aside className={`co-summary${summaryOpen ? " open" : ""}`} aria-label="Order summary">
      <button type="button" className="co-summary-toggle" onClick={() => setSummaryOpen((o) => !o)} aria-expanded={summaryOpen}>
        <span>{summaryOpen ? "Hide" : "Show"} order summary</span>
        <b>{money(total)}</b>
      </button>
      <div className="co-summary-body">
        <h2>Order summary</h2>
        <ul className="co-items">
          {lines.map(({ line, p }) => (
            <li key={`${line.slug}|${line.options}`}>
              <span className="co-thumb">
                <img src={p.image} alt="" />
                <i>{line.qty}</i>
              </span>
              <span className="co-item-text">
                <b>{p.name}</b>
                {line.options && <small>{line.options}</small>}
              </span>
              <span>{money(p.price * line.qty)}</span>
            </li>
          ))}
        </ul>
        <form className="co-promo" onSubmit={applyCode}>
          <input aria-label="Promo code" placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
          <button type="submit">Apply</button>
        </form>
        {promoMsg && <p className={discount ? "co-ok" : "co-error"}>{promoMsg}</p>}
        <dl className="co-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{money(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div>
              <dt>Promo ({promo})</dt>
              <dd>-{money(discount)}</dd>
            </div>
          )}
          <div>
            <dt>{mode === "pickup" ? "Branch pickup" : "Delivery"}</dt>
            <dd>{fee ? money(fee) : "Free"}</dd>
          </div>
          <div className="co-vat">
            <dt>VAT 5% (included)</dt>
            <dd>{money(vatIncluded(total))}</dd>
          </div>
          <div className="co-total">
            <dt>Total</dt>
            <dd>{money(total)}</dd>
          </div>
        </dl>
        {estimate && (
          <p className="co-estimate">
            {mode === "pickup" ? "Ready to collect by" : `Delivered to ${emirate} by`} <b>{estimate}</b>
            {needsMeasurements && " (includes tailoring time)"}
          </p>
        )}
        <ul className="co-trust">
          <li>{RETURNS_DAYS}-day returns</li>
          <li>Free fit adjustments</li>
          <li>
            Questions?{" "}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );

  return (
    <div className="co">
      <div className="co-wrap">
        <div className="co-head">
          <span className="co-eyebrow">*Secure checkout</span>
          <h1>Checkout</h1>
          <p>
            Checking out as a guest. No account needed.{" "}
            <Link className="co-link" href="/account">
              Sign in
            </Link>
          </p>
        </div>
        <div className="co-grid">
          <form className="co-form" onSubmit={placeOrder} noValidate>
            <section className="co-step">
              <h2>
                <span>1</span>Contact
              </h2>
              <div className="co-row">
                <label data-field="name">
                  Full name
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
                  {err("name")}
                </label>
              </div>
              <div className="co-row two">
                <label data-field="phone">
                  Mobile number
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" aria-invalid={!!errors.phone} />
                  <small>We&apos;ll send order updates on WhatsApp.</small>
                  {err("phone")}
                </label>
                <label data-field="email">
                  Email <em>(optional)</em>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />
                  {err("email")}
                </label>
              </div>
            </section>

            <section className="co-step">
              <h2>
                <span>2</span>Delivery
              </h2>
              <div className="co-tabs" role="radiogroup" aria-label="Delivery method">
                {(["delivery", "pickup"] as Mode[]).map((m) => (
                  <label key={m} className={mode === m ? "on" : ""}>
                    <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} />
                    <b>{m === "delivery" ? "Home delivery" : "Pick up at a branch"}</b>
                    <small>{m === "delivery" ? `AED ${DELIVERY.fee} · free over AED ${DELIVERY.freeOver}` : "Free · 13 branches"}</small>
                  </label>
                ))}
              </div>
              {mode === "delivery" ? (
                <>
                  <div className="co-row two">
                    <label data-field="emirate">
                      Emirate
                      <select value={emirate} onChange={(e) => setEmirate(e.target.value as Emirate)} aria-invalid={!!errors.emirate}>
                        <option value="">Choose…</option>
                        {EMIRATES.map((em) => (
                          <option key={em}>{em}</option>
                        ))}
                      </select>
                      {err("emirate")}
                    </label>
                    <label data-field="area">
                      Area
                      <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Al Barsha 2" aria-invalid={!!errors.area} />
                      {err("area")}
                    </label>
                  </div>
                  <div className="co-row two">
                    <label data-field="building">
                      Building / villa
                      <input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="Building, flat or villa number" aria-invalid={!!errors.building} />
                      {err("building")}
                    </label>
                    <label>
                      Makani number <em>(optional)</em>
                      <input value={makani} onChange={(e) => setMakani(e.target.value)} inputMode="numeric" placeholder="10-digit Makani" />
                    </label>
                  </div>
                </>
              ) : (
                <div className="co-row">
                  <label data-field="branch">
                    Branch
                    <select value={branch} onChange={(e) => setBranch(e.target.value)} aria-invalid={!!errors.branch}>
                      <option value="">Choose a branch…</option>
                      {BRANCHES.map((g) => (
                        <optgroup key={g.emirate} label={g.emirate}>
                          {g.branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}, {b.area}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {err("branch")}
                  </label>
                </div>
              )}
            </section>

            {needsMeasurements && (
              <section className="co-step">
                <h2>
                  <span>3</span>Measurements
                </h2>
                <p className="co-hint">Some pieces in your cart are tailored to your measurements. How should we get them?</p>
                <div className="co-options" data-field="measure" role="radiogroup" aria-label="Measurements">
                  {MEASURE_OPTIONS.map((m) => (
                    <label key={m.id} className={measure === m.id ? "on" : ""}>
                      <input type="radio" name="measure" checked={measure === m.id} onChange={() => setMeasure(m.id)} />
                      <span>
                        <b>{m.label}</b>
                        <small>{m.note}</small>
                      </span>
                    </label>
                  ))}
                </div>
                {measure === "manual" && (
                  <div className="co-measures">
                    {MEASURE_FIELDS.map((f) => (
                      <label key={f}>
                        {f} (cm)
                        <input
                          inputMode="decimal"
                          value={sizes[f] ?? ""}
                          onChange={(e) => setSizes((s) => ({ ...s, [f]: e.target.value.replace(/[^\d.]/g, "") }))}
                        />
                      </label>
                    ))}
                    <Link className="co-link" href="/size-guide" target="_blank">
                      How to measure: size guide
                    </Link>
                  </div>
                )}
                {err("measure")}
              </section>
            )}

            <section className="co-step">
              <h2>
                <span>{needsMeasurements ? 4 : 3}</span>Payment
              </h2>
              <div className="co-options" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={payment === m.id ? "on" : ""}>
                    <input type="radio" name="payment" checked={payment === m.id} onChange={() => setPayment(m.id)} />
                    <span>
                      <b>{m.label}</b>
                      {m.note && <small>{m.note}</small>}
                    </span>
                  </label>
                ))}
              </div>
              {payment !== "cod" && <p className="co-hint">After you place the order, we&apos;ll send a secure payment link on WhatsApp.</p>}
            </section>

            <button className="btn co-submit" type="submit">
              Place order · {money(total)}
            </button>
            <p className="co-small">
              By placing your order you agree to our <Link href="/policies/terms">terms</Link> and{" "}
              <Link href="/policies/refund">returns policy</Link>.
            </p>
          </form>
          {summary}
        </div>
      </div>
    </div>
  );
}
