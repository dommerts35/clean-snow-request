import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GlobeMarker {
  /** [latitude, longitude] in degrees. */
  location: [number, number];
  /** Relative marker size (default 1). */
  size?: number;
}

export interface GlobeProps {
  className?: string;
  markers?: GlobeMarker[];
  /** [latitude, longitude] turned toward the viewer at start. Defaults to the first marker. */
  focus?: [number, number];
  /** Number of dots on the sphere. */
  dots?: number;
  dotColor?: string;
  markerColor?: string;
  glowColor?: string;
  /** Auto-rotation speed (0 = still). */
  speed?: number;
}

const DEG = Math.PI / 180;

/**
 * Magic UI-style dotted globe that slowly turns and can be dragged. Canvas-based, no dependencies.
 * Still when the user prefers reduced motion; pauses off-screen.
 */
export function Globe({ className, markers = [{ location: [40.81, -74.22], size: 1 }], focus, dots = 2600, dotColor = "oklch(0.38 0.07 165)", markerColor = "oklch(0.78 0.15 145)", glowColor = "oklch(0.78 0.15 145 / 0.18)", speed = 1 }: GlobeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const markerKey = JSON.stringify(markers);
  const focusKey = JSON.stringify(focus ?? markers[0]?.location ?? [20, 0]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const ms: GlobeMarker[] = JSON.parse(markerKey);
    const [fLat, fLng] = JSON.parse(focusKey) as [number, number];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || speed === 0;

    // Evenly spread dots (Fibonacci sphere).
    const pts: [number, number, number][] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < dots; i++) {
      const y = 1 - (i / (dots - 1)) * 2, r = Math.sqrt(1 - y * y), a = golden * i;
      pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    const toVec = ([lat, lng]: [number, number]): [number, number, number] => [Math.cos(lat * DEG) * Math.sin(lng * DEG), Math.sin(lat * DEG), Math.cos(lat * DEG) * Math.cos(lng * DEG)];
    const mVecs = ms.map((m) => ({ v: toVec(m.location), s: m.size ?? 1 }));

    let rot = -fLng * DEG, tilt = fLat * DEG * 0.6, raf = 0, visible = true, t = 0, size = 0, dpr = 1;
    let drag: { x: number; y: number; rot: number; tilt: number } | null = null;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      size = cv.clientWidth;
      cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr);
    };
    const project = ([x, y, z]: [number, number, number]) => {
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const x1 = x * cr + z * sr, z1 = -x * sr + z * cr;
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      return [x1, y * ct - z1 * st, y * st + z1 * ct] as const;
    };
    const draw = () => {
      const W = size * dpr, R = W * 0.46, c = W / 2;
      ctx.clearRect(0, 0, W, W);
      const g = ctx.createRadialGradient(c, c, R * 0.6, c, c, R * 1.08);
      g.addColorStop(0, "transparent"); g.addColorStop(1, glowColor);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R * 1.08, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = dotColor;
      const dot = Math.max(1.5, W / 210);
      for (const p of pts) {
        const [x, y, z] = project(p);
        if (z <= 0) continue;
        ctx.globalAlpha = 0.2 + 0.8 * z;
        ctx.fillRect(c + x * R - dot / 2, c - y * R - dot / 2, dot, dot);
      }
      ctx.globalAlpha = 1;
      for (const m of mVecs) {
        const [x, y, z] = project(m.v);
        if (z <= 0.05) continue;
        const px = c + x * R, py = c - y * R, base = W * 0.018 * m.s;
        const pulse = (t * 0.8) % 1;
        ctx.strokeStyle = markerColor; ctx.lineWidth = dpr * 1.5;
        ctx.globalAlpha = (1 - pulse) * z; ctx.beginPath(); ctx.arc(px, py, base * (1 + pulse * 3), 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = z; ctx.fillStyle = markerColor; ctx.beginPath(); ctx.arc(px, py, base, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const loop = () => {
      if (visible) { t += 0.016; if (!drag) rot += 0.0025 * speed; draw(); }
      raf = requestAnimationFrame(loop);
    };

    const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, rot, tilt }; cv.setPointerCapture(e.pointerId); cv.style.cursor = "grabbing"; };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      rot = drag.rot + (e.clientX - drag.x) * 0.008;
      tilt = Math.max(-1.1, Math.min(1.1, drag.tilt + (e.clientY - drag.y) * 0.006));
      if (still) draw();
    };
    const up = () => { drag = null; cv.style.cursor = "grab"; };

    resize(); draw();
    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    if (!still) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      cv.removeEventListener("pointerdown", down); cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up); cv.removeEventListener("pointercancel", up);
    };
  }, [markerKey, focusKey, dots, dotColor, markerColor, glowColor, speed]);

  return <canvas ref={ref} aria-hidden="true" className={cn("aspect-square w-full max-w-[560px] cursor-grab touch-pan-y select-none", className)} />;
}
