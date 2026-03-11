<script setup lang="ts">
import { ref, watch } from 'vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'

interface Props {
    open?: boolean
    class?: string
}

const props = withDefaults(defineProps<Props>(), {
    open: false,
})

const emit = defineEmits<{
    'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)

watch(
    () => props.open,
    (val) => {
        isOpen.value = val
    },
)

function close() {
    isOpen.value = false
    emit('update:open', false)
}

function onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
        close()
    }
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        close()
    }
}

const overlayClasses = computed(() =>
    cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity',
    ),
)

const contentClasses = computed(() =>
    cn(
        'relative z-50 max-h-[90vh] max-w-[90vw] overflow-auto rounded-xl border border-border bg-background p-6 shadow-xl',
        props.class,
    ),
)
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200"
            leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
            leave-to-class="opacity-0">
            <div v-if="isOpen" :class="overlayClasses" @click="onOverlayClick" @keydown="onKeydown" tabindex="-1">
                <div :class="contentClasses">
                    <button
                        class="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        @click="close">
                        <X class="size-4" />
                    </button>
                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
