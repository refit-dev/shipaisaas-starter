import { cn } from "@/lib/utils";
import React from "react";

type FeatureType = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  badge?: string;
};

type FeatureCardProps = React.ComponentProps<"div"> & {
  feature: FeatureType;
};

export function FeatureCard({ feature, className, ...props }: FeatureCardProps) {
  const p = genRandomPattern(strToSeed(feature.title));

  return (
    <div
      className={cn(
        "group relative overflow-hidden border border-dashed border-border p-6 bg-background/30 transition-colors duration-300 hover:bg-primary/[0.04]",
        className,
      )}
      {...props}
    >
      {/* Pattern overlay — brightens on hover */}
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-30 transition-opacity duration-300 group-hover:opacity-70">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={p}
            className="fill-foreground/20 stroke-foreground/15 absolute inset-0 h-full w-full mix-blend-overlay"
          />
        </div>
      </div>

      {/* Icon — shifts to primary and lifts on hover */}
      <feature.icon
        className="text-foreground/75 size-6 transition-all duration-300 group-hover:scale-110 group-hover:text-primary"
        strokeWidth={1}
        aria-hidden
      />

      <div className="mt-10 flex items-center gap-2">
        <h3 className="text-sm md:text-base">{feature.title}</h3>
        {feature.badge && (
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide">
            {feature.badge}
          </span>
        )}
      </div>

      <p className="text-foreground/60 relative z-20 mt-2 text-xs leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export function strToSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function genRandomPattern(seed = 42, length = 5): number[][] {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967295;
  };
  return Array.from({ length }, () => [
    Math.floor(rand() * 4) + 7,
    Math.floor(rand() * 6) + 1,
  ]);
}

export function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<"svg"> & {
  width: number;
  height: number;
  x: string;
  y: string;
  squares?: number[][];
}) {
  const patternId = React.useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], index) => (
            <rect
              strokeWidth="0"
              key={index}
              width={width + 1}
              height={height + 1}
              x={sx * width}
              y={sy * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
