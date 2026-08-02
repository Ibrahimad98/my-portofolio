<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SplashScreen from '@/components/layout/SplashScreen.vue'
import PageLoader from '@/components/layout/PageLoader.vue'
import PixelScene from '@/components/pixel/PixelScene.vue'
import CloudTransition from '@/components/pixel/CloudTransition.vue'
import WeaponPicker from '@/components/pixel/WeaponPicker.vue'
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

  <!--
    Ambient pixel world. Sits above the body background (bg-background from the
    base layer) but below all content, so the site reads as sitting on top of the
    world. Mounted once here, never per route.
  -->
  <PixelScene v-if="!showSplash" />

  <!-- No bg-background here: an opaque wrapper would hide the scene entirely.
       The body supplies the page background instead. -->
  <div
    v-show="!showSplash"
    class="relative z-10 min-h-screen flex flex-col text-foreground antialiased"
  >
    <AppHeader />
    <main class="flex-1">
      <!--
        No crossfade here. The cloud cover IS the page transition, and an
        out-in fade on top of it kept the OLD view on screen for 150ms after
        navigation, then faded the new one in over another 150ms — all of it
        happening while the clouds were already parting. Swapping instantly
        under full cover is the whole point.
      -->
      <RouterView />
    </main>
    <AppFooter />
  </div>

  <!-- Weapon / holster control for the pixel character. -->
  <WeaponPicker v-if="!showSplash" />

  <!-- Cloud wipe between routes. Above everything, so it can actually hide the swap. -->
  <CloudTransition />
</template>


