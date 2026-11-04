import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Receives sign-ups from the offer popup.
 *
 * Set SUBSCRIBE_WEBHOOK_URL (for example a Zapier, Make, Google Apps Script or
 * mailing-list webhook) and each sign-up is forwarded there as JSON:
 * { email, source, signedUpAt }. Without it, sign-ups are only logged.
 */
export async function POST(req: Request) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "website";
  const payload = { email, source, signedUpAt: new Date().toISOString() };

  const hook = process.env.SUBSCRIBE_WEBHOOK_URL;
  if (!hook) {
    console.warn("[subscribe] SUBSCRIBE_WEBHOOK_URL is not set; sign-up not stored:", payload);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`webhook responded ${res.status}`);
  } catch (err) {
    console.error("[subscribe] forwarding failed:", err);
    return NextResponse.json({ error: "Could not save your sign-up" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
