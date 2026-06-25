import type { Project, PortfolioOwner } from '@/types/Portfolio'
import data from '@/data/projects.json'

interface PortfolioData {
  owner: PortfolioOwner
  projects: Project[]
}

/**
 * Project service with a configurable base URL.
 * Currently loads from local JSON mock data.
 * To switch to a real API, replace the method bodies with fetch calls:
 *
 *   const res = await fetch(`${baseUrl}/projects`)
 *   return res.json()
 */
export function createProjectService(baseUrl?: string) {
  const _baseUrl = baseUrl ?? ''

  async function getAll(): Promise<PortfolioData> {
    if (_baseUrl) {
      const res = await fetch(`${_baseUrl}/projects`)
      return res.json() as Promise<PortfolioData>
    }
    // Load from local JSON mock
    return data as PortfolioData
  }

  async function getProjects(): Promise<Project[]> {
    const portfolio = await getAll()
    return portfolio.projects
  }

  async function getOwner(): Promise<PortfolioOwner> {
    const portfolio = await getAll()
    return portfolio.owner
  }

  async function getProjectBySlug(slug: string): Promise<Project | undefined> {
    const projects = await getProjects()
    return projects.find((p) => p.slug === slug)
  }

  async function getFeaturedProjects(): Promise<Project[]> {
    const projects = await getProjects()
    return projects.filter((p) => p.featured)
  }

  return {
    getAll,
    getProjects,
    getOwner,
    getProjectBySlug,
    getFeaturedProjects,
  }
}

// Default service instance (uses JSON mock)
export const projectService = createProjectService()
