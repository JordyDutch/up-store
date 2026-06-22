# LUKSO UP! Store

LUKSO UP! Store is a community-maintained directory for LUKSO Universal Profile
Mini-Apps. Users can browse apps, open them directly, or add them to a Universal
Profile Grid.

This is the JordyDutch version of the project. It started from the LUKSO
hackathon work by [Heisenburgirs](https://github.com/Heisenburgirs), but the app
now works differently: the catalog is maintained through GitHub pull requests,
the storefront exposes machine-readable data, and Add to Grid works through the
Universal Everything add-widget flow outside the Grid as well.

## What This App Does

- Lists LUKSO Mini-Apps from `src/data/apps.json`.
- Builds app detail pages at `/store/<appId>`.
- Supports category browsing, search, featured apps, screenshots and source-code
  links.
- Adds apps to a Universal Profile Grid with prebuilt
  `universaleverything.io/add-widget` deep links.
- Still supports direct LSP28 The Grid writes when running inside a connected
  Universal Profile Grid context.
- Lets users bookmark apps, Universal Profiles and links. Bookmarks are stored on
  the user's Universal Profile via ERC725Y (custom `UPStoreBookmarks` key, encoded
  as a `VerifiableURI`) — not in a database or browser storage.
- Tracks app opens with optional Upstash Redis storage and ranks Trending from
  those counts.
- Exposes agent-friendly app data through `/api/apps` and `/llms.txt`.

## How The Catalog Works

The catalog is data-driven. Adding or updating apps should usually require no
TypeScript changes.

- App data lives in `src/data/apps.json`.
- App images live in `public/apps/<slug>/`.
- `src/data/appCatalog.ts` loads the JSON, derives image paths, builds featured
  apps, categories and extra widgets, and collapses related product-family
  entries into one store listing.

To update the catalog:

1. Fork this repository.
2. Edit `src/data/apps.json`.
3. Add or update images in `public/apps/<slug>/`.
4. Run the verification commands.
5. Open a pull request.

### Requirements for a new app

Submissions are only merged when **all data is complete and the images are in
place**. Every new app must include:

- **A unique slug** — lowercase and hyphenated (e.g. `awesome-swap`). The
  `apps.json` key and the `public/apps/<slug>/` folder name must be identical.
- **Images** in `public/apps/<slug>/`, PNG only:
  - `logo.png` — square app icon (required)
  - `banner.png` — wide ~16:9 banner (required)
  - **At least one screenshot** — `screenshot-1.png`, `screenshot-2.png`, …
    numbered from `1` with no gaps. Apps without screenshots are not accepted.
- **All required JSON fields, filled in and accurate:**
  - `name` — display name
  - `url` — the live app the **Open** button launches (must actually load)
  - `developer` — shown under the app name
  - `publisher` — the publisher's Universal Profile address (`0x…`)
  - `categories` — one or more from the [valid list](docs/adding-apps.md#valid-categories-must-match-exactly)
  - `gridSize` — `[width, height]`
  - `screenshots` — integer that **equals** the number of `screenshot-N.png`
    files you added (a wrong count produces broken images)
- **Optional but encouraged:** `sourceCode`, `tags`, and extra `widgets`.
- **Valid JSON** (no trailing commas, no comments) that passes both
  verification commands below.

See [docs/adding-apps.md](docs/adding-apps.md) for the exact JSON fields, image
naming rules, the full category list and common mistakes to avoid.

## Contributing

Catalog additions and code changes are both welcome. Read
**[CONTRIBUTING.md](CONTRIBUTING.md)** for the full submission requirements,
local setup, code conventions and the verification/PR flow before opening a pull
request.

## Important Routes

| Route | Purpose |
|---|---|
| `/` | Main discovery experience |
| `/store` | Full searchable app directory |
| `/store/<appId>` | Shareable app detail page with structured data |
| `/search?q=<term>&category=<Category>` | Search and category deep links |
| `/bookmarks` | The user's saved apps, profiles and links (stored on their Universal Profile) |
| `/api/apps` | Machine-readable catalog JSON with absolute URLs and Add to Grid links |
| `/api/track-open` | Best-effort open tracking endpoint |
| `/api/trending` | Open-count data used by Trending |
| `/llms.txt` | LLM-friendly catalog overview |

## Add To Grid

The current default Add to Grid action uses Universal Everything's add-widget
route:

```text
https://universaleverything.io/add-widget?data=<URL-encoded widget JSON>
```

The widget JSON shape is:

```json
{
  "properties": {
    "src": "https://example-mini-app.xyz"
  },
  "type": "IFRAME",
  "width": 1,
  "height": 1
}
```

The app builds these links in `src/lib/addToGrid.ts`. Each serialized app in
`/api/apps` includes a ready-to-use `addToGridUrl`.

When the store is running inside a Universal Profile Grid and the wallet context
is connected, `useInstallApp` can write updated LSP28 The Grid metadata directly:
it updates the local grid sections, uploads the new metadata to IPFS through
Pinata, encodes the VerifiableURI with ERC725.js, and calls `setData` on the
Universal Profile.

## Trending And Open Tracking

App opens are recorded through `useAppLaunch.openApp`, which calls
`trackOpen(app.id)` before opening the app in a new tab.

Tracking is optional:

- Without Redis env vars, tracking no-ops and the store still works.
- With Upstash Redis configured, `/api/track-open` stores counts in the
  `app:opens` hash.
- Client session storage deduplicates one open per app per browser session.
- The server adds a 10-minute per-IP/app cooldown.
- `/api/trending` returns the counts used by the Trending section.

See [docs/trending.md](docs/trending.md) for setup details.

## Environment Variables

Create `.env` with the services you need.

```env
# Required for direct LSP28 Grid metadata uploads through Pinata.
PINATA_JWT=
NEXT_PUBLIC_GATEWAY_URL=

# Used for absolute URLs in metadata, sitemap, /api/apps and /llms.txt.
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Used by Apollo Client to fetch Universal Profile publisher metadata.
NEXT_PUBLIC_UNIVERSAL_GRAPH_URL=

# Optional: Upstash Redis for open tracking and Trending.
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Also accepted for manual Upstash setups:
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
```

For LUKSO mainnet profile data, `NEXT_PUBLIC_UNIVERSAL_GRAPH_URL` is normally:

```text
https://envio.lukso-mainnet.universal.tech/v1/graphql
```

## Local Development

```bash
git clone https://github.com/JordyDutch/up-store.git
cd up-store
npm install
npm run dev
```

The app runs on the Next.js dev server, usually `http://localhost:3000`.

## Verification

Before opening a pull request, run:

```bash
npx tsc --noEmit
npm run build
```

For code changes, also run:

```bash
npm run lint
```

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- LUKSO UP Provider
- viem
- ERC725.js
- Apollo Client
- Pinata
- Upstash Redis

## Project Status

This repository is focused on the live JordyDutch UP! Store flow:

- community catalog updates through pull requests;
- app discovery and Add to Grid links for users;
- machine-readable catalog data for agents and integrations;
- optional analytics-backed Trending without making tracking a hard dependency.
