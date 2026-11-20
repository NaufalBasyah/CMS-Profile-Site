/**
 * Fades content up as it scrolls into view, like Motion Primitives' InView, but
 * done in CSS (scroll-driven animation, see .reveal in globals.css). No JavaScript,
 * no hydration mismatch, and content is simply visible in browsers without
 * support or for visitors who prefer reduced motion.
 */
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function InView({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  return (
    <Tag className={cn("reveal", className)} style={{ "--reveal-delay": `${delay * 8}%` } as CSSProperties}>
      {children}
    </Tag>
  );
}
