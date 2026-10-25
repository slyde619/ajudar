import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";

/**
 * AppShell reads usePathname(). On routes with unknown dynamic params
 * (/jobs/[id]) that is runtime data under Cache Components, so the shell
 * streams behind this boundary. Static routes still prerender fully.
 */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AppShell role="customer">{children}</AppShell>
    </Suspense>
  );
}
