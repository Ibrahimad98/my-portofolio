<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ProjectMedia } from '@/types/Portfolio'
import Dialog from '@/components/ui/Dialog.vue'
import { ZoomIn, Play, ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
    media: ProjectMedia[]
}

const props = defineProps<Props>()

const lightboxOpen = ref(false)
const activeIndex = ref(0)
const lightboxVideoRef = ref<HTMLVideoElement | null>(null)

function isVideo(item: ProjectMedia): boolean {
    return item.type === 'video'
}

function openLightbox(index: number) {
    activeIndex.value = index
    lightboxOpen.value = true
}

function prev() {
    pauseLightboxVideo()
    activeIndex.value =
        activeIndex.value > 0 ? activeIndex.value - 1 : props.media.length - 1
}

function next() {
    pauseLightboxVideo()
    activeIndex.value =
        activeIndex.value < props.media.length - 1 ? activeIndex.value + 1 : 0
}

function pauseLightboxVideo() {
    lightboxVideoRef.value?.pause()
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
}

// Pause video when lightbox closes
watch(lightboxOpen, (open) => {
    if (!open) pauseLightboxVideo()
})

// Auto-play video when navigating to a video slide in lightbox
watch(activeIndex, async () => {
    await nextTick()
    const current = props.media[activeIndex.value]
    if (current && isVideo(current) && lightboxVideoRef.value) {
        lightboxVideoRef.value.play()
    }
})
</script>

<template>
    <div>
        <!-- Thumbnail Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button v-for="(item, index) in media" :key="index"
                class="group relative aspect-video overflow-hidden rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                @click="openLightbox(index)">

                <!-- Video thumbnail: autoplay muted loop -->
                <video v-if="isVideo(item)" :src="item.src" :poster="item.poster" muted autoplay loop playsinline
                    preload="metadata"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />

                <!-- Image thumbnail -->
                <img v-else :src="item.src" :alt="item.alt"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy" />

                <!-- Overlay icon -->
                <div
                    class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <Play v-if="isVideo(item)"
                        class="size-8 text-white opacity-70 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                    <ZoomIn v-else
                        class="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <!-- Video badge -->
                <span v-if="isVideo(item)"
                    class="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    VIDEO
                </span>
            </button>
        </div>

        <!-- Lightbox Dialog -->
        <Dialog v-model:open="lightboxOpen" class="max-w-4xl p-0 overflow-hidden" @keydown="onKeydown">
            <div class="relative">
                <!-- Video in lightbox -->
                <video v-if="media[activeIndex] && isVideo(media[activeIndex]!)" ref="lightboxVideoRef"
                    :src="media[activeIndex]?.src" :poster="media[activeIndex]?.poster" controls autoplay
                    class="w-full max-h-[75vh] object-contain bg-black" />

                <!-- Image in lightbox -->
                <img v-else :src="media[activeIndex]?.src" :alt="media[activeIndex]?.alt"
                    class="w-full max-h-[75vh] object-contain bg-black/5" />

                <!-- Navigation Arrows -->
                <button v-if="media.length > 1"
                    class="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background shadow-md transition-colors cursor-pointer"
                    @click.stop="prev">
                    <ChevronLeft class="size-5" />
                </button>
                <button v-if="media.length > 1"
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background shadow-md transition-colors cursor-pointer"
                    @click.stop="next">
                    <ChevronRight class="size-5" />
                </button>

                <!-- Caption -->
                <div class="p-4 bg-background border-t border-border">
                    <p class="text-sm text-muted-foreground text-center">
                        {{ media[activeIndex]?.caption }}
                    </p>
                    <p class="text-xs text-muted-foreground/60 text-center mt-1">
                        {{ activeIndex + 1 }} / {{ media.length }}
                    </p>
                </div>
            </div>
        </Dialog>
    </div>
</template>
