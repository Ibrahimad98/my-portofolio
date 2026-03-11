<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Separator from '@/components/ui/Separator.vue'
import {
    User,
    Briefcase,
    GraduationCap,
    Wrench,
    MapPin,
    Mail,
    Phone,
    Github,
    Linkedin,
    ChevronRight,
} from 'lucide-vue-next'

const store = usePortfolioStore()
const { owner, loading } = storeToRefs(store)
</script>

<template>
    <div>
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>

        <template v-else-if="owner">
            <!-- Page Header -->
            <section class="relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div class="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                        <!-- Avatar -->
                        <div class="shrink-0">
                            <img v-if="owner.avatar" :src="owner.avatar" :alt="owner.name"
                                class="size-32 sm:size-40 rounded-2xl object-cover shadow-xl ring-4 ring-background" />
                        </div>

                        <!-- Bio -->
                        <div class="text-center md:text-left space-y-4 flex-1">
                            <div>
                                <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                    About Me
                                </h1>
                                <p class="text-lg text-primary font-medium mt-1">
                                    {{ owner.title }}
                                </p>
                            </div>

                            <p class="text-muted-foreground leading-relaxed max-w-2xl">
                                {{ owner.bio }}
                            </p>

                            <!-- Contact Info -->
                            <div
                                class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                <span class="inline-flex items-center gap-1.5">
                                    <MapPin class="size-4" />
                                    {{ owner.location }}
                                </span>
                                <span class="inline-flex items-center gap-1.5">
                                    <Mail class="size-4" />
                                    <a :href="'mailto:' + owner.email" class="hover:text-primary transition-colors">
                                        {{ owner.email }}
                                    </a>
                                </span>
                                <a v-if="owner.github" :href="owner.github" target="_blank" rel="noopener noreferrer"
                                    class="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                                    <Github class="size-4" />
                                    GitHub
                                </a>
                                <a v-if="owner.linkedin" :href="owner.linkedin" target="_blank"
                                    rel="noopener noreferrer"
                                    class="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                                    <Linkedin class="size-4" />
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 space-y-12">

                <!-- Professional Experience -->
                <section>
                    <div class="flex items-center gap-3 mb-8">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Briefcase class="size-5" />
                        </div>
                        <h2 class="text-2xl font-bold text-foreground">Professional Experience</h2>
                    </div>

                    <div class="relative">
                        <!-- Timeline line -->
                        <div class="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border hidden sm:block" />

                        <div class="space-y-8">
                            <div v-for="(exp, index) in owner.experience" :key="index"
                                class="relative flex gap-6 sm:gap-8">
                                <!-- Timeline dot -->
                                <div class="hidden sm:flex shrink-0 relative z-10">
                                    <div :class="[
                                        'size-10 rounded-full border-4 border-background flex items-center justify-center',
                                        index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    ]">
                                        <Briefcase class="size-4" />
                                    </div>
                                </div>

                                <!-- Content -->
                                <Card class="flex-1">
                                    <CardHeader>
                                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <CardTitle class="text-lg">{{ exp.role }}</CardTitle>
                                                <p class="text-primary font-medium text-sm mt-0.5">{{ exp.company }}</p>
                                            </div>
                                            <Badge variant="outline" class="self-start whitespace-nowrap">
                                                {{ exp.period }}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p class="text-muted-foreground text-sm mb-4">{{ exp.description }}</p>
                                        <ul class="space-y-2">
                                            <li v-for="(highlight, hIndex) in exp.highlights" :key="hIndex"
                                                class="flex items-start gap-2 text-sm text-foreground">
                                                <ChevronRight class="size-4 text-primary shrink-0 mt-0.5" />
                                                <span>{{ highlight }}</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                <Separator />

                <!-- Education -->
                <section>
                    <div class="flex items-center gap-3 mb-8">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <GraduationCap class="size-5" />
                        </div>
                        <h2 class="text-2xl font-bold text-foreground">Education</h2>
                    </div>

                    <div class="grid gap-6 md:grid-cols-2">
                        <Card v-for="(edu, index) in owner.education" :key="index">
                            <CardHeader>
                                <div class="flex flex-col gap-2">
                                    <div class="flex items-start justify-between gap-2">
                                        <CardTitle class="text-lg">{{ edu.institution }}</CardTitle>
                                        <Badge variant="outline" class="shrink-0 whitespace-nowrap">
                                            {{ edu.period }}
                                        </Badge>
                                    </div>
                                    <p class="text-primary font-medium text-sm">{{ edu.degree }}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p class="text-muted-foreground text-sm mb-3">{{ edu.description }}</p>
                                <Badge v-if="edu.score" variant="secondary">
                                    {{ edu.score }}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Separator />

                <!-- Skills -->
                <section>
                    <div class="flex items-center gap-3 mb-8">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Wrench class="size-5" />
                        </div>
                        <h2 class="text-2xl font-bold text-foreground">Skills & Technologies</h2>
                    </div>

                    <Card>
                        <CardContent class="pt-6">
                            <div class="flex flex-wrap gap-2">
                                <Badge v-for="skill in owner.skills" :key="skill" variant="secondary"
                                    class="text-sm px-3 py-1.5">
                                    {{ skill }}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </template>
    </div>
</template>
