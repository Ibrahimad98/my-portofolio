<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'

const emit = defineEmits<{ done: [] }>()
const store = usePortfolioStore()
const { owner } = storeToRefs(store)

const MIN_SPLASH = 1100 // minimum on-screen time (ms)

const progress = ref(0)
const leaving = ref(false)
const visible = ref(true)

let tick: ReturnType<typeof setInterval> | null = null

const pct = computed(() => String(Math.round(progress.value)).padStart(3, '0'))
const initials = computed(() => {
    const name = owner.value?.name
    if (!name) return 'IA'
    const parts = name.trim().split(/\s+/)
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase()
})

onMounted(() => {
    const start = Date.now()

    // Ease the counter toward 90 while we wait for data
    tick = setInterval(() => {
        if (progress.value < 90) {
            progress.value += Math.max(0.6, (90 - progress.value) * 0.06)
        }
    }, 55)

    const finish = () => {
        const wait = Math.max(0, MIN_SPLASH - (Date.now() - start))
        setTimeout(() => {
            if (tick) clearInterval(tick)
            progress.value = 100
            // brief beat at 100%, then fade out
            setTimeout(() => {
                leaving.value = true
                setTimeout(() => {
                    visible.value = false
                    emit('done')
                }, 500)
            }, 220)
        }, wait)
    }

    const waitReady = () => {
        if (!store.loading) finish()
        else setTimeout(waitReady, 50)
    }
    waitReady()
})

onUnmounted(() => {
    if (tick) clearInterval(tick)
})
</script>

<template>
    <div v-if="visible"
        class="fixed inset-0 z-50 flex flex-col bg-background transition-opacity duration-500"
        :class="leaving ? 'opacity-0' : 'opacity-100'">
        <!-- Masthead meta -->
        <div
            class="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{{ owner?.name ?? 'Portfolio' }}</span>
            <span>{{ owner?.location ?? '' }}</span>
        </div>

        <!-- Center monogram -->
        <div class="flex flex-1 items-center justify-center">
            <div class="flex flex-col items-center gap-7">
                <div class="relative size-24 sm:size-28 border border-foreground overflow-hidden">
                    <!-- fill rises with progress -->
                    <span class="absolute inset-0 bg-foreground origin-bottom transition-transform duration-200 ease-out"
                        :style="{ transform: `scaleY(${progress / 100})` }" />
                    <span
                        class="absolute inset-0 flex items-center justify-center font-mono text-3xl sm:text-4xl font-medium tracking-tight"
                        style="mix-blend-mode: difference; color: #fff">
                        {{ initials }}
                    </span>
                    <span class="absolute top-0 right-0 size-2.5 bg-foreground" />
                </div>
                <p class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {{ owner?.title ?? 'Loading' }}
                </p>
            </div>
        </div>

        <!-- Bottom progress -->
        <div class="px-4 sm:px-6 lg:px-8 pb-6">
            <div class="flex items-end justify-between font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                <span>Loading</span>
                <span class="text-foreground tabular-nums">{{ pct }}<span class="text-muted-foreground">%</span></span>
            </div>
            <div class="h-px w-full bg-border overflow-hidden">
                <div class="h-full bg-foreground transition-[width] duration-200 ease-out"
                    :style="{ width: `${progress}%` }" />
            </div>
        </div>
    </div>
</template>
