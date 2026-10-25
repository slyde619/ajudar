import { ThreadRow } from "@/components/messages/thread-row";
import { StickyHeader } from "@/components/shell/sticky-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const threads = [
  {
    name: "Chinedu Okafor",
    role: "Plumber · on the way",
    snippet: "I'm 8 minutes away — please keep the gate open.",
    time: "18:42",
    unread: true,
  },
  {
    name: "Ngozi Eze",
    role: "Electrician",
    snippet: "I can come tomorrow morning to check the sockets.",
    time: "16:10",
    unread: true,
  },
  {
    name: "Adaobi Nkem",
    role: "AC technician",
    snippet: "Servicing is complete. Thank you for the rating.",
    time: "Mon",
  },
];

export default function MessagesPage() {
  return (
    <>
      <StickyHeader title="Messages" subtitle="3 conversations" />

      <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-8 lg:px-8 lg:pt-8">
        <Input
          type="search"
          inputMode="search"
          placeholder="Search conversations"
          aria-label="Search conversations"
          className="h-11 rounded-lg"
        />

        <Card className="mt-4 gap-0 rounded-xl ring-line-200">
          <CardContent className="divide-y divide-line-200 p-0">
            {threads.map((thread) => (
              <ThreadRow key={thread.name} {...thread} />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
