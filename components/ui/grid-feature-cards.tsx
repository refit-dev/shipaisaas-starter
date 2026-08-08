import React from "react";

import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "group bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-6 transition-colors duration-200",
        className,
      )}
      {...props}
    >
      {/* Brand wash that warms up on hover */}
      <div
        className="from-primary/[0.07] pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden
      />

      <div className="bg-primary/10 text-primary relative flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105">
        <feature.icon className="size-5" strokeWidth={1.75} aria-hidden />
      </div>

      <div className="relative mt-6 flex items-center gap-2">
        <h3 className="text-base font-semibold">{feature.title}</h3>
        {feature.badge && (
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide">
            {feature.badge}
          </span>
        )}
      </div>

      <p className="text-muted-foreground relative mt-2 text-sm leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}
