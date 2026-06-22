# Contributing to LUKSO UP! Store

Thanks for helping improve the **LUKSO UP! Store** — the community-maintained
directory of LUKSO Universal Profile Mini-Apps. There are two main ways to
contribute:

1. **Add or update an app in the catalog** — the most common contribution. No
   TypeScript required: edit one JSON file and drop in a few images.
2. **Improve the app itself** — fixes and features for the Next.js storefront.

By contributing you agree that your contribution is provided under the same
license as this repository.

---

## Catalog contributions (add or update an app)

This is data-driven, so adding an app should require **no code changes**.

1. Fork [`JordyDutch/up-store`](https://github.com/JordyDutch/up-store/).
2. Add images to `public/apps/<slug>/` (`logo.png`, `banner.png`,
   `screenshot-1.png`, …). PNG only, exact names.
3. Add one entry, keyed by `<slug>`, to `src/data/apps.json`.
4. Run the [verification](#verification) commands.
5. Open a pull request.

### Submission requirements

PRs are only merged when **every field is complete and the images are present**.
Your app must include:

- [ ] A **unique slug** — lowercase, hyphenated. The `apps.json` key and the
      `public/apps/<slug>/` folder name are identical.
- [ ] **`logo.png`** — square app icon (PNG, required).
- [ ] **`banner.png`** — wide ~16:9 banner (PNG, required).
- [ ] **At least one screenshot** — `screenshot-1.png`, `screenshot-2.png`, …
      PNG, numbered from `1` with no gaps. **Apps without screenshots are not
      accepted.**
- [ ] **All required JSON fields, filled in and accurate:** `name`, `url` (the
      live app — verify it loads), `developer`, `publisher` (UP address `0x…`),
      `categories` (1+ from the valid list), `gridSize`, and `screenshots`
      (count equal to the number of `screenshot-N.png` files).
- [ ] **Valid JSON** — no trailing commas, no comments — that passes both
      verification commands.

Optional but encouraged: `sourceCode`, `tags`, and extra `widgets`.

The full field reference, image rules and valid category list live in
**[docs/adding-apps.md](docs/adding-apps.md)** — read it before editing
`apps.json`. A few things worth calling out:

- **Slug must match.** The JSON key and the `public/apps/<slug>/` folder name
  have to be identical.
- **`screenshots` must equal the file count**, numbered `screenshot-1.png`
  upward with no gaps.
- **Categories must match the valid list exactly** (see the docs). Introducing a
  brand-new category is the one case that needs a code edit, in
  `src/data/appCatalog.ts`.
- **`featured`** is an eligibility flag for the home hero carousel — keep it for
  official and genuinely notable apps; it is not a default-on field.
- **Same-publisher apps whose names share the part before the `:`** are merged
  into a single listing. Use distinct names for separate listings, or one entry
  plus `widgets` for variants.

Nothing changes in the live store until a maintainer merges your PR, so it is
safe to experiment.

---

## Code contributions

### Prerequisites

- Node.js 18.18+ (Next.js requirement)
- npm (this repo ships a `package-lock.json`; please don't switch package
  managers in a PR)

### Local setup

```bash
git clone https://github.com/JordyDutch/up-store.git
cd up-store
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`. Copy the env vars you need from
the [README](README.md#environment-variables) into a `.env` file — the app runs
without most of them (tracking, Pinata and profile metadata degrade gracefully).

### Project layout

| Path | What lives here |
|---|---|
| `src/app/` | Next.js App Router routes, layout and API endpoints |
| `src/components/` | React UI components |
| `src/data/apps.json` | The app catalog (data only) |
| `src/data/appCatalog.ts` | Loader that expands the catalog into UI shapes |
| `src/lib/`, `src/utils/`, `src/hooks/` | Shared logic, helpers and hooks |
| `public/apps/<slug>/` | Per-app images |
| `docs/` | Catalog, trending and audit docs |

### Conventions

- **TypeScript everywhere**, matching the surrounding style — no `any` unless
  there is no reasonable alternative.
- **Match the existing code.** Mirror nearby naming, comment density and
  patterns rather than introducing a new style.
- **Brand name:** always write **`UP! Store`** (with the space) in user-facing
  copy, comments and docs. Do **not** rename code identifiers such as the
  `UPStoreBookmarks` ERC725Y key or the `upstore:` storage-key prefixes —
  changing those breaks existing users' saved data.
- Keep accessibility intact (labels, `aria-*`, focus states) when touching UI.
- Don't reformat or churn unrelated files in a feature PR.

---

## Verification

Run these before opening any PR. Both must pass:

```bash
npx tsc --noEmit   # validates types and the catalog shape
npm run build      # confirms it compiles and images resolve
```

For code changes (not catalog-only PRs), also run:

```bash
npm run lint
```

Avoid using `npm run dev` as a verification step — it's a long-running server,
not a check.

---

## Pull requests

- Keep PRs focused: one app, one fix or one feature per PR where practical.
- Write a clear title and describe **what** changed and **why**.
- For catalog PRs, confirm the live `url` actually loads and the images render.
- Link any related issue.
- Expect a maintainer review; the change goes live in the store when it's merged.

## Reporting issues

Found a wrong detail, a broken link or a bug, but don't want to edit yourself?
[Open an issue](https://github.com/JordyDutch/up-store/issues) describing the
problem (and the app slug, for catalog issues). A PR with the fix is even more
welcome.

Thanks for contributing! 🎉
