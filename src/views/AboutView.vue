<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { ArrowUpRight, Download } from 'lucide-vue-next'
import BrandLoader from '@/components/layout/BrandLoader.vue'

const store = usePortfolioStore()
const { owner, loading } = storeToRefs(store)
</script>

<template>
    <div>
        <!-- Loading State -->
        <BrandLoader v-if="loading" />

        <template v-else-if="owner">
            <!-- ───────────── HERO ───────────── -->
            <section class="border-b border-border">
                <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24">
                    <div class="flex items-baseline justify-between eyebrow text-muted-foreground border-b border-border pb-4 mb-10">
                        <span>{{ owner.location }}</span>
                        <span>{{ owner.title }}</span>
                    </div>

                    <h1 class="display font-medium text-foreground text-6xl sm:text-8xl">About</h1>

                    <div class="mt-10 grid gap-8 md:grid-cols-12 items-start">
                        <div class="md:col-span-4 order-2 md:order-1">
                            <img v-if="owner.avatar" :src="owner.avatar" :alt="owner.name"
                                class="w-full max-w-[18rem] aspect-square object-cover border border-border grayscale hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div class="md:col-span-8 order-1 md:order-2 space-y-6">
                            <p class="text-xl sm:text-2xl text-foreground leading-relaxed text-pretty">
                                {{ owner.bio }}
                            </p>
                            <div class="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-wider pt-2">
                                <a v-if="owner.resumeUrl" :href="owner.resumeUrl" download
                                    class="group inline-flex items-center gap-2 text-foreground">
                                    <span class="link-underline">Download CV</span>
                                    <Download class="size-3.5" />
                                </a>
                                <a :href="'mailto:' + owner.email"
                                    class="group inline-flex items-center gap-2 text-foreground">
                                    <span class="link-underline">Email</span>
                                    <ArrowUpRight class="size-3.5" />
                                </a>
                                <a v-if="owner.github" :href="owner.github" target="_blank" rel="noopener noreferrer"
                                    class="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <span class="link-underline">GitHub</span>
                                    <ArrowUpRight class="size-3.5" />
                                </a>
                                <a v-if="owner.linkedin" :href="owner.linkedin" target="_blank" rel="noopener noreferrer"
                                    class="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <span class="link-underline">LinkedIn</span>
                                    <ArrowUpRight class="size-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <!-- ───────────── EXPERIENCE ───────────── -->
                <section v-reveal class="py-16 grid gap-8 md:grid-cols-12">
                    <p class="md:col-span-3 eyebrow text-muted-foreground">(01) — Experience</p>
                    <div class="md:col-span-9">
                        <article v-for="(exp, index) in owner.experience" :key="index"
                            class="grid gap-2 sm:grid-cols-12 border-t border-border py-8 first:border-t-0 first:pt-0">
                            <p class="sm:col-span-3 text-mono text-xs uppercase tracking-wider text-muted-foreground">
                                {{ exp.period }}
                            </p>
                            <div class="sm:col-span-9">
                                <h3 class="display text-2xl sm:text-3xl font-medium text-foreground">{{ exp.role }}</h3>
                                <p class="text-mono text-xs uppercase tracking-wider text-muted-foreground mt-1.5">
                                    {{ exp.company }}
                                </p>
                                <p class="text-foreground/80 mt-4 leading-relaxed">{{ exp.description }}</p>
                                <ul class="mt-4 space-y-1.5">
                                    <li v-for="(highlight, hIndex) in exp.highlights" :key="hIndex"
                                        class="flex gap-3 text-sm text-foreground/80">
                                        <span class="text-mono text-muted-foreground shrink-0">→</span>
                                        <span>{{ highlight }}</span>
                                    </li>
                                </ul>
                            </div>
                        </article>
                    </div>
                </section>

                <!-- ───────────── EDUCATION ───────────── -->
                <section v-reveal class="py-16 grid gap-8 md:grid-cols-12 border-t border-border">
                    <p class="md:col-span-3 eyebrow text-muted-foreground">(02) — Education</p>
                    <div class="md:col-span-9">
                        <article v-for="(edu, index) in owner.education" :key="index"
                            class="grid gap-2 sm:grid-cols-12 border-t border-border py-8 first:border-t-0 first:pt-0">
                            <p class="sm:col-span-3 text-mono text-xs uppercase tracking-wider text-muted-foreground">
                                {{ edu.period }}
                            </p>
                            <div class="sm:col-span-9">
                                <h3 class="display text-2xl font-medium text-foreground">{{ edu.institution }}</h3>
                                <p class="text-mono text-xs uppercase tracking-wider text-muted-foreground mt-1.5">
                                    {{ edu.degree }}<span v-if="edu.score"> · {{ edu.score }}</span>
                                </p>
                                <p class="text-foreground/80 mt-4 leading-relaxed">{{ edu.description }}</p>
                            </div>
                        </article>
                    </div>
                </section>

                <!-- ───────────── SKILLS ───────────── -->
                <section v-reveal class="py-16 grid gap-8 md:grid-cols-12 border-t border-border">
                    <p class="md:col-span-3 eyebrow text-muted-foreground">(03) — Skills</p>
                    <ul class="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                        <li v-for="skill in owner.skills" :key="skill"
                            class="border-b border-border/60 pb-2 text-mono text-sm text-foreground">
                            {{ skill }}
                        </li>
                    </ul>
                </section>
            </div>
        </template>
    </div>
</template>
