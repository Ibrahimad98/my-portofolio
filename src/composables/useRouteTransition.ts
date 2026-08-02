import { ref } from 'vue'

export type RoutePhase = 'idle' | 'covering' | 'held' | 'revealing'

const COVER_MS = 460
/** Full-cover hold while the view swaps and the world rebuilds underneath. */
const HOLD_MS = 300
const REVEAL_MS = 520

/** 0 = clear, 1 = fully covered. */
const progress = ref(0)
const phase = ref<RoutePhase>('idle')

let animId = 0

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function animate(to: number, ms: number, next: RoutePhase): Promise<void> {
  const id = ++animId
  const from = progress.value
  const start = performance.now()

  return new Promise((resolve) => {
    if (ms <= 0 || from === to) {
      progress.value = to
      phase.value = next
      resolve()
      return
    }
    const step = (now: number) => {
      // A newer transition superseded this one — abandon it silently.
      if (id !== animId) {
        resolve()
        return
      }
      const t = Math.min((now - start) / ms, 1)
      // easeInOutCubic: settles in, holds, then lifts.
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      progress.value = from + (to - from) * e
      if (t < 1) {
        requestAnimationFrame(step)
      } else {
        phase.value = next
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

/**
 * Router-driven page cover.
 *
 * `coverRoute()` is awaited in beforeEach so the panel closes BEFORE the view
 * swaps — that ordering is what hides the swap. `revealRoute()` runs in
 * afterEach, once the incoming view has painted.
 */
export async function coverRoute(): Promise<void> {
  if (prefersReduced()) return
  phase.value = 'covering'
  await animate(1, COVER_MS, 'held')
}

export async function revealRoute(): Promise<void> {
  if (prefersReduced()) {
    progress.value = 0
    phase.value = 'idle'
    return
  }
  // HOLD at full cover before parting.
  //
  // Two rAFs was not nearly enough: the incoming view still has to mount and
  // paint, the scroll has to reset, and the pixel world rebuilds on a 140ms
  // debounce. Parting early meant the clouds opened onto the OLD page, which
  // then visibly swapped a moment later. The cover is cheap — holding it until
  // everything underneath has settled is what makes the swap invisible.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  await new Promise((r) => setTimeout(r, HOLD_MS))

  phase.value = 'revealing'
  await animate(0, REVEAL_MS, 'idle')
}

export function useRouteTransition() {
  return { progress, phase, coverRoute, revealRoute }
}
