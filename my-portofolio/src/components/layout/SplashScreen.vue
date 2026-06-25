<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const emit = defineEmits<{ done: [] }>()
const store = usePortfolioStore()

const phase = ref<'drawing' | 'revealing' | 'fading' | 'done'>('drawing')
const DRAW_DURATION = 600 // hexagon stroke draw-on (ms)
const REVEAL_DURATION = 400 // "I" letter fade+scale in (ms)
const MIN_SPLASH = 1000 // minimum total splash time (ms)

onMounted(() => {
    const startTime = Date.now()

    // Phase 1: stroke draw-on is handled by CSS animation, wait for it
    setTimeout(() => {
        phase.value = 'revealing'

        // Phase 2: letter reveal
        setTimeout(() => {
            // Wait for data to finish loading AND minimum time to elapse
            const waitForReady = () => {
                const elapsed = Date.now() - startTime
                const remaining = Math.max(0, MIN_SPLASH - elapsed)

                if (!store.loading) {
                    setTimeout(() => {
                        phase.value = 'fading'
                        // Wait for fade-out animation to finish
                        setTimeout(() => {
                            phase.value = 'done'
                            emit('done')
                        }, 400) // fade-out duration
                    }, remaining)
                } else {
                    // Data still loading, check again in 50ms
                    setTimeout(waitForReady, 50)
                }
            }
            waitForReady()
        }, REVEAL_DURATION)
    }, DRAW_DURATION)
})

// Safety: if store finishes loading before mount logic triggers,
// this watch will help resolve quickly
watch(
    () => store.loading,
    () => {
        /* intentionally empty — just ensures reactivity triggers re-evaluation */
    },
)
</script>

<template>
    <Transition name="splash-fade">
        <div v-if="phase !== 'done'" class="fixed inset-0 z-50 flex items-center justify-center bg-background"
            :class="{ 'splash-fading': phase === 'fading' }">
            <div class="splash-logo">
                <!-- Flat-top hexagon SVG -->
                <svg viewBox="0 0 120 104" class="splash-hexagon" xmlns="http://www.w3.org/2000/svg">
                    <!-- Hexagon path (flat-top) -->
                    <path class="hex-stroke"
                        :class="{ drawing: phase === 'drawing' || phase === 'revealing' || phase === 'fading' }"
                        d="M60 2 L113.3 28 L113.3 76 L60 102 L6.7 76 L6.7 28 Z" fill="none" stroke="currentColor"
                        stroke-width="3" stroke-linejoin="round" />

                    <!-- Filled background (appears after stroke) -->
                    <path class="hex-fill" :class="{ visible: phase === 'revealing' || phase === 'fading' }"
                        d="M60 2 L113.3 28 L113.3 76 L60 102 L6.7 76 L6.7 28 Z" fill="currentColor" stroke="none" />

                    <!-- The letter "I" -->
                    <text class="hex-letter" :class="{ visible: phase === 'revealing' || phase === 'fading' }" x="60"
                        y="66" text-anchor="middle" font-family="'Geist Variable', system-ui, sans-serif" font-size="44"
                        font-weight="700" fill="var(--background)">
                        I
                    </text>
                </svg>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Hexagon stroke path — total length for draw-on animation */
.hex-stroke {
    color: var(--foreground);
    stroke-dasharray: 440;
    stroke-dashoffset: 440;
    opacity: 0;
}

.hex-stroke.drawing {
    opacity: 1;
    animation: draw-hex 0.6s ease-out forwards;
}

@keyframes draw-hex {
    0% {
        stroke-dashoffset: 440;
    }

    100% {
        stroke-dashoffset: 0;
    }
}

/* Filled hexagon background — fades in after stroke */
.hex-fill {
    color: var(--foreground);
    opacity: 0;
    transform-origin: center;
    transition: none;
}

.hex-fill.visible {
    animation: fill-hex 0.35s ease-out forwards;
}

@keyframes fill-hex {
    0% {
        opacity: 0;
        transform: scale(0.85);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* The "I" letter — scales + fades in */
.hex-letter {
    opacity: 0;
    transform-origin: center;
    transition: none;
}

.hex-letter.visible {
    animation: reveal-letter 0.4s ease-out forwards;
    animation-delay: 0.1s;
}

@keyframes reveal-letter {
    0% {
        opacity: 0;
        transform: scale(0.5);
    }

    60% {
        opacity: 1;
        transform: scale(1.1);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* Overall splash screen sizing */
.splash-logo {
    width: 100px;
    height: 87px;
}

.splash-hexagon {
    width: 100%;
    height: 100%;
    overflow: visible;
}

/* Fade-out when data is ready */
.splash-fading {
    animation: fade-out 0.4s ease-in forwards;
}

@keyframes fade-out {
    0% {
        opacity: 1.5;
    }

    100% {
        opacity: 0;
    }
}

/* Vue <Transition> classes (fallback) */
.splash-fade-leave-active {
    transition: opacity 0.4s ease-in;
}

.splash-fade-leave-to {
    opacity: 0;
}
</style>
