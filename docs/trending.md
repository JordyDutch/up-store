# App-open tracking & popularity Trending

The store records how often each app is **engaged with** and ranks the
**Trending** section by those counts. Data lives in **Upstash Redis**, so it
survives both a browser refresh and a Vercel redeploy/upgrade (the counts are
external state, not part of the deployment).

## How it works

```
detail-page view ──▶ AppDetailPage useEffect([app?.id]) ──┐
open click ──────────▶ useAppLaunch.openApp ───────────────┼──▶ trackOpen(app.id)
add to grid ─────────▶ useAppLaunch.addToGrid ─────────────┘     │  (sessionStorage dedup: 1×/app/session)
                                                                  ▼
                                          POST /api/track-open  ──▶ recordOpen(appId, ip)
                                                    │                 │ 10-min per-ip+app cooldown
                                                    │                 ▼
                                                    │            HINCRBY app:opens <appId> 1
                                                    ▼
Trending ◀── TopChartsSlider ◀── useTrending() ◀── GET /api/trending ──▶ HGETALL app:opens
   (sortByOpenCount: most-opened first; ties keep the per-reload shuffle order)
```

- **Three tracked entry points, one call each.** Viewing an app's detail page
  (`AppDetailPage`'s mount `useEffect`), launching it externally
  (`useAppLaunch.openApp`), and adding it to the Grid
  (`useAppLaunch.addToGrid`) each call `trackOpen()` directly. Every
  card/row click and every direct `/store/[appId]` URL renders
  `AppDetailPage`, so the detail-page view alone already covers all browse
  paths; `openApp`/`addToGrid` add the two actions that can fire without a
  detail-page visit. All three share the same dedup, so a view + launch + add
  of the same app in one session still counts once total.
- **Two dedup layers.** Client `sessionStorage` (1 per app per session) plus a
  server per-ip+app cooldown (10 min). Tune `COOLDOWN_SECONDS` in
  `src/lib/openCounts.ts`.
- **Only known apps.** `/api/track-open` rejects any `appId` not in the catalog.
- **Graceful fallback.** With no Redis env configured, tracking no-ops and
  Trending falls back to its shuffled order — nothing breaks.

## Setup on Vercel (2 clicks)

1. Vercel project → **Storage** (or **Integrations**) → add **Upstash → Redis**.
2. Link it to this project. The integration injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` into the project's environment automatically.
3. Redeploy. Done — counts start accumulating and Trending self-orders.

### Local development

Copy the REST URL/token from the Upstash console into `.env`:

```
KV_REST_API_URL=https://<your-db>.upstash.io
KV_REST_API_TOKEN=<token>
```

(A manual Upstash setup may instead expose `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` — both naming schemes are accepted.)

## Notes

- Counts are all-time. For a rolling/decaying window, switch the hash to a
  per-day key or a sorted set with periodic decay in `src/lib/openCounts.ts`.
- `GET /api/trending` is CDN-cached for 30s (`s-maxage=30, swr=60`) to keep
  Redis reads cheap; the client fetches it once per load.
