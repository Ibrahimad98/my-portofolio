import { computed, ref, watch } from 'vue'

export type WeaponKind = 'none' | 'water' | 'spear' | 'sword'
export type WeaponHolder = 'cursor' | 'hero'
export type MoveMode = 'follow' | 'independent'
export type Vehicle = 'foot' | 'horse'

const KEY_WEAPON = 'portfolio-pixel-weapon'
const KEY_MOVE = 'portfolio-pixel-move'
const KEY_VEHICLE = 'portfolio-pixel-vehicle'
const KEY_FAIRY = 'portfolio-pixel-fairy'

export const WEAPONS: { kind: WeaponKind; label: string }[] = [
  { kind: 'none', label: 'None' },
  { kind: 'water', label: 'Water gun' },
  { kind: 'spear', label: 'Spear' },
  { kind: 'sword', label: 'Sword' },
]

export const MOVES: { kind: MoveMode; label: string; hint: string }[] = [
  { kind: 'follow', label: 'Follows you', hint: 'Walks toward the cursor' },
  { kind: 'independent', label: 'Independent', hint: 'Wanders the world on its own' },
]

export const VEHICLES: { kind: Vehicle; label: string }[] = [
  { kind: 'foot', label: 'On foot' },
  { kind: 'horse', label: 'Horse' },
]

function stored<T extends string>(key: string, fallback: T, valid: readonly T[]): T {
  if (typeof window === 'undefined') return fallback
  const v = localStorage.getItem(key) as T | null
  return v && valid.includes(v) ? v : fallback
}

// Module-level singletons: the panel and the canvas share one source of truth.
const weapon = ref<WeaponKind>(stored(KEY_WEAPON, 'water', WEAPONS.map((w) => w.kind)))
const holder = ref<WeaponHolder>('cursor')
const move = ref<MoveMode>(stored(KEY_MOVE, 'follow', ['follow', 'independent']))
const vehicle = ref<Vehicle>(stored(KEY_VEHICLE, 'foot', ['foot', 'horse']))
/**
 * Where the fairy currently is on screen, in CSS pixels, so the options panel
 * can float a real, focusable button over it. The canvas itself is
 * pointer-events:none, so the fairy cannot be clicked on the canvas.
 */
export const fairyScreen = ref({ x: -999, y: -999, visible: false })

/** Shared so the fairy and the corner button open the same panel. */
export const panelOpen = ref(false)

const fairy = ref(
  typeof window === 'undefined' ? true : localStorage.getItem(KEY_FAIRY) !== 'off',
)

/**
 * Movement is now its own switch rather than a side effect of holstering: you
 * can carry a sword and still let the character roam.
 */
const followsCursor = computed(() => move.value === 'follow')

watch(weapon, (w) => {
  localStorage.setItem(KEY_WEAPON, w)
  // A holstered weapon is held by nobody; melee is always swung by the
  // character, so only the water gun can actually change hands.
  if (w === 'none') holder.value = 'cursor'
  else if (w !== 'water') holder.value = 'hero'
})
watch(move, (m) => localStorage.setItem(KEY_MOVE, m))
watch(vehicle, (v) => localStorage.setItem(KEY_VEHICLE, v))
watch(fairy, (f) => localStorage.setItem(KEY_FAIRY, f ? 'on' : 'off'))

export function useWeapon() {
  return {
    weapon, holder, move, vehicle, fairy, followsCursor, fairyScreen, panelOpen,
    WEAPONS, MOVES, VEHICLES,
    selectWeapon: (k: WeaponKind) => { weapon.value = k },
    selectMove: (k: MoveMode) => { move.value = k },
    selectVehicle: (k: Vehicle) => { vehicle.value = k },
    toggleFairy: () => { fairy.value = !fairy.value },
  }
}
