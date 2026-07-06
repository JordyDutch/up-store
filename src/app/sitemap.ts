import type { MetadataRoute } from "next";

import { apps } from "@/data/appCatalog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/store`, changeFrequency: "daily", priority: 0.9 },
  ];

  const appRoutes: MetadataRoute.Sitemap = Object.values(apps)
    .filter((app) => app.id)
    .map((app) => ({
      url: `${siteUrl}/store/${encodeURIComponent(app.id as string)}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...appRoutes];
}
