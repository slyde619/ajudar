import Link from "next/link";
import { MapPin } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pt-safe pb-safe">
      <header className="py-5">
        <BrandMark />
      </header>

      <div className="flex flex-1 flex-col justify-center py-10">
        <Card className="ring-line-200">
          <CardHeader className="gap-2">
            <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
              Step 2 of 2
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-950">
              Where do you need help?
            </h1>
            <p className="text-sm leading-relaxed text-ink-500">
              Your LGA decides which artisans can reach you. Your landmark tells
              them where to stop.
            </p>
          </CardHeader>

          <CardContent className="mt-2 flex flex-col gap-4">
            <div className="rounded-lg border border-dashed border-line-300 bg-surface-sunken/60 p-4">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-ink-400 uppercase">
                <MapPin className="h-3 w-3" aria-hidden />
                Location gate · Phase 3
              </span>
              <p className="mt-2 text-sm text-ink-700">
                LGA point-in-polygon, landmark entry, and pin confirmation are
                built in Phase 3.
              </p>
            </div>

            <Button asChild size="lg" className="h-12 w-full">
              <Link href="/dashboard">Enter ajudar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
