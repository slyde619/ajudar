import type { Trade } from "./catalog";
import type { Coordinates, GeoPolygon } from "./geo";
import type { Id, IsoDateTime, Kobo, LgaCode } from "./primitives";
import type { ArtisanVerification } from "./verification";

export interface RateCard {
  callOutFee: Kobo;
  hourlyRate?: Kobo;
  minimumCharge: Kobo;
  transportIncluded: boolean;
  transportFeePerKm?: Kobo;
  updatedAt: IsoDateTime;
}

export interface CoverageArea {
  homeLgaCode: LgaCode;
  servedLgaCodes: LgaCode[];
  driveTimeMinutes: number;
  polygonGeoJSON: GeoPolygon | null;
  updatedAt: IsoDateTime;
}

export interface ArtisanStats {
  jobsCompleted: number;
  jobsCancelled: number;
  completionRate: number;
  averageRating: number;
  ratingCount: number;
  ratingTrend: number;
  medianResponseSeconds: number;
  disputesOpened: number;
  disputesResolved: number;
}

export interface PortfolioItem {
  id: Id;
  imageUrl: string;
  caption?: string;
  trade: Trade;
  completedAt?: IsoDateTime;
  verified: boolean;
}

export interface ArtisanProfile {
  id: Id;
  displayName: string;
  avatarUrl?: string;
  phone: string;
  trade: Trade;
  specialties: string[];
  bio?: string;
  yearsExperience: number;

  baseAddress: string;
  base: Coordinates;
  coverage: CoverageArea;

  rateCard: RateCard;
  verification: ArtisanVerification;
  stats: ArtisanStats;
  portfolio: PortfolioItem[];

  isOnline: boolean;
  acceptsEmergency: boolean;
  suspended: boolean;
  suspendedReason?: string;

  createdAt: IsoDateTime;
  lastActiveAt?: IsoDateTime;
}

export interface ArtisanLocation {
  artisanId: Id;
  coords: Coordinates;
  accuracyM?: number;
  updatedAt: IsoDateTime;
  source: "foreground" | "base";
}
