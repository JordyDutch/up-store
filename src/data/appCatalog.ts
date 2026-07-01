/*
 * App catalog.
 *
 * To ADD AN APP you only edit `apps.json` and drop images into
 * `public/apps/<slug>/` — see docs/adding-apps.md. This file is just the loader
 * that expands that plain data into the shape the UI consumes; you should not
 * need to touch it when adding apps.
 */

import appsManifest from "./apps.json";

// A secondary, separately-addable Grid widget offered by an app (beyond its
// primary `url`). Each renders as its own iframe widget on the user's Grid.
interface AppWidgetManifestEntry {
  name: string;
  url: string;
  gridSize: number[]; // [width, height]
  description?: string;
}

// Shape of a single entry in apps.json
interface AppManifestEntry {
  name: string;
  url: string;
  developer: string;
  publisher: string;
  categories: string[];
  gridSize: number[]; // [width, height]
  screenshots: number; // count of screenshot-N.png in public/apps/<slug>/
  sourceCode?: string;
  tags?: string[];
  featured?: boolean;
  featuredTitle?: string; // when present, the app appears in the featured hero
  widgets?: AppWidgetManifestEntry[]; // extra widgets addable to the Grid
  addedAt?: string;
}

// A single addable Grid widget (the app's primary surface is its `url`; these
// are additional ones an app can offer).
export interface AppWidget {
  name: string;
  url: string;
  gridSize: { width: number; height: number };
  description?: string;
}

// App Types and Interfaces (unchanged — the rest of the app relies on this shape)
export interface App {
  categories: string[];
  publisherProfile: string;
  app: {
    profile: string;
    name: string;
    url: string;
    sourceCode?: string;
    defaultGridSize: {
      width: number;
      height: number;
    };
    previewImages: string[];
  };

  // Derived convenience fields used throughout the UI
  id?: string;
  icon?: string;
  banner?: string;
  developer?: string;
  tags?: string[];
  featured?: boolean;
  featuredTitle?: string;
  widgets?: AppWidget[]; // extra widgets beyond the primary app surface
  addedAt?: string;
}

export interface FeaturedApp extends App {
  title: string;
  banner: string;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
}

const manifest = appsManifest as Record<string, AppManifestEntry>;

// Build the public asset path for an app's image by folder convention.
const assetBase = (slug: string) => `/apps/${slug}`;

// Expand one manifest entry into the full App shape.
function toApp(slug: string, entry: AppManifestEntry): App {
  const base = assetBase(slug);
  const [width, height] = entry.gridSize;
  const previewImages = Array.from(
    { length: Math.max(0, entry.screenshots) },
    (_, i) => `${base}/screenshot-${i + 1}.png`
  );

  return {
    categories: entry.categories,
    publisherProfile: entry.publisher,
    app: {
      profile: entry.publisher,
      name: entry.name,
      url: entry.url,
      sourceCode: entry.sourceCode,
      defaultGridSize: { width, height },
      previewImages,
    },
    id: slug,
    icon: `${base}/logo.png`,
    banner: `${base}/banner.png`,
    developer: entry.developer,
    tags: entry.tags,
    featured: entry.featured ?? false,
    featuredTitle: entry.featuredTitle,
    addedAt: entry.addedAt,
    widgets: (entry.widgets ?? []).map((w) => ({
      name: w.name,
      url: w.url,
      gridSize: { width: w.gridSize?.[0] ?? 1, height: w.gridSize?.[1] ?? 1 },
      description: w.description,
    })),
  };
}

// Dedupe widgets by their iframe URL, preserving first-seen order.
const dedupeWidgets = (widgets: AppWidget[]): AppWidget[] => {
  const seen = new Set<string>();
  return widgets.filter((w) => (seen.has(w.url) ? false : (seen.add(w.url), true)));
};

// All apps in the store (insertion order preserved from apps.json)
const manifestApps: Record<string, App> = Object.fromEntries(
  Object.entries(manifest).map(([slug, entry]) => [slug, toApp(slug, entry)])
);

const uniqueValues = (values: Array<string | undefined>) =>
  Array.from(new Set(values.filter(Boolean) as string[]));

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getProductFamily = (app: App) => {
  const [family] = app.app.name.split(":");
  return family.trim() || app.app.name;
};

const getDeduplicationKey = (app: App) => {
  const owner = app.publisherProfile || app.developer || "";
  return `${normalizeKey(owner)}:${normalizeKey(getProductFamily(app))}`;
};

// Pick the more recent of two ISO-ish date strings; falls back to whichever is
// present when the other is missing.
const moreRecentAddedAt = (a?: string, b?: string): string | undefined => {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
};

const mergeDuplicateApps = (canonical: App, duplicate: App): App => {
  return {
    ...canonical,
    categories: uniqueValues([...canonical.categories, ...duplicate.categories]),
    tags: uniqueValues([
      ...(canonical.tags ?? []),
      ...(duplicate.tags ?? []),
      duplicate.app.name,
      getProductFamily(duplicate),
    ]),
    featured: canonical.featured || duplicate.featured,
    featuredTitle: canonical.featuredTitle ?? duplicate.featuredTitle,
    addedAt: moreRecentAddedAt(canonical.addedAt, duplicate.addedAt),
    widgets: dedupeWidgets([
      ...(canonical.widgets ?? []),
      ...(duplicate.widgets ?? []),
    ]),
  };
};

// Public app list with product-family duplicates collapsed. This keeps variants
// like several "Stakingverse: ..." widgets from showing as separate store apps.
export const apps: Record<string, App> = Object.fromEntries(
  Object.entries(manifestApps).reduce<Array<[string, App]>>((deduped, [slug, app]) => {
    const key = getDeduplicationKey(app);
    const existingIndex = deduped.findIndex(([, existingApp]) => {
      return getDeduplicationKey(existingApp) === key;
    });

    if (existingIndex === -1) {
      deduped.push([slug, app]);
      return deduped;
    }

    const [existingSlug, existingApp] = deduped[existingIndex];
    deduped[existingIndex] = [existingSlug, mergeDuplicateApps(existingApp, app)];
    return deduped;
  }, [])
);

// Categories definition (taxonomy — edit here to add a new category)
export const categories: Record<string, Category> = {
  Art: { id: "Art", name: "Art", displayName: "Art" },
  AI: { id: "AI", name: "AI", displayName: "AI" },
  Brands: { id: "Brands", name: "Brands", displayName: "Brands" },
  Community: { id: "Community", name: "Community", displayName: "Community" },
  DAOs: { id: "DAOs", name: "DAOs", displayName: "DAOs" },
  DeFi: { id: "DeFi", name: "DeFi", displayName: "DeFi" },
  Exchanges: { id: "Exchanges", name: "Exchanges", displayName: "Exchanges" },
  Fashion: { id: "Fashion", name: "Fashion", displayName: "Fashion" },
  Gaming: { id: "Gaming", name: "Gaming", displayName: "Gaming" },
  Infrastructure: { id: "Infrastructure", name: "Infrastructure", displayName: "Infrastructure" },
  Marketplaces: { id: "Marketplaces", name: "Marketplaces", displayName: "Marketplaces" },
  Music: { id: "Music", name: "Music", displayName: "Music" },
  NFTs: { id: "NFTs", name: "NFTs", displayName: "NFTs" },
  Security: { id: "Security", name: "Security", displayName: "Security" },
  Social: { id: "Social", name: "Social", displayName: "Social" },
  Staking: { id: "Staking", name: "Staking", displayName: "Staking" },
};

// Featured apps (hero carousel) — any featured app can rotate into the hero.
// `featuredTitle` is an optional editorial override; otherwise use app name.
export const featuredApps: FeaturedApp[] = Object.values(apps)
  .filter((app) => app.featured || app.featuredTitle)
  .map((app) => ({
    ...app,
    title: app.featuredTitle || app.app.name,
    banner: app.banner || "",
  }));

// Sample categories for display
export const sampleCategories = ["Social", "AI", "Gaming", "DeFi", "NFTs"];

// Helper functions to retrieve data
export const getAppsByCategory = (categoryId: string): App[] => {
  return Object.values(apps).filter((app) => app.categories.includes(categoryId));
};

// Get the primary category (first in the array) of an app
export const getPrimaryCategory = (app: App): string => {
  return app.categories[0] || "";
};

export const getFeaturedApps = (): FeaturedApp[] => {
  return featuredApps;
};

export const getTopCategories = (): Category[] => {
  return sampleCategories.map((id) => categories[id]).filter(Boolean);
};

// Fisher–Yates shuffle — returns a new array, leaves the input untouched.
// Used to randomize the store rails on each reload (see useHydrated()).
export const shuffle = <T>(items: readonly T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Order apps by global open count (most-opened first). The sort is stable, so
// apps with equal counts — notably everything at 0 — keep their incoming order
// (e.g. the per-reload shuffle), which is what powers the popularity-ranked
// Trending section without flattening discovery for un-opened apps.
export const sortByOpenCount = <T extends { id?: string }>(
  items: readonly T[],
  counts: Record<string, number>
): T[] =>
  [...items].sort(
    (a, b) => (counts[b.id ?? ""] ?? 0) - (counts[a.id ?? ""] ?? 0)
  );

// Canonical LUKSO-relevance category order, shared by every category cloud
// (Search + Trending) so both pages present categories identically.
export const CATEGORY_PRIORITY: string[] = [
  "Social",
  "NFTs",
  "Community",
  "Art",
  "Music",
  "Fashion",
  "DeFi",
  "Marketplaces",
  "Gaming",
  "DAOs",
  "Staking",
  "AI",
  "Infrastructure",
  "Exchanges",
  "Security",
  "Brands",
];

// Sort a list of category-like objects by CATEGORY_PRIORITY, returning a new
// array. Unknown ids (not present in CATEGORY_PRIORITY) sort last, and ties
// (including two unknowns) break alphabetically by id.
export const sortCategoriesByRelevance = <T extends { id: string }>(
  cats: readonly T[]
): T[] => {
  const priorityIndex = (id: string) => {
    const index = CATEGORY_PRIORITY.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  return [...cats].sort((a, b) => {
    const diff = priorityIndex(a.id) - priorityIndex(b.id);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });
};

// Pseudo-category id/config for the "New" chip shown alongside real
// categories on both the Search and Trending category clouds.
export const NEW_FILTER_ID = "New";
export const NEW_APPS_COUNT = 8;

// Missing/invalid addedAt sorts as -Infinity so those apps land last.
const addedAtTimestamp = (app: App): number => {
  const parsed = app.addedAt ? Date.parse(app.addedAt) : NaN;
  return Number.isNaN(parsed) ? -Infinity : parsed;
};

// Newest-first ordering by addedAt. Stable and non-mutating: spreads the
// input before sorting so apps with missing/invalid addedAt keep their
// relative order at the tail.
export const sortByNewest = (list: App[]): App[] =>
  [...list].sort((a, b) => addedAtTimestamp(b) - addedAtTimestamp(a));

export const getNewestApps = (
  list: App[] = Object.values(apps),
  limit: number = NEW_APPS_COUNT
): App[] => sortByNewest(list).slice(0, limit);
