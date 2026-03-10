import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: 'Adam Ibrahim — Portfolio' },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
      meta: { title: 'Projects — Adam Ibrahim' },
    },
    {
      path: '/projects/:slug',
      name: 'project-detail',
      component: () => import('@/views/ProjectDetailView.vue'),
      props: true,
      meta: { title: 'Project Details — Adam Ibrahim' },
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

// Update page title on route change
router.beforeEach((to) => {
  document.title = (to.meta.title as string) ?? 'Adam Ibrahim — Portfolio'
})

export default router
