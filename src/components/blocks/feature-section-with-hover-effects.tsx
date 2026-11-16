import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FeatureItem {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface FeaturesSectionWithHoverEffectsProps {
  features?: FeatureItem[];
  /** Columns on large screens (2, 3 or 4). */
  columns?: 2 | 3 | 4;
  className?: string;
  /** Heading level for each feature title. */
  as?: "h3" | "h4";
}

const COLS = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const;

/** 21st.dev feature grid: on hover a soft gradient fills the cell, the side accent grows and turns brand green, and the title nudges right. */
export function FeaturesSectionWithHoverEffects({ features = [], columns = 4, className, as = "h3" }: FeaturesSectionWithHoverEffectsProps) {
  const rows = Math.ceil(features.length / columns);
  return (
    <ul className={cn("relative z-10 mx-auto grid max-w-7xl list-none grid-cols-1 p-0 md:grid-cols-2", COLS[columns], className)}>
      {features.map((f, i) => (
        <Feature key={f.title} {...f} first={i % columns === 0} topRow={i < columns} lastRow={Math.floor(i / columns) === rows - 1} Title={as} />
      ))}
    </ul>
  );
}

function Feature({ title, description, icon, first, topRow, lastRow, Title }: FeatureItem & { first: boolean; topRow: boolean; lastRow: boolean; Title: "h3" | "h4" }) {
  return (
    <li className={cn("group/feature relative flex flex-col border-border py-10 lg:border-r", first && "lg:border-l", !lastRow && "lg:border-b")}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full from-background to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100",
          topRow ? "bg-gradient-to-t" : "bg-gradient-to-b",
        )}
      />
      <div className="relative z-10 mb-4 px-10 text-primary-text" aria-hidden="true">{icon}</div>
      <div className="relative z-10 mb-2 px-10">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-br-full rounded-tr-full bg-border transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-primary" />
        <Title className="inline-block text-lg font-bold text-foreground transition duration-200 group-hover/feature:translate-x-2">{title}</Title>
      </div>
      <p className="relative z-10 max-w-xs px-10 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
    </li>
  );
}
