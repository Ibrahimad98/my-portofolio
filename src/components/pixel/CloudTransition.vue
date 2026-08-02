<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { useRouteTransition } from '@/composables/useRouteTransition'
import { useTheme } from '@/composables/useTheme'

const SCALE = 4

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const { progress } = useRouteTransition()
const { theme } = useTheme()

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let W = 0
let H = 0

let hiColor = '#ffffff'
let midColor = '#dfe6ee'
let loColor = '#a9b6c6'
let skyColor = '#cfd8e3'

function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A cumulus mass with real volume.
 *
 * Three rules, each learned from a version that looked wrong:
 *
 * 1. **Shade in three tones, not one.** A single flat fill reads as a paper
 *    cut-out. Building the silhouette, then lighting the top and darkening the
 *    underside — both clipped to the shape with `source-atop` — is what gives a
 *    cloud its billow.
 * 2. **No straight-edged fill anywhere.** Any `fillRect` survives under the soft
 *    top as a visible box.
 * 3. **Every lobe must fit inside the canvas.** A lobe whose circle runs past an
 *    edge is CLIPPED by it, and that clip is a dead-straight line — which is
 *    where the phantom "rectangle below the cloud" came from.
 */
function renderCumulus(w: number, h: number, seed: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  // Padding for the offset shading passes. The silhouette lobes are already
  // inset, but the highlight is drawn shifted UP — without headroom those
  // shifted circles run past the top edge and are clipped into flat white
  // rectangles, which is where the phantom boxes came from.
  const pad = Math.max(Math.round(h * 0.1), 3)
  c.width = Math.max(Math.round(w), 6) + pad * 2
  c.height = Math.max(Math.round(h), 6) + pad * 2
  const g = c.getContext('2d')!
  const rand = prng(seed)

  const lobe = (cx: number, cy: number, r: number) => {
    for (let dy = -r; dy <= r; dy++) {
      const half = Math.sqrt(Math.max(r * r - dy * dy, 0))
      g.fillRect(Math.round(cx - half), Math.round(cy + dy), Math.max(Math.round(half * 2), 1), 1)
    }
  }

  // Layout is generated once and replayed for every tone, so the bands follow
  // the same billows instead of scattering their own shapes.
  const innerW = c.width - pad * 2
  const innerH = c.height - pad * 2
  const baseR = innerH * 0.24
  const baseCy = pad + innerH - baseR - 1
  const step = baseR * 0.62
  const puffs: { x: number; y: number; r: number }[] = []

  for (let x = pad + baseR * 0.55; x < pad + innerW - baseR * 0.35; x += step) {
    puffs.push({
      x: x + (rand() - 0.5) * step * 0.5,
      y: baseCy - rand() * baseR * 0.55,
      r: baseR * (0.7 + rand() * 0.6),
    })
  }
  for (let i = 0; i < 4; i++) {
    puffs.push({
      x: pad + innerW * (0.18 + rand() * 0.64),
      y: baseCy - baseR * (0.5 + rand() * 0.5),
      r: baseR * (0.7 + rand() * 0.45),
    })
  }
  const stacks = 6 + Math.round(rand() * 3)
  for (let i = 0; i < stacks; i++) {
    const t = i / stacks
    const r = baseR * (0.85 - t * 0.5) * (0.75 + rand() * 0.55)
    const y = baseCy - baseR * 0.6 - t * (baseCy - baseR - pad) * 0.95 - rand() * innerH * 0.03
    if (y - r < pad * 0.5) continue
    puffs.push({ x: pad + innerW * (0.22 + rand() * 0.56 + (t - 0.5) * 0.18), y, r })
  }

  // Three NESTED bands rather than three scattered sets. Each pass redraws the
  // same lobes slightly smaller and higher, so what survives underneath is a
  // crescent of the previous tone — an underside, not a row of dark discs.
  //
  // 1 — full silhouette in the shadow tone.
  g.fillStyle = loColor
  for (const p of puffs) lobe(p.x, p.y, p.r)

  // 2 — mid tone, lifted a little.
  g.save()
  g.globalCompositeOperation = 'source-atop'
  g.fillStyle = midColor
  for (const p of puffs) lobe(p.x, p.y - p.r * 0.16, p.r * 0.97)
  g.restore()

  // 3 — lit tops, lifted further and drawn tighter.
  g.save()
  g.globalCompositeOperation = 'source-atop'
  g.fillStyle = hiColor
  for (const p of puffs) lobe(p.x - p.r * 0.06, p.y - p.r * 0.34, p.r * 0.84)
  g.restore()

  return c
}

interface Puff {
  art: HTMLCanvasElement
  u: number
  v: number
  from: -1 | 1
  delay: number
  alpha: number
}

let puffs: Puff[] = []

function readColors() {
  const s = getComputedStyle(document.documentElement)
  const v = (n: string, fb: string) => s.getPropertyValue(n).trim() || fb
  hiColor = v('--pixel-cloud-hi', '#ffffff')
  midColor = v('--pixel-cloud-mid', '#dfe6ee')
  loColor = v('--pixel-cloud-lo', '#a9b6c6')
  skyColor = v('--pixel-cloud-sky', '#cfd8e3')
  build()
}

function build() {
  if (!W || !H) return
  // Deterministic layout: a reshuffling cloud front on every navigation reads
  // as noise rather than as one consistent piece of the site's language.
  const rand = prng(0x51ee)
  puffs = []

  // Depth tiers, back to front. A single plane of identical clouds reads as
  // cut-outs sliding past each other; overlapping masses at different sizes and
  // opacities are what make a front look deep.
  const tiers = [
    { scale: 0.42, alpha: 0.5, rows: 3, perRow: 5, delay: 0 },
    { scale: 0.7, alpha: 0.8, rows: 3, perRow: 4, delay: 0.07 },
    { scale: 1.1, alpha: 1, rows: 2, perRow: 3, delay: 0.15 },
  ]

  let seedN = 0x900d
  for (const tier of tiers) {
    for (let row = 0; row < tier.rows; row++) {
      for (let i = 0; i < tier.perRow; i++) {
        const cw = H * tier.scale * (0.55 + rand() * 0.3)
        puffs.push({
          art: renderCumulus(cw, cw * (0.66 + rand() * 0.28), (seedN += 137)),
          u: (i + rand() * 0.7) / Math.max(tier.perRow - 1, 1),
          v: (row + rand() * 0.7) / tier.rows,
          from: rand() < 0.5 ? -1 : 1,
          delay: tier.delay + rand() * 0.2,
          alpha: tier.alpha,
        })
      }
    }
  }
}

function resize() {
  const el = canvas.value
  if (!el || !ctx) return
  W = Math.max(Math.ceil(window.innerWidth / SCALE), 1)
  H = Math.max(Math.ceil(window.innerHeight / SCALE), 1)
  el.width = W
  el.height = H
  el.style.width = `${W * SCALE}px`
  el.style.height = `${H * SCALE}px`
  ctx.imageSmoothingEnabled = false
  build()
}

function draw() {
  if (!ctx) return
  const p = progress.value
  ctx.clearRect(0, 0, W, H)
  if (p <= 0.001) return

  // Sky fills in behind the front so the page is genuinely hidden and the view
  // swap underneath is never visible.
  const fill = Math.max(0, (p - 0.5) / 0.5)
  if (fill > 0) {
    ctx.globalAlpha = Math.min(fill, 1)
    ctx.fillStyle = skyColor
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
  }

  for (const puff of puffs) {
    const t = Math.min(Math.max((p - puff.delay) / (1 - puff.delay), 0), 1)
    if (t <= 0) continue
    const w = puff.art.width
    const h = puff.art.height
    const restX = puff.u * (W + w) - w * 0.5
    const startX = puff.from === -1 ? -w - 20 : W + 20
    const x = startX + (restX - startX) * t
    const y = puff.v * (H + h) - h * 0.5
    ctx.globalAlpha = Math.min(t * 1.6, 1) * puff.alpha
    ctx.drawImage(puff.art, Math.round(x), Math.round(y))
  }
  ctx.globalAlpha = 1
}

function loop() {
  draw()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  ctx = el.getContext('2d')
  if (!ctx) return
  resize()
  readColors()
  window.addEventListener('resize', resize, { passive: true })
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  puffs = []
})

watch(theme, () => readColors())
</script>

<template>
  <!-- Above the page, below nothing else. Purely decorative: no pointer capture,
       no a11y presence. Hidden entirely when idle so it costs nothing. -->
  <div
    v-show="progress > 0.001"
    aria-hidden="true"
    class="cloud-transition pointer-events-none fixed inset-0 z-[60] overflow-hidden"
  >
    <canvas ref="canvas" class="cloud-canvas" />
  </div>
</template>

<style scoped>
.cloud-canvas {
  display: block;
  image-rendering: pixelated;
}

@media (prefers-reduced-motion: reduce) {
  .cloud-transition {
    display: none;
  }
}
</style>
