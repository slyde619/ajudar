/** Title block for an onboarding step. */
export function StepHeading({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-ink-950">{title}</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{detail}</p>
    </div>
  );
}
