import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface BorderBeamProps {
  className?: string;
  /** Length of the light beam in px. */
  size?: number;
  /** Seconds for one trip around the border. */
  duration?: number;
  borderWidth?: number;
  /** Where along the beam the glow is anchored (0–100). */
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  /** Seconds to offset the start (useful for several beams). */
  delay?: number;
}

/**
 * Magic UI-style light that travels around the border of its parent.
 * Put it inside an element with `position: relative` and a border radius; it inherits the radius.
 * CSS-only (no animation library); stays still when the user prefers reduced motion.
 */
export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "oklch(0.78 0.15 145)",
  colorTo = "oklch(0.6 0.15 230)",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("border-beam", className)}
      style={
        {
          "--size": size,
          "--duration": `${duration}s`,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as CSSProperties
      }
    />
  );
}
