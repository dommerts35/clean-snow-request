import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Magic UI-style bento grid: 3 columns on desktop, one column on small screens. Size cards with col-span classes. */
export function BentoGrid({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("grid w-full auto-rows-[24rem] grid-cols-3 gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export interface BentoCardProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  name: string;
  description: string;
  Icon: ElementType;
  /** Decorative layer behind the content (image, pattern, animation). */
  background?: ReactNode;
  cta: string;
  /** Link target for the call to action. Ignored when onCtaClick is given. */
  href?: string;
  /** Run an action (e.g. open a dialog) instead of following a link. */
  onCtaClick?: () => void;
  /** Accessible name for the call to action when the visible text is generic. */
  ctaLabel?: string;
  /** "image" puts light text over a darkened background photo. */
  variant?: "default" | "image";
  /** Extra content under the description (e.g. feature chips). */
  extra?: ReactNode;
  /** Heading level for the card title. */
  as?: "h2" | "h3" | "h4";
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  href = "#",
  cta,
  onCtaClick,
  ctaLabel,
  variant = "default",
  extra,
  as: Title = "h3",
  ...props
}: BentoCardProps) {
  const image = variant === "image";
  const action = (
    <Button
      variant={image ? "default" : "link"}
      size="sm"
      asChild={!onCtaClick}
      className={cn("pointer-events-auto", image ? "font-semibold" : "p-0")}
      aria-label={ctaLabel}
      onClick={onCtaClick}
    >
      {onCtaClick ? (
        <span>
          {cta}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </span>
      ) : (
        <a href={href}>
          {cta}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </a>
      )}
    </Button>
  );
  return (
    <div
      className={cn(
        "group relative col-span-3 flex flex-col justify-end overflow-hidden rounded-xl transform-gpu",
        image
          ? "bg-overlay text-white"
          : "bg-background border border-border [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0" aria-hidden={image ? undefined : true}>
        {background}
      </div>
      {image && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/5"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 p-5">
        <div className="pointer-events-none flex transform-gpu flex-col gap-1.5 transition-all duration-300 lg:group-hover:-translate-y-12 lg:group-focus-within:-translate-y-12">
          <Icon
            className={cn(
              "h-11 w-11 origin-left transform-gpu transition-all duration-300 ease-in-out group-hover:scale-75",
              image ? "text-white" : "text-foreground",
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <Title
            className={cn(
              "text-xl font-semibold leading-snug",
              image ? "text-white" : "text-foreground",
            )}
          >
            {name}
          </Title>
          <p
            className={cn(
              "max-w-lg text-[15px] leading-relaxed",
              image ? "text-white/85" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
          {extra}
        </div>
        <div className="mt-3 flex lg:hidden">{action}</div>
      </div>
      <div className="pointer-events-none absolute bottom-0 z-20 hidden w-full translate-y-10 transform-gpu flex-row items-center p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:flex">
        {action}
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transform-gpu transition-all duration-300",
          image ? "group-hover:bg-black/10" : "group-hover:bg-black/[.03]",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
