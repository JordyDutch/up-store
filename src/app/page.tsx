import type { Metadata } from "next";
import Link from "next/link";

import StoreExperience from "@/components/StoreExperience";
import { getTopCategories } from "@/data/appCatalog";
import { serializeCatalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Discover mini-apps for Universal Profiles",
  description:
    "Browse the LUKSO UP!Store, discover Mini-Apps for your Universal Profile, and jump into the most useful Grid widgets on LUKSO.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Discover mini-apps for Universal Profiles",
    description:
      "Browse the LUKSO UP!Store, discover Mini-Apps for your Universal Profile, and jump into the most useful Grid widgets on LUKSO.",
    url: siteUrl,
  },
};

export default function Home() {
  const apps = serializeCatalog().slice(0, 6);
  const categories = getTopCategories();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured LUKSO UP!Store apps",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: apps.length,
    itemListElement: apps.map((app, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: app.detailUrl,
      name: app.name,
    })),
  };

  return (
    <StoreExperience variant="auto">
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
        />
        <section className="max-w-3xl">
          <p className="eyebrow">LUKSO UP!Store</p>
          <h1 className="mt-1.5 text-balance font-display text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-foreground md:text-[44px]">
            Discover apps for your Universal Profile
          </h1>
          <p className="mt-3 max-w-prose text-balance text-[15px] leading-relaxed text-text-secondary md:text-[16px]">
            The LUKSO app store is a catalog of Mini-Apps and Grid widgets built
            for Universal Profiles. Open them instantly, or add them to your Grid.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/store"
              className="inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
            >
              Browse the store
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Search apps
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured</p>
              <h2 className="section-h2">Highlighted apps</h2>
            </div>
            <Link
              href="/store"
              className="text-sm font-medium text-brand-text underline-offset-4 hover:underline"
            >
              View all apps
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </>
    </StoreExperience>
  );
}
