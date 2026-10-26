import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  href?: string | null;
  showWordmark?: boolean;
  className?: string;
}

/** ajudar brand lockup. */
export function BrandMark({
  href = "/",
  showWordmark = true,
  className,
}: BrandMarkProps) {
  const content = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-celo-500 text-sm font-bold text-ink-950">
        a
      </span>
      {showWordmark ? (
        <span className="text-lg font-semibold tracking-tight text-ink-950">
          ajudar
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <span className={cn("flex items-center gap-2.5", className)}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label="ajudar home"
      className={cn("flex items-center gap-2.5", className)}
    >
      {content}
    </Link>
  );
}
