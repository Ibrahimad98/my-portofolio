<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

interface Props {
  variant?: BadgeVariant
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-border text-foreground',
  destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
}

const classes = computed(() =>
  cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
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
