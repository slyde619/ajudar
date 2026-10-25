import {
  CreditCard,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { ProfileRow } from "@/components/profile/profile-row";
import { StickyHeader } from "@/components/shell/sticky-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  return (
    <>
      <StickyHeader title="Profile" subtitle="Account and saved places" />

      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <Card className="rounded-xl ring-line-200">
          <CardContent className="flex items-center gap-4 p-5">
            <Avatar className="size-14">
              <AvatarFallback className="bg-celo-100 text-base font-semibold text-ink-950">
                AO
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-lg font-semibold tracking-tight text-ink-950">
                Adaeze Okafor
              </p>
              <p
                className="truncate font-mono text-xs text-ink-500"
                data-tabular
              >
                +234 803 000 0000
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-surface-sunken px-2.5 py-1 text-xs text-ink-700">
                <MapPin className="h-3 w-3" aria-hidden />
                Ikeja, Lagos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 gap-0 overflow-hidden rounded-xl ring-line-200">
          <CardContent className="p-0">
            <ProfileRow icon={MapPin} label="Saved places" meta="2" />
            <Separator />
            <ProfileRow icon={CreditCard} label="Payment methods" meta="1" />
            <Separator />
            <ProfileRow icon={ShieldCheck} label="Verification" meta="NIN" />
            <Separator />
            <ProfileRow icon={Settings} label="Settings" />
            <Separator />
            <ProfileRow icon={LogOut} label="Sign out" tone="danger" />
          </CardContent>
        </Card>

        <p className="mt-6 text-center font-mono text-[10px] tracking-widest text-ink-400 uppercase">
          ajudar · Lagos · Abia
        </p>
      </div>
    </>
  );
}
