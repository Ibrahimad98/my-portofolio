<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { ArrowUpRight, ArrowRight, Download } from 'lucide-vue-next'
import BrandLoader from '@/components/layout/BrandLoader.vue'

const store = usePortfolioStore()
const { owner, featuredProjects, totalProjects, categories, techStackSummary, loading } =
    storeToRefs(store)

function year(date: string) {
    return new Date(date).getFullYear()
}
</script>

<template>
    <div>
        <!-- Loading State -->
        <BrandLoader v-if="loading" />

        <template v-else>
            <!-- ───────────────── HERO ───────────────── -->
            <section class="border-b border-border">
                <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 sm:pt-24 sm:pb-14">
                    <!-- Masthead meta row -->
                    <div
                        class="flex flex-wrap items-center justify-between gap-y-2 eyebrow text-muted-foreground border-b border-border pb-4 mb-10">
                        <span>{{ owner?.location ?? 'Indonesia' }}</span>
                        <span class="hidden sm:inline">{{ owner?.title ?? 'Full-Stack Developer' }}</span>
                        <span>© {{ new Date().getFullYear() }}</span>
                    </div>

                    <!-- Oversized name -->
                    <h1 class="display font-medium text-foreground text-[15vw] sm:text-8xl lg:text-[7.5rem]">
                        {{ owner?.name }}
                    </h1>

                    <!-- Statement + actions -->
                    <div class="mt-10 grid gap-8 md:grid-cols-12">
                        <p class="md:col-span-7 text-lg sm:text-xl text-foreground/80 leading-relaxed text-pretty">
                            {{ owner?.bio }}
                        </p>
                        <div class="md:col-span-5 md:justify-self-end flex flex-col gap-3 text-mono text-sm">
                            <a v-if="owner?.resumeUrl" :href="owner.resumeUrl" download
                                class="group inline-flex items-center justify-between gap-6 border-b border-border pb-2 text-foreground hover:text-muted-foreground transition-colors">
                                <span class="link-underline">DOWNLOAD CV</span>
                                <Download class="size-4" />
                            </a>
                            <a v-if="owner?.email" :href="`mailto:${owner.email}`"
                                class="group inline-flex items-center justify-between gap-6 border-b border-border pb-2 hover:text-foreground text-muted-foreground transition-colors">
                                <span class="link-underline">EMAIL</span>
                                <ArrowUpRight class="size-4" />
                            </a>
                            <a v-if="owner?.github" :href="owner.github" target="_blank" rel="noopener noreferrer"
                                class="group inline-flex items-center justify-between gap-6 border-b border-border pb-2 hover:text-foreground text-muted-foreground transition-colors">
                                <span class="link-underline">GITHUB</span>
                                <ArrowUpRight class="size-4" />
                            </a>
                            <a v-if="owner?.linkedin" :href="owner.linkedin" target="_blank" rel="noopener noreferrer"
                                class="group inline-flex items-center justify-between gap-6 border-b border-border pb-2 hover:text-foreground text-muted-foreground transition-colors">
                                <span class="link-underline">LINKEDIN</span>
                                <ArrowUpRight class="size-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Full-bleed tech marquee -->
                <div class="border-t border-border overflow-hidden py-4">
                    <div class="flex w-max animate-marquee text-mono text-sm uppercase tracking-wider text-muted-foreground">
                        <span v-for="n in 2" :key="n" class="flex shrink-0">
                            <span v-for="tech in techStackSummary" :key="`${n}-${tech.name}`"
                                class="flex items-center">
                                <span class="px-6">{{ tech.name }}</span>
                                <span class="text-border">/</span>
                            </span>
                        </span>
                    </div>
                </div>
            </section>

            <!-- ───────────────── INDEX / FIGURES ───────────────── -->
            <section v-reveal class="border-b border-border">
                <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-3 divide-x divide-border">
                    <div class="py-8 pr-4">
                        <p class="text-4xl sm:text-6xl font-medium display text-foreground">{{ totalProjects }}</p>
                        <p class="eyebrow text-muted-foreground mt-3">Projects</p>
                    </div>
                    <div class="py-8 px-4 sm:px-8">
                        <p class="text-4xl sm:text-6xl font-medium display text-foreground">{{ techStackSummary.length }}</p>
                        <p class="eyebrow text-muted-foreground mt-3">Technologies</p>
                    </div>
                    <div class="py-8 pl-4 sm:pl-8">
                        <p class="text-4xl sm:text-6xl font-medium display text-foreground">{{ categories.length }}</p>
                        <p class="eyebrow text-muted-foreground mt-3">Categories</p>
                    </div>
                </div>
            </section>

            <!-- ───────────────── SELECTED WORK ───────────────── -->
            <section class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div v-reveal class="flex items-baseline justify-between mb-2">
                    <h2 class="eyebrow text-muted-foreground">(01) — Selected Work</h2>
                    <RouterLink to="/projects"
                        class="group eyebrow text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                        <span class="link-underline">All Projects</span>
                        <ArrowRight class="size-3.5" />
                    </RouterLink>
                </div>

                <ul>
                    <li v-for="(project, index) in featuredProjects" :key="project.slug" v-reveal>
                        <RouterLink :to="`/projects/${project.slug}`"
                            class="group grid grid-cols-12 items-baseline gap-3 sm:gap-6 border-t border-border py-7 sm:py-9 transition-colors hover:bg-muted/30">
                            <span class="col-span-2 sm:col-span-1 eyebrow text-muted-foreground pt-2">
                                {{ String(index + 1).padStart(2, '0') }}
                            </span>
                            <div class="col-span-10 sm:col-span-6">
                                <h3
                                    class="display font-medium text-3xl sm:text-5xl text-foreground transition-transform duration-300 group-hover:translate-x-2">
                                    {{ project.title }}
                                </h3>
                                <p class="text-mono text-xs uppercase tracking-wider text-muted-foreground mt-3">
                                    {{ project.category }} · {{ year(project.completedAt) }}
                                </p>
                            </div>
                            <div
                                class="hidden sm:block sm:col-span-4 text-mono text-xs text-muted-foreground leading-relaxed pt-2">
                                {{ project.techStack.slice(0, 5).join(' / ') }}
                            </div>
                            <div class="col-span-12 sm:col-span-1 flex justify-end pt-2">
                                <ArrowUpRight
                                    class="size-5 sm:size-6 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:-translate-y-1 group-hover:translate-x-1" />
                            </div>
                        </RouterLink>
                    </li>
                </ul>
                <div class="border-t border-border" />
            </section>

            <!-- ───────────────── STACK ───────────────── -->
            <section class="border-y border-border bg-muted/20">
                <div v-reveal class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 grid gap-8 md:grid-cols-12">
                    <h2 class="md:col-span-3 eyebrow text-muted-foreground">(02) — Stack</h2>
                    <ul class="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                        <li v-for="tech in techStackSummary" :key="tech.name"
                            class="flex items-baseline justify-between gap-2 border-b border-border/60 pb-2 text-mono text-sm text-foreground">
                            <span>{{ tech.name }}</span>
                            <span class="text-xs text-muted-foreground">×{{ tech.count }}</span>
                        </li>
                    </ul>
                </div>
            </section>

            <!-- ───────────────── CONTACT ───────────────── -->
            <section class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                <div v-reveal>
                    <p class="eyebrow text-muted-foreground mb-6">(03) — Contact</p>
                    <a v-if="owner?.email" :href="`mailto:${owner.email}`" class="group inline-block">
                        <h2
                            class="display font-medium text-foreground text-[12vw] sm:text-7xl lg:text-8xl transition-transform duration-300 group-hover:-translate-y-1">
                            Let's talk
                            <ArrowUpRight
                                class="inline-block size-[0.7em] -translate-y-2 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:translate-x-2" />
                        </h2>
                    </a>
                    <p v-if="owner?.email" class="text-mono text-sm text-muted-foreground mt-6">{{ owner.email }}</p>
                </div>
            </section>
        </template>
    </div>
</template>
