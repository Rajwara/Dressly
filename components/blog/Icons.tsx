/** Icons from the blog/contact design (stroke icons, sized by CSS `.icon`). */
const P = {
  upRight: <path d="M7 17 17 7M8 7h9v9" />,
  left: <path d="M20 12H4M10 6l-6 6 6 6" />,
  right: <path d="M4 12h16M14 6l6 6-6 6" />,
  up: <path d="M12 20V4M6 10l6-6 6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m3 17 5-4 4 3 3-2 6 5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  phone: <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />,
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  home: <path d="M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10" />,
  shield: <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  tiktok: <path d="M14 4v10a3 3 0 1 1-3-3M14 4c.5 2.5 2 4 5 4" />,
  whatsapp: (
    <>
      <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" />
      <path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1.2 1.8.8-.3 1.4c-3.5.5-7.7-3.7-7.2-7.2l1.4-.3.8 1.8z" />
    </>
  ),
};

export type IconName = keyof typeof P;

export default function DIcon({ name, small }: { name: IconName; small?: boolean }) {
  return (
    <svg className={small ? "icon icon-sm" : "icon"} viewBox="0 0 24 24" aria-hidden="true">
      {P[name]}
    </svg>
  );
}
