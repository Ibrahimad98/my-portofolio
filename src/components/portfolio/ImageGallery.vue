<script setup lang="ts">
import { ref } from 'vue'
import type { ProjectImage } from '@/types/Portfolio'
import Dialog from '@/components/ui/Dialog.vue'
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  images: ProjectImage[]
}

const props = defineProps<Props>()

const lightboxOpen = ref(false)
const activeIndex = ref(0)

function openLightbox(index: number) {
  activeIndex.value = index
  lightboxOpen.value = true
}

function prevImage() {
  activeIndex.value =
    activeIndex.value > 0 ? activeIndex.value - 1 : props.images.length - 1
}

function nextImage() {
  activeIndex.value =
    activeIndex.value < props.images.length - 1 ? activeIndex.value + 1 : 0
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}
</script>

<template>
  <div>
    <!-- Thumbnail Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button
        v-for="(image, index) in images"
        :key="index"
        class="group relative aspect-video overflow-hidden rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
        @click="openLightbox(index)"
      >
        <img
          :src="image.src"
          :alt="image.alt"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <ZoomIn class="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </button>
    </div>

    <!-- Lightbox Dialog -->
    <Dialog v-model:open="lightboxOpen" class="max-w-4xl p-0 overflow-hidden" @keydown="onKeydown">
      <div class="relative">
        <!-- Image -->
        <img
          :src="images[activeIndex]?.src"
          :alt="images[activeIndex]?.alt"
          class="w-full max-h-[75vh] object-contain bg-black/5"
        />

        <!-- Navigation Arrows -->
        <button
          v-if="images.length > 1"
          class="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background shadow-md transition-colors cursor-pointer"
          @click.stop="prevImage"
        >
          <ChevronLeft class="size-5" />
        </button>
        <button
          v-if="images.length > 1"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background shadow-md transition-colors cursor-pointer"
          @click.stop="nextImage"
        >
          <ChevronRight class="size-5" />
        </button>

        <!-- Caption -->
        <div class="p-4 bg-background border-t border-border">
          <p class="text-sm text-muted-foreground text-center">
            {{ images[activeIndex]?.caption }}
          </p>
          <p class="text-xs text-muted-foreground/60 text-center mt-1">
            {{ activeIndex + 1 }} / {{ images.length }}
          </p>
        </div>
      </div>
    </Dialog>
  </div>
</template>
