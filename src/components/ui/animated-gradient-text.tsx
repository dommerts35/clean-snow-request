import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Color pairs tuned for contrast on each background the site uses. */
export const GRADIENT_PRESETS = {
  /** Light page backgrounds (headings). */
  light: { colorFrom: "oklch(0.5 0.14 150)", colorTo: "oklch(0.45 0.15 255)" },
  /** Dark photo overlays (hero). */
  dark: { colorFrom: "oklch(0.86 0.17 145)", colorTo: "oklch(0.86 0.12 205)" },
  /** Text on the green primary button. */
  onPrimary: { colorFrom: "oklch(0.2 0.045 163)", colorTo: "oklch(0.3 0.12 255)" },
} as const;

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<"span"> {
  /** Higher = the gradient band is wider and moves more slowly across the text. */
  speed?: number;
  colorFrom?: string;
  colorTo?: string;
  /** Shortcut for a preset color pair; colorFrom/colorTo win when given. */
  tone?: keyof typeof GRADIENT_PRESETS;
}

/** Text filled with a slowly moving two-color gradient (Magic UI pattern). Static when the user prefers reduced motion. */
export function AnimatedGradientText({ children, className, style, speed = 1, tone = "light", colorFrom, colorTo, ...props }: AnimatedGradientTextProps) {
  const preset = GRADIENT_PRESETS[tone];
  return (
    <span
      className={cn("animated-gradient-text", className)}
      style={{
        "--bg-size": `${speed * 300}%`,
        "--color-from": colorFrom ?? preset.colorFrom,
        "--color-to": colorTo ?? preset.colorTo,
        ...style,
      } as CSSProperties}
      {...props}
    >
      {children}
    </span>
  );
}
