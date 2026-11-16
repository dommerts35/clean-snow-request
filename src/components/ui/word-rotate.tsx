import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface WordRotateProps {
  words: string[];
  /** Milliseconds each word stays on screen. */
  duration?: number;
  className?: string;
  /** Optional wrapper for each word (e.g. gradient text). */
  render?: (word: string) => ReactNode;
}

/**
 * Magic UI-style word rotator: each word drops in from above and leaves downward.
 * CSS-only (no animation library). Shows the first word without rotating when the user prefers reduced motion.
 * Screen readers should get a stable text elsewhere; this element is aria-hidden by the caller when needed.
 */
export function WordRotate({ words, duration = 2500, className, render }: WordRotateProps) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let swap: ReturnType<typeof setTimeout>;
    const tick = setInterval(() => {
      setLeaving(true);
      swap = setTimeout(() => { setIndex((i) => (i + 1) % words.length); setLeaving(false); }, 300);
    }, duration);
    return () => { clearInterval(tick); clearTimeout(swap); };
  }, [words.length, duration]);

  const word = words[index % Math.max(1, words.length)] ?? "";
  return (
    <span className={cn("inline-block overflow-hidden py-[0.1em] align-bottom", className)}>
      <span key={index} className={cn("word-rotate-item inline-block", leaving && "is-leaving")}>
        {render ? render(word) : word}
      </span>
    </span>
  );
}
