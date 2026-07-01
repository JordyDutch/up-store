"use client";

import type React from "react";
import {
  BadgePercent,
  Bot,
  BookOpen,
  Brain,
  Coins,
  Gamepad2,
  Globe,
  Landmark,
  Layers3,
  Music,
  Palette,
  Shield,
  Shirt,
  ShoppingCart,
  Star,
  Store,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type CategoryOption = {
  id: string;
  label: string;
  count: number;
  icon?: React.ReactNode;
};

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Art: <Palette className="h-4 w-4" />,
  AI: <Brain className="h-4 w-4" />,
  Brands: <Store className="h-4 w-4" />,
  Community: <Users className="h-4 w-4" />,
  DAOs: <Landmark className="h-4 w-4" />,
  DeFi: <Coins className="h-4 w-4" />,
  Exchanges: <BadgePercent className="h-4 w-4" />,
  Fashion: <Shirt className="h-4 w-4" />,
  Gaming: <Gamepad2 className="h-4 w-4" />,
  Infrastructure: <Layers3 className="h-4 w-4" />,
  Marketplaces: <ShoppingCart className="h-4 w-4" />,
  "Mini-Apps": <Bot className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
  NFTs: <Star className="h-4 w-4" />,
  Security: <Shield className="h-4 w-4" />,
  Social: <Globe className="h-4 w-4" />,
  Staking: <BookOpen className="h-4 w-4" />,
};

interface CategoryChipProps {
  label: string;
  count: number;
  active: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}

export function CategoryChip({ label, count, active, icon, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 grow items-center justify-center gap-1.5 rounded-full border px-2.5 text-[13px] font-medium transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:h-3.5 [&_svg]:w-3.5",
        active
          ? "border-brand bg-brand text-primary-foreground shadow-sm hover:bg-brand-hover dark:text-background dark:hover:bg-brand-hover"
          : "border-border-strong bg-card text-foreground hover:bg-muted dark:bg-muted dark:hover:bg-accent"
      )}
    >
      {icon ? (
        <span className="shrink-0 text-current opacity-70" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums text-[11px]",
          active
            ? "text-primary-foreground/75 dark:text-background/70"
            : "text-text-tertiary"
        )}
      >
        {count}
      </span>
    </button>
  );
}

interface CategoryCloudProps {
  options: CategoryOption[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
}

export default function CategoryCloud({
  options,
  activeId,
  onSelect,
  ariaLabel,
}: CategoryCloudProps) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <CategoryChip
          key={option.id}
          label={option.label}
          count={option.count}
          icon={option.icon}
          active={option.id === activeId}
          onClick={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}
