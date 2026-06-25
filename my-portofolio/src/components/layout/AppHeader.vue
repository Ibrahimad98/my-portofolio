<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { storeToRefs } from 'pinia'

const route = useRoute()
const mobileMenuOpen = ref(false)
const store = usePortfolioStore()
const { owner } = storeToRefs(store)

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
        class="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <!-- Logo -->
            <RouterLink to="/"
                class="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors">
                <div
                    class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                    {{ owner?.name?.charAt(0) ?? 'P' }}
                </div>
                <span class="hidden sm:inline">{{ owner?.name ?? 'Portfolio' }}</span>
            </RouterLink>

            <!-- Desktop Nav -->
            <nav class="hidden md:flex items-center gap-1">
                <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" :class="cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.to)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )" @click="closeMobile">
                    {{ link.name }}
                </RouterLink>
            </nav>

            <!-- Mobile Menu Toggle -->
            <button
                class="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                @click="mobileMenuOpen = !mobileMenuOpen">
                <X v-if="mobileMenuOpen" class="size-5" />
                <Menu v-else class="size-5" />
            </button>
        </div>

        <!-- Mobile Nav -->
        <Transition enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 -translate-y-2"
            leave-to-class="opacity-0 -translate-y-2">
            <nav v-if="mobileMenuOpen" class="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
                <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" :class="cn(
                    'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(link.to)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )" @click="closeMobile">
                    {{ link.name }}
                </RouterLink>
            </nav>
        </Transition>
    </header>
</template>
