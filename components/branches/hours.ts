import type { BranchHours, Weekday } from "@/lib/brand";

export const WEEK: { key: Weekday; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

const KEYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const hasHours = (h?: BranchHours) => !!h && Object.values(h).some(Boolean);

/** Weekday and minutes since midnight in UAE time, whatever the visitor's timezone. */
function uaeNow(now = new Date()) {
  const t = new Date(now.getTime() + (now.getTimezoneOffset() + 240) * 60_000); // UTC+4
  return { day: KEYS[t.getDay()], prev: KEYS[(t.getDay() + 6) % 7], mins: t.getHours() * 60 + t.getMinutes() };
}

function range(v?: string): [number, number] | null {
  const m = v?.match(/^(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return [+m[1] * 60 + +m[2], +m[3] * 60 + +m[4]];
}

/** True / false when hours are known, undefined when they are not. */
export function isOpenNow(h?: BranchHours, now = new Date()): boolean | undefined {
  if (!hasHours(h)) return undefined;
  const { day, prev, mins } = uaeNow(now);
  const today = range(h![day]);
  if (today) {
    const [a, b] = today;
    if (b > a ? mins >= a && mins < b : mins >= a) return true;
  }
  // Yesterday's overnight range, e.g. 16:00-01:00.
  const y = range(h![prev]);
  if (y && y[1] < y[0] && mins < y[1]) return true;
  return false;
}

export const todayKey = () => uaeNow().day;

export const pretty = (v?: string) => (!v ? "—" : v.toLowerCase() === "closed" ? "Closed" : v.replace(/\s*[-–]\s*/, " – "));
