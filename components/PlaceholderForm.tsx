"use client";

import { useState } from "react";

/** A form that is not wired to a backend yet: submitting shows a notice instead. */
export default function PlaceholderForm({ notice, children }: { notice: string; children: React.ReactNode }) {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      {children}
      <p className="notice" hidden={!sent}>
        {notice}
      </p>
    </form>
  );
}
