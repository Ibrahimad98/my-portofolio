<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

onMounted(() => {
  store.fetchPortfolio()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground antialiased">
    <AppHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped></style>
