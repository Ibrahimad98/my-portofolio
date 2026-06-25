<script setup lang="ts">
interface Props {
    /** Monogram initials shown inside the mark */
    initials?: string
    /** Show the wordmark text next to the mark */
    label?: string
    /** Size of the square mark in px */
    size?: number
}

withDefaults(defineProps<Props>(), {
    initials: 'IA',
    size: 30,
})
</script>

<template>
    <span class="group/logo inline-flex items-center gap-2.5 select-none">
        <!-- Monogram mark -->
        <span
            class="relative inline-flex items-center justify-center border border-foreground overflow-hidden transition-colors duration-300"
            :style="{ width: `${size}px`, height: `${size}px` }">
            <!-- invert fill on hover -->
            <span
                class="absolute inset-0 bg-foreground origin-bottom scale-y-0 transition-transform duration-300 ease-out group-hover/logo:scale-y-100" />
            <span
                class="relative font-mono font-medium leading-none tracking-tight text-foreground transition-colors duration-300 group-hover/logo:text-background"
                :style="{ fontSize: `${Math.round(size * 0.42)}px` }">
                {{ initials }}
            </span>
            <!-- corner accent tick -->
            <span class="absolute top-0 right-0 size-1.5 bg-foreground/90 group-hover/logo:bg-background transition-colors duration-300" />
        </span>

        <!-- Wordmark -->
        <span v-if="label"
            class="font-mono text-sm font-medium tracking-tight text-foreground">
            {{ label }}<span class="text-muted-foreground">.dev</span>
        </span>
    </span>
</template>
