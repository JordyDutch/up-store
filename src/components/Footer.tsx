import { ArrowUpRight, BookOpen, Github, GitPullRequestArrow } from "lucide-react";

import { Wordmark } from "@/components/Wordmark";

/**
 * Site footer.
 *
 * Two jobs: (1) point people at the GitHub repo, and (2) make the contribution
 * path obvious — this catalog is community-maintained, so adding or editing an
 * app happens through a pull request. Purely presentational (no client state),
 * so it stays a server component and renders at the bottom of the list pages.
 */

const REPO_URL = "https://github.com/JordyDutch/up-store/";
// Step-by-step guide for adding an app, on the default branch.
const GUIDE_URL = "https://github.com/JordyDutch/up-store/blob/master/docs/adding-apps.md";
// Lands on the repo's PR list with the "New pull request" button in reach.
const PR_URL = "https://github.com/JordyDutch/up-store/pulls";

export function Footer() {
  return (
    <footer className="relative z-10 mt-8 border-t border-border bg-background/60">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 pb-safe-content md:px-6 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr] md:gap-12">
          {/* Brand + one-line about + GitHub link */}
          <div>
            <Wordmark />
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-text-secondary">
              An open, community-built catalog of Mini-Apps for your LUKSO
              Universal Profile. Open any app instantly, or add it to your Grid.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-text transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              View the source on GitHub
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          {/* Contribute — the info heading: how to add or change an app */}
          <div className="md:justify-self-end">
            <p className="eyebrow">Contribute</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
              Add or update an app
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-secondary">
              This catalog is maintained openly on GitHub. Want to list your app
              or fix a detail? Open a pull request — the guide below walks through
              every step.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost-outline"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Adding-apps guide
              </a>
              <a
                href={PR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brand"
              >
                <GitPullRequestArrow className="h-4 w-4" aria-hidden="true" />
                Open a pull request
              </a>
            </div>
          </div>
        </div>

        {/* Baseline row */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-text-tertiary sm:flex-row sm:items-center sm:justify-between">
          <p>Built with care for the LUKSO community.</p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            github.com/JordyDutch/up-store
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
