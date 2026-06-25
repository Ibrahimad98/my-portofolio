<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Project } from '@/types/Portfolio'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import Badge from '@/components/ui/Badge.vue'
import { ArrowRight } from 'lucide-vue-next'

interface Props {
    project: Project
}

defineProps<Props>()
</script>

<template>
    <RouterLink :to="`/projects/${project.slug}`" class="group block">
        <Card
            class="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
            <!-- Image Preview -->
            <div class="relative aspect-video overflow-hidden">
                <img :src="project.media[0]?.src" :alt="project.media[0]?.alt ?? project.title"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy" />
                <div
                    class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Badge variant="secondary" class="absolute top-3 right-3 bg-background/90 backdrop-blur-sm">
                    {{ project.category }}
                </Badge>
            </div>

            <CardHeader>
                <CardTitle class="flex items-center justify-between">
                    <span>{{ project.title }}</span>
                    <ArrowRight
                        class="size-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </CardTitle>
                <CardDescription>{{ project.description }}</CardDescription>
            </CardHeader>

            <CardFooter class="flex flex-wrap gap-1.5">
                <Badge v-for="tech in project.techStack.slice(0, 4)" :key="tech" variant="interactive"
                    class="text-[11px]">
                    {{ tech }}
                </Badge>
                <Badge v-if="project.techStack.length > 4" variant="interactive" class="text-[11px]">
                    +{{ project.techStack.length - 4 }}
                </Badge>
            </CardFooter>
        </Card>
    </RouterLink>
</template>
