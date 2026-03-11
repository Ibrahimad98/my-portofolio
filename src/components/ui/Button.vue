<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon'

interface Props {
    variant?: ButtonVariant
    size?: ButtonSize
    as?: string
    class?: string
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'default',
    as: 'button',
})

const variantClasses: Record<ButtonVariant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    outline:
        'border border-border bg-background hover:bg-muted hover:text-foreground',
    secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-muted hover:text-foreground',
    destructive:
        'bg-destructive/10 text-destructive hover:bg-destructive/20',
    link: 'text-primary underline-offset-4 hover:underline',
}

const sizeClasses: Record<ButtonSize, string> = {
    default: 'h-9 px-4 py-2',
    xs: 'h-6 px-2 text-xs rounded-md',
    sm: 'h-8 px-3 text-sm rounded-md',
    lg: 'h-10 px-6 text-base',
    icon: 'h-9 w-9',
}

const classes = computed(() =>
    cn(
        'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 cursor-pointer',
        variantClasses[props.variant],
        sizeClasses[props.size],
        props.class,
    ),
)
</script>

<template>
    <component :is="as" :class="classes" :disabled="disabled">
        <slot />
    </component>
</template>
