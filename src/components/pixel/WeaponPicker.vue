<script setup lang="ts">
import { computed } from 'vue'
import { useWeapon } from './useWeapon'
import { usePixelSceneEnabled } from './usePixelSceneEnabled'

const {
  weapon, move, vehicle, fairy, fairyScreen, panelOpen,
  WEAPONS, MOVES, VEHICLES,
  selectWeapon, selectMove, selectVehicle, toggleFairy,
} = useWeapon()
const { enabled, isSupported } = usePixelSceneEnabled()

const summary = computed(() =>
  move.value === 'independent'
    ? 'Roaming'
    : (WEAPONS.find((w) => w.kind === weapon.value)?.label ?? 'Companion'),
)

// The fairy is a real DOM button floated over the canvas: the canvas itself is
// pointer-events:none, so nothing drawn on it can ever be clicked.
const fairyStyle = computed(() => ({
  left: `${fairyScreen.value.x}px`,
  top: `${fairyScreen.value.y}px`,
}))

const rowBase = 'block w-full text-left px-2.5 py-1 transition-colors cursor-pointer'
const rowOn = 'bg-foreground text-background'
const rowOff = 'text-muted-foreground hover:text-foreground'
</script>

<template>
  <template v-if="isSupported && enabled">
    <!-- Click target riding on top of the drawn fairy. The box is deliberately
         much larger than the sprite: it is also what tells the scene the pointer
         has arrived, which settles the fairy so it stops moving under you. -->
    <button v-if="fairy && fairyScreen.visible" type="button"
      :aria-expanded="panelOpen" aria-controls="scene-panel"
      aria-label="Companion options"
      class="fixed z-40 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer focus-visible:outline focus-visible:outline-ring"
      :style="fairyStyle" @click="panelOpen = !panelOpen" />

    <div class="fixed bottom-4 left-4 z-40 font-mono text-[11px] uppercase tracking-wider">
      <button type="button" :aria-expanded="panelOpen" aria-controls="scene-panel"
        class="border border-border bg-background/90 backdrop-blur px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        @click="panelOpen = !panelOpen">
        {{ summary }}
        <span class="text-muted-foreground/60">{{ panelOpen ? '−' : '+' }}</span>
      </button>

      <div v-show="panelOpen" id="scene-panel"
        class="mt-1 w-[12.5rem] border border-border bg-background/95 backdrop-blur divide-y divide-border">
        <div class="py-1">
          <p class="px-2.5 py-0.5 text-muted-foreground/60">Weapon</p>
          <button v-for="w in WEAPONS" :key="w.kind" type="button"
            :aria-pressed="weapon === w.kind" :class="[rowBase, weapon === w.kind ? rowOn : rowOff]"
            @click="selectWeapon(w.kind)">
            {{ w.label }}
          </button>
        </div>

        <div class="py-1">
          <p class="px-2.5 py-0.5 text-muted-foreground/60">Movement</p>
          <button v-for="m in MOVES" :key="m.kind" type="button" :title="m.hint"
            :aria-pressed="move === m.kind" :class="[rowBase, move === m.kind ? rowOn : rowOff]"
            @click="selectMove(m.kind)">
            {{ m.label }}
          </button>
        </div>

        <div class="py-1">
          <p class="px-2.5 py-0.5 text-muted-foreground/60">Vehicle</p>
          <button v-for="v in VEHICLES" :key="v.kind" type="button"
            :aria-pressed="vehicle === v.kind" :class="[rowBase, vehicle === v.kind ? rowOn : rowOff]"
            @click="selectVehicle(v.kind)">
            {{ v.label }}
          </button>
        </div>

        <div class="py-1">
          <button type="button" :aria-pressed="fairy"
            :class="[rowBase, fairy ? rowOn : rowOff]" @click="toggleFairy()">
            Fairy {{ fairy ? 'on' : 'off' }}
          </button>
        </div>

        <p class="px-2.5 py-1.5 text-muted-foreground/70 normal-case tracking-normal">
          Click the fairy to open this. Fly into the sky and it takes a broomstick.
        </p>
      </div>
    </div>
  </template>
</template>
