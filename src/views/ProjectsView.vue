<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import ProjectGrid from '@/components/portfolio/ProjectGrid.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
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
    <div v-if="loading" class="flex items-center justify-center min-h-[40vh]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <template v-else>
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-foreground">All Projects</h1>
        <p class="text-muted-foreground mt-2">
          Browse through all {{ projects.length }} projects I've built
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <!-- Search -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects by name, description, or tech..."
            class="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            @click="searchQuery = ''"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- Category Filter -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            :class="[
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ]"
            @click="selectCategory(null)"
          >
            All
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            :class="[
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ]"
            @click="selectCategory(cat)"
          >
            {{ cat }}
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
