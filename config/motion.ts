/**
 * Motion budget.
 *
 * The rules this file encodes:
 *
 * 1. A page entrance settles in under ~700ms. Anything slower reads as "slow
 *    site", however pretty the individual animation is.
 * 2. Scroll reveals last 200-300ms. At 800ms the content is still arriving
 *    after the eye has landed on it.
 * 3. Animate the container, not every child. Stagger only peers in one group,
 *    at most a few of them, and keep the whole group under ~250ms.
 * 4. Move and fade. Never animate `filter: blur()` — it makes text unreadable
 *    exactly when the reader arrives, and forces repaints on a composited layer.
 * 5. Reveals start slightly before the element enters the viewport, so content
 *    is already settled by the time it is looked at.
 *
 * Import these instead of hardcoding numbers, so the whole site can be retimed
 * from one place.
 */

export const duration = {
  /** Micro-interactions: hover, toggle, focus. */
  fast: 0.15,
  /** Default for scroll reveals and entrances. */
  base: 0.25,
  /** Hero headline and anything deliberately weightier. */
  slow: 0.4,
} as const;

/** Gentle deceleration — motion arrives, it does not bounce. */
export const ease = [0.22, 1, 0.36, 1] as const;

/** Distance travelled on a reveal. Small: the movement is a hint, not a slide. */
export const distance = {
  sm: 8,
  md: 12,
} as const;

/** Per-item delay inside a group, and the cap on how long a group may take. */
export const stagger = {
  step: 0.04,
  maxItems: 4,
} as const;

/**
 * Start the reveal before the element is actually on screen, so it has
 * finished by the time the reader gets there.
 */
export const viewport = {
  once: true,
  margin: "0px 0px -15% 0px",
} as const;

/** Delay for the nth item in a group, capped so long lists never crawl. */
export function staggerDelay(index: number, base = 0): number {
  return base + Math.min(index, stagger.maxItems) * stagger.step;
}

/** The standard reveal: rise a little, fade in. */
export const reveal = {
  initial: { opacity: 0, y: distance.md },
  whileInView: { opacity: 1, y: 0 },
  viewport,
  transition: { duration: duration.base, ease },
} as const;
