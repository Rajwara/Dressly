"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { whatsapp } from "@/lib/brand";
import { money } from "@/lib/format";
import type { CardProduct } from "@/lib/types";
import Icon from "./Icon";
import { useStore } from "./StoreProvider";

const Ctx = createContext<(p: CardProduct) => void>(() => {});
export const useQuickView = () => useContext(Ctx);

/** One shared "Quick view" dialog for every product card. */
export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<CardProduct | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const open = useCallback((p: CardProduct) => setProduct(p), []);

  useEffect(() => {
    if (product && !dialog.current?.open) dialog.current?.showModal();
  }, [product]);

  return (
    <Ctx.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        className="qv"
        aria-label={product ? `Quick view: ${product.name}` : "Quick view"}
        onClose={() => setProduct(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        {product && <QuickViewBody key={product.slug} p={product} close={() => dialog.current?.close()} />}
      </dialog>
    </Ctx.Provider>
  );
}

function QuickViewBody({ p, close }: { p: CardProduct; close: () => void }) {
  const { addToCart } = useStore();
  const [pic, setPic] = useState(0);
  const [choices, setChoices] = useState(() => p.options.map((o) => o.values[0]));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const summary = choices.join(" / ");

  return (
    <div className="qv-grid">
      <button className="qv-close" type="button" aria-label="Close" onClick={close}>
        <Icon name="close" size={18} />
      </button>
      <div className="qv-gallery">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="qv-main" src={p.images[pic]} alt={p.name} key={pic} />
        <div className="qv-thumbs">
          {p.images.map((src, i) => (
            <button key={src} type="button" className={i === pic ? "on" : undefined} onClick={() => setPic(i)} aria-label={`View ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div className="qv-info">
        <span className="eyebrow">{p.category}</span>
        <h2>{p.name}</h2>
        <span className="qv-price">{money(p.price)}</span>
        {p.options.map((o, oi) => (
          <div className="opt" key={o.label}>
            <div className="opt-label">
              <span>
                {o.label}: <span className="current">{choices[oi]}</span>
              </span>
            </div>
            <div className="choices">
              {o.values.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={choices[oi] === v ? "on" : undefined}
                  onClick={() => setChoices((c) => c.map((x, j) => (j === oi ? v : x)))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="buy">
          <div className="qty">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              -
            </button>
            <input readOnly value={qty} aria-label="Quantity" />
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
              +
            </button>
          </div>
          <button
            className="btn"
            type="button"
            onClick={() => {
              addToCart(p.slug, summary, qty);
              setAdded(true);
            }}
          >
            Add to cart
          </button>
        </div>
        <a
          className="btn wa-line"
          href={whatsapp(`Hello Dressly, I would like to order: ${p.name} (${summary}) x${qty}`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="whatsapp" size={17} /> Order on WhatsApp
        </a>
        {added && (
          <p className="notice">
            Added to your cart.{" "}
            <Link href="/cart" onClick={close} style={{ borderBottom: "1px solid" }}>
              View cart
            </Link>
          </p>
        )}
        <Link className="qv-more" href={`/product/${p.slug}`} onClick={close}>
          View full details <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </div>
  );
}

export function QuickViewButton({ product }: { product: CardProduct }) {
  const open = useQuickView();
  return (
    <button className="pcard-quick" type="button" onClick={() => open(product)}>
      Quick view
    </button>
  );
}
