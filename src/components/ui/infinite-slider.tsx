import { Children, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InfiniteSliderProps {
  children: ReactNode;
  /** Space between items in px. */
  gap?: number;
  /** Seconds for one full loop (lower = faster). */
  duration?: number;
  /** Slow down to this many seconds per loop while hovered; 0 pauses. Omit to keep the speed. */
  durationOnHover?: number;
  direction?: "horizontal" | "vertical";
  /** Move right-to-left becomes left-to-right (or upward becomes downward). */
  reverse?: boolean;
  /** Repeat the items inside each copy so short lists still fill wide screens (extra repeats are hidden from screen readers). */
  repeat?: number;
  className?: string;
  /** Accessible name for the list of items. */
  "aria-label"?: string;
}

/**
 * Motion Primitives-style endless marquee. CSS-only: the items are rendered twice and the track
 * slides by exactly one copy. The second copy is hidden from screen readers.
 * With reduced motion the items simply wrap and stay still.
 */
export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = "horizontal",
  reverse = false,
  repeat = 1,
  className,
  ...aria
}: InfiniteSliderProps) {
  const items = Children.toArray(children);
  const vertical = direction === "vertical";
  const style = {
    "--slider-gap": `${gap}px`,
    "--slider-duration": `${duration}s`,
  } as CSSProperties;
  const track = useRef<HTMLDivElement>(null);
  // Change speed in place (no jump): adjust the running animation's playback rate instead of its duration.
  const setRate = (rate: number) =>
    track.current
      ?.getAnimations()
      .forEach((a) =>
        a.updatePlaybackRate ? a.updatePlaybackRate(rate) : (a.playbackRate = rate),
      );
  const hoverRate =
    durationOnHover === undefined ? 1 : durationOnHover === 0 ? 0 : duration / durationOnHover;
  return (
    <div
      onPointerEnter={() => setRate(hoverRate)}
      onPointerLeave={() => setRate(1)}
      className={cn(
        "infinite-slider overflow-hidden",
        vertical && "is-vertical",
        reverse && "is-reverse",
        className,
      )}
      style={style}
    >
      <div ref={track} className="infinite-slider-track">
        <ul className="infinite-slider-group" aria-label={aria["aria-label"]}>
          {items.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
          {Array.from({ length: Math.max(0, repeat - 1) }, (_, r) =>
            items.map((c, i) => (
              <li key={`r${r}-${i}`} aria-hidden="true">
                {c}
              </li>
            )),
          )}
        </ul>
        <ul className="infinite-slider-group is-copy" aria-hidden="true">
          {Array.from({ length: Math.max(1, repeat) }, (_, r) =>
            items.map((c, i) => <li key={`c${r}-${i}`}>{c}</li>),
          )}
        </ul>
      </div>
    </div>
  );
}
