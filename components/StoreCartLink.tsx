"use client";

import Link from "next/link";
import { useStore } from "./StoreProvider";

/** The homepage cart icon, linked to the real cart with the live item count. */
export default function StoreCartLink() {
  const { cartCount } = useStore();
  return (
    <Link className="cart" href="/cart" aria-label={`Cart (${cartCount})`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M5 8h14l1.500 13h-17zM8.500 8V6a3.500 3.500 0 0 1 7 0v2" />
      </svg>
      <b>{cartCount}</b>
    </Link>
  );
}
