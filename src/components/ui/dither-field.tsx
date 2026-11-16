import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface DitherFieldProps extends ComponentPropsWithoutRef<"div"> {
  /** Size of one dither pixel in CSS px. */
  pixelSize?: number;
  /** Background color (behind the dots). */
  background?: string;
  /** Dot color. */
  color?: string;
  /** Animation speed multiplier (0 = still). */
  speed?: number;
}

// 4x4 Bayer matrix, normalized to 0..1 thresholds.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/**
 * Animated ordered-dither background (moving soft waves rendered as pixel dots), with content on top.
 * Canvas-based, no dependencies. Still frame when the user prefers reduced motion; pauses off-screen.
 */
export function DitherField({ children, className, pixelSize = 4, background = "oklch(0.16 0.035 172)", color = "oklch(0.78 0.15 145)", speed = 1, ...props }: DitherFieldProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current, cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || speed === 0;
    let w = 0, h = 0, raf = 0, visible = true, t = Math.random() * 100;

    const resize = () => {
      w = Math.max(1, Math.ceil(el.clientWidth / pixelSize));
      h = Math.max(1, Math.ceil(el.clientHeight / pixelSize));
      cv.width = w; cv.height = h;
    };
    const draw = () => {
      ctx.fillStyle = background; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w, v = y / h;
          // Soft moving waves, brighter toward the right so text on the left stays readable.
          let f = 0.5 + 0.25 * Math.sin(u * 6 + t * 0.6) + 0.2 * Math.sin(v * 5 - t * 0.45 + u * 3) + 0.15 * Math.sin((u + v) * 9 + t * 0.9);
          f *= 0.15 + 0.85 * u;
          if (f > BAYER[(y & 3) * 4 + (x & 3)]) ctx.fillRect(x, y, 1, 1);
        }
      }
    };
    const loop = () => { if (visible) { t += 0.016 * speed; draw(); } raf = requestAnimationFrame(loop); };

    resize(); draw();
    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    if (!still) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [pixelSize, background, color, speed]);

  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)} {...props}>
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full [image-rendering:pixelated]" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
