import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Project, PortfolioOwner } from '@/types/Portfolio'
import { projectService } from '@/services/projectService'

export const usePortfolioStore = defineStore('portfolio', () => {
  const projects = ref<Project[]>([])
  const owner = ref<PortfolioOwner | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const featuredProjects = computed(() =>
    projects.value.filter((p) => p.featured),
  )

  const categories = computed(() => {
    const cats = new Set(projects.value.map((p) => p.category))
    return Array.from(cats)
  })

  const totalProjects = computed(() => projects.value.length)

  const techStackSummary = computed(() => {
    const techMap = new Map<string, number>()
    projects.value.forEach((p) => {
      p.techStack.forEach((tech) => {
        techMap.set(tech, (techMap.get(tech) ?? 0) + 1)
      })
    })
    return Array.from(techMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  })

  function getProjectBySlug(slug: string): Project | undefined {
    return projects.value.find((p) => p.slug === slug)
  }

  async function fetchPortfolio() {
    loading.value = true
    error.value = null
    try {
      const data = await projectService.getAll()
      projects.value = data.projects
      owner.value = data.owner
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load portfolio data'
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    owner,
    loading,
    error,
    featuredProjects,
    categories,
    totalProjects,
    techStackSummary,
    getProjectBySlug,
    fetchPortfolio,
  }
})
