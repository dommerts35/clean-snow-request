import { forwardRef, type ButtonHTMLAttributes } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Magic UI interactive hover button: a small dot grows to fill the pill on hover (or keyboard focus)
 * while the label slides out and returns with an arrow.
 */
export const InteractiveHoverButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex min-h-11 w-auto cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-background px-6 py-2 text-center text-sm font-semibold text-foreground",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary transition-all duration-300 group-hover:scale-[100.8] group-focus-visible:scale-[100.8]" />
        <span className="inline-block whitespace-nowrap transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0 group-focus-visible:translate-x-12 group-focus-visible:opacity-0">
          {children}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 flex translate-x-12 items-center justify-center gap-2 whitespace-nowrap text-primary-foreground opacity-0 transition-all duration-300 px-6 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        <span>{children}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  ),
);
InteractiveHoverButton.displayName = "InteractiveHoverButton";
