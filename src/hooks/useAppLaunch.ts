"use client";

import { useCallback } from "react";
import { useInstallApp } from "./useInstallApp";
import { useUpProvider } from "@/app/components/providers/upProvider";
import { App, AppWidget } from "@/data/appCatalog";
import { getAddToGridUrl, getWidgetAddToGridUrl } from "@/lib/addToGrid";
import { trackOpen } from "@/lib/trackOpen";

export type PrimaryActionKind = "open" | "install";

export interface PrimaryAction {
  kind: PrimaryActionKind;
  label: string; // "Open" | "Add to Grid"
  run: (app: App) => void; // openApp(app) or addToGrid(app)
}

export interface UseAppLaunch {
  // context
  canInstallToGrid: boolean; // walletConnected && isMiniApp (direct write path)
  isInGridContext: boolean; // alias of canInstallToGrid for readability
  // actions
  openApp: (app: App) => void; // opens app.app.url in a new top-level tab
  // Add a whole app (or one specific widget) to the Grid: direct write in-grid,
  // else the UE add-widget deep link.
  addToGrid: (app: App, widget?: AppWidget) => void;
  getAddToGridUrl: (app: App) => string; // primary-surface add-widget deep link
  getWidgetAddToGridUrl: (widget: AppWidget) => string; // per-widget deep link
  // resolver: single source of truth for "what is the primary button"
  getPrimaryAction: (app: App) => PrimaryAction;
  // secondary action: the other of Open / Add-to-Grid
  getSecondaryAction: (app: App) => PrimaryAction | null;
  // passthrough of the existing install flow (kept intact)
  handleInstall: (app: App, widget?: AppWidget) => Promise<void>;
  handleUninstall: (app: App) => Promise<void>;
  isInstalled: (app: App, widget?: AppWidget) => boolean;
  isInstalling: boolean;
  isUninstalling: boolean;
  // GridSelectionDialog wiring (passed straight through from useInstallApp)
  showGridSelection: boolean;
  setShowGridSelection: (v: boolean) => void;
  pendingApp: App | null;
  pendingWidget: AppWidget | null;
  handleGridSelect: (gridIndex: number) => void;
  handleGridSelectionCancel: () => void;
}

export function useAppLaunch(): UseAppLaunch {
  const install = useInstallApp();
  const { walletConnected, isMiniApp } = useUpProvider();

  const canInstallToGrid = walletConnected && isMiniApp;

  const openApp = useCallback((app: App) => {
    const url = app?.app?.url;
    if (!url) return;
    // Record the open before launching — every open path funnels through here,
    // and the store tab stays alive (new tab), so the signal reliably lands.
    trackOpen(app?.id);
    // "_blank" so launching never replaces the store/grid iframe content.
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // Add-to-Grid works everywhere now. Inside the Grid we write LSP28TheGrid
  // directly (the existing install flow). Anywhere else — including standalone
  // desktop — we hand off to universaleverything.io's add-widget flow, which
  // handles connect → choose Grid → add. So "Add to Grid" is no longer
  // gated to the in-Grid (mobile) context.
  const addToGrid = useCallback(
    (app: App, widget?: AppWidget) => {
      // Add to Grid counts as an engagement too (deduped in trackOpen).
      trackOpen(app?.id);
      if (canInstallToGrid) {
        install.handleInstall(app, widget);
        return;
      }
      const url = widget?.url ?? app?.app?.url;
      if (!url) return;
      const deepLink = widget ? getWidgetAddToGridUrl(widget) : getAddToGridUrl(app);
      window.open(deepLink, "_blank", "noopener,noreferrer");
    },
    [canInstallToGrid, install.handleInstall]
  );

  // Add to Grid is the store's primary action on every surface; Open is the
  // secondary. (The mechanism behind Add to Grid differs by context — see above.)
  const getPrimaryAction = useCallback(
    (_app: App): PrimaryAction => ({
      kind: "install",
      label: "Add to Grid",
      run: addToGrid,
    }),
    [addToGrid]
  );

  const getSecondaryAction = useCallback(
    (_app: App): PrimaryAction => ({ kind: "open", label: "Open", run: openApp }),
    [openApp]
  );

  return {
    canInstallToGrid,
    isInGridContext: canInstallToGrid,
    openApp,
    addToGrid,
    getAddToGridUrl,
    getWidgetAddToGridUrl,
    getPrimaryAction,
    getSecondaryAction,
    handleInstall: install.handleInstall,
    handleUninstall: install.handleUninstall,
    isInstalled: install.isInstalled,
    isInstalling: install.isInstalling,
    isUninstalling: install.isUninstalling,
    showGridSelection: install.showGridSelection,
    setShowGridSelection: install.setShowGridSelection,
    pendingApp: install.pendingApp,
    pendingWidget: install.pendingWidget,
    handleGridSelect: install.handleGridSelect,
    handleGridSelectionCancel: install.handleGridSelectionCancel,
  };
}
