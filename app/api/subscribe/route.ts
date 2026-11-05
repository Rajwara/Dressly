import { NextResponse } from "next/server";
import { PROMO } from "@/lib/commerce";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** UAE mobile: 9 digits starting with 5, after +971 / 971 / 0. Returns +9715XXXXXXXX or "". */
function uaeMobile(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^00/, "");
  const local = digits.replace(/^971/, "").replace(/^0/, "");
  return /^5\d{8}$/.test(local) ? `+971${local}` : "";
}

/**
 * Receives sign-ups from the offer popup, by email or WhatsApp number.
 *
 * Set SUBSCRIBE_WEBHOOK_URL (for example a Zapier, Make, Google Apps Script,
 * mailing-list or WhatsApp-provider webhook) and each sign-up is forwarded
 * there as JSON: { email | phone, channel, code, source, signedUpAt }. The
 * webhook is what actually sends the code; without it, sign-ups are only logged.
 */
export async function POST(req: Request) {
  let body: { email?: unknown; phone?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "website";
  let contact: { email: string } | { phone: string };
  if (typeof body.phone === "string" && body.phone.trim()) {
    const phone = uaeMobile(body.phone);
    if (!phone) return NextResponse.json({ error: "Please enter a UAE mobile number, e.g. 50 123 4567" }, { status: 400 });
    contact = { phone };
  } else {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    }
    contact = { email };
  }

  const payload = {
    ...contact,
    channel: "phone" in contact ? "whatsapp" : "email",
    code: PROMO.code,
    source,
    signedUpAt: new Date().toISOString(),
  };

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
