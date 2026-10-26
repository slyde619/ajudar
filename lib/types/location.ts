import type { Coordinates } from "./geo";
import type { Id, IsoDateTime, LgaCode } from "./primitives";

export interface SavedSite extends Coordinates {
  id: Id;
  label: string;
  landmark: string;
  lgaCode: LgaCode;
}

export interface JobSite extends Coordinates {
  lgaCode: LgaCode;
  landmark: string;
  pinConfirmedByUser: boolean;
  accuracyM?: number;
  savedLabel?: "home" | "work" | "other";
  plusCode?: string;
}

export type LocationStatus =
  | "unknown" | "requesting" | "resolving" | "confirmed"
  | "manual" | "stale" | "denied" | "unavailable";

export type LocationState =
  | { status: "unknown" }
  | { status: "requesting" }
  | { status: "resolving" }
  | { status: "confirmed"; site: JobSite; resolvedAt: IsoDateTime }
  | { status: "manual"; site: JobSite }
  | { status: "stale"; site: JobSite; resolvedAt: IsoDateTime }
  | { status: "denied" }
  | { status: "unavailable" };
