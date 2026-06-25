<script setup lang="ts">
defineProps<{
    visible: boolean
}>()
</script>

<template>
    <Transition name="loader-fade">
        <div v-if="visible" class="fixed inset-0 z-40 pointer-events-none">
            <!-- Top progress bar -->
            <div class="absolute top-0 left-0 right-0 h-0.5 overflow-hidden bg-muted">
                <div class="loader-bar absolute inset-y-0 bg-primary" />
            </div>

            <!-- Centered small hexagon spinner -->
            <div class="flex items-center justify-center h-full">
                <div class="loader-hex-wrapper">
                    <svg viewBox="0 0 120 104" class="loader-hexagon" xmlns="http://www.w3.org/2000/svg">
                        <path d="M60 2 L113.3 28 L113.3 76 L60 102 L6.7 76 L6.7 28 Z" fill="currentColor" stroke="none"
                            class="text-foreground" />
                        <text x="60" y="66" text-anchor="middle" font-family="'Geist Variable', system-ui, sans-serif"
                            font-size="44" font-weight="700" fill="var(--background)">
                            I
                        </text>
                    </svg>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Top progress bar — indeterminate slide animation */
.loader-bar {
    width: 40%;
    animation: slide 1.2s ease-in-out infinite;
}

@keyframes slide {
    0% {
        transform: translateX(-100%);
        left: 0;
    }

    50% {
        left: 60%;
    }

    100% {
        transform: translateX(100%);
        left: 100%;
    }
}

/* Small hexagon with pulse animation */
.loader-hex-wrapper {
    width: 48px;
    height: 42px;
    animation: hex-pulse 1s ease-in-out infinite;
}

.loader-hexagon {
    width: 100%;
    height: 100%;
    overflow: visible;
}

@keyframes hex-pulse {

    0%,
    100% {
        opacity: 0.4;
        transform: scale(0.9);
    }

    50% {
        opacity: 1;
        transform: scale(1);
    }
}

/* Fade transition */
.loader-fade-enter-active,
.loader-fade-leave-active {
    transition: opacity 0.2s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
    opacity: 0;
}
</style>
