"use client";

import { useEffect, useState } from "react";
import { EMIRATES, deliveryLabel, type Emirate } from "@/lib/commerce";
import Icon from "../Icon";

const KEY = "delivery-emirate";

/** "Delivered to Dubai by Thursday", with the emirate remembered between pages. */
export default function DeliveryEstimate({ tailored = false, compact = false }: { tailored?: boolean; compact?: boolean }) {
  const [emirate, setEmirate] = useState<Emirate>("Dubai");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && (EMIRATES as readonly string[]).includes(saved)) setEmirate(saved as Emirate);
    } catch {
      /* storage unavailable */
    }
    setReady(true);
    const sync = (e: Event) => setEmirate((e as CustomEvent<Emirate>).detail);
    window.addEventListener("delivery-emirate", sync);
    return () => window.removeEventListener("delivery-emirate", sync);
  }, []);

  const change = (v: Emirate) => {
    setEmirate(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent("delivery-emirate", { detail: v }));
  };

  return (
    <div className={compact ? "dlv compact" : "dlv"}>
      <Icon name="pin" size={17} />
      <span>
        Delivered to{" "}
        <select value={emirate} onChange={(e) => change(e.target.value as Emirate)} aria-label="Delivery emirate">
          {EMIRATES.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>{" "}
        by <b suppressHydrationWarning>{ready ? deliveryLabel(emirate, tailored) : "…"}</b>
        {tailored && <small> (tailored pieces take a few extra days)</small>}
      </span>
    </div>
  );
}
