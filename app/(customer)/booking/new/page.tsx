import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DescribeForm } from "@/components/booking/describe-form";
import { listCategories } from "@/lib/api/categories";
import { listLgas } from "@/lib/api/geo";

async function Describe({ slug }: { slug: string | undefined }) {
  const [categoriesResult, lgasResult] = await Promise.all([listCategories(), listLgas()]);
  const category = categoriesResult.ok
    ? categoriesResult.data.find((entry) => entry.slug === slug)
    : undefined;
  if (!category) notFound();

  return (
    <DescribeForm
      category={category}
      lgas={lgasResult.ok ? lgasResult.data : []}
      returnHref={`/booking/new?category=${encodeURIComponent(category.slug)}`}
    />
  );
}

/** First booking step, where the customer describes the job before it exists. */
export default function NewBookingPage({ searchParams }: PageProps<"/booking/new">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      {searchParams.then(({ category }) => (
        <Describe slug={typeof category === "string" ? category : undefined} />
      ))}
    </Suspense>
  );
}
