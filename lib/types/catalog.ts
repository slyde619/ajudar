import type { Id } from "./primitives";

export type Trade =
  | "plumber" | "electrician" | "carpenter" | "painter"
  | "tiler" | "welder" | "ac_technician" | "generator_mechanic"
  | "locksmith" | "cleaner" | "mason" | "roofer";

export type NegotiationMode = "bounded" | "fixed" | "none";

export interface TradeCategory {
  id: Id;
  slug: string;
  label: string;
  trade: Trade;
  iconKey: string;
  negotiation: NegotiationMode;
  bandPercent: number;
  maxNegotiationRounds: number;
  negotiationWindowMinutes: number;
  supportsEmergency: boolean;
  emergencySurgeMultiplier?: number;
}
