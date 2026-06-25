import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'portfolio-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Module-level singleton so every consumer shares the same reactive theme.
const theme = ref<Theme>(getInitialTheme())

function apply(value: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', value === 'dark')
  root.style.colorScheme = value
}

watch(
  theme,
  (value) => {
    apply(value)
    localStorage.setItem(STORAGE_KEY, value)
  },
  { immediate: true },
)

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
}
