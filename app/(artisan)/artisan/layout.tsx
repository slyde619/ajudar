import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";

/** App shell for the artisan side, with the artisan dock. */
export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AppShell role="artisan">{children}</AppShell>
    </Suspense>
  );
}
