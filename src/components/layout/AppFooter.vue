<script setup lang="ts">
import { usePortfolioStore } from '@/stores/portfolio'
import { storeToRefs } from 'pinia'
import { ArrowUpRight } from 'lucide-vue-next'
import { usePixelSceneEnabled } from '@/components/pixel/usePixelSceneEnabled'

const store = usePortfolioStore()
const { owner } = storeToRefs(store)
const { enabled: sceneEnabled, isSupported: sceneSupported, toggle: toggleScene } =
    usePixelSceneEnabled()
</script>

<template>
    <footer class="border-t border-border">
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex flex-col gap-2">
                    <p class="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        © {{ new Date().getFullYear() }} {{ owner?.name ?? 'Portfolio' }} — All rights reserved
                    </p>
                    <button v-if="sceneSupported" type="button" :aria-pressed="sceneEnabled"
                        class="group self-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        @click="toggleScene">
                        <span class="link-underline">
                            Ambient world — {{ sceneEnabled ? 'on' : 'off' }}
                        </span>
                    </button>
                </div>
                <div class="flex items-center gap-x-6 font-mono text-xs uppercase tracking-wider">
                    <a v-if="owner?.github" :href="owner.github" target="_blank" rel="noopener noreferrer"
                        class="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <span class="link-underline">GitHub</span>
                        <ArrowUpRight class="size-3" />
                    </a>
                    <a v-if="owner?.linkedin" :href="owner.linkedin" target="_blank" rel="noopener noreferrer"
                        class="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <span class="link-underline">LinkedIn</span>
                        <ArrowUpRight class="size-3" />
                    </a>
                    <a v-if="owner?.email" :href="`mailto:${owner.email}`"
                        class="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <span class="link-underline">Email</span>
                        <ArrowUpRight class="size-3" />
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>
