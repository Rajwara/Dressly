"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HOME_VISIT_URL, whatsapp } from "@/lib/brand";
import Icon from "./Icon";
import { money } from "@/lib/format";
import type { ProductOption } from "@/lib/types";
import SizeGuideDialog from "./size-guide/SizeGuide";
import { useStore } from "./StoreProvider";

type Props = {
  slug: string;
  name: string;
  price: number;
  description: string;
  options: ProductOption[];
  sizeGuide: boolean;
  images: { view: string; src: string }[];
  children?: React.ReactNode;
};

export default function ProductDetail({ slug, name, price, description, options, sizeGuide, images, children }: Props) {
  const { addToCart } = useStore();
  const [picture, setPicture] = useState(0);
  const [choices, setChoices] = useState(() => options.map((o) => o.values[0]));
  const [qty, setQty] = useState("1");
  const [added, setAdded] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const buyRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = buyRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const add = () => {
    addToCart(slug, choices.join(" / "), parseInt(qty, 10) || 1);
    setAdded(true);
  };
  const step = (d: number) => setQty((q) => String(Math.max(1, (parseInt(q, 10) || 1) + d)));

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
                onClick={() => setPicture(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={`${name} ${img.view}`} loading="lazy" />
              </button>
            ))}
          </div>
          <div
            className={zoom ? "main-pic zoom" : "main-pic"}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[picture].src} alt={name} style={{ transformOrigin: origin }} key={picture} />
          </div>
        </div>
        <div className="info">
          <h1>{name}</h1>
          <span className="price">{money(price)}</span>
          {options.map((opt, oi) => (
            <div className="opt" key={opt.label}>
              <div className="opt-label">
                <span>
                  {opt.label}: <span className="current">{choices[oi]}</span>
                </span>
                {oi === 0 && sizeGuide && (
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
          <a
            className="btn wa-line"
            href={whatsapp(`Hello Dressly, I would like to order: ${name} (${choices.join(" / ")}) x${parseInt(qty, 10) || 1}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" size={17} /> Order on WhatsApp
          </a>
          <p className="notice" hidden={!added}>
            Added to your cart.{" "}
            <Link href="/cart" style={{ borderBottom: "1px solid" }}>
              View cart
            </Link>
          </p>
          <ul className="trust">
            <li>
              <Icon name="home" size={18} /> Home tailoring visits across the Emirates
            </li>
            <li>
              <Icon name="pin" size={18} /> Try on and get measured at 13 branches
            </li>
            <li>
              <Icon name="whatsapp" size={18} /> Questions? WhatsApp us any time
            </li>
          </ul>
          <p className="notes">Sample product. Add real delivery times, offers and shipping thresholds before launch.</p>
          <details open>
            <summary>Description</summary>
            <p>{description}</p>
          </details>
          <details>
            <summary>Shipping and returns</summary>
            <p>Add Dressly&apos;s shipping rates, delivery times and return terms.</p>
          </details>
          <details>
            <summary>Book a home tailoring visit</summary>
            <p>
              Prefer a made-to-measure fit? A tailor can visit your home or majlis with fabrics and take your measurements.{" "}
              <a href={HOME_VISIT_URL} target="_blank" rel="noopener noreferrer" style={{ borderBottom: "1px solid" }}>
                Book on WhatsApp
              </a>
            </p>
          </details>
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
    </>
  );
}
