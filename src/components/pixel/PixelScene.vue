<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePixelScene } from './usePixelScene'
import { usePixelSceneEnabled } from './usePixelSceneEnabled'
import { useWeapon } from './useWeapon'
import { useTheme } from '@/composables/useTheme'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const { enabled } = usePixelSceneEnabled()
const { theme } = useTheme()
const route = useRoute()
const { weapon, holder, move, vehicle, fairy } = useWeapon()

// Each route gets its own world: different structures, density and inhabitants.
const routeName = computed(() => route.name as string | undefined)

const { refreshPalette } = usePixelScene(
  canvas, enabled, routeName, weapon, holder, move, vehicle, fairy,
)

/**
 * Theme change: a plain monochrome dissolve.
 *
 * The palette swap itself is instantaneous — the ramp is baked into cached
 * sprite renders — so it needs somewhere to hide. Dissolving the scene down and
 * back, and rebuilding at the trough, is enough. Nothing else is layered on top:
 * the site's language is monochrome and typographic, and a tinted, dithered
 * effect over it read as belonging to a different site.
 */
const swapping = ref(false)
let swapTimer: ReturnType<typeof setTimeout> | undefined

watch(theme, () => {
  clearTimeout(swapTimer)
  swapping.value = true
  swapTimer = setTimeout(() => {
    refreshPalette()
    swapping.value = false
  }, 380)
})

onBeforeUnmount(() => clearTimeout(swapTimer))
</script>

<template>
  <!--
    Ambient decoration only:
      aria-hidden      — nothing here is content, keep it out of the a11y tree
      pointer-events   — every link underneath stays clickable
      overflow-hidden  — clips the few px of integer-scale overflow
  -->
  <div
    v-show="enabled"
    aria-hidden="true"
    :class="{ 'pixel-scene--swapping': swapping }"
    class="pixel-scene pointer-events-none fixed inset-0 z-0 overflow-hidden"
  >
    <canvas ref="canvas" class="pixel-canvas" />
  </div>
</template>

<style scoped>
.pixel-scene {
  opacity: var(--pixel-opacity, 0.4);
  transition: opacity 0.38s ease;
}
/* Dissolves down while the palette is swapped, then back up. Not to zero —
   a full blackout made the world blink out of existence rather than dissolve. */
.pixel-scene--swapping {
  opacity: 0.06;
}

.pixel-canvas {
  display: block;
  /* Buffer is the low-res art grid; the browser upscales it nearest-neighbour.
     This is what makes it read as pixel art rather than as smooth vector shapes. */
  image-rendering: pixelated;
}

@media (prefers-reduced-motion: reduce) {
  /* The world still renders one static frame; just make it quieter still, and
     swap the palette outright rather than dissolving. */
  .pixel-scene {
    opacity: calc(var(--pixel-opacity, 0.4) * 0.6);
    transition: none;
  }
  .pixel-scene--swapping {
    opacity: calc(var(--pixel-opacity, 0.4) * 0.6);
  }
}
</style>
