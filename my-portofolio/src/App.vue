<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SplashScreen from '@/components/layout/SplashScreen.vue'
import PageLoader from '@/components/layout/PageLoader.vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useRouteLoading } from '@/composables/useRouteLoading'

const store = usePortfolioStore()
const { routeLoading } = useRouteLoading()

// Show splash only on the very first visit in this session
const showSplash = ref(!sessionStorage.getItem('splash-shown'))

function onSplashDone() {
  showSplash.value = false
  sessionStorage.setItem('splash-shown', '1')
}

onMounted(() => {
  store.fetchPortfolio()
})
</script>

<template>
  <!-- Splash screen — first visit per session only -->
  <SplashScreen v-if="showSplash" @done="onSplashDone" />

  <!-- Page transition loader (route changes) -->
  <PageLoader :visible="routeLoading && !showSplash" />

  <div v-show="!showSplash" class="min-h-screen flex flex-col bg-background text-foreground antialiased">
    <AppHeader />
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
/* Page transition — 150ms opacity fade */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
