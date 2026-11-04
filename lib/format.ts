export const CURRENCY = "AED";

export function money(n: number): string {
  return `${CURRENCY} ${Number(n).toLocaleString("en-US")}`;
}
