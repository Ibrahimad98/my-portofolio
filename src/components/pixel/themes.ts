import {
  BENCH,
  BIG_HOUSE,
  BOAT,
  CAMPFIRE,
  CRATE,
  HOUSE,
  LIGHTHOUSE,
  MINE,
  PINE,
  ROCK,
  SHRUB,
  TENT,
  TREE,
  type Sprite,
} from './sprites'
import type { BackdropKind } from './procgen'

export interface ThemeStructure {
  sprite?: Sprite
  proc?: 'castle'
  t: number
  side: 'left' | 'right'
  interactive?: boolean
  smoke?: boolean
  solid?: boolean
  /** Integer pixel-doubling. A 16px hut next to an 11px person reads as a
   *  doll house; buildings need to be several times a figure. */
  scale?: number
}

export interface ScatterEntry {
  sprite: Sprite
  /** Items per screenful — kept low; naturalness comes from clustering. */
  count: number
  /** Items per clump. 1 scatters evenly, 3-5 reads as a copse. */
  clump?: number
  /** Minimum spacing in art px, so nothing overlaps into mush. */
  spacing?: number
}

/** Which endemic animal wanders this environment. */
export type CritterKind = 'cat' | 'fox' | 'deer' | 'owl' | 'hare' | 'boar' | 'crab' | 'gull' | 'reindeer' | 'lion'

export interface SceneTheme {
  label: string
  backdrop: BackdropKind
  structures: ThemeStructure[]
  scatter: ScatterEntry[]
  lamps: number
  roads: number
  villagers: number
  pedestrians: number
  /** Endemic animals. Several species per theme reads as an ecosystem;
   *  one repeated species reads as a clone stamp. */
  critters: CritterKind[]
  critterCount: number
  birds: number
  /** Ground detail density divisor — higher means sparser. */
  grass: number
  /** Drifting snow particles. */
  snow?: boolean
  /**
   * What lies beyond the horizon of each vista.
   *
   * 'sky'   — unreachable. Nothing is placed there and nobody can walk into it.
   * 'water' — the sea itself. Land entities are pushed back to the shore, fish
   *           live in it, and contact rings the surface.
   *
   * Either way the region is defined ONCE, by the backdrop's own horizon, so the
   * scenery and the world can never disagree about where the ground begins.
   */
  vista: 'sky' | 'water'
  /** Fish per screenful. Only meaningful when `vista` is 'water'. */
  fish?: number
}

/** Landing: open plains, a village, mountains on the horizon. */
const HOME: SceneTheme = {
  label: 'Plains',
  backdrop: 'plains',
  structures: [
    { proc: 'castle', t: 0.26, side: 'right', interactive: true, solid: true },
    { sprite: BIG_HOUSE, scale: 2, t: 0.58, side: 'left', interactive: true, smoke: true, solid: true },
    { sprite: HOUSE, scale: 2, t: 0.84, side: 'right', interactive: true, smoke: true, solid: true },
  ],
  scatter: [
    { sprite: TREE, count: 2.6, clump: 3, spacing: 16 },
    { sprite: SHRUB, count: 3, clump: 4, spacing: 9 },
    { sprite: ROCK, count: 1.6, clump: 2, spacing: 10 },
  ],
  lamps: 1.8,
  roads: 1,
  villagers: 1.3,
  pedestrians: 1.4,
  critters: ['cat', 'hare'],
  critterCount: 2.2,
  birds: 1.4,
  grass: 620,
  vista: 'sky',
}

/** Projects: high snowfield. Falling snow, pines, arctic foxes. */
const PROJECTS: SceneTheme = {
  label: 'Snowfield',
  backdrop: 'snow',
  structures: [
    { sprite: MINE, scale: 2, t: 0.30, side: 'left', interactive: true, smoke: true, solid: true },
    { sprite: MINE, scale: 2, t: 0.74, side: 'right', interactive: true, solid: true },
  ],
  scatter: [
    { sprite: PINE, count: 3.4, clump: 3, spacing: 13 },
    { sprite: ROCK, count: 2.4, clump: 3, spacing: 9 },
    { sprite: CRATE, count: 0.9, clump: 2, spacing: 10 },
  ],
  lamps: 0.8,
  roads: 1,
  villagers: 0.9,
  pedestrians: 1.1,
  critters: ['fox', 'hare'],
  critterCount: 2,
  birds: 0.8,
  // Snow reads as an empty ground plane; heavy grass would fight it.
  grass: 2600,
  snow: true,
  vista: 'sky',
}

/** Project detail: the coast. Land and water are strictly separate places. */
const DETAIL: SceneTheme = {
  label: 'Coast',
  backdrop: 'sea',
  structures: [
    { sprite: LIGHTHOUSE, scale: 2, t: 0.30, side: 'right', interactive: true, solid: true },
    { sprite: BOAT, t: 0.60, side: 'left' },
    { sprite: BENCH, t: 0.82, side: 'right' },
  ],
  scatter: [
    { sprite: ROCK, count: 2.6, clump: 3, spacing: 8 },
    { sprite: SHRUB, count: 1.4, clump: 2, spacing: 10 },
  ],
  lamps: 0.7,
  roads: 0,
  villagers: 0.9,
  pedestrians: 0,
  critters: ['crab', 'gull'],
  critterCount: 2.4,
  birds: 1.8,
  grass: 1400,
  // The sea beyond the horizon IS the water — there is no second river.
  vista: 'water',
  fish: 3,
}

/** About: deep woods. The densest theme by design — the contrast is the point. */
const ABOUT: SceneTheme = {
  label: 'Deep Wood',
  backdrop: 'treeline',
  structures: [
    { sprite: TENT, t: 0.14, side: 'left', solid: true },
    { sprite: CAMPFIRE, t: 0.17, side: 'left', interactive: true },
    { sprite: TENT, t: 0.62, side: 'right', solid: true },
  ],
  scatter: [
    { sprite: PINE, count: 9, clump: 3, spacing: 9 },
    { sprite: TREE, count: 4.6, clump: 2, spacing: 11 },
    { sprite: SHRUB, count: 5.2, clump: 3, spacing: 7 },
  ],
  lamps: 0.4,
  roads: 0,
  villagers: 0.7,
  pedestrians: 0,
  critters: ['deer', 'reindeer', 'lion', 'boar', 'hare'],
  critterCount: 2.8,
  birds: 0,
  grass: 380,
  vista: 'sky',
}

const THEMES: Record<string, SceneTheme> = {
  dashboard: HOME,
  projects: PROJECTS,
  'project-detail': DETAIL,
  about: ABOUT,
}

export function themeForRoute(name: string | undefined): SceneTheme {
  return (name && THEMES[name]) || HOME
}

/** Stable per-theme seed, so each page's layout is its own but reproducible. */
export function seedForRoute(name: string | undefined): number {
  const key = name ?? 'dashboard'
  let h = 0x5eed
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) | 0
  return h >>> 0
}
