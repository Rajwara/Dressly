"use client";

import { useState } from "react";
import DIcon from "./Icons";

/** Footer newsletter; uses the same /api/subscribe endpoint as the offer popup. */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      setStatus(res.ok ? "Thank you, you're on the list." : "Please check your email address and try again.");
      if (res.ok) setEmail("");
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form className="newsletter" onSubmit={submit}>
        <input
          type="email"
          required
          placeholder="Enter your email"
          aria-label="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" aria-label="Subscribe" disabled={busy}>
          <DIcon name="right" small />
        </button>
      </form>
      <p className="newsletter-status" role="status" hidden={!status}>
        {status}
      </p>
    </>
  );
}
