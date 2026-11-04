"use client";

import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/format";
import type { CardProduct } from "@/lib/types";
import { useStore } from "./StoreProvider";

export default function CartView({ products }: { products: CardProduct[] }) {
  const { cart, changeQty, removeLine } = useStore();
  const [checkout, setCheckout] = useState(false);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const lines = cart.map((line, index) => ({ line, index, p: bySlug.get(line.slug) })).filter((l) => l.p);

  if (!lines.length) {
    return (
      <p className="empty">
        Your cart is empty.{" "}
        <Link href="/" style={{ borderBottom: "1px solid" }}>
          Continue shopping
        </Link>
      </p>
    );
  }

  const total = lines.reduce((a, { line, p }) => a + p!.price * line.qty, 0);

  return (
    <div>
      {lines.map(({ line, index, p }) => (
        <div className="cart-row" key={`${line.slug}|${line.options}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={p!.image} />
          <div>
            <Link href={`/product/${p!.slug}`}>
              <b>{p!.name}</b>
            </Link>
            <br />
            <small>{line.options}</small>
            <br />
            <div className="qty" style={{ display: "inline-flex", margin: "7px 0" }}>
              <button type="button" aria-label="Decrease quantity" onClick={() => changeQty(index, -1)}>
                -
              </button>
              <input readOnly value={line.qty} aria-label="Quantity" />
              <button type="button" aria-label="Increase quantity" onClick={() => changeQty(index, 1)}>
                +
              </button>
            </div>
            <br />
            <button className="link" type="button" onClick={() => removeLine(index)}>
              Remove
            </button>
          </div>
          <div className="price">{money(p!.price * line.qty)}</div>
        </div>
      ))}
      <div className="total">
        <span>Subtotal</span>
        <span>{money(total)}</span>
      </div>
      <button className="btn" type="button" onClick={() => setCheckout(true)}>
        Checkout
      </button>
      <p className="notice" hidden={!checkout}>
        Checkout is not active yet. Connect a payment provider before launch.
      </p>
    </div>
  );
}
