"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Sparkles, Star } from "lucide-react";

import CategoryCloud, {
  CATEGORY_ICONS,
  type CategoryOption,
} from "@/components/CategoryCloud";
import {
  App,
  categories as appCategories,
  getNewestApps,
  getPrimaryCategory,
  NEW_FILTER_ID,
  sortByOpenCount,
  sortCategoriesByRelevance,
} from "@/data/appCatalog";

interface TopChartsSliderProps {
  apps: App[];
  onAppClick: (app: App) => void;
  /**
   * Global open counts ({ [appId]: count }). When provided, rows rank
   * most-opened first within the active category. Empty/undefined falls back to
   * the incoming order, so SSR/first render stays stable (see useTrending).
   */
  trendingCounts?: Record<string, number>;
}

type ChartFilter = string;

// Pseudo-category shown first and selected by default: ranks the whole catalog
// by open count, i.e. the most-trending apps overall. Kept distinct from any
// real category id in appCatalog.
const ALL_FILTER_ID = "All";

export default function TopChartsSlider({
  apps,
  onAppClick,
  trendingCounts,
}: TopChartsSliderProps) {
  const [activeFilter, setActiveFilter] = useState<ChartFilter>(ALL_FILTER_ID);
  const reduceMotion = useReducedMotion();
  const options: CategoryOption[] = useMemo(() => {
    const counts = new Map<string, number>();

    apps.forEach((app) => {
      app.categories.forEach((category) => {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      });
    });

    const categoryOptionsWithCountGtZero = Object.values(appCategories)
      .map((category) => ({
        id: category.id,
        label: category.displayName,
        count: counts.get(category.id) ?? 0,
      }))
      .filter((category) => category.count > 0);

    // "All" and "New" lead the list, then the LUKSO-relevance-ordered
    // categories — identical ordering to the Search page's category cloud.
    return [
      { id: ALL_FILTER_ID, label: "All", count: apps.length },
      {
        id: NEW_FILTER_ID,
        label: "New",
        count: getNewestApps(apps).length,
        icon: <Sparkles className="h-4 w-4" />,
      },
      ...sortCategoriesByRelevance(categoryOptionsWithCountGtZero).map((c) => ({
        id: c.id,
        label: c.label,
        count: c.count,
        icon: CATEGORY_ICONS[c.id] ?? <Star className="h-4 w-4" />,
      })),
    ];
  }, [apps]);

  if (!apps || apps.length === 0) {
    return null;
  }

  // The active filter may not exist in the current catalog; fall back to the
  // first available option ("All") so the table never opens on an empty tab.
  const effectiveFilter = options.some((option) => option.id === activeFilter)
    ? activeFilter
    : options[0]?.id ?? "";

  // Rank most-opened first; ties keep incoming order. "All" ranks the whole
  // catalog (most-trending overall), "New" shows the newest apps, otherwise
  // scope to the active category.
  const filteredApps =
    effectiveFilter === ALL_FILTER_ID
      ? sortByOpenCount(apps, trendingCounts ?? {})
      : effectiveFilter === NEW_FILTER_ID
        ? getNewestApps(apps)
        : sortByOpenCount(
            apps.filter((app) => app.categories.includes(effectiveFilter)),
            trendingCounts ?? {}
          );
  const activeLabel =
    options.find((option) => option.id === effectiveFilter)?.label ?? effectiveFilter;

  return (
    <div>
      {/* Category tag-cloud (the section heading is owned by the parent
          DiscoverSection). Identical in look/behavior to the Search page's
          category cloud. */}
      <div className="mb-5">
        <CategoryCloud
          options={options}
          activeId={effectiveFilter}
          onSelect={setActiveFilter}
          ariaLabel="Filter trending apps by category"
        />
      </div>

      {/* Announce the active category + result count to assistive tech */}
      <p className="sr-only" role="status" aria-live="polite">
        {activeLabel}: {filteredApps.length}{" "}
        {filteredApps.length === 1 ? "app" : "apps"}
      </p>

      {/* Ranked rows — solid content card, no glass (data-dense) */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-rest">
        {filteredApps.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-text-secondary">
            No apps in this category yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredApps.map((app, index) => {
              const rank = index + 1;
              const isTop = rank === 1;
              return (
                <motion.li
                  key={app.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.28,
                          delay: Math.min(index, 11) * 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  <button
                    type="button"
                    onClick={() => onAppClick(app)}
                    aria-label={`View ${app.app.name}, ranked number ${rank} in ${
                      activeLabel
                    }`}
                    className="group relative flex w-full min-h-[44px] items-center gap-3 px-4 py-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:gap-4 sm:px-5"
                  >
                    {/* Pink accent bar on #1 */}
                    {isTop && (
                      <span
                        aria-hidden
                        className="absolute inset-y-2 left-0 w-1 rounded-full bg-brand-gradient-soft"
                      />
                    )}

                    {/* Rank numeral */}
                    <span
                      aria-hidden
                      className={`w-7 flex-shrink-0 text-center font-display text-lg font-bold tabular-nums sm:w-8 sm:text-xl ${
                        isTop ? "text-brand-text" : "text-text-tertiary"
                      }`}
                    >
                      {rank}
                    </span>

                    {/* Squircle icon */}
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-rest">
                      <Image
                        src={app.icon || ""}
                        alt={`${app.app.name} icon`}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>

                    {/* Name + category */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="truncate text-[15px] font-medium text-foreground">
                        {app.app.name}
                      </h3>
                      <p className="truncate text-[13px] text-text-secondary">
                        {getPrimaryCategory(app)}
                      </p>
                    </div>

                    {/* Chevron affordance */}
                    <ChevronRight
                      aria-hidden
                      className="h-5 w-5 flex-shrink-0 text-text-tertiary transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text-secondary"
                    />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
