"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { OFFER } from "@/lib/brand";
import { PROMO } from "@/lib/commerce";
import { NO_POPUP_PATHS } from "@/lib/site-nav";
import "./offer/offer-popup.css";

const KEY = "offer-popup";

type Saved = { closedAt?: number; joined?: boolean };
type Channel = "email" | "whatsapp";

function readSaved(): Saved {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null") ?? {};
  } catch {
    return {};
  }
}

function writeSaved(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage blocked: the popup may simply show again next visit.
  }
}

const blocked = (path: string) => NO_POPUP_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * First-order offer. Opens after OFFER.delaySeconds or once the visitor has
 * scrolled half the page, never on cart, checkout or account pages.
 * On phones it is a bottom sheet with one field and one button.
 */
export default function OfferPopup() {
  const pathname = usePathname() ?? "/";
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);
  // Floating "Get 10% off" button: shown until the visitor signs up, so a closed popup can be reopened later.
  const [joined, setJoined] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => setJoined(!!readSaved().joined), []);

  const open = useCallback(() => {
    const d = dialog.current;
    if (d && !d.open && !blocked(window.location.pathname)) {
      d.showModal();
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (blocked(pathname)) {
      if (dialog.current?.open) dialog.current.close();
      return;
    }
    const s = readSaved();
    const snoozed = s.closedAt && Date.now() - s.closedAt < OFFER.hideForDays * 86_400_000;
    if (s.joined || snoozed) return;

    const timer = setTimeout(open, OFFER.delaySeconds * 1000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) open();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, pathname]);

  const close = () => dialog.current?.close();

  const onClosed = () => {
    setIsOpen(false);
    const s = readSaved();
    if (!s.joined) writeSaved({ ...s, closedAt: Date.now() });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const body = channel === "email" ? { email } : { phone: `+971${phone.replace(/\D/g, "").replace(/^(971|0)/, "")}` };
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, source: "offer-popup" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
      setJoined(true);
      writeSaved({ joined: true });
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code is still visible to copy by hand.
    }
  };

  const showTab = !joined && !isOpen && !blocked(pathname);

  return (
    <>
    {showTab && (
      <button type="button" className="offer-tab" onClick={open} aria-haspopup="dialog">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" />
        </svg>
        <span>Get {PROMO.percent}% off</span>
      </button>
    )}
    <dialog
      ref={dialog}
      className="offer-pop"
      aria-labelledby="offer-title"
      onClose={onClosed}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <button className="offer-close" type="button" aria-label="Close" onClick={close}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div className="offer-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={OFFER.image} alt="" />
        <div className="offer-photo-copy" aria-hidden="true">
          <span>{OFFER.title}</span>
          <strong>{PROMO.percent}% off</strong>
          <em>your first order</em>
        </div>
      </div>
      <div className="offer-main">
        {status === "done" ? (
          <div className="offer-done">
            <span className="offer-eyebrow">You&apos;re in</span>
            <h2 id="offer-title">Your code</h2>
            <div className="offer-code">
              <code>{PROMO.code}</code>
              <button type="button" className="offer-btn offer-copy" onClick={copy}>
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>
            <p>
              {PROMO.label}. We&apos;ve also sent it to{" "}
              <b>{channel === "email" ? email : `+971 ${phone}`}</b>
              {channel === "whatsapp" ? " on WhatsApp" : ""}. Valid for {PROMO.validDays} days; enter it at checkout.
            </p>
            <button className="offer-skip" type="button" onClick={close}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <span className="offer-eyebrow">Join the Dressly list</span>
            <h2 id="offer-title">{PROMO.label}</h2>
            <p className="offer-valid">Valid for {PROMO.validDays} days after sign-up. One use per customer.</p>
            <div className="offer-tabs" role="tablist" aria-label="Send my code by">
              <button type="button" role="tab" aria-selected={channel === "whatsapp"} onClick={() => setChannel("whatsapp")}>
                WhatsApp
              </button>
              <button type="button" role="tab" aria-selected={channel === "email"} onClick={() => setChannel("email")}>
                Email
              </button>
            </div>
            <form onSubmit={submit}>
              {channel === "email" ? (
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  aria-label="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              ) : (
                <div className="offer-phone">
                  <span>+971</span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    placeholder="50 123 4567"
                    aria-label="WhatsApp number"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}
              <button className="offer-btn" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Get my 10% code"}
              </button>
              {status === "error" && <p className="offer-error">{error}</p>}
            </form>
            <button className="offer-switch" type="button" onClick={() => setChannel(channel === "email" ? "whatsapp" : "email")}>
              {channel === "email" ? "Use WhatsApp instead" : "Use email instead"}
            </button>
            <ul className="offer-points">
              {OFFER.points.slice(0, 3).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <button className="offer-skip" type="button" onClick={close}>
              No thanks
            </button>
          </>
        )}
      </div>
    </dialog>
    </>
  );
}
