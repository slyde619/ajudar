import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Status colours are never yellow (§4.2 / §18). */
export type StatusTone = "success" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  danger: "bg-danger-100 text-danger-600",
  neutral: "bg-surface-sunken text-ink-500",
};

interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", TONE_CLASSES[tone], className)}
    >
      {children}
    </Badge>
  );
}
