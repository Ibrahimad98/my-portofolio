import { ref, watch } from 'vue'

const STORAGE_KEY = 'portfolio-pixel-scene'

/**
 * The scene is ambient decoration. Some visitors genuinely find drifting motion
 * distracting, so the preference is user-owned and persisted.
 *
 * It is force-disabled where it cannot work well:
 *  - coarse pointer (touch): there is no cursor for the character to follow, and
 *    a full-screen rAF loop is a poor trade for battery on mobile.
 */
function supported(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: fine)').matches
}

function initial(): boolean {
  if (!supported()) return false
  return localStorage.getItem(STORAGE_KEY) !== 'off'
}

// Module-level singleton so the toggle and the canvas share one source of truth.
const enabled = ref(initial())
const isSupported = ref(supported())

watch(enabled, (value) => {
  localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
})

export function usePixelSceneEnabled() {
  function toggle() {
    if (!isSupported.value) return
    enabled.value = !enabled.value
  }

  return { enabled, isSupported, toggle }
}
