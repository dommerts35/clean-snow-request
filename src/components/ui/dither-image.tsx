import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { DitherField, type DitherPattern } from "./dither-field";

export interface DitherImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Classes for the wrapper that holds the placeholder and the image (size/position it like the image). */
  wrapperClassName?: string;
  /** Placeholder colors, faint to strong. */
  placeholderColors?: string[];
  placeholderPattern?: DitherPattern;
}

const GREENS = ["oklch(0.9 0.07 150)", "oklch(0.8 0.12 148)", "oklch(0.68 0.15 146)"];

/**
 * Image with an animated green-and-white dither placeholder that shows until the image has loaded,
 * then the photo fades in and the placeholder is removed.
 */
export function DitherImage({ wrapperClassName, placeholderColors = GREENS, placeholderPattern = "clouds", className, onLoad, ...img }: DitherImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [gone, setGone] = useState(false);

  // Images already in the browser cache may finish before React attaches onLoad.
  useEffect(() => { if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true); }, []);
  useEffect(() => { if (!loaded) return; const id = setTimeout(() => setGone(true), 600); return () => clearTimeout(id); }, [loaded]);

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {!gone && (
        <DitherField
          aria-hidden="true"
          pattern={placeholderPattern}
          color={placeholderColors}
          speed={1.6}
          interactive={false}
          className={cn("absolute inset-0 bg-white transition-opacity duration-500", loaded && "opacity-0")}
        />
      )}
      <img
        ref={ref}
        {...img}
        onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        className={cn("dither-img", !loaded && "is-loading", className)}
      />
    </div>
  );
}
