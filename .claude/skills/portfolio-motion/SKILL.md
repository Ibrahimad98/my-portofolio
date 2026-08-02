---
name: portfolio-motion
description: How to build animation in THIS Vue 3 portfolio using motion-v (Motion for Vue / the Framer Motion API) and GSAP + ScrollTrigger. Use when adding, revamping, or debugging any animation, transition, scroll effect, page transition, hover/gesture, splash screen, or "signature moment" in this repo. Covers which library to reach for, working Vue 3 recipes, cleanup rules, and reduced-motion handling.
---

# Portfolio Motion

Animation system for this repo. Pair with the `portfolio-revamp` skill — that one
owns *how it looks*, this one owns *how it moves*. Motion here must stay
**editorial and restrained**: it earns attention, it doesn't beg for it.

## Installed stack

| Package | Version | What it is |
| --- | --- | --- |
| `motion-v` | 2.3.0 | Motion for Vue — the Framer Motion API as Vue SFC components + composables. Declarative, reactive, tied to component lifecycle. |
| `gsap` | 3.15.0 | Imperative timeline engine. **All plugins are free since 3.13** — ScrollTrigger, SplitText, Flip, Observer, ScrollSmoother, MotionPath, Draggable, ScrollTo are all in `node_modules/gsap/`. |
| `@vueuse/core` | 10.11.1 | Required peer of `motion-v`. Declared directly in `package.json` — do not remove it. |

Also already in the repo and still valid for simple cases:
- `v-reveal` directive ([src/directives/reveal.ts](src/directives/reveal.ts)) — IntersectionObserver fade-up, registered globally in [src/main.ts](src/main.ts).
- CSS keyframes + `.reveal` / `.animate-marquee` / `.link-underline` in [src/assets/style.css](src/assets/style.css).
- `tw-animate-css` for one-shot Tailwind utility animations.

## Which library do I reach for?

Decide once, per effect. Do not animate the same property with both.

**Use `motion-v` when** the animation is *state-driven or component-scoped*:
- enter/exit of conditional UI (dialogs, splash screen, route content, toasts)
- hover / tap / drag gestures on cards and rows
- staggered lists that mount with data
- shared-element / layout transitions (`layout` prop, `LayoutGroup`)
- anything where Vue reactivity (`v-if`, a ref, a store value) drives the change

**Use `gsap` when** the animation is *choreographed or scroll-bound*:
- multi-step timelines where step 3 must wait on step 1
- `ScrollTrigger` scrub, pin, and progress-linked sequences
- `SplitText` per-character / per-line headline reveals (fits the oversized display type)
- pixel-precise sequencing of unrelated DOM nodes
- `Flip` for FLIP-style layout morphs GSAP does better than `layout`

**Use plain CSS / `v-reveal` when** it's a one-property fade or slide. Don't pull in
a library for a 200ms opacity change — the existing `v-reveal` already covers the
standard section fade-up and honors reduced motion.

---

## motion-v recipes

`motion-v` exports the whole Framer Motion surface. Import named, tree-shakes fine.

### Basic element
`<Motion>` renders a `div` by default; pass `as` for any tag or component.

```vue
<script setup lang="ts">
import { Motion } from 'motion-v'
</script>

<template>
  <Motion
    as="section"
    :initial="{ opacity: 0, y: 24 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }"
  >
    <slot />
  </Motion>
</template>
```

`[0.16, 1, 0.3, 1]` (expo-out) is this project's house easing — snappy start, long
settle. Use it for reveals. Use `{ type: 'spring', stiffness: 300, damping: 30 }`
for gesture feedback only.

There is also a per-tag shorthand: `import { motion } from 'motion-v'` gives
`<motion.section>`, `<motion.a>`, `<motion.button>`, … Prefer it over
`<Motion as="…">` — it types the native HTML attributes for that tag.

Use `asChild` when you need the motion props applied to an existing child
component (e.g. a `ui/Button`) instead of a wrapper element.

### Scroll reveal with `whileInView`
Replaces `v-reveal` when you need stagger or non-trivial values.

```vue
<Motion
  :initial="{ opacity: 0, y: 32 }"
  :while-in-view="{ opacity: 1, y: 0 }"
  :in-view-options="{ once: true, amount: 0.3 }"
  :transition="{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }"
/>
```

Always set `once: true` for content reveals. Re-triggering on every scroll-by reads
as a demo, not a portfolio.

### Variants + stagger (parent drives children)

```vue
<script setup lang="ts">
import { Motion } from 'motion-v'

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}
</script>

<template>
  <Motion :variants="list" initial="hidden" while-in-view="show" :in-view-options="{ once: true }">
    <Motion v-for="p in projects" :key="p.slug" as="article" :variants="item">
      {{ p.title }}
    </Motion>
  </Motion>
</template>
```

Children inherit the variant name from the parent — do not repeat `while-in-view`
on each child.

### Exit animations — `AnimatePresence`
Required for anything that unmounts. Wrap the `v-if`, and the child **must** have a
stable `:key`.

```vue
<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'
</script>

<template>
  <AnimatePresence>
    <Motion
      v-if="showSplash"
      key="splash"
      :initial="{ opacity: 1 }"
      :exit="{ opacity: 0, filter: 'blur(8px)' }"
      :transition="{ duration: 0.5 }"
    />
  </AnimatePresence>
</template>
```

Use `mode="wait"` on `AnimatePresence` for route/page swaps so the outgoing view
finishes before the incoming one starts.

### Gestures
The full set is `whileHover`, `whilePress`, `whileFocus`, `whileDrag`, `whileInView`.

> **Gotcha:** motion-v has **no `whileTap`**. React's Framer Motion calls it
> `whileTap`; the Vue port renamed it to **`whilePress`**. Copy-pasting React
> examples will silently do nothing — the prop is just ignored. Same for the
> callbacks: `onPress` / `onPressStart` / `onPressCancel`, not `onTap*`.

Prefer these over Tailwind `hover:` when the motion needs spring physics; keep
Tailwind for color- and border-only hovers.

```vue
<Motion
  :while-hover="{ x: 8 }"
  :while-press="{ scale: 0.98 }"
  :transition="{ type: 'spring', stiffness: 400, damping: 28 }"
/>
```

### Scroll-linked values
`useScroll` + `useTransform` for progress bars, parallax, sticky headers.

```ts
import { useScroll, useTransform, useSpring } from 'motion-v'
import { useTemplateRef } from 'vue'

const target = useTemplateRef<HTMLElement>('target')
const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] })
const y = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
```

Bind with `:style="{ y }"` — motion values are read directly, no `.value` unwrapping
needed inside a `Motion` style binding.

### Layout / shared element

```vue
<Motion :layout="true" layout-id="project-cover" />
```

`layoutId` on two elements in different trees morphs one into the other. Excellent
for the projects index → project detail cover image. Wrap sibling groups in
`<LayoutGroup>` when their layouts affect each other.

### Global config
`<MotionConfig :reduced-motion="'user'" :transition="{ ... }">` in [src/App.vue](src/App.vue)
sets app-wide defaults and makes every descendant honor the OS reduced-motion
setting automatically. **Do this once** rather than gating each component.

### Verified prop list (motion-v 2.3.0)
Anything not on this list is not a prop — check here before guessing from React docs.

`initial` `animate` `exit` `variants` `transition` `style` `custom` `inherit`
`whileHover` `whilePress` `whileFocus` `whileDrag` `whileInView` `inViewOptions`
`layout` `layoutId` `layoutRoot` `layoutScroll` `layoutDependency` `crossfade`
`drag` `dragConstraints` `dragControls` `dragDirectionLock` `dragElastic`
`dragListener` `dragMomentum` `dragPropagation` `dragSnapToOrigin` `dragTransition`
`asChild` `forwardMotionProps` `transformTemplate` `globalPressTarget` `ignoreStrict`

Events: `onUpdate` `onAnimationComplete` `onHoverStart` `onHoverEnd` `onPress`
`onPressStart` `onPressCancel` `onPan` `onPanStart` `onPanEnd` `onPanSessionStart`
`onDrag` `onDragStart` `onDragEnd` `onDirectionLock` `onViewportEnter`
`onViewportLeave` `onLayoutAnimationStart` `onLayoutAnimationComplete`.

### Other useful exports
`useAnimate`, `useAnimationControls`, `useReducedMotion`, `useMotionValue`,
`useMotionTemplate`, `useTime`, `useVelocity`, `useDragControls`, `Reorder`,
`LazyMotion` + `domAnimation`/`domMax`, `vMotion` directive, `MotionPlugin`.

---

## GSAP recipes

### Registration
Plugins are side-effectful — register once, at module scope of the file using them.

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)
```

Import from the deep path (`gsap/ScrollTrigger`), never `gsap/all` — that defeats
tree-shaking and ships every plugin.

### Cleanup — non-negotiable
There is **no `useGSAP` for Vue** (that hook is React-only). Use `gsap.context()`
scoped to a template ref and revert it on unmount. Without this, every route change
leaks tweens and ScrollTriggers, and this app is an SPA with lazy routes.

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const root = useTemplateRef<HTMLElement>('root')
let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context((self) => {
    gsap.from('[data-anim="line"]', {
      yPercent: 110,
      duration: 0.9,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: root.value, start: 'top 75%', once: true },
    })
  }, root.value!)
})

onUnmounted(() => ctx?.revert())
</script>

<template>
  <section ref="root">…</section>
</template>
```

Selector strings inside `gsap.context(fn, scopeEl)` are **scoped to `scopeEl`** —
that's the point of passing it. Never use unscoped global selectors.

### Reduced motion — `gsap.matchMedia()`
The idiomatic GSAP gate. Everything created inside a `matchMedia` branch is
auto-reverted when the query stops matching.

```ts
const mm = gsap.matchMedia()

mm.add(
  {
    motionOk: '(prefers-reduced-motion: no-preference)',
    isDesktop: '(min-width: 1024px)',
  },
  (ctx) => {
    const { motionOk, isDesktop } = ctx.conditions as Record<string, boolean>
    if (!motionOk) return
    if (isDesktop) {
      // pinned, scrubbed desktop-only choreography
    }
  },
)

onUnmounted(() => mm.revert())
```

### ScrollTrigger pin + scrub (the signature moment)

```ts
gsap.timeline({
  scrollTrigger: {
    trigger: root.value,
    start: 'top top',
    end: '+=120%',
    pin: true,
    scrub: 1,          // number = smoothing lag in seconds; `true` = 1:1, twitchier
  },
})
  .to('[data-anim="cover"]', { scale: 1.1, ease: 'none' })
  .to('[data-anim="title"]', { yPercent: -40, opacity: 0, ease: 'none' }, 0)
```

Budget: **one pinned section for the whole site.** Two feels like a template.

Call `ScrollTrigger.refresh()` after images load or content height changes, and
after route transitions — otherwise start/end positions are computed against the
wrong layout.

### SplitText headline reveal
Fits the oversized `.display` type in this project. Always `revert()` the split so
the DOM and screen readers get the original text back.

```ts
const split = new SplitText('[data-anim="headline"]', {
  type: 'lines',
  linesClass: 'overflow-hidden',
  autoSplit: true,       // re-splits on font load / resize
})

gsap.from(split.lines, { yPercent: 110, duration: 1, stagger: 0.1, ease: 'expo.out' })

onUnmounted(() => split.revert())
```

Prefer `type: 'lines'` or `'words'`. Per-character on a `15vw` headline creates
hundreds of nodes and tanks the reveal — reserve `'chars'` for short words.

### GSAP easing names
`'expo.out'` is the GSAP spelling of the house easing above. Also useful:
`'power3.out'` (softer), `'none'` (**required** for anything `scrub`bed — eased
scrub feels laggy and wrong).

---

## Rules that apply to both

1. **Animate `transform` and `opacity` only.** Never animate `width`, `height`,
   `top`, `left`, `margin`, or `box-shadow` on scroll — they trigger layout.
   Use `x`/`y`/`scale`/`rotate` (both libraries map these to `transform`).
2. **Reserve space.** Anything starting at `opacity: 0` must already occupy its
   final box, or you ship CLS. Set aspect ratios on media before animating it.
3. **Durations**: micro-interactions 150–300ms, section reveals 500–800ms, the one
   signature moment up to 1.2s. Anything longer makes the site feel slow.
4. **Reduced motion is not optional.** `<MotionConfig reduced-motion="user">` covers
   motion-v; `gsap.matchMedia()` covers GSAP; `@media (prefers-reduced-motion: reduce)`
   in [src/assets/style.css](src/assets/style.css) already covers CSS. When reduced,
   content still appears — kill the transform, keep the opacity, never hide it.
5. **Clean up.** `ctx.revert()` / `mm.revert()` / `split.revert()` in `onUnmounted`.
   motion-v cleans itself up with the component.
6. **Don't double-drive a property.** If GSAP owns an element's `y`, motion-v and
   Tailwind transitions must not touch it. Pick one owner per element.
7. **Test both themes and both motion preferences** before declaring done, then run
   `yarn type-check` and `yarn lint`.

## Aesthetic guardrails (inherited from `portfolio-revamp`)

The editorial/Swiss-mono direction constrains motion too:

- **Yes**: mask-reveal of display type (lines sliding out from `overflow-hidden`),
  horizontal shifts on index rows, the existing marquee, hairline-rule draw-ins,
  scrubbed cover-image scale, sharp cross-fades, cursor-adjacent hover states.
- **No**: bounce/elastic easing, pulsing or breathing elements, spinning icons,
  glow/aura fades, particle fields, typewriter loops, scale-up "pop" cards,
  parallax on every layer, scroll-jacked full-page snapping.
- **Motion budget**: one signature moment per page, one pinned section per site.
  Everything else is a reveal or a hover. When in doubt, do less and make it faster.

## References

- Motion for Vue docs — https://motion.dev/docs/vue
- Motion for Vue component API — https://motion.dev/docs/vue-motion-component
- GSAP docs — https://gsap.com/docs/v3/
- ScrollTrigger — https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- SplitText — https://gsap.com/docs/v3/Plugins/SplitText/
- `gsap.context()` — https://gsap.com/docs/v3/GSAP/gsap.context()
- `gsap.matchMedia()` — https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
