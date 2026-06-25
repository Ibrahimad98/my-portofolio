<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Project } from '@/types/Portfolio'
import { ArrowUpRight } from 'lucide-vue-next'

interface Props {
    project: Project
}

defineProps<Props>()

function year(date: string) {
    return new Date(date).getFullYear()
}
</script>

<template>
    <RouterLink :to="`/projects/${project.slug}`" class="group block border border-border bg-card transition-colors hover:border-foreground">
        <!-- Media preview -->
        <div class="relative aspect-[4/3] overflow-hidden border-b border-border">
            <img :src="project.media[0]?.src" :alt="project.media[0]?.alt ?? project.title"
                class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy" />
            <span
                class="absolute top-3 left-3 font-mono text-[11px] uppercase tracking-wider bg-background/90 backdrop-blur px-2 py-1 border border-border">
                {{ project.category }}
            </span>
        </div>

        <!-- Body -->
        <div class="p-5">
            <div class="flex items-start justify-between gap-3">
                <h3 class="display text-xl font-medium text-foreground leading-tight">
                    {{ project.title }}
                </h3>
                <ArrowUpRight
                    class="size-4 shrink-0 mt-1 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>

            <p class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-2">
                {{ year(project.completedAt) }} — {{ project.techStack.slice(0, 3).join(' / ')
                }}<span v-if="project.techStack.length > 3"> +{{ project.techStack.length - 3 }}</span>
            </p>
        </div>
    </RouterLink>
</template>
