import { ArrowRight, House, Wrench } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

type Role = "customer" | "artisan";

const ROLES: { role: Role; href: string; title: string; detail: string; icon: typeof House }[] = [
  {
    role: "customer",
    href: "/onboarding",
    title: "I need an artisan",
    detail: "Get a fair estimate, agree the price, and pay into escrow before anyone moves.",
    icon: House,
  },
  {
    role: "artisan",
    href: "/artisan/onboarding",
    title: "I'm an artisan",
    detail: "Get verified once, see paying jobs near you, and get paid the moment the work is done.",
    icon: Wrench,
  },
];

/** Customer and artisan cards for picking a side. */
function RoleChoice({ preferred }: { preferred: Role | null }) {
  return (
    <ul className="flex flex-col gap-3">
      {ROLES.map(({ role, href, title, detail, icon: Icon }) => (
        <li key={role}>
          <Link
            href={href}
            className={cn(
              "group flex items-center gap-4 rounded-2xl bg-surface-raised p-4 ring-1 transition-[box-shadow,transform] duration-200 active:scale-[0.99]",
              preferred === role ? "ring-2 ring-ink-950" : "ring-line-200 hover:ring-line-300",
            )}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-celo-500">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold tracking-tight text-ink-950">{title}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-ink-500">{detail}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Sign-up entry where the person picks the customer or artisan side. */
export default function SignupPage({ searchParams }: PageProps<"/signup">) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pt-safe pb-safe">
      <header className="py-5">
        <BrandMark />
      </header>

      <div className="flex flex-1 flex-col justify-center pb-16">
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-ink-950">How will you use ajudar?</h1>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-ink-500">Pick one so we take you to the right place.</p>
        <Suspense fallback={<RoleChoice preferred={null} />}>
          {searchParams.then(({ as }) => (
            <RoleChoice preferred={as === "customer" || as === "artisan" ? as : null} />
          ))}
        </Suspense>
      </div>
    </main>
  );
}
