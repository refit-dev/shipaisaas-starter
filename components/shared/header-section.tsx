interface HeaderSectionProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export function HeaderSection({ label, title, subtitle }: HeaderSectionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {label ? (
        <p className="text-muted-foreground mb-3 font-mono text-[11px] tracking-[0.18em] uppercase">
          {label}
        </p>
      ) : null}

      <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>

      {subtitle ? (
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg font-light leading-relaxed text-balance">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
