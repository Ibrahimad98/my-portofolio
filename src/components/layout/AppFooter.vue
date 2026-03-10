<script setup lang="ts">
import { Github, Linkedin, Mail } from 'lucide-vue-next'
import { usePortfolioStore } from '@/stores/portfolio'
import { storeToRefs } from 'pinia'

const store = usePortfolioStore()
const { owner } = storeToRefs(store)
</script>

<template>
  <footer class="border-t border-border bg-muted/30">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} {{ owner?.name ?? 'Adam Ibrahim' }}. All rights reserved.
        </p>
        <div class="flex items-center gap-3">
          <a
            v-if="owner?.github"
            :href="owner.github"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Github class="size-4" />
          </a>
          <a
            v-if="owner?.linkedin"
            :href="owner.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Linkedin class="size-4" />
          </a>
          <a
            v-if="owner?.email"
            :href="`mailto:${owner.email}`"
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Mail class="size-4" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
