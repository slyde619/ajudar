import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Structural placeholder for the landing → signup → onboarding → dashboard
 * flow. No phone, OTP, or consent fields are invented before the auth spec.
 */
export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pt-safe pb-safe">
      <header className="py-5">
        <BrandMark />
      </header>

      <div className="flex flex-1 flex-col justify-center py-10">
        <Card className="ring-line-200">
          <CardHeader className="gap-2">
            <p className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
              Step 1 of 2
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-950">
              Create your ajudar account
            </h1>
            <p className="text-sm leading-relaxed text-ink-500">
              Phone and OTP sign-up will live here. This is a structural
              placeholder for the shell test.
            </p>
          </CardHeader>

          <CardContent className="mt-2 flex flex-col gap-2">
            <Button asChild size="lg" className="h-12 w-full">
              <Link href="/onboarding">Continue</Link>
            </Button>
            <Button asChild variant="ghost" className="h-11 w-full">
              <Link href="/">Back to landing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
