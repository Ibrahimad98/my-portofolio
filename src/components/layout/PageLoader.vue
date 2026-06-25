<script setup lang="ts">
defineProps<{
    visible: boolean
}>()
</script>

<template>
    <Transition name="loader-fade">
        <div v-if="visible" class="fixed inset-x-0 top-0 z-50 pointer-events-none">
            <!-- Thin indeterminate progress bar in brand foreground -->
            <div class="h-0.5 w-full overflow-hidden bg-border/60">
                <div class="page-loader-bar h-full bg-foreground" />
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.page-loader-bar {
    width: 35%;
    animation: page-loader-slide 1s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

@keyframes page-loader-slide {
    0% {
        transform: translateX(-120%);
    }

    100% {
        transform: translateX(400%);
    }
}

.loader-fade-enter-active,
.loader-fade-leave-active {
    transition: opacity 0.2s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .page-loader-bar {
        animation: page-loader-slide 1.6s linear infinite;
    }
}
</style>
