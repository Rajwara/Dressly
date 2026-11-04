/* eslint-disable @next/next/no-img-element */
import type { Ref } from "react";
import "./size-guide.css";

type Row = (string | number)[];

const KIDS: Row[] = [
  [18, 7.75, 12.25, 10], [20, 8.5, 13, 10.25], [22, 9.5, 13.25, 10.5], [24, 10.5, 13.5, 10.75], [26, 11.25, 14, 10.75],
  [28, 12, 14.25, 11], [30, 13, 14.5, 11], [32, 14, 14.5, 11.25], [34, 14.75, 15, 11.5], [36, 15.5, 15.25, 11.5],
  [38, 16.25, 15.5, 11.75], [40, 17.25, 16, 12], [42, 18, 16.25, 12.25], [44, 18.75, 16.5, 12.5], [46, 19.5, 17, 13],
  [48, 20.5, 18, 13.5], [50, 21.5, 19, 14],
];
const FOOTWEAR: Row[] = [[40, 6], [41, 7], [42, 8], [43, 9], [44, 10], [45, 11], [46, 12], [47, 13]];
const NORMAL: Row[] = [
  [50, 15.5, 19, 14.25], [52, 15.5, 20.5, 14.75], [54, 16.1, 21.5, 15.25], [56, 16.5, 23, 15.75],
  [58, 17.5, 24, 16.25], [60, 18, 25, 16.75], [62, 18.5, 26, 17.25], [64, 19, 28, 17.75],
];
const SLIM: Row[] = [
  [50, 15, 17.5, 14.25], [52, 15.5, 18.5, 14.75], [54, 16.1, 19.5, 15.25], [56, 16.5, 21, 15.75],
  [58, 17.5, 21.5, 16.25], [60, 18, 23.5, 16.75], [62, 18.5, 23.5, 17.25], [64, 19, 24.5, 17.75],
];
const KIDS_IMAGE = "https://i.postimg.cc/ZYsDZctn/Whats-App-Image-2025-02-18-at-11-41-17-AM.jpg";

function Table({ head, rows }: { head: string[]; rows: Row[] }) {
  return (
    <table className="kandura-size-table">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.join("-")}>
            {r.map((c, i) => (
              <td key={i}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The size chart: kids kandura, adult footwear, and adult kandoora in normal and slim fit. */
export function SizeChart() {
  return (
    <div className="kandura-size-chart">
      <div className="kandura-size-chart-header">
        <h2>Size Chart Guide</h2>
        <p>Use these measurements to choose your ideal fit.</p>
      </div>
      {/* Top row: Kids + Footwear */}
      <div className="kandura-sections">
        <div className="kandura-card">
          <div className="kandura-card-title">
            Kids Kandura <span>Height based</span>
          </div>
          <Table head={["Length", "Hand", "Body Loose", "Neck"]} rows={KIDS} />
          <div className="kandura-helper-text">Length is measured from shoulder to hem of the Kandura.</div>
          <div className="kandura-image-wrap">
            <img alt="Kids Kandura Size Reference" src={KIDS_IMAGE} loading="lazy" />
          </div>
        </div>
        <div className="kandura-card">
          <div className="kandura-card-title">
            Adult Footwear <span>EU &amp; UK</span>
          </div>
          <div className="kandura-footwear-table-wrap">
            <Table head={["EU Size", "UK Size"]} rows={FOOTWEAR} />
          </div>
          <div className="kandura-helper-text">Choose your usual EU or UK size for sandals and shoes.</div>
        </div>
      </div>
      <div className="kandura-section-full">
        <div className="kandura-card">
          <div className="kandura-card-title">
            Arabic Kandoora – Normal Fit <span>Regular comfort</span>
          </div>
          <Table head={["Length", "Hand Loose", "Body Loose", "Neck"]} rows={NORMAL} />
        </div>
      </div>
      <div className="kandura-section-full">
        <div className="kandura-card">
          <div className="kandura-card-title">
            Arabic Kandoora – Slim Fit <span>Closer to body</span>
          </div>
          <Table head={["Length", "Hand Loose", "Body Loose", "Neck"]} rows={SLIM} />
        </div>
      </div>
    </div>
  );
}

/** Popup holding the size chart. Open it with ref.current.showModal(). */
export default function SizeGuideDialog({ ref }: { ref: Ref<HTMLDialogElement> }) {
  return (
    <dialog
      ref={ref}
      className="sg-modal"
      aria-labelledby="sg-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <button type="button" className="sg-close" aria-label="Close size guide" onClick={(e) => e.currentTarget.closest("dialog")?.close()}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
          <path d="M1 1l11 11M12 1 1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="sg-close-label">Close</span>
      </button>
      <div className="sg-header">
        <h3 className="sg-title" id="sg-title">
          Size Guide
        </h3>
      </div>
      <div className="sg-content">
        <SizeChart />
      </div>
    </dialog>
  );
}
