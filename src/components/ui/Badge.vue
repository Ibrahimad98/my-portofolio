<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'interactive'

interface Props {
    variant?: BadgeVariant
    class?: string
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
})

/**
 * For interactive badges, pick a random accent color per instance.
 * The color is stable for the lifetime of the component.
 */
const accentColors = [
    { bg: 'hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200', ring: 'hover:ring-blue-300/40' },
    { bg: 'hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-200', ring: 'hover:ring-emerald-300/40' },
    { bg: 'hover:bg-amber-100 hover:text-amber-700 hover:border-amber-200', ring: 'hover:ring-amber-300/40' },
    { bg: 'hover:bg-violet-100 hover:text-violet-700 hover:border-violet-200', ring: 'hover:ring-violet-300/40' },
    { bg: 'hover:bg-rose-100 hover:text-rose-700 hover:border-rose-200', ring: 'hover:ring-rose-300/40' },
    { bg: 'hover:bg-cyan-100 hover:text-cyan-700 hover:border-cyan-200', ring: 'hover:ring-cyan-300/40' },
]
const randomAccent = accentColors[Math.floor(Math.random() * accentColors.length)]!

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border text-foreground',
    destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
    interactive: [
        'bg-secondary text-secondary-foreground border border-transparent cursor-pointer',
        'hover:ring-2 hover:scale-105',
        randomAccent.bg,
        randomAccent.ring,
    ].join(' '),
}

const classes = computed(() =>
    cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 badge-shine',
        variantClasses[props.variant],
        props.class,
    ),
)
</script>

<template>
    <span :class="classes">
        <slot />
    </span>
</template>

<style scoped>
/* Shine sweep effect on first hover */
.badge-shine {
    position: relative;
    overflow: hidden;
}

.badge-shine::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg,
            transparent 0%,
            transparent 30%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 70%,
            transparent 100%);
    transform: translateX(-100%);
    transition: none;
    pointer-events: none;
}

.badge-shine:hover::after {
    animation: shine-sweep 0.6s ease-out forwards;
}

@keyframes shine-sweep {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}
</style>
