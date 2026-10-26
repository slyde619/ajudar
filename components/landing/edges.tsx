import { cn } from "@/lib/utils";

/** Cloud-row seam where the next landing section rises into this one. */
export function CloudEdge({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className={cn("block h-12 w-full md:h-20", flip && "-scale-y-100", className)}
      aria-hidden
    >
      <path d="M0 90 V58 C40 30 92 30 124 52 C150 18 222 14 252 48 C282 26 330 28 352 54 C392 10 476 8 506 50 C534 30 576 30 598 52 C632 20 700 18 726 50 C760 28 806 30 826 56 C866 14 948 12 978 52 C1004 32 1048 30 1070 54 C1104 22 1170 20 1196 52 C1226 32 1268 32 1290 54 C1326 18 1400 20 1440 46 V90 Z" />
    </svg>
  );
}

/** Torn-paper seam where the next landing section rises into this one. */
export function TornEdge({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className={cn("block h-6 w-full md:h-9", flip && "-scale-y-100", className)}
      aria-hidden
    >
      <path d="M0 40 V22 L38 14 L70 24 L112 8 L150 20 L196 12 L230 26 L282 10 L318 22 L366 6 L402 18 L446 14 L488 28 L530 10 L566 20 L618 12 L650 26 L704 8 L742 22 L786 14 L830 24 L868 6 L912 20 L950 12 L996 26 L1040 10 L1078 22 L1126 14 L1162 26 L1210 8 L1248 20 L1292 12 L1330 24 L1376 10 L1440 20 V40 Z" />
    </svg>
  );
}
