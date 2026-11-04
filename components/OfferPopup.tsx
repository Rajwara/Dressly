"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OFFER } from "@/lib/brand";

const KEY = "offer-popup";

type Saved = { deadline: number; closedAt?: number; joined?: boolean };

function readSaved(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

function writeSaved(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage blocked: the popup simply may show again next visit.
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function OfferPopup() {
  const dialog = useRef<HTMLDialogElement>(null);
  const saved = useRef<Saved | null>(null);
  const [left, setLeft] = useState(OFFER.minutes * 60);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [email, setEmail] = useState("");

  const open = useCallback(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);

  // Decide whether to show it, and when.
  useEffect(() => {
    const now = Date.now();
    let s = readSaved();
    const snoozed = s?.closedAt && now - s.closedAt < OFFER.hideForDays * 86_400_000;
    if (s?.joined || snoozed) return;
    if (!s || s.deadline < now) s = { deadline: now + OFFER.minutes * 60_000 };
    saved.current = s;
    writeSaved(s);

    const timer = setTimeout(open, OFFER.delaySeconds * 1000);
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) open();
    };
    document.addEventListener("mouseleave", onLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [open]);

  // Countdown.
  useEffect(() => {
    const tick = () => {
      if (saved.current) setLeft(Math.max(0, Math.round((saved.current.deadline - Date.now()) / 1000)));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const close = () => {
    dialog.current?.close();
  };

  const onClosed = () => {
    if (saved.current && !saved.current.joined) {
      saved.current = { ...saved.current, closedAt: Date.now() };
      writeSaved(saved.current);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "offer-popup" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      saved.current = { ...(saved.current ?? { deadline: Date.now() }), joined: true };
      writeSaved(saved.current);
    } catch {
      setStatus("error");
    }
  };

  return (
    <dialog
      ref={dialog}
      className="offer"
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
      <div className="offer-main">
        {status === "done" ? (
          <div className="offer-done">
            <h2 id="offer-title">Thank you!</h2>
            <p>
              You&apos;re on the list. We&apos;ll send your exclusive discount to <b>{email}</b>.
            </p>
            <button className="btn" type="button" onClick={close}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            {left > 0 && (
              <div className="countdown" role="timer" aria-label={`${Math.floor(left / 60)} minutes ${left % 60} seconds left`}>
                <div>
                  <b>{pad(Math.floor(left / 60))}</b>
                  <small>minutes</small>
                </div>
                <b className="colon">:</b>
                <div>
                  <b>{pad(left % 60)}</b>
                  <small>seconds</small>
                </div>
              </div>
            )}
            <h2 id="offer-title">{OFFER.title}</h2>
            <p>{OFFER.text}</p>
            <form onSubmit={submit}>
              <input
                type="email"
                required
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Claim Your Offer"}
              </button>
              {status === "error" && <p className="offer-error">Something went wrong. Please try again.</p>}
            </form>
            <button className="offer-skip" type="button" onClick={close}>
              No thanks
            </button>
          </>
        )}
      </div>
      <div className="offer-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={640} height={180} />
        <h3>
          Trusted <em>since 1998</em> across the UAE
        </h3>
        <ul>
          {OFFER.points.map((p) => (
            <li key={p}>
              <span aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
