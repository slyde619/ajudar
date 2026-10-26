"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { HouseIcon } from "@phosphor-icons/react/ssr";
import {
  setWorkerUrl,
  type Map as MapLibreMap,
  type StyleSpecification,
} from "maplibre-gl";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import MapGL, {
  Layer,
  Marker,
  Source,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { Coordinates, GeoPolygon } from "@/lib/types";
import { cn } from "@/lib/utils";

setWorkerUrl(
  new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href,
);

export type LngLat = [lng: number, lat: number];

export interface MapMarker {
  id: string;
  kind: "artisan" | "site";
  position: Coordinates;
  label: string;
  initials?: string;
}

export interface MapBoundary {
  polygons: GeoPolygon[];
  tone: "inside" | "outside";
}

export interface MapFrame {
  key: string;
  bounds: [LngLat, LngLat];
  padding: { top: number; right: number; bottom: number; left: number };
}

export interface MapCanvasProps {
  center: Coordinates;
  zoom?: number;
  frame?: MapFrame;
  markers?: MapMarker[];
  route?: LngLat[];
  boundary?: MapBoundary | null;
  interactive?: boolean;
  onCenterChange?: (center: Coordinates, settled: boolean) => void;
  className?: string;
}

const MAP = {
  land: "#1A1A1A",
  water: "#111213",
  green: "#1D1E1C",
  building: "#222221",
  road: "#2A2A2A",
  roadMajor: "#333331",
  label: "#7A766F",
  halo: "#1A1A1A",
  celo: "#FCFF52",
  casing: "#0E0E0D",
  danger: "#C0392B",
} as const;

const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

const ATTRIBUTION =
  'Boundaries © <a href="https://www.geoboundaries.org" target="_blank" rel="noreferrer">geoBoundaries</a> (GRID3), CC BY 4.0';

const HIDDEN_LAYER = /oneway|highway_name|railway|aeroway|boundary_country|place_country|place_state|water_name|waterway|ice|glacier/;

function applyMutedStyle(map: MapLibreMap): void {
  const style = map.getStyle() as StyleSpecification | undefined;
  for (const layer of style?.layers ?? []) {
    const id = layer.id;
    if (HIDDEN_LAYER.test(id)) {
      map.setLayoutProperty(id, "visibility", "none");
      continue;
    }
    if (layer.type === "background") map.setPaintProperty(id, "background-color", MAP.land);
    else if (id === "water") map.setPaintProperty(id, "fill-color", MAP.water);
    else if (id.startsWith("landuse") || id.startsWith("landcover")) {
      map.setPaintProperty(id, "fill-color", MAP.green);
    } else if (id === "building") map.setPaintProperty(id, "fill-color", MAP.building);
    else if (layer.type === "line" && id.includes("casing")) {
      map.setPaintProperty(id, "line-color", MAP.land);
    } else if (layer.type === "line" && /highway|road/.test(id)) {
      map.setPaintProperty(
        id,
        "line-color",
        /major|motorway/.test(id) ? MAP.roadMajor : MAP.road,
      );
    } else if (layer.type === "symbol" && id.startsWith("place")) {
      map.setPaintProperty(id, "text-color", MAP.label);
      map.setPaintProperty(id, "text-halo-color", MAP.halo);
    }
  }
}

/** Eases a marker between positions so it glides instead of jumping. */
function useGlidingPosition(target: Coordinates, durationMs = 1200): Coordinates {
  const [position, setPosition] = useState(target);
  const from = useRef(target);
  const current = useRef(target);

  useEffect(() => {
    from.current = current.current;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - t) ** 3;
      const next = {
        lat: from.current.lat + (target.lat - from.current.lat) * eased,
        lng: from.current.lng + (target.lng - from.current.lng) * eased,
      };
      current.current = next;
      setPosition(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target.lat, target.lng, durationMs]);

  return position;
}

function ArtisanPuck({ marker }: { marker: MapMarker }) {
  const position = useGlidingPosition(marker.position);
  return (
    <Marker longitude={position.lng} latitude={position.lat} anchor="center">
      <span
        role="img"
        aria-label={marker.label}
        className="flex size-11 items-center justify-center rounded-full border-[3px] border-ink-950 bg-celo-500 text-[13px] font-bold tracking-tight text-ink-950 shadow-pop"
      >
        {marker.initials}
      </span>
    </Marker>
  );
}

function SitePin({ marker }: { marker: MapMarker }) {
  return (
    <Marker longitude={marker.position.lng} latitude={marker.position.lat} anchor="bottom">
      <span role="img" aria-label={marker.label} className="flex flex-col items-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-surface-raised text-ink-950 shadow-pop">
          <HouseIcon className="size-4" weight="bold" aria-hidden />
        </span>
        <span className="-mt-px h-2.5 w-0.5 rounded-full bg-surface-raised" aria-hidden />
      </span>
    </Marker>
  );
}

/** The app's only map-library component, drawing markers, routes and LGA boundaries from props. */
export function MapCanvas({
  center,
  zoom = 14,
  frame,
  markers = [],
  route,
  boundary,
  interactive = true,
  onCenterChange,
  className,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      applyMutedStyle(map);
      map
        .getContainer()
        .querySelector(".maplibregl-ctrl-attrib")
        ?.classList.remove("maplibregl-compact-show");
    }
    setLoaded(true);
  }, []);

  useLayoutEffect(() => () => setLoaded(false), []);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!loaded || !map) return;
    const handlers = [map.dragPan, map.scrollZoom, map.touchZoomRotate, map.doubleClickZoom, map.keyboard];
    for (const handler of handlers) {
      if (interactive) handler.enable();
      else handler.disable();
    }
  }, [loaded, interactive]);

  const frameKey = frame?.key;
  useEffect(() => {
    if (!loaded || !frame) return;
    mapRef.current?.fitBounds(frame.bounds, {
      padding: frame.padding,
      duration: 700,
      maxZoom: 16,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, frameKey]);

  const emitCenter = useCallback(
    (event: ViewStateChangeEvent, settled: boolean) => {
      onCenterChange?.(
        { lat: event.viewState.latitude, lng: event.viewState.longitude },
        settled,
      );
    },
    [onCenterChange],
  );

  return (
    <div className={cn("relative size-full bg-ink-950", className)}>
      <MapGL
        ref={mapRef}
        mapStyle={STYLE_URL}
        initialViewState={{ latitude: center.lat, longitude: center.lng, zoom }}
        onLoad={handleLoad}
        onMove={onCenterChange ? (event) => emitCenter(event, false) : undefined}
        onMoveEnd={onCenterChange ? (event) => emitCenter(event, true) : undefined}
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        attributionControl={{ compact: true, customAttribution: ATTRIBUTION }}
        style={{ position: "absolute", inset: 0 }}
      >
        {loaded && boundary ? (
          <Source
            id="lga-boundary"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: boundary.polygons.map((geometry) => ({
                type: "Feature",
                properties: {},
                geometry,
              })),
            }}
          >
            <Layer
              id="lga-boundary-fill"
              type="fill"
              paint={{
                "fill-color": boundary.tone === "inside" ? MAP.celo : MAP.danger,
                "fill-opacity": boundary.tone === "inside" ? 0.07 : 0.12,
                "fill-opacity-transition": { duration: 240 },
              }}
            />
            <Layer
              id="lga-boundary-line"
              type="line"
              paint={{
                "line-color": boundary.tone === "inside" ? MAP.celo : MAP.danger,
                "line-width": 1.5,
                "line-opacity": 0.8,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        ) : null}

        {loaded && route && route.length > 1 ? (
          <Source
            id="route"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: route },
            }}
          >
            <Layer
              id="route-casing"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": MAP.casing, "line-width": 10 }}
            />
            <Layer
              id="route-line"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": MAP.celo, "line-width": 5 }}
            />
          </Source>
        ) : null}

        {markers.map((marker) =>
          marker.kind === "artisan" ? (
            <ArtisanPuck key={marker.id} marker={marker} />
          ) : (
            <SitePin key={marker.id} marker={marker} />
          ),
        )}
      </MapGL>
    </div>
  );
}

export default MapCanvas;
