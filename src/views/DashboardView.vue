<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Separator from '@/components/ui/Separator.vue'
import ImageGallery from '@/components/portfolio/ImageGallery.vue'
import {
    ArrowRight,
    Briefcase,
    Code2,
    Layers,
    MapPin,
    Github,
    Linkedin,
    Mail,
} from 'lucide-vue-next'

const store = usePortfolioStore()
const { owner, featuredProjects, totalProjects, categories, techStackSummary, loading } =
    storeToRefs(store)
</script>

<template>
    <div>
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>

        <template v-else>
            <!-- Hero Section -->
            <section class="relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <!-- Avatar -->
                        <div class="shrink-0">
                            <div class="relative">
                                <img v-if="owner?.avatar" :src="owner.avatar" :alt="owner.name"
                                    class="size-32 sm:size-40 rounded-2xl object-cover shadow-xl ring-4 ring-background" />
                                <div
                                    class="absolute -bottom-2 -right-2 size-8 rounded-lg bg-green-500 border-4 border-background" />
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="text-center md:text-left space-y-4">
                            <div>
                                <p class="text-sm font-medium text-primary mb-1">Hello, I'm</p>
                                <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                                    {{ owner?.name ?? 'Adam Ibrahim' }}
                                </h1>
                                <p class="text-xl sm:text-2xl text-muted-foreground mt-2">
                                    {{ owner?.title ?? 'Full-Stack Developer' }}
                                </p>
                            </div>

                            <p class="text-muted-foreground max-w-lg leading-relaxed">
                                {{ owner?.bio }}
                            </p>

                            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MapPin class="size-4" />
                                    <span>{{ owner?.location ?? 'Indonesia' }}</span>
                                </div>
                            </div>

                            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                                <RouterLink to="/projects">
                                    <Button>
                                        View All Projects
                                        <ArrowRight class="size-4" />
                                    </Button>
                                </RouterLink>
                                <a v-if="owner?.github" :href="owner.github" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline">
                                        <Github class="size-4" />
                                        GitHub
                                    </Button>
                                </a>
                                <a v-if="owner?.linkedin" :href="owner.linkedin" target="_blank"
                                    rel="noopener noreferrer">
                                    <Button variant="outline">
                                        <Linkedin class="size-4" />
                                        LinkedIn
                                    </Button>
                                </a>
                                <a v-if="owner?.email" :href="`mailto:${owner.email}`">
                                    <Button variant="outline">
                                        <Mail class="size-4" />
                                        Contact
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Stats Overview -->
            <section class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent class="flex items-center gap-4 p-6">
                            <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                <Briefcase class="size-6 text-primary" />
                            </div>
                            <div>
                                <p class="text-2xl font-bold text-foreground">{{ totalProjects }}</p>
                                <p class="text-sm text-muted-foreground">Total Projects</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex items-center gap-4 p-6">
                            <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                <Code2 class="size-6 text-primary" />
                            </div>
                            <div>
                                <p class="text-2xl font-bold text-foreground">{{ techStackSummary.length }}</p>
                                <p class="text-sm text-muted-foreground">Technologies</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex items-center gap-4 p-6">
                            <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                <Layers class="size-6 text-primary" />
                            </div>
                            <div>
                                <p class="text-2xl font-bold text-foreground">{{ categories.length }}</p>
                                <p class="text-sm text-muted-foreground">Categories</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator class="my-12 mx-auto max-w-6xl" />

            <!-- Featured Projects with Image Gallery -->
            <section class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-2xl sm:text-3xl font-bold text-foreground">Featured Projects</h2>
                        <p class="text-muted-foreground mt-1">Highlighting my best and most recent work</p>
                    </div>
                    <RouterLink to="/projects">
                        <Button variant="outline" size="sm">
                            View All
                            <ArrowRight class="size-4" />
                        </Button>
                    </RouterLink>
                </div>

                <div class="space-y-8">
                    <Card v-for="(project, index) in featuredProjects" :key="project.slug" class="overflow-hidden">
                        <div :class="[
                            'flex flex-col lg:flex-row gap-0',
                            index % 2 === 1 ? 'lg:flex-row-reverse' : '',
                        ]">
                            <!-- Image Gallery Side -->
                            <div class="lg:w-1/2 p-6">
                                <ImageGallery :images="project.images" />
                            </div>

                            <!-- Content Side -->
                            <div class="lg:w-1/2 flex flex-col justify-center p-6">
                                <div class="space-y-4">
                                    <div class="flex items-center gap-2">
                                        <Badge variant="secondary">{{ project.category }}</Badge>
                                        <Badge v-if="project.featured"
                                            class="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                            ⭐ Featured
                                        </Badge>
                                    </div>

                                    <h3 class="text-2xl font-bold text-foreground">{{ project.title }}</h3>
                                    <p class="text-muted-foreground leading-relaxed">{{ project.overview }}</p>

                                    <div class="flex flex-wrap gap-1.5">
                                        <Badge v-for="tech in project.techStack" :key="tech" variant="outline">
                                            {{ tech }}
                                        </Badge>
                                    </div>

                                    <div class="flex items-center gap-2 pt-2">
                                        <RouterLink :to="`/projects/${project.slug}`">
                                            <Button>
                                                View Details
                                                <ArrowRight class="size-4" />
                                            </Button>
                                        </RouterLink>
                                        <a v-if="project.liveUrl" :href="project.liveUrl" target="_blank"
                                            rel="noopener noreferrer">
                                            <Button variant="outline">Live Demo</Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            <!-- Tech Stack Overview -->
            <section class="bg-muted/30 border-t border-border">
                <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
                    <h2 class="text-2xl sm:text-3xl font-bold text-foreground mb-2">Tech Stack</h2>
                    <p class="text-muted-foreground mb-8">Technologies I work with across my projects</p>

                    <div class="flex flex-wrap gap-2">
                        <Badge v-for="tech in techStackSummary" :key="tech.name" variant="secondary"
                            class="text-sm px-4 py-1.5">
                            {{ tech.name }}
                            <span class="ml-1.5 text-xs text-muted-foreground">({{ tech.count }})</span>
                        </Badge>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>
