<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { cn } from '@/lib/utils'
import { Menu, X, Moon, Sun } from 'lucide-vue-next'
import { ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { storeToRefs } from 'pinia'
import { useTheme } from '@/composables/useTheme'
import LogoMark from '@/components/layout/LogoMark.vue'

function initials(name?: string) {
    if (!name) return 'IA'
    const parts = name.trim().split(/\s+/)
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase()
}

const route = useRoute()
const mobileMenuOpen = ref(false)
const store = usePortfolioStore()
const { owner } = storeToRefs(store)
const { theme, toggleTheme } = useTheme()

const navLinks = [
    { name: 'Dashboard', to: '/' },
    { name: 'Projects', to: '/projects' },
    { name: 'About', to: '/about' },
]

function isActive(path: string) {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
}

function closeMobile() {
    mobileMenuOpen.value = false
}
</script>

<template>
    <header
        class="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <!-- Logo -->
            <RouterLink to="/" aria-label="Home">
                <LogoMark :initials="initials(owner?.name)"
                    :label="owner?.name?.split(' ')[0] ?? 'Portfolio'" :size="28" />
            </RouterLink>

            <!-- Desktop Nav -->
            <nav class="hidden md:flex items-center gap-7">
                <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" :class="cn(
                    'font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-1.5',
                    isActive(link.to)
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                )" @click="closeMobile">
                    <span v-if="isActive(link.to)" class="text-foreground">●</span>
                    {{ link.name }}
                </RouterLink>
            </nav>

            <div class="flex items-center gap-1">
                <!-- Theme Toggle -->
                <button type="button"
                    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
                    class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    @click="toggleTheme">
                    <Sun v-if="theme === 'dark'" class="size-5" />
                    <Moon v-else class="size-5" />
                </button>

                <!-- Mobile Menu Toggle -->
                <button
                    class="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    aria-label="Toggle navigation menu" @click="mobileMenuOpen = !mobileMenuOpen">
                    <X v-if="mobileMenuOpen" class="size-5" />
                    <Menu v-else class="size-5" />
                </button>
            </div>
        </div>

        <!-- Mobile Nav -->
        <Transition enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 -translate-y-2"
            leave-to-class="opacity-0 -translate-y-2">
            <nav v-if="mobileMenuOpen" class="md:hidden border-t border-border bg-background px-4 py-2">
                <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" :class="cn(
                    'flex items-center gap-2 border-b border-border/60 py-3.5 font-mono text-xs uppercase tracking-widest transition-colors',
                    isActive(link.to)
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                )" @click="closeMobile">
                    <span class="text-muted-foreground">{{ String(navLinks.indexOf(link) + 1).padStart(2, '0') }}</span>
                    {{ link.name }}
                </RouterLink>
            </nav>
        </Transition>
    </header>
</template>
