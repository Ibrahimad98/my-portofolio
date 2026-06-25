<script setup lang="ts">
import LogoMark from '@/components/layout/LogoMark.vue'

interface Props {
    label?: string
    initials?: string
    /** Fill the viewport-ish height; set false for inline use */
    full?: boolean
}

withDefaults(defineProps<Props>(), {
    label: 'Loading',
    initials: 'IA',
    full: true,
})
</script>

<template>
    <div :class="['flex flex-col items-center justify-center gap-6', full ? 'min-h-[60vh]' : 'py-16']">
        <!-- Pulsing monogram -->
        <div class="animate-loader-pulse">
            <LogoMark :initials="initials" :size="52" />
        </div>

        <!-- Indeterminate progress track -->
        <div class="relative h-px w-40 overflow-hidden bg-border">
            <span class="absolute inset-y-0 left-0 w-1/3 bg-foreground animate-loader-bar" />
        </div>

        <!-- Mono status -->
        <p class="eyebrow text-muted-foreground">
            {{ label }}<span class="animate-loader-dots">…</span>
        </p>
    </div>
</template>
