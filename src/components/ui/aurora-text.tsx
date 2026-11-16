import { memo, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AuroraTextProps {
  children: ReactNode;
  className?: string;
  /** Colors the aurora cycles through. */
  colors?: string[];
  /** Higher = faster (1 = 10s cycle). */
  speed?: number;
}

/** Magic UI aurora text: shifting multi-color fill (no movement of the letters). Still when reduced motion is preferred. */
export const AuroraText = memo(function AuroraText({ children, className, colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"], speed = 1 }: AuroraTextProps) {
  const style = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
    animationDuration: `${10 / speed}s`,
  } as CSSProperties;
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="sr-only">{children}</span>
      <span className="aurora-text" style={style} aria-hidden="true">{children}</span>
    </span>
  );
});
