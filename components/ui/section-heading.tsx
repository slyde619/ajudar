interface SectionHeadingProps {
  id?: string;
  title: string;
  action?: React.ReactNode;
}

export function SectionHeading({ id, title, action }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-sm font-semibold text-ink-950">
        {title}
      </h2>
      {action}
    </div>
  );
}
