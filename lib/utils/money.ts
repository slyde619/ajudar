import type { Kobo } from "@/lib/types";

const KOBO_PER_NAIRA = 100;

function assertKobo(amount: Kobo): void {
  if (!Number.isInteger(amount)) {
    throw new TypeError(`Kobo amounts must be integers, received ${amount}.`);
  }
}

function groupThousands(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatNaira(amount: Kobo): string {
  assertKobo(amount);
  const sign = amount < 0 ? "−" : "";
  const abs = Math.abs(amount);
  const naira = Math.trunc(abs / KOBO_PER_NAIRA);
  const kobo = abs % KOBO_PER_NAIRA;
  const fraction = kobo === 0 ? "" : `.${kobo.toString().padStart(2, "0")}`;
  return `${sign}₦${groupThousands(naira)}${fraction}`;
}

export function formatNairaCompact(amount: Kobo): string {
  assertKobo(amount);
  const naira = Math.trunc(amount / KOBO_PER_NAIRA);
  const abs = Math.abs(naira);
  const sign = naira < 0 ? "−" : "";
  if (abs >= 1_000_000) {
    const tenths = Math.round(abs / 100_000);
    return `${sign}₦${tenths % 10 === 0 ? tenths / 10 : (tenths / 10).toFixed(1)}m`;
  }
  if (abs >= 1_000) {
    const tenths = Math.round(abs / 100);
    return `${sign}₦${tenths % 10 === 0 ? tenths / 10 : (tenths / 10).toFixed(1)}k`;
  }
  return `${sign}₦${abs}`;
}

export function nairaToKobo(naira: number): Kobo {
  return Math.round(naira * KOBO_PER_NAIRA);
}

export function sumKobo(amounts: readonly Kobo[]): Kobo {
  return amounts.reduce((total, amount) => {
    assertKobo(amount);
    return total + amount;
  }, 0);
}
