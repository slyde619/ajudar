"use client";

import { usePathname } from "next/navigation";
import { DockedNav, type AppRole } from "./docked-nav";
import { ScrollRestore } from "./scroll-restore";
import { StackLayout } from "./stack-layout";

function isFullScreenFlow(pathname: string): boolean {
  if (pathname === "/signup" || pathname === "/onboarding") return true;
  if (pathname.startsWith("/booking/")) return true;
  if (/^\/jobs\/[^/]+$/.test(pathname)) return true;
  if (/^\/artisans\/[^/]+$/.test(pathname)) return true;
  if (pathname.startsWith("/artisan/onboarding")) return true;
  if (pathname.startsWith("/artisan/requests/")) return true;
  if (/^\/artisan\/jobs\/[^/]+$/.test(pathname)) return true;
  return false;
}

/** App shell that layers screen content above the dock. */
export function AppShell({
  role,
  children,
}: {
  role: AppRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dockVisible = !isFullScreenFlow(pathname);

  return (
    <div className="min-h-dvh bg-background">
      <ScrollRestore />
      <main
        className={
          dockVisible
            ? "relative z-10 pb-dock lg:pb-0 lg:pl-64"
            : "relative z-10"
        }
      >
        <StackLayout>{children}</StackLayout>
      </main>
      {dockVisible ? <DockedNav role={role} /> : null}
    </div>
  );
}
