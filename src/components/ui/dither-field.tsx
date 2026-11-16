import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type DitherPattern = "horizon" | "waves";

export interface DitherFieldProps extends Omit<ComponentPropsWithoutRef<"div">, "color"> {
  /** "horizon": light rising from the bottom edge. "waves": soft moving bands across the field. */
  pattern?: DitherPattern;
  /** One color, or several from faint to bright (e.g. ["var(--dither-low)", "var(--dither-mid)", "var(--dither-high)"]). CSS variables are resolved. */
  color?: string | string[];
  /** Size of one dither dot in CSS px. */
  pixelSize?: number;
  /** Animation speed multiplier (0 = still). */
  speed?: number;
  /** Brighten the field around the pointer. */
  interactive?: boolean;
}

// 4x4 Bayer matrix, normalized to 0..1 thresholds.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** Resolve any CSS color (including var(--x)) to a value canvas understands, in the element's context. */
function resolveColors(el: HTMLElement, colors: string[]) {
  const probe = document.createElement("span");
  probe.style.display = "none";
  el.appendChild(probe);
  const out = colors.map((c) => { probe.style.color = ""; probe.style.color = c; return getComputedStyle(probe).color || c; });
  probe.remove();
  return out;
}

/**
 * Magic UI-style ordered-dither field: animated light drawn one dot at a time, behind its children.
 * Follows the pointer, pauses off-screen, and renders a still frame when reduced motion is preferred.
 * The element's own background shows between the dots.
 */
export function DitherField({ children, className, pattern = "horizon", color = ["var(--primary)"], pixelSize = 4, speed = 1, interactive = true, ...props }: DitherFieldProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const colorKey = Array.isArray(color) ? color.join("|") : color;

  useEffect(() => {
    const el = wrap.current, cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || speed === 0;
    let palette = resolveColors(el, colorKey.split("|"));
    let w = 0, h = 0, raf = 0, visible = true, t = 0;
    const pointer = { x: -1, y: -1, s: 0 }; // s eases the glow in and out

    const resize = () => {
      w = Math.max(1, Math.ceil(el.clientWidth / pixelSize));
      h = Math.max(1, Math.ceil(el.clientHeight / pixelSize));
      cv.width = w; cv.height = h;
    };
    const field = (u: number, v: number) => {
      let f: number;
      if (pattern === "horizon") {
        const ridge = 0.06 * Math.sin(u * 7 + t * 0.7) + 0.04 * Math.sin(u * 15 - t * 1.1);
        f = Math.pow(Math.max(0, v - 0.25 + ridge), 1.35) * 1.55;
        f += 0.06 * Math.sin(u * 22 + v * 9 - t * 1.6);
      } else {
        f = 0.45 + 0.25 * Math.sin(u * 6 + t * 0.6) + 0.18 * Math.sin(v * 5 - t * 0.45 + u * 3) + 0.12 * Math.sin((u + v) * 9 + t * 0.9);
        f *= 0.2 + 0.8 * u;
      }
      if (pointer.s > 0.01) {
        const dx = (u - pointer.x) * (w / h), dy = v - pointer.y;
        f += pointer.s * 0.55 * Math.exp(-(dx * dx + dy * dy) / 0.035);
      }
      return Math.min(1, Math.max(0, f));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const n = palette.length;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const level = field(x / w, y / h) * n;
          let i = Math.floor(level);
          if (level - i > BAYER[(y & 3) * 4 + (x & 3)]) i++;
          if (i <= 0) continue;
          ctx.fillStyle = palette[Math.min(n, i) - 1];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    };
    const loop = () => {
      if (visible) {
        t += 0.016 * speed;
        pointer.s += ((pointer.x >= 0 ? 1 : 0) - pointer.s) * 0.08;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => { const r = el.getBoundingClientRect(); pointer.x = (e.clientX - r.left) / r.width; pointer.y = (e.clientY - r.top) / r.height; };
    const onLeave = () => { pointer.x = -1; };
    // Re-read colors when the theme (class / data-theme on <html>) changes.
    const mo = new MutationObserver(() => { palette = resolveColors(el, colorKey.split("|")); if (still) draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });

    resize(); draw();
    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    if (!still) {
      if (interactive) { el.addEventListener("pointermove", onMove); el.addEventListener("pointerleave", onLeave); }
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect();
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
    };
  }, [pattern, colorKey, pixelSize, speed, interactive]);

  return (
    <div ref={wrap} className={cn("relative isolate overflow-hidden", className)} {...props}>
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full [image-rendering:pixelated]" />
      {children}
    </div>
  );
}
