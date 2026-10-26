import type { SavedSite } from "./location";
import type { Id, IsoDateTime, LgaCode } from "./primitives";

export interface CustomerProfile {
  id: Id;
  displayName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  savedSites: SavedSite[];
  defaultLgaCode?: LgaCode;
  createdAt: IsoDateTime;
}
