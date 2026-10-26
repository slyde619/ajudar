import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VerificationStrip } from "@/components/verification/verification-strip";
import type { ArtisanProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { deriveVerificationSignals, initialsOf, TRADE_LABEL } from "@/lib/utils/verification";

interface ArtisanSummaryProps {
  artisan: ArtisanProfile;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  showSignals?: boolean;
  size?: "md" | "lg";
  className?: string;
}

/** Artisan profile summary kept on screen while negotiating. */
export function ArtisanSummary({ artisan, meta, action, showSignals = true, size = "md", className }: ArtisanSummaryProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <Avatar className={size === "lg" ? "size-16" : "size-12"}>
          <AvatarFallback
            className={cn("bg-ink-950 font-semibold text-celo-500", size === "lg" ? "text-lg" : "text-sm")}
          >
            {initialsOf(artisan.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-semibold text-ink-950", size === "lg" ? "text-lg" : "text-[15px]")}>
            {artisan.displayName}
          </p>
          <p className="truncate text-xs text-ink-500">
            {meta ?? `${TRADE_LABEL[artisan.trade]} · ${artisan.yearsExperience} yrs`}
          </p>
        </div>
        {action}
      </div>
      {showSignals ? <VerificationStrip signals={deriveVerificationSignals(artisan)} className="mt-3" /> : null}
    </div>
  );
}
