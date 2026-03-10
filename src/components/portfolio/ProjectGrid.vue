<script setup lang="ts">
import type { Project } from '@/types/Portfolio'
import ProjectCard from '@/components/portfolio/ProjectCard.vue'

interface Props {
  projects: Project[]
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ProjectCard
      v-for="project in projects"
      :key="project.slug"
      :project="project"
    />
  </div>
</template>
