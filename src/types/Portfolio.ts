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

export interface Experience {
  company: string
  role: string
  period: string
  description: string
  highlights: string[]
}

export interface Education {
  institution: string
  degree: string
  period: string
  description: string
  score?: string
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
  phone?: string
  skills: string[]
  experience: Experience[]
  education: Education[]
}
