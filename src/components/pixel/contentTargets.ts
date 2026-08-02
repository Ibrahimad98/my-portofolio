/**
 * Bridges the pixel world to the real page.
 *
 * The scene measures actual DOM elements and toggles classes on them as the
 * character walks past or strikes them, so the world reacts to the portfolio's
 * own content instead of floating in front of it.
 *
 * Everything here is additive decoration: only classes are added and removed,
 * never layout, so nothing can shift the page or break its accessibility.
 */

const SELECTOR = [
  'main h1',
  'main h2',
  'main a[href]',
  'main button',
  '[data-pixel-target]',
].join(',')

export interface ContentTarget {
  el: HTMLElement
  /** World-space bounds in art pixels. */
  x0: number
  x1: number
  y0: number
  y1: number
  near: boolean
  struckUntil: number
}

export function measureTargets(scale: number, limit = 60): ContentTarget[] {
  const out: ContentTarget[] = []
  const scroll = window.scrollY
  for (const node of document.querySelectorAll(SELECTOR)) {
    const el = node as HTMLElement
    const r = el.getBoundingClientRect()
    // Skip anything invisible or absurdly large (wrappers, not content).
    if (r.width < 8 || r.height < 8 || r.height > 400) continue
    out.push({
      el,
      x0: r.left / scale,
      x1: r.right / scale,
      y0: (r.top + scroll) / scale,
      y1: (r.bottom + scroll) / scale,
      near: false,
      struckUntil: 0,
    })
    if (out.length >= limit) break
  }
  return out
}

/** Distance from a point to a target's box, 0 when inside. */
export function distanceTo(t: ContentTarget, x: number, y: number): number {
  const dx = x < t.x0 ? t.x0 - x : x > t.x1 ? x - t.x1 : 0
  const dy = y < t.y0 ? t.y0 - y : y > t.y1 ? y - t.y1 : 0
  return Math.hypot(dx, dy)
}

export function setNear(t: ContentTarget, near: boolean) {
  if (t.near === near) return
  t.near = near
  t.el.classList.toggle('pixel-near', near)
}

export function strike(t: ContentTarget, now: number) {
  t.struckUntil = now + 0.45
  t.el.classList.remove('pixel-struck')
  // Force a reflow so re-triggering the animation on the same element restarts it.
  void t.el.offsetWidth
  t.el.classList.add('pixel-struck')
}

export function clearAll(targets: ContentTarget[]) {
  for (const t of targets) {
    t.el.classList.remove('pixel-near', 'pixel-struck')
  }
}
