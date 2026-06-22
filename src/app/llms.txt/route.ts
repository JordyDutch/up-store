import { serializeCatalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

// Build-time static — regenerated on deploy when the catalog changes.
export const dynamic = "force-static";

/**
 * /llms.txt — an LLM- and agent-friendly overview of the store.
 * Follows the https://llmstxt.org convention: H1 title, a blockquote summary,
 * then link sections. Includes the full app list with one-click add-to-grid
 * deep links so an agent can act, not just read.
 */
export async function GET() {
  const apps = serializeCatalog();

  const appLines = apps
    .map((a) => {
      const cats = a.categories.length ? ` — ${a.categories.join(", ")}` : "";
      // a.widgets[0] is the primary surface (already shown as "Add to Grid");
      // list any extra widgets the app offers.
      const extras = a.widgets.slice(1);
      const widgetLines = extras.length
        ? "\n" +
          extras
            .map(
              (w) =>
                `  - Widget "${w.name}" (${w.gridSize.width}×${w.gridSize.height}): ${w.url} — Add to Grid: ${w.addToGridUrl}`
            )
            .join("\n")
        : "";
      return `- [${a.name}](${a.detailUrl})${cats}\n  - Open: ${a.appUrl}\n  - Add to Grid: ${a.addToGridUrl}${widgetLines}`;
    })
    .join("\n");

  const body = `# LUKSO UP! Store

> A storefront for Mini-Apps that run on LUKSO Universal Profiles. Browse and search apps, open any of them instantly, or add one to your Universal Profile "Grid" (LSP-28 The Grid) on universaleverything.io — from desktop or mobile.

LUKSO UP! Store lists ${apps.length} Mini-Apps. Every app can be:
- **Opened** directly at its app URL, or
- **Added to a Universal Profile Grid** via the universaleverything.io add-widget flow.

## How to add a Mini-App to a Grid

Link the user to the add-widget route with a URL-encoded \`data\` parameter holding the Grid widget JSON:

\`\`\`
https://universaleverything.io/add-widget?data=<URL-encoded widget JSON>
\`\`\`

Widget JSON shape:

\`\`\`json
{ "properties": { "src": "<app url>" }, "type": "IFRAME", "width": <grid columns>, "height": <grid rows> }
\`\`\`

The flow asks the user to connect their Universal Profile, choose a Grid, and adds the Mini-App. Each app below already has a ready-to-use \`Add to Grid\` link. Reference: https://docs.lukso.tech/learn/mini-apps/add-mini-app-to-grid

## Machine-readable data

- [Apps catalog (JSON)](${siteUrl}/api/apps): every app with absolute URLs, categories, grid size, and ready-to-use add-to-grid links.

## Pages

- [Home / Discover](${siteUrl}/)
- [Store directory](${siteUrl}/store)
- [Search](${siteUrl}/search) — deep-linkable via \`?q=<term>\` and \`?category=<Category>\`
- [Bookmarks](${siteUrl}/bookmarks) — saved apps, profiles, and links, stored on the user's Universal Profile (ERC725Y), not a database or browser storage; requires a connected Universal Profile

## Apps

${appLines}
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
