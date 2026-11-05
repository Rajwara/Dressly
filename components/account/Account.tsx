"use client";

import Link from "next/link";
import { useState } from "react";
import { HOME_VISIT_URL } from "@/lib/brand";
import { useStore } from "../StoreProvider";
import "./account.css";

/*
 * Sign-in and account dashboard: DESIGN PREVIEW ONLY. Nothing is sent or
 * stored; connect an auth provider (WhatsApp/SMS one-time codes) before launch.
 */

type Mode = "signin" | "signup";
type Method = "phone" | "email";
type Channel = "whatsapp" | "sms";

function Notice() {
  return <p className="acc-notice">Preview: accounts are not connected yet. Nothing you enter here is sent or saved.</p>;
}

export default function Account({ initialMode = "signin" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [method, setMethod] = useState<Method>("phone");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [phone, setPhone] = useState("+971 ");
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  if (signedIn) return <Dashboard name={name} onSignOut={() => { setSignedIn(false); setStep("enter"); setCode(""); }} />;

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^971(5\d{8})$/.test(phone.replace(/\D/g, ""))) return setError("Enter a UAE mobile number, e.g. +971 50 123 4567.");
    if (mode === "signup" && !name.trim()) return setError("Please enter your name.");
    setError("");
    setStep("code");
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code.");
    setError("");
    setSignedIn(true);
  }

  function emailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(f.get("email") ?? ""))) return setError("Enter a valid email address.");
    if (String(f.get("password") ?? "").length < 8) return setError("Password must be at least 8 characters.");
    if (mode === "signup" && !name.trim()) return setError("Please enter your name.");
    setError("");
    setSignedIn(true);
  }

  return (
    <div className="acc">
      <div className="acc-card">
        <span className="acc-eyebrow">*My account</span>
        <h1>{mode === "signin" ? "Sign in" : "Create an account"}</h1>
        <p className="acc-lead">
          {mode === "signin"
            ? "Sign in with your mobile number. We'll send you a one-time code, no password needed."
            : "Keep your measurements, track orders and book home visits. You never need an account to buy."}
        </p>
        <Notice />

        <div className="acc-switch" role="tablist" aria-label="Sign-in method">
          <button type="button" role="tab" aria-selected={method === "phone"} className={method === "phone" ? "on" : ""} onClick={() => { setMethod("phone"); setError(""); }}>
            Mobile number
          </button>
          <button type="button" role="tab" aria-selected={method === "email"} className={method === "email" ? "on" : ""} onClick={() => { setMethod("email"); setError(""); }}>
            Email & password
          </button>
        </div>

        {method === "phone" && step === "enter" && (
          <form onSubmit={sendCode} noValidate>
            {mode === "signup" && (
              <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
            )}
            <label>
              Mobile number
              <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </label>
            <fieldset className="acc-channel">
              <legend>Send my code by</legend>
              {(["whatsapp", "sms"] as Channel[]).map((c) => (
                <label key={c} className={channel === c ? "on" : ""}>
                  <input type="radio" name="channel" checked={channel === c} onChange={() => setChannel(c)} />
                  {c === "whatsapp" ? "WhatsApp" : "SMS"}
                </label>
              ))}
            </fieldset>
            {error && <p className="acc-error">{error}</p>}
            <button className="btn acc-btn" type="submit">
              Send code
            </button>
          </form>
        )}

        {method === "phone" && step === "code" && (
          <form onSubmit={verify} noValidate>
            <p className="acc-sent">
              We sent a 6-digit code by {channel === "whatsapp" ? "WhatsApp" : "SMS"} to <b>{phone}</b>.{" "}
              <button type="button" className="acc-link" onClick={() => { setStep("enter"); setCode(""); }}>
                Change
              </button>
            </p>
            <label>
              One-time code
              <input className="acc-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            </label>
            {error && <p className="acc-error">{error}</p>}
            <button className="btn acc-btn" type="submit">
              Verify and {mode === "signin" ? "sign in" : "create account"}
            </button>
            <button type="button" className="acc-link acc-resend">
              Resend code
            </button>
          </form>
        )}

        {method === "email" && (
          <form onSubmit={emailSubmit} noValidate>
            {mode === "signup" && (
              <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
            )}
            <label>
              Email
              <input name="email" type="email" autoComplete="email" />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            </label>
            {mode === "signin" && (
              <button type="button" className="acc-link acc-forgot">
                Forgot password?
              </button>
            )}
            {error && <p className="acc-error">{error}</p>}
            <button className="btn acc-btn" type="submit">
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}

        <p className="acc-toggle">
          {mode === "signin" ? "New to Dressly?" : "Already have an account?"}{" "}
          <button type="button" className="acc-link" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setStep("enter"); setError(""); }}>
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="acc-guest">
          Just shopping? <Link href="/shop">Continue as a guest</Link>. You can create an account after your order.
        </p>
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: "orders", title: "Orders & tracking", empty: "You haven't placed any orders yet.", cta: { label: "Start shopping", href: "/shop" } },
  { id: "visits", title: "Home-visit bookings", empty: "No home visits booked.", cta: { label: "Book a home visit", href: "/home-tailoring" } },
  { id: "addresses", title: "Addresses", empty: "No saved addresses. Add one at checkout and it will appear here.", cta: null },
  { id: "profile", title: "Profile", empty: "", cta: null },
] as const;

function Dashboard({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  const { wishlist } = useStore();
  return (
    <div className="acc acc-dash">
      <div className="acc-dash-head">
        <div>
          <span className="acc-eyebrow">*My account</span>
          <h1>Welcome{name ? `, ${name.split(" ")[0]}` : ""}</h1>
        </div>
        <button type="button" className="acc-link" onClick={onSignOut}>
          Sign out
        </button>
      </div>
      <Notice />
      <div className="acc-grid">
        <section className="acc-panel acc-measure">
          <h2>My measurements</h2>
          <p>Save your measurements once and every tailored piece is cut to fit, in store, at home or online.</p>
          <div className="acc-empty">
            <b>No measurements saved yet</b>
            <span>Get measured by a tailor at home or in any branch, and we&apos;ll store them here.</span>
          </div>
          <div className="acc-actions">
            <a className="btn" href={HOME_VISIT_URL} target="_blank" rel="noopener noreferrer">
              Book a home visit
            </a>
            <Link className="acc-link" href="/branches">
              Find a branch
            </Link>
            <Link className="acc-link" href="/size-guide">
              Size guide
            </Link>
          </div>
        </section>
        <section className="acc-panel">
          <h2>Saved pieces</h2>
          <p>
            {wishlist.length ? `${wishlist.length} saved ${wishlist.length === 1 ? "piece" : "pieces"}.` : "Tap the heart on any piece to save it."}
          </p>
          <Link className="acc-link" href="/wishlist">
            View saved pieces
          </Link>
        </section>
        {SECTIONS.map((s) => (
          <section className="acc-panel" key={s.id}>
            <h2>{s.title}</h2>
            {s.id === "profile" ? (
              <dl className="acc-profile">
                <div>
                  <dt>Name</dt>
                  <dd>{name || "Not set"}</dd>
                </div>
                <div>
                  <dt>Mobile</dt>
                  <dd>Verified</dd>
                </div>
                <div>
                  <dt>Updates</dt>
                  <dd>WhatsApp</dd>
                </div>
              </dl>
            ) : (
              <p>{s.empty}</p>
            )}
            {s.cta && (
              <Link className="acc-link" href={s.cta.href}>
                {s.cta.label}
              </Link>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
