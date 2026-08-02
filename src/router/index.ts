import { createRouter, createWebHistory } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { startLoading, stopLoading } from '@/composables/useRouteLoading'
import { coverRoute, revealRoute } from '@/composables/useRouteTransition'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { titleTemplate: '{name} — Portfolio' },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
      meta: { titleTemplate: 'Projects — {name}' },
    },
    {
      path: '/projects/:slug',
      name: 'project-detail',
      component: () => import('@/views/ProjectDetailView.vue'),
      props: true,
      meta: { titleTemplate: 'Project Details — {name}' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { titleTemplate: 'About — {name}' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// Update page title on route change using owner name from store
router.beforeEach(async (to, from) => {
  startLoading()
  const store = usePortfolioStore()
  const ownerName = store.owner?.name ?? 'Portfolio'
  const template = (to.meta.titleTemplate as string) ?? '{name} — Portfolio'
  document.title = template.replace('{name}', ownerName)

  // Cover BEFORE the view swaps — that is the whole point. Skipped on first
  // load, which has nothing to transition from.
  if (from.name && to.name !== from.name) {
    await coverRoute()
  }
})

router.afterEach((to, from) => {
  stopLoading()
  if (from.name && to.name !== from.name) {
    void revealRoute()
  }
})

export default router
