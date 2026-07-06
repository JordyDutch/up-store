import type { Metadata } from "next";
import Link from "next/link";

import StoreDirectoryExperience from "@/components/StoreDirectoryExperience";
import { getTopCategories } from "@/data/appCatalog";
import { serializeCatalog } from "@/lib/catalog";
import { buildUniversalProfilesItunesMeta } from "@/lib/universalProfilesApp";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Store directory | LUKSO UP! Store",
  description:
    "Browse every app in the LUKSO UP!Store library, filter by category, and open individual app pages that Google can actually index.",
  alternates: {
    canonical: "/store",
  },
  itunes: buildUniversalProfilesItunesMeta("/store"),
};

export default function StorePage() {
  const apps = serializeCatalog();
  const categories = getTopCategories();

  return (
    <StoreDirectoryExperience>
      <>
        <section className="max-w-3xl">
          <p className="eyebrow">Store directory</p>
          <h1 className="mt-1.5 text-balance font-display text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-foreground md:text-[44px]">
            Every LUKSO Mini-App, in one place
          </h1>
          <p className="mt-3 max-w-prose text-balance text-[15px] leading-relaxed text-text-secondary md:text-[16px]">
            This is the crawlable library page for the UP!Store. Each app gets its
            own indexed detail page, plus a direct link to open or add it to a Grid.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Discover home
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
            >
              Search apps
            </Link>
          </div>
        </section>

        <section>
          <p className="eyebrow">Browse by category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${encodeURIComponent(category.id)}`}
                className="inline-flex min-h-10 items-center rounded-full border border-border bg-muted/50 px-4 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                {category.displayName}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">App index</p>
              <h2 className="section-h2">Indexed app pages</h2>
            </div>
            <p className="text-sm text-text-secondary">{apps.length} apps</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <li key={app.id}>
                <Link
                  href={app.detailUrl}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-rest transition hover:-translate-y-0.5 hover:shadow-glass"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-tertiary">
                    {app.categories.slice(0, 2).join(" / ") || "Mini-App"}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {app.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
                    {app.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </>
    </StoreDirectoryExperience>
  );
}
