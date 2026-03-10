export interface ProjectImage {
  src: string
  alt: string
  caption: string
}

export interface Project {
  slug: string
  title: string
  description: string
  overview: string
  techStack: string[]
  images: ProjectImage[]
  liveUrl?: string
  repoUrl?: string
  featured: boolean
  category: string
  completedAt: string
}

export interface PortfolioOwner {
  name: string
  title: string
  bio: string
  avatar: string
  email: string
  github?: string
  linkedin?: string
  location: string
}
