import type { Directive } from 'vue'

/**
 * v-reveal — fades/slides an element into view when it scrolls into the viewport.
 * Honors prefers-reduced-motion (elements appear instantly, no transform).
 *
 * Usage:
 *   <section v-reveal>...</section>
 *   <div v-reveal="{ delay: 120 }">...</div>   // stagger in ms
 */
interface RevealBinding {
  delay?: number
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer?.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
  }
  return observer
}

export const vReveal: Directive<HTMLElement, RevealBinding | undefined> = {
  mounted(el, binding) {
    if (prefersReducedMotion()) return
    const delay = binding.value?.delay ?? 0
    if (delay) el.style.transitionDelay = `${delay}ms`
    el.classList.add('reveal')
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
