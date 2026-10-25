import type { Lga } from "@/lib/types";

/**
 * Mock LGA centroids for the two pilot states (Lagos and Abia).
 *
 * These coordinates are demonstration placeholders for map pins and
 * distance sorting. The hard eligibility gate uses the real LGA polygon
 * GeoJSON described in project.md §10.2 — not these centroids.
 */
export const lgas = [
  /* ── Lagos State (20 LGAs) ── */
  { code: "NG-LA-AGEGE", name: "Agege", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.615, lng: 3.322 } },
  { code: "NG-LA-AJEROMI-IFELODUN", name: "Ajeromi-Ifelodun", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.465, lng: 3.335 } },
  { code: "NG-LA-ALIMOSHO", name: "Alimosho", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.61, lng: 3.265 } },
  { code: "NG-LA-AMUWO-ODOFIN", name: "Amuwo-Odofin", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.45, lng: 3.27 } },
  { code: "NG-LA-APAPA", name: "Apapa", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.447, lng: 3.36 } },
  { code: "NG-LA-BADAGRY", name: "Badagry", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.415, lng: 2.887 } },
  { code: "NG-LA-EPE", name: "Epe", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.584, lng: 3.983 } },
  { code: "NG-LA-ETI-OSA", name: "Eti-Osa", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.45, lng: 3.5 } },
  { code: "NG-LA-IBEJU-LEKKI", name: "Ibeju-Lekki", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.5, lng: 3.75 } },
  { code: "NG-LA-IFAKO-IJAIYE", name: "Ifako-Ijaiye", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.633, lng: 3.317 } },
  { code: "NG-LA-IKEJA", name: "Ikeja", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.601, lng: 3.351 } },
  { code: "NG-LA-IKORODU", name: "Ikorodu", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.619, lng: 3.51 } },
  { code: "NG-LA-KOSOFE", name: "Kosofe", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.583, lng: 3.383 } },
  { code: "NG-LA-LAGOS-ISLAND", name: "Lagos Island", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.455, lng: 3.396 } },
  { code: "NG-LA-LAGOS-MAINLAND", name: "Lagos Mainland", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.5, lng: 3.367 } },
  { code: "NG-LA-MUSHIN", name: "Mushin", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.533, lng: 3.35 } },
  { code: "NG-LA-OJO", name: "Ojo", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.467, lng: 3.183 } },
  { code: "NG-LA-OSHODI-ISOLO", name: "Oshodi-Isolo", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.55, lng: 3.317 } },
  { code: "NG-LA-SHOMOLU", name: "Shomolu", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.533, lng: 3.383 } },
  { code: "NG-LA-SURULERE", name: "Surulere", stateCode: "NG-LA", stateName: "Lagos", centroid: { lat: 6.5, lng: 3.35 } },

  /* ── Abia State (17 LGAs) ── */
  { code: "NG-AB-ABA-NORTH", name: "Aba North", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.117, lng: 7.367 } },
  { code: "NG-AB-ABA-SOUTH", name: "Aba South", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.1, lng: 7.35 } },
  { code: "NG-AB-AROCHUKWU", name: "Arochukwu", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.383, lng: 7.917 } },
  { code: "NG-AB-BENDE", name: "Bende", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.567, lng: 7.633 } },
  { code: "NG-AB-IKWUANO", name: "Ikwuano", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.433, lng: 7.567 } },
  { code: "NG-AB-ISIALA-NGWA-NORTH", name: "Isiala Ngwa North", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.35, lng: 7.467 } },
  { code: "NG-AB-ISIALA-NGWA-SOUTH", name: "Isiala Ngwa South", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.3, lng: 7.4 } },
  { code: "NG-AB-ISUIKWUATO", name: "Isuikwuato", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.5, lng: 7.5 } },
  { code: "NG-AB-OBI-NGWA", name: "Obi Ngwa", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.2, lng: 7.45 } },
  { code: "NG-AB-OHAFIA", name: "Ohafia", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.617, lng: 7.833 } },
  { code: "NG-AB-OSISIOMA", name: "Osisioma", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.15, lng: 7.4 } },
  { code: "NG-AB-UGWUNAGBO", name: "Ugwunagbo", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.05, lng: 7.317 } },
  { code: "NG-AB-UKWA-EAST", name: "Ukwa East", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.05, lng: 7.45 } },
  { code: "NG-AB-UKWA-WEST", name: "Ukwa West", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 4.983, lng: 7.35 } },
  { code: "NG-AB-UMUAHIA-NORTH", name: "Umuahia North", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.533, lng: 7.483 } },
  { code: "NG-AB-UMUAHIA-SOUTH", name: "Umuahia South", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.467, lng: 7.467 } },
  { code: "NG-AB-UMU-NNEOCHI", name: "Umu Nneochi", stateCode: "NG-AB", stateName: "Abia", centroid: { lat: 5.75, lng: 7.6 } },
] satisfies Lga[];

export function getLgaByCode(code: string): Lga | undefined {
  return lgas.find((lga) => lga.code === code);
}

export function getLgasByState(stateCode: string): Lga[] {
  return lgas.filter((lga) => lga.stateCode === stateCode);
}
