import { NextResponse } from "next/server";

import { serializeCatalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

// The catalog is build-time static data, so this can be prerendered and cached.
export const dynamic = "force-static";

/**
 * Machine-readable app catalog for agents, integrations and LLMs.
 *
 * Each app includes absolute URLs and a ready-to-use `addToGridUrl` — the
 * universaleverything.io add-widget deep link that adds the Mini-App to a
 * Universal Profile Grid (works on desktop and mobile).
 */
export async function GET() {
  const apps = serializeCatalog();

  return NextResponse.json(
    {
      name: "LUKSO UP! Store",
      description:
        "Discover Mini-Apps for your LUKSO Universal Profile. Open any app, or add it to your Universal Profile Grid.",
      website: siteUrl,
      docs: "https://docs.lukso.tech/learn/mini-apps/add-mini-app-to-grid",
      addToGrid: {
        howto:
          "Open `addToGridUrl` (or build it: https://universaleverything.io/add-widget?data=<URL-encoded widget JSON>). The flow connects the user's Universal Profile and adds the Mini-App to a chosen Grid.",
        widgetShape: {
          properties: { src: "<app url>" },
          type: "IFRAME",
          width: "<grid columns>",
          height: "<grid rows>",
        },
      },
      count: apps.length,
      apps,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
