import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/** Magic UI-style dock: icons grow as the pointer gets close, like the macOS dock. No animation library needed. */

type DockCtx = { pointerX: number | null; size: number; magnification: number; distance: number };
const DockContext = createContext<DockCtx>({
  pointerX: null,
  size: 40,
  magnification: 60,
  distance: 140,
});

export interface DockProps extends ComponentPropsWithoutRef<"div"> {
  /** Resting icon size in px. */
  iconSize?: number;
  /** Size in px of the icon right under the pointer. */
  iconMagnification?: number;
  /** How far (px) from the pointer icons still grow. */
  iconDistance?: number;
  /** Vertical alignment of icons while they grow. */
  direction?: "top" | "middle" | "bottom";
  /** Turn magnification off. */
  disableMagnification?: boolean;
}

export function Dock({
  children,
  className,
  iconSize = 40,
  iconMagnification = 60,
  iconDistance = 140,
  direction = "middle",
  disableMagnification = false,
  ...props
}: DockProps) {
  const [pointerX, setPointerX] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const magnify = !disableMagnification && !reduced;
  return (
    <DockContext.Provider
      value={{
        pointerX: magnify ? pointerX : null,
        size: iconSize,
        magnification: iconMagnification,
        distance: iconDistance,
      }}
    >
      <div
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") setPointerX(e.clientX);
        }}
        onPointerLeave={() => setPointerX(null)}
        className={cn(
          "mx-auto flex w-max gap-2 rounded-2xl border border-border bg-background/70 p-2 backdrop-blur-md",
          direction === "top"
            ? "items-start"
            : direction === "bottom"
              ? "items-end"
              : "items-center",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}

export interface DockIconProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

export function DockIcon({ children, className, style, ...props }: DockIconProps) {
  const { pointerX, size, magnification, distance } = useContext(DockContext);
  const ref = useRef<HTMLDivElement>(null);
  let current = size;
  if (pointerX !== null && ref.current) {
    const r = ref.current.getBoundingClientRect();
    const d = Math.abs(pointerX - (r.left + r.width / 2));
    if (d < distance)
      current = size + ((magnification - size) * (Math.cos((d / distance) * Math.PI) + 1)) / 2;
  }
  return (
    <div
      ref={ref}
      style={{ width: current, height: current, ...style }}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-[10px] transition-[width,height] duration-150 ease-out",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
