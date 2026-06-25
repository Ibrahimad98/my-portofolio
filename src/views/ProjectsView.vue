<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import ProjectGrid from '@/components/portfolio/ProjectGrid.vue'
import Button from '@/components/ui/Button.vue'
import BrandLoader from '@/components/layout/BrandLoader.vue'
import { Search, X } from 'lucide-vue-next'

const store = usePortfolioStore()
const { projects, categories, loading } = storeToRefs(store)

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

const filteredProjects = computed(() => {
    let result = projects.value

    if (selectedCategory.value) {
        result = result.filter((p) => p.category === selectedCategory.value)
    }

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(
            (p) =>
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.techStack.some((t) => t.toLowerCase().includes(query)),
        )
    }

    return result
})

function selectCategory(category: string | null) {
    selectedCategory.value = category
}

function clearFilters() {
    searchQuery.value = ''
    selectedCategory.value = null
}
</script>

<template>
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <!-- Loading State -->
        <BrandLoader v-if="loading" label="Loading projects" />

        <template v-else>
            <!-- Page Header -->
            <div v-reveal class="mb-10 border-b border-border pb-8">
                <div class="flex items-baseline justify-between eyebrow text-muted-foreground mb-6">
                    <span>(Index)</span>
                    <span>{{ projects.length }} Projects</span>
                </div>
                <h1 class="display font-medium text-foreground text-6xl sm:text-8xl">Projects</h1>
            </div>

            <!-- Filters -->
            <div class="flex flex-col gap-5 mb-10">
                <!-- Search -->
                <div class="relative">
                    <Search class="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input v-model="searchQuery" type="text"
                        placeholder="SEARCH BY NAME, DESCRIPTION, OR TECH…"
                        class="w-full h-11 border-b border-border bg-transparent pl-7 pr-8 font-mono text-xs uppercase tracking-wider text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-foreground transition-colors" />
                    <button v-if="searchQuery"
                        class="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        @click="searchQuery = ''">
                        <X class="size-4" />
                    </button>
                </div>

                <!-- Category Filter -->
                <div class="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-wider">
                    <button :class="[
                        'transition-colors cursor-pointer inline-flex items-center gap-1.5',
                        !selectedCategory ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    ]" @click="selectCategory(null)">
                        <span v-if="!selectedCategory">●</span> All
                    </button>
                    <button v-for="cat in categories" :key="cat" :class="[
                        'transition-colors cursor-pointer inline-flex items-center gap-1.5',
                        selectedCategory === cat ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    ]" @click="selectCategory(cat)">
                        <span v-if="selectedCategory === cat">●</span> {{ cat }}
                    </button>
                </div>
            </div>

            <!-- Results -->
            <div v-if="filteredProjects.length === 0" class="text-center py-16">
                <p class="text-muted-foreground text-lg mb-4">No projects found matching your filters</p>
                <Button variant="outline" @click="clearFilters">Clear Filters</Button>
            </div>

            <ProjectGrid v-else :projects="filteredProjects" />
        </template>
    </div>
</template>
