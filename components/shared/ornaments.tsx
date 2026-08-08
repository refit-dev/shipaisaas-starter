/**
 * Hand-drawn marks used sparingly on marketing pages.
 *
 * They exist to stop the layout reading as a technical grid. Strokes inherit
 * `currentColor`, so colour comes from a text-* class on the parent.
 */

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      fill="none"
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d="M4 16C40 6 78 6 116 12c34 5 66 7 120-2"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M14 21c44-7 84-5 122 0 30 4 58 3 100-4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/**
 * Underlines a phrase inside a heading with the hero's squiggle.
 *
 * Use it on one phrase per section at most — it is emphasis, and emphasis
 * everywhere is emphasis nowhere.
 */
export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <Squiggle
        className="text-primary absolute -bottom-1.5 left-0 h-3 w-full md:-bottom-2 md:h-4"
        aria-hidden
      />
    </span>
  );
}

export function Loop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} aria-hidden>
      <path
        d="M196 4C150 10 96 26 60 54c-18 14-32 32-30 50 2 16 20 26 36 20 14-6 20-24 12-38-8-14-28-20-46-16C10 74 0 92 2 112"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A short arrow that curls — for pointing at something without a callout box. */
export function CurvedArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden>
      <path
        d="M4 6c26 2 52 14 68 34 8 10 13 23 12 38"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M70 66l14 14 14-18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
