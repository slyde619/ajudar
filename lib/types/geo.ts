import type { LgaCode, StateCode } from "./primitives";

export interface Coordinates { lat: number; lng: number; }

export interface GeoPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface Lga {
  code: LgaCode;
  name: string;
  stateCode: StateCode;
  stateName: string;
  centroid: Coordinates;
}

export interface LgaBoundary {
  lgaCode: LgaCode;
  name: string;
  stateCode: StateCode;
  polygons: GeoPolygon[];
}

export interface RoutePath {
  coordinates: [lng: number, lat: number][];
  distanceM: number;
  durationSeconds: number;
}
