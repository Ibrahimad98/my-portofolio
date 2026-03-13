import { ref } from 'vue'

/**
 * Shared reactive state for route-transition loading indicator.
 * Used by router guards (beforeEach / afterEach) and consumed by PageLoader.vue.
 */
const routeLoading = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null

/** Call in router.beforeEach to show the page loader */
export function startLoading() {
  // Small delay so instant navigations don't flash the loader
  timer = setTimeout(() => {
    routeLoading.value = true
  }, 80)
}

/** Call in router.afterEach to hide the page loader */
export function stopLoading() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  routeLoading.value = false
}

export function useRouteLoading() {
  return { routeLoading, startLoading, stopLoading }
}
