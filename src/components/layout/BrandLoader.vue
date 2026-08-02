<script setup lang="ts">
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
    <!--
        Deliberately the SAME mark as the splash screen: a bordered square with
        the monogram and a fill that rises inside it. Views used to show a
        different loader here — a pulsing logo over a wide sliding track — so
        refreshing a page flashed a loading state that looked like it came from
        another site. One loading language everywhere.
    -->
    <div :class="['flex flex-col items-center justify-center gap-6', full ? 'min-h-[60vh]' : 'py-16']">
        <!-- bg-background is load-bearing: the monogram below blends with
             `difference`, which needs an OPAQUE backdrop. Without it the white
             glyph blends against transparency and vanishes on a light page. -->
        <div class="relative size-20 border border-foreground overflow-hidden bg-background">
            <span class="absolute inset-0 bg-foreground origin-bottom animate-loader-fill" />
            <span
                class="absolute inset-0 flex items-center justify-center font-mono text-2xl font-medium tracking-tight"
                style="mix-blend-mode: difference; color: #fff">
                {{ initials }}
            </span>
            <span class="absolute top-0 right-0 size-2 bg-foreground" />
        </div>

        <div class="relative h-px w-28 overflow-hidden bg-border">
            <span class="absolute inset-y-0 left-0 w-1/3 bg-foreground animate-loader-bar" />
        </div>

        <p class="eyebrow text-muted-foreground">
            {{ label }}<span class="animate-loader-dots">…</span>
        </p>
    </div>
</template>
