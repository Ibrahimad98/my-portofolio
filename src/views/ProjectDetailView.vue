<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import Button from '@/components/ui/Button.vue'
import ImageGallery from '@/components/portfolio/ImageGallery.vue'
import { ArrowLeft, ArrowUpRight } from 'lucide-vue-next'
import BrandLoader from '@/components/layout/BrandLoader.vue'

const route = useRoute()
const store = usePortfolioStore()
const { loading } = storeToRefs(store)

const project = computed(() => {
    const slug = route.params.slug as string
    return store.getProjectBySlug(slug)
})

function year(date: string) {
    return new Date(date).getFullYear()
}

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
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <!-- Loading State -->
        <BrandLoader v-if="loading" label="Loading project" />

        <!-- Not Found -->
        <div v-else-if="!project" class="text-center py-24">
            <p class="eyebrow text-muted-foreground mb-4">Error 404</p>
            <h2 class="display text-4xl font-medium text-foreground mb-6">Project not found</h2>
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
                class="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-10">
                <ArrowLeft class="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                Index
            </RouterLink>

            <!-- Header -->
            <div v-reveal class="border-b border-border pb-10 mb-12">
                <div class="flex items-baseline justify-between eyebrow text-muted-foreground mb-6">
                    <span>{{ project.category }}</span>
                    <span>{{ year(project.completedAt) }}</span>
                </div>

                <h1 class="display font-medium text-foreground text-5xl sm:text-7xl lg:text-8xl">
                    {{ project.title }}
                </h1>

                <p class="text-lg text-foreground/80 max-w-3xl mt-8 leading-relaxed text-pretty">
                    {{ project.description }}
                </p>

                <!-- Action links -->
                <div class="flex flex-wrap items-center gap-x-8 gap-y-3 mt-8 font-mono text-xs uppercase tracking-wider">
                    <a v-if="project.liveUrl" :href="project.liveUrl" target="_blank" rel="noopener noreferrer"
                        class="group inline-flex items-center gap-2 text-foreground">
                        <span class="link-underline">Live Demo</span>
                        <ArrowUpRight class="size-3.5" />
                    </a>
                    <a v-if="project.repoUrl" :href="project.repoUrl" target="_blank" rel="noopener noreferrer"
                        class="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <span class="link-underline">Source Code</span>
                        <ArrowUpRight class="size-3.5" />
                    </a>
                </div>
            </div>

            <!-- Gallery -->
            <section v-reveal class="mb-16">
                <p class="eyebrow text-muted-foreground mb-6">(01) — Gallery</p>
                <ImageGallery :images="project.images" />
            </section>

            <!-- Overview -->
            <section v-reveal class="mb-16 grid gap-8 md:grid-cols-12">
                <p class="md:col-span-3 eyebrow text-muted-foreground">(02) — Overview</p>
                <p class="md:col-span-9 text-foreground/90 leading-relaxed whitespace-pre-line text-lg text-pretty">
                    {{ project.overview }}
                </p>
            </section>

            <!-- Tech Stack -->
            <section v-reveal class="mb-16 grid gap-8 md:grid-cols-12 border-t border-border pt-12">
                <p class="md:col-span-3 eyebrow text-muted-foreground">(03) — Stack</p>
                <ul class="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                    <li v-for="tech in project.techStack" :key="tech"
                        class="border-b border-border/60 pb-2 text-mono text-sm text-foreground">
                        {{ tech }}
                    </li>
                </ul>
            </section>

            <!-- Navigation -->
            <div class="border-t border-border pt-10 flex justify-center">
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
