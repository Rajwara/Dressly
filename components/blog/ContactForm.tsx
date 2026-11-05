"use client";

import { useState } from "react";
import { PHONE_DISPLAY, whatsapp } from "@/lib/brand";
import DIcon from "./Icons";

const TOPICS = ["Order", "Fabric & fit", "Home visit", "Uniforms/corporate", "Other"];

type Field = "first" | "last" | "email" | "topic" | "order" | "message";
const MESSAGES: Record<Field, string> = {
  first: "Please fill in this field.",
  last: "Please fill in this field.",
  email: "Please enter a valid email address.",
  topic: "Please select a topic.",
  order: "",
  message: "Please fill in this field.",
};

/**
 * Contact form with the design's validation. A valid message opens WhatsApp
 * with everything filled in, so it reaches the team without a mail server.
 */
export default function ContactForm() {
  const [invalid, setInvalid] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
    const bad: Partial<Record<Field, boolean>> = {};
    let first: HTMLElement | null = null;
    fields.forEach((f) => {
      const ok = f.checkValidity();
      bad[f.id as Field] = !ok;
      if (!ok && !first) first = f;
    });
    setInvalid(bad);
    if (first) {
      setStatus("");
      (first as HTMLElement).focus();
      return;
    }
    const v = Object.fromEntries(fields.map((f) => [f.id, f.value.trim()])) as Record<Field, string>;
    const text = `Hello Dressly,\n\n${v.message}\n\nName: ${v.first} ${v.last}\nEmail: ${v.email}\nTopic: ${v.topic}${v.order ? `\nOrder number: ${v.order}` : ""}`;
    window.open(whatsapp(text), "_blank", "noopener");
    setStatus(`Opening WhatsApp with your message. If it didn't open, message us on ${PHONE_DISPLAY}.`);
  };

  const field = (id: Field) => ({ id, "aria-invalid": invalid[id] ? true : undefined });
  const error = (id: Field) => (
    <span className="field-error" hidden={!invalid[id]}>
      {MESSAGES[id]}
    </span>
  );

  return (
    <form className="contact-form" noValidate onSubmit={submit}>
      <div className="field">
        <label htmlFor="first">First name</label>
        <input {...field("first")} name="first_name" type="text" required placeholder="First name" autoComplete="given-name" />
        {error("first")}
      </div>
      <div className="field">
        <label htmlFor="last">Last name</label>
        <input {...field("last")} name="last_name" type="text" required placeholder="Last name" autoComplete="family-name" />
        {error("last")}
      </div>
      <div className="field field-full">
        <label htmlFor="email">Email address</label>
        <input {...field("email")} name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        {error("email")}
      </div>
      <div className="field field-full">
        <label htmlFor="topic">How can we help?</label>
        <select {...field("topic")} name="topic" required defaultValue="">
          <option value="">Select a topic...</option>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {error("topic")}
      </div>
      <div className="field field-full">
        <label htmlFor="order">
          Order number <span className="field-optional">(optional)</span>
        </label>
        <input {...field("order")} name="order_number" type="text" placeholder="e.g. DR-10482" autoComplete="off" />
      </div>
      <div className="field field-full">
        <label htmlFor="message">Message</label>
        <textarea {...field("message")} name="message" required placeholder="Tell us a little more..." />
        {error("message")}
      </div>
      <button className="btn form-submit" type="submit">
        Send message
      </button>
      <div className="form-privacy">
        <DIcon name="lock" />
        Your details are kept private and never shared.
      </div>
      <div className="form-status" role="status" hidden={!status}>
        {status}
      </div>
    </form>
  );
}
