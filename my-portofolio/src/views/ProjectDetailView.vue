<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Separator from '@/components/ui/Separator.vue'
import MediaGallery from '@/components/portfolio/MediaGallery.vue'
import {
    ArrowLeft,
    ExternalLink,
    Github,
    Calendar,
} from 'lucide-vue-next'

const route = useRoute()
const store = usePortfolioStore()
const { loading } = storeToRefs(store)

const project = computed(() => {
    const slug = route.params.slug as string
    return store.getProjectBySlug(slug)
})

// Update page title when project loads
watch(
    project,
    (p) => {
        if (p) {
            const ownerName = store.owner?.name ?? 'Portfolio'
            document.title = `${p.title} — ${ownerName}`
        }
    },
    { immediate: true },
)
</script>

<template>
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center min-h-[40vh]">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>

        <!-- Not Found -->
        <div v-else-if="!project" class="text-center py-16">
            <h2 class="text-2xl font-bold text-foreground mb-2">Project not found</h2>
            <p class="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
            <RouterLink to="/projects">
                <Button>
                    <ArrowLeft class="size-4" />
                    Back to Projects
                </Button>
            </RouterLink>
        </div>

        <!-- Project Detail -->
        <template v-else>
            <!-- Back Button -->
            <RouterLink to="/projects"
                class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
                <ArrowLeft class="size-4" />
                Back to Projects
            </RouterLink>

            <!-- Header -->
            <div class="mb-8 space-y-4">
                <div class="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{{ project.category }}</Badge>
                    <Badge v-if="project.featured" class="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        ⭐ Featured
                    </Badge>
                    <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar class="size-3.5" />
                        <span>{{ new Date(project.completedAt).toLocaleDateString('en-US', {
                            year: 'numeric', month:
                                'long'
                        }) }}</span>
                    </div>
                </div>

                <h1 class="text-3xl sm:text-4xl font-bold text-foreground">
                    {{ project.title }}
                </h1>

                <p class="text-lg text-muted-foreground max-w-3xl">
                    {{ project.description }}
                </p>

                <!-- Action Buttons -->
                <div class="flex flex-wrap items-center gap-2">
                    <a v-if="project.liveUrl" :href="project.liveUrl" target="_blank" rel="noopener noreferrer">
                        <Button>
                            <ExternalLink class="size-4" />
                            Live Demo
                        </Button>
                    </a>
                    <a v-if="project.repoUrl" :href="project.repoUrl" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            <Github class="size-4" />
                            Source Code
                        </Button>
                    </a>
                </div>
            </div>

            <Separator class="my-8" />

            <!-- Image Gallery -->
            <section class="mb-12">
                <h2 class="text-xl font-semibold text-foreground mb-4">Gallery</h2>
                <MediaGallery :media="project.media" />
            </section>

            <!-- Project Overview -->
            <section class="mb-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p class="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {{ project.overview }}
                        </p>
                    </CardContent>
                </Card>
            </section>

            <!-- Tech Stack -->
            <section class="mb-12">
                <h2 class="text-xl font-semibold text-foreground mb-4">Tech Stack</h2>
                <div class="flex flex-wrap gap-2">
                    <Badge v-for="tech in project.techStack" :key="tech" variant="interactive"
                        class="text-sm px-4 py-1.5">
                        {{ tech }}
                    </Badge>
                </div>
            </section>

            <!-- Navigation -->
            <Separator class="my-8" />
            <div class="flex justify-center">
                <RouterLink to="/projects">
                    <Button variant="outline">
                        <ArrowLeft class="size-4" />
                        Back to All Projects
                    </Button>
                </RouterLink>
            </div>
        </template>
    </div>
</template>
