"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HOME_VISIT_URL, whatsapp } from "@/lib/brand";
import { DELIVERY, RETURNS_DAYS } from "@/lib/commerce";
import { money } from "@/lib/format";
import type { ProductOption } from "@/lib/types";
import Icon from "./Icon";
import DeliveryEstimate from "./product/DeliveryEstimate";
import SizeGuideDialog from "./size-guide/SizeGuide";
import { useStore } from "./StoreProvider";
import "./product/product-extras.css";

export const READY_MADE = "Ready-made";
export const TAILORED = "Tailored to my measurements";

type Props = {
  slug: string;
  name: string;
  price: number;
  description: string;
  options: ProductOption[];
  sizeGuide: boolean;
  images: { view: string; src: string }[];
  /** Show the Ready-made / Tailored switch (kanduras and thobes). */
  tailorable?: boolean;
  fabric?: string;
  children?: React.ReactNode;
};

export default function ProductDetail({ slug, name, price, description, options, sizeGuide, images, tailorable, fabric, children }: Props) {
  const { addToCart } = useStore();
  const [picture, setPicture] = useState(0);
  const [choices, setChoices] = useState(() => options.map((o) => o.values[0]));
  const [fit, setFit] = useState(READY_MADE);
  const [qty, setQty] = useState("1");
  const [added, setAdded] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const buyRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDialogElement>(null);
  const boxRef = useRef<HTMLDialogElement>(null);

  const tailored = tailorable && fit === TAILORED;
  // Measurements replace the size chips for tailored pieces, so only keep non-size options then.
  const shownOptions = options.map((o, i) => ({ o, i })).filter(({ o }) => !(tailored && /size|length/i.test(o.label)));
  const summary = [...(tailorable ? [fit] : []), ...shownOptions.map(({ i }) => choices[i])].join(" / ");

  useEffect(() => {
    const el = buyRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const add = () => {
    addToCart(slug, summary, parseInt(qty, 10) || 1);
    setAdded(true);
  };
  const step = (d: number) => setQty((q) => String(Math.max(1, (parseInt(q, 10) || 1) + d)));
  const go = useCallback((d: number) => setPicture((p) => (p + d + images.length) % images.length), [images.length]);

  const openBox = () => boxRef.current?.showModal();

  return (
    <>
      <div className="pdp">
        <div className="gallery">
          <div className="thumbs">
            {images.map((img, i) => (
              <button
                key={img.view}
                type="button"
                className={i === picture ? "on" : undefined}
                aria-label={`${img.view} view`}
                aria-pressed={i === picture}
                onClick={() => setPicture(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={`${name} ${img.view}`} loading="lazy" />
              </button>
            ))}
          </div>
          <button
            type="button"
            className={zoom ? "main-pic zoom" : "main-pic"}
            aria-label={`Open ${name} photos full screen`}
            onClick={openBox}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[picture].src} alt={name} style={{ transformOrigin: origin }} key={picture} />
            <span className="zoom-hint" aria-hidden="true">
              <Icon name="search" size={16} /> Zoom
            </span>
          </button>
        </div>
        <div className="info">
          <h1>{name}</h1>
          <span className="price">
            {money(price)} <small className="vat">incl. VAT</small>
          </span>

          {tailorable && (
            <div className="opt">
              <div className="opt-label">
                <span>
                  Fit: <span className="current">{fit}</span>
                </span>
              </div>
              <div className="fit-switch" role="radiogroup" aria-label="Fit">
                {[READY_MADE, TAILORED].map((v) => (
                  <button key={v} type="button" role="radio" aria-checked={fit === v} className={fit === v ? "on" : undefined} onClick={() => setFit(v)}>
                    {v}
                  </button>
                ))}
              </div>
              {tailored && (
                <p className="fit-note">
                  We&apos;ll ask for your measurements at checkout: use saved ones, book a{" "}
                  <Link href="/home-tailoring">home visit</Link>, visit a branch, or enter them yourself.
                </p>
              )}
            </div>
          )}

          {shownOptions.map(({ o: opt, i: oi }, n) => (
            <div className="opt" key={opt.label}>
              <div className="opt-label">
                <span>
                  {opt.label}: <span className="current">{choices[oi]}</span>
                </span>
                {n === 0 && sizeGuide && (
                  <button type="button" onClick={() => chartRef.current?.showModal()}>
                    Size guide
                  </button>
                )}
              </div>
              <div className="choices">
                {opt.values.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={choices[oi] === v ? "on" : undefined}
                    aria-pressed={choices[oi] === v}
                    onClick={() => setChoices((c) => c.map((x, j) => (j === oi ? v : x)))}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <DeliveryEstimate tailored={tailored} />

          <div className="buy" ref={buyRef}>
            <div className="qty">
              <button type="button" aria-label="Decrease quantity" onClick={() => step(-1)}>
                -
              </button>
              <input value={qty} inputMode="numeric" aria-label="Quantity" onChange={(e) => setQty(e.target.value)} />
              <button type="button" aria-label="Increase quantity" onClick={() => step(1)}>
                +
              </button>
            </div>
            <button className="btn" type="button" onClick={add}>
              Add to cart
            </button>
          </div>
          <div className="pdp-alt">
            <a
              className="btn wa-line"
              href={whatsapp(`Hello Dressly, I would like to order: ${name} (${summary}) x${parseInt(qty, 10) || 1}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={17} /> Order on WhatsApp
            </a>
            <Link className="btn wa-line" href="/branches">
              <Icon name="pin" size={17} /> Try it in branch
            </Link>
          </div>
          <p className="notice" hidden={!added}>
            Added to your cart.{" "}
            <Link href="/cart" style={{ borderBottom: "1px solid" }}>
              View cart
            </Link>
          </p>
          <ul className="trust">
            <li>
              <Icon name="home" size={18} /> <Link href="/home-tailoring">Home tailoring visits across the Emirates</Link>
            </li>
            <li>
              <Icon name="pin" size={18} /> <Link href="/branches">Try on and get measured at 13 branches</Link>
            </li>
            <li>
              <Icon name="check" size={18} /> {RETURNS_DAYS}-day returns on ready-made pieces
            </li>
          </ul>
          <details open>
            <summary>Description</summary>
            <p>{description}</p>
          </details>
          <details>
            <summary>Fabric &amp; care</summary>
            <p>
              {fabric ? `${fabric}. ` : ""}
              Follow the care label inside the garment. As a general rule, wash whites and light colours separately at a low
              temperature, avoid bleach on embroidery, and iron on the reverse while slightly damp. Ask any branch for advice on a
              specific fabric.
            </p>
          </details>
          <details>
            <summary>Delivery &amp; returns</summary>
            <p>
              Delivery across the UAE, free on orders from {money(DELIVERY.freeOver)} (otherwise {money(DELIVERY.fee)}). Tailored
              pieces take a few extra days. Ready-made pieces can be returned within {RETURNS_DAYS} days in their original condition;
              tailored pieces include free fit adjustments.{" "}
              <Link href="/policies/shipping">Shipping</Link> · <Link href="/policies/refund">Returns</Link>
            </p>
          </details>
          {tailorable && (
            <details>
              <summary>Book a home tailoring visit</summary>
              <p>
                A tailor can visit your home or majlis with fabrics and take your measurements.{" "}
                <a href={HOME_VISIT_URL} target="_blank" rel="noopener noreferrer">
                  Book on WhatsApp
                </a>
              </p>
            </details>
          )}
        </div>
      </div>
      {children}
      <div className={stuck ? "sticky on" : "sticky"}>
        <span>
          {name} &middot; {money(price)}
        </span>
        <button className="btn" type="button" onClick={add}>
          Add to cart
        </button>
      </div>
      {sizeGuide && <SizeGuideDialog ref={chartRef} />}
      <dialog
        ref={boxRef}
        className="lightbox"
        aria-label={`${name} photos`}
        onClick={(e) => e.target === boxRef.current && boxRef.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <button className="lb-close" type="button" aria-label="Close" onClick={() => boxRef.current?.close()}>
          <Icon name="close" size={20} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[picture].src} alt={`${name} ${images[picture].view}`} />
        {images.length > 1 && (
          <>
            <button className="lb-nav prev" type="button" aria-label="Previous photo" onClick={() => go(-1)}>
              <Icon name="left" size={22} />
            </button>
            <button className="lb-nav next" type="button" aria-label="Next photo" onClick={() => go(1)}>
              <Icon name="right" size={22} />
            </button>
            <span className="lb-count">
              {picture + 1} / {images.length}
            </span>
          </>
        )}
      </dialog>
    </>
  );
}
