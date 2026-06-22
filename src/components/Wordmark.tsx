import Image from "next/image";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  /** Renders a larger lockup for loading / hero contexts. */
  size?: "sm" | "md" | "lg";
}

export function Wordmark({ className, size = "md" }: WordmarkProps) {
  const dimensions = {
    sm: "h-8 w-8",
    md: "h-9 w-9 md:h-10 md:w-10",
    lg: "h-20 w-20 md:h-24 md:w-24",
  }[size];

  return (
    <span
      className={cn("relative inline-flex shrink-0 select-none", dimensions, className)}
      aria-label="UP! Store"
    >
      <Image
        src="/brand/upstore-wordmark.webp"
        alt="UP! Store"
        width={512}
        height={512}
        priority
        className="h-full w-full object-contain"
        sizes={size === "lg" ? "96px" : "40px"}
      />
    </span>
  );
}

export default Wordmark;
