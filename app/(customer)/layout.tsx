import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";

/** App shell for the customer side, with the customer dock. */
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
