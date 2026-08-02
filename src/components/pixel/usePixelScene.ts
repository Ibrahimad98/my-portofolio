import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import {
  BAT_FRAMES,
  BIRD_FRAMES,
  BOAT,
  BROOM_FRAMES,
  BOAR_FRAMES,
  CAT_FRAMES,
  CRAB_FRAMES,
  DEER_FRAMES,
  DROPLET,
  FAIRY_FRAMES,
  FIN_FRAMES,
  FISH_FRAMES,
  FOX_FRAMES,
  GULL_FRAMES,
  HARE_FRAMES,
  HORSE_FRAMES,
  LION_FRAMES,
  OWL_FRAMES,
  POOF,
  REINDEER_FRAMES,
  RIPPLE,
  GRASS,
  TORCH,
  WARRIOR_AIM,
  WARRIOR_FRAMES,
  WARRIOR_RIDE,
  WARRIOR_SHOOT,
  WARRIOR_SLASH,
  WARRIOR_THRUST,
  LAMP,
  SLASH_ARC,
  SMOKE,
  SPEAR,
  SPLASH,
  SWORD,
  THRUST_HIT,
  VILLAGER_FRAMES,
  WATER_GUN,
  spriteHeight,
  spriteWidth,
  type Sprite,
} from './sprites'
import { seedForRoute, themeForRoute, type CritterKind, type SceneTheme } from './themes'
import {
  renderBackdrop,
  renderCastle,
  renderMoon,
  scaleSprite,
  type ProcArt,
} from './procgen'
import {
  clearAll,
  distanceTo,
  measureTargets,
  setNear,
  strike,
  type ContentTarget,
} from './contentTargets'
import { fairyScreen, type MoveMode, type Vehicle, type WeaponHolder, type WeaponKind } from './useWeapon'

/* ------------------------------------------------------------------ tuning */

const SCALE = 4

const WALK_SPEED = 34
const RUN_SPEED = 88
const ACCEL = 150
const ARRIVE_RADIUS = 26
const STOP_RADIUS = 3
const RUN_RADIUS = 95
const STRIDE = 5

const NEAR_ENTER = 40
const NEAR_EXIT = 56

const PELLET_SPEED = 165
const PELLET_LIFE = 2.2
const SOAK_RADIUS = 10
const WET_SECONDS = 4.5
const FLEE_SECONDS = 1.8

/** Melee reach in art px, measured from the character's centre. */
const SPEAR_REACH = 22
const SWORD_REACH = 15
/** How long an attack pose is held. */
const ATTACK_TIME = 0.26
const RECOIL_TIME = 0.18

/** Content elements react within this distance of the character. */
const CONTENT_NEAR = 26

/** The sky drifts far slower than the ground it arches over. */
const SKY_PARALLAX = 0.22

/** Cursor must leave this radius before the character starts walking. */
/** How far below the horizon a road must sit, as a fraction of the viewport. */
const ROAD_CLEARANCE = 0.22

const FOLLOW_DEADZONE = 34

/** Pointer within this many art px settles the fairy so it can be clicked. */
const FAIRY_HOLD = 11

/** Where the sea starts and ends inside the coast band, as fractions of it. */
const COAST_SEA_TOP = 0.34
const COAST_SHORE = 0.72

const MAX_DT = 1 / 30
const HERO_HIT = { w: 14, h: 20 }

/* ----------------------------------------------------------------- palette */

type PaletteKey = 'k' | 's' | 'm' | 'f' | 'p' | 'd' | 'b' | 'w' | 'l' | 'g' | 'v' | 'r' | 'c' | 'e'
type Palette = Record<PaletteKey, string>

const VAR_BY_KEY: Record<PaletteKey, string> = {
  k: '--pixel-ink',
  s: '--pixel-shade',
  m: '--pixel-mid',
  f: '--pixel-soft',
  p: '--pixel-pale',
  d: '--pixel-brown-dark',
  b: '--pixel-brown',
  w: '--pixel-brown-soft',
  l: '--pixel-brown-pale',
  g: '--pixel-glow',
  v: '--pixel-cavity',
  r: '--pixel-scarf',
  c: '--pixel-crest',
  e: '--pixel-eye',
}

const WET_SWAP: Partial<Record<PaletteKey, PaletteKey>> = {
  f: 'm', m: 's', p: 'f', w: 'b', l: 'w',
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement)
  const out = {} as Palette
  for (const key of Object.keys(VAR_BY_KEY) as PaletteKey[]) {
    out[key] = style.getPropertyValue(VAR_BY_KEY[key]).trim() || '#888888'
  }
  return out
}

/* --------------------------------------------------------------- utilities */

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

interface DynCells {
  door: { col: number; row: number }[]
  window: { col: number; row: number }[]
  doorCols: number[]
}

const dynCache = new Map<Sprite, DynCells>()

function dynCells(sprite: Sprite): DynCells {
  let d = dynCache.get(sprite)
  if (!d) {
    const door: { col: number; row: number }[] = []
    const win: { col: number; row: number }[] = []
    const cols = new Set<number>()
    for (let row = 0; row < sprite.length; row++) {
      const line = sprite[row]!
      for (let col = 0; col < line.length; col++) {
        if (line[col] === 'D') { door.push({ col, row }); cols.add(col) }
        else if (line[col] === 'W') win.push({ col, row })
      }
    }
    d = { door, window: win, doorCols: [...cols].sort((a, b) => a - b) }
    dynCache.set(sprite, d)
  }
  return d
}

/* ---------------------------------------------------------------- entities */

type ActorMode = 'wander' | 'commute'

interface Actor {
  x: number; y: number; vx: number; vy: number
  facing: 1 | -1
  stride: number
  tx: number; ty: number; waitUntil: number
  bandMin: number; bandMax: number; yMin: number; yMax: number
  mode: ActorMode
  dir: 1 | -1
  speed: number
  wetUntil: number
  fleeUntil: number
  /** Index of the road this actor walks, or -1. */
  road: number
  /** Knockback impulse from a melee hit. */
  hitUntil: number
  /** Throttles water-contact ripples for this entity. */
  rippleAt: number
}

interface Structure {
  sprite: Sprite | null
  proc: ProcArt | null
  /** How the proc art was produced, so a palette change can rebuild it in
   *  place rather than rebuilding the entire world. */
  srcSprite: Sprite | null
  srcScale: number
  isCastle: boolean
  x: number; y: number
  w: number; h: number
  interactive: boolean
  smoke: boolean
  solid: boolean
  near: boolean
  openness: number
  emit: number
}

interface Prop { sprite: Sprite; x: number; y: number }
interface Puff { x: number; y: number; life: number }
interface Pellet { x: number; y: number; vx: number; vy: number; life: number }
interface Splash { x: number; y: number; life: number; sprite: Sprite }

/** A wide sweeping road. y varies with x — nothing here is a straight line. */
interface Road {
  baseY: number
  amp: number
  freq: number
  phase: number
  width: number
}

/**
 * A vista: the strip of distance beyond a horizon, in WORLD coordinates.
 *
 * The backdrop band is drawn here and the region above the horizon is off
 * limits to everything that walks. Because the band and the exclusion share one
 * definition, the scenery and the world can never disagree about where the
 * ground starts — which is exactly what went wrong when the backdrop lived on
 * its own parallax plane and slid independently of the world.
 */
interface Vista {
  /** World y of the band's top edge. */
  top: number
  /** World y of the horizon line. */
  horizon: number
  /** 'sky' is crossed on a broom, 'water' by boat; both block walking. */
  kind: 'sky' | 'water'
  water: boolean
  /** Shoreline wobble, so a coast never reads as a rectangle. */
  amp: number
  freq: number
  phase: number
}

interface Ripple {
  x: number
  y: number
  life: number
}

interface Flake {
  x: number
  y: number
  vx: number
  vy: number
  phase: number
}

interface Drawable {
  kind: 0 | 1 | 2 | 3 | 4
  sprite: Sprite | null
  proc: ProcArt | null
  x: number; y: number; baseY: number
  facing: 1 | -1
  wet: boolean
  struct: Structure | null
}

export interface PixelSceneControls {
  refreshPalette: () => void
  rebuild: () => void
}

export function usePixelScene(
  canvasRef: Ref<HTMLCanvasElement | null>,
  enabled: Ref<boolean>,
  routeName: Ref<string | undefined>,
  weapon: Ref<WeaponKind>,
  holder: Ref<WeaponHolder>,
  move: Ref<MoveMode>,
  vehicle: Ref<Vehicle>,
  fairyOn: Ref<boolean>,
): PixelSceneControls {
  let ctx: CanvasRenderingContext2D | null = null
  let palette = {} as Palette
  let raf = 0
  let last = 0
  let running = false

  let W = 0
  let Hv = 0
  let worldH = 0
  let camY = 0

  const spriteCache = new Map<Sprite, Map<string, HTMLCanvasElement>>()
  let ground: HTMLCanvasElement | null = null
  /** Two variants, alternated so repeats never tile identically. */
  let backdropBands: ProcArt[] = []
  let backdropStep = 0
  let castleArt: ProcArt | null = null

  let theme: SceneTheme = themeForRoute(undefined)
  const structures: Structure[] = []
  const props: Prop[] = []
  const lamps: Structure[] = []
  const actors: Actor[] = []
  const birds: { x: number; y: number; phase: number; speed: number; amp: number; baseY: number }[] = []
  const puffs: Puff[] = []
  const pellets: Pellet[] = []
  const splashes: Splash[] = []
  const roads: Road[] = []
  const vistas: Vista[] = []
  const ripples: Ripple[] = []
  const flakes: Flake[] = []
  /** Fish are kept separate from land actors: different rules, different water. */
  const fish: Actor[] = []
  let targets: ContentTarget[] = []
  let moonArt: ProcArt | null = null
  /**
   * Where the moon is along its arc: 0 below the horizon, 1 at rest, 2 climbed
   * away out of sight. It travels rather than blinking into existence.
   */
  // Default to 2 (out of sight), not 1. Anything that draws before the first
  // build should show no moon at all; a visible moon is opted into by night.
  let moonT = 2
  let moonTarget = 2
  /** First world build of this page load. */
  let firstBuild = true
  let isNight = false

  const hero: Actor = makeActor(0, 0)
  hero.bandMax = Number.MAX_SAFE_INTEGER
  hero.yMax = Number.MAX_SAFE_INTEGER

  const target = { x: 0, y: 0 }
  const cursor = { x: 0, y: 0, facing: 1 as 1 | -1 }

  /** True while the character is beyond a sky horizon, riding the broom. */
  let flying = false
  let boating = false
  /** Which medium the character was in last frame, to detect a change. */
  let medium: 'land' | 'sea' | 'sky' = 'land'
  /** Puffs of displaced air when the medium changes. */
  const poofs: { x: number; y: number; life: number }[] = []
  /** Wake left behind while moving across water. */
  const wakes: { x: number; y: number; life: number }[] = []
  /** Shark fins, confined to a water vista like the fish. */
  const fins: Actor[] = []
  const fairy = { x: 0, y: 0 }
  let fairyPhase = 0
  let fairyPublish = 0
  let wakeAt = 0
  /** Which shoulder it flies over. Only re-evaluated while actually walking. */
  let fairySide: 1 | -1 = 1
  /** Frozen because the pointer is on it, so it can actually be clicked. */
  let fairyHeld = false
  /** Slow-drifting motes of light, night only. */
  const fireflies: { x: number; y: number; phase: number; speed: number }[] = []

  /** Attack animation state. */
  let attackUntil = 0
  let attackKind: WeaponKind = 'none'
  let recoilUntil = 0

  let leftEdge = 0
  let rightEdge = 0
  let hasBands = false
  let clock = 0
  /** Half-open range of `actors` holding this theme's endemic critters. */
  let critterFrom = 0
  let critterTo = 0
  /** Species of each critter, indexed the same as the actors array. */
  const critterKind: CritterKind[] = []
  const isCritter = (i: number) => i >= critterFrom && i < critterTo

  function makeActor(x: number, y: number): Actor {
    return {
      x, y, vx: 0, vy: 0, facing: 1, stride: 0, tx: x, ty: y, waitUntil: 0,
      bandMin: 0, bandMax: 0, yMin: 0, yMax: 0,
      mode: 'wander', dir: 1, speed: 11,
      wetUntil: 0, fleeUntil: 0, road: -1, hitUntil: 0, rippleAt: 0,
    }
  }

  const reduceMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ------------------------------------------------------------- rendering */

  function buildSpriteCanvas(sprite: Sprite, variant: string): HTMLCanvasElement {
    const w = spriteWidth(sprite)
    const h = spriteHeight(sprite)
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d')!
    const wet = variant === 'wet'
    for (let row = 0; row < h; row++) {
      const line = sprite[row]!
      for (let col = 0; col < line.length; col++) {
        const ch = line[col]!
        if (ch === '.' || ch === 'D' || ch === 'W') continue
        let key = ch as PaletteKey
        if (wet) key = WET_SWAP[key] ?? key
        const color = palette[key]
        if (!color) continue
        g.fillStyle = color
        g.fillRect(col, row, 1, 1)
      }
    }
    return c
  }

  function spriteCanvas(sprite: Sprite, variant = 'base'): HTMLCanvasElement {
    let byVariant = spriteCache.get(sprite)
    if (!byVariant) { byVariant = new Map(); spriteCache.set(sprite, byVariant) }
    let c = byVariant.get(variant)
    if (!c) { c = buildSpriteCanvas(sprite, variant); byVariant.set(variant, c) }
    return c
  }

  function blit(sprite: Sprite, x: number, y: number, facing: 1 | -1, variant = 'base') {
    if (!ctx) return
    const c = spriteCanvas(sprite, variant)
    const px = Math.round(x)
    const py = Math.round(y)
    if (facing === -1) {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(c, -px - c.width, py)
      ctx.restore()
    } else {
      ctx.drawImage(c, px, py)
    }
  }

  /**
   * Soft halo around a light source. Concentric blocky rings rather than a
   * radial gradient — a smooth gradient fights the pixel grid, and stepped
   * rings read as the glow of a lamp at this resolution.
   */
  function glow(cx: number, cy: number, radius: number, strength = 0.5) {
    if (!ctx || !isNight || radius < 1) return
    // Concentric rings drawn as OUTLINES rather than filled discs. Filled discs
    // stack into an opaque blob that hides the very window or lamp they come
    // from; rings leave the centre clear so the source stays visible.
    //
    // Four rings, not six: this is a STEPPED halo on purpose. A finer falloff
    // reads as one smooth smear, where distinct bands read as light — and it is
    // what makes the moon and the torches work.
    const rings = 4
    ctx.fillStyle = palette.g
    for (let i = rings; i >= 1; i--) {
      const t = i / rings
      const r = radius * t
      const inner = radius * ((i - 1) / rings)
      // Linear-ish falloff keeps the outer bands visible instead of vanishing.
      ctx.globalAlpha = strength * (1.05 - t)
      for (let dy = -r; dy <= r; dy++) {
        const half = Math.sqrt(Math.max(r * r - dy * dy, 0))
        const hole = Math.sqrt(Math.max(inner * inner - dy * dy, 0))
        const x0 = Math.round(cx - half)
        const w = Math.max(Math.round(half - hole), 1)
        ctx.fillRect(x0, Math.round(cy + dy), w, 1)
        ctx.fillRect(Math.round(cx + hole), Math.round(cy + dy), w, 1)
      }
    }
    ctx.globalAlpha = 1
  }

  function shadow(x: number, y: number, w: number) {
    if (!ctx) return
    ctx.globalAlpha = 0.18
    ctx.fillStyle = palette.k
    ctx.fillRect(Math.round(x), Math.round(y), w, 1)
    ctx.globalAlpha = 1
  }

  /* -------------------------------------------------------- world building */

  function computeBands() {
    const contentHalf = Math.min(W * 0.5, (1152 / SCALE) * 0.5)
    const centre = W * 0.5
    leftEdge = centre - contentHalf
    rightEdge = centre + contentHalf
    hasBands = leftEdge > 26
  }

  function bandFor(side: 'left' | 'right'): { min: number; max: number } {
    if (!hasBands) return { min: 4, max: Math.max(W - 10, 6) }
    if (side === 'left') return { min: 4, max: Math.max(leftEdge - 12, 6) }
    const min = rightEdge + 4
    return { min, max: Math.max(W - 10, min + 2) }
  }

  function measureSections(): number[] {
    const out: number[] = []
    const scroll = window.scrollY
    for (const el of document.querySelectorAll('main section')) {
      const r = el.getBoundingClientRect()
      if (r.height < 40) continue
      out.push((r.bottom + scroll) / SCALE)
    }
    return out.sort((a, b) => a - b)
  }

  function snapToSection(y: number, sections: number[], tolerance = 70): number {
    let best = y
    let bestD = tolerance
    for (const s of sections) {
      const d = Math.abs(s - y)
      if (d < bestD) { bestD = d; best = s }
    }
    return best
  }

  /** The road's centreline at a given x — a broad sine sweep, never straight. */
  function roadYAt(road: Road, x: number): number {
    return road.baseY + Math.sin(x * road.freq + road.phase) * road.amp
  }

  /** The horizon / shoreline y of a vista at a given x. */
  function horizonYAt(v: Vista, x: number): number {
    return v.horizon + Math.sin(x * v.freq + v.phase) * v.amp
  }

  /** The vista whose beyond-the-horizon region contains this point, if any. */
  function beyondHorizon(x: number, y: number): Vista | null {
    for (const v of vistas) {
      if (y >= v.top - 40 && y < horizonYAt(v, x)) return v
    }
    return null
  }

  /**
   * Nothing that walks may go beyond a horizon. Push them back to the near side
   * and, on water, ring the surface so the boundary is felt rather than drawn.
   *
   * `canFly` exempts the hero from a SKY horizon — the sky is a different medium
   * to be crossed on a broomstick, not a wall. Water still blocks everyone:
   * nobody swims.
   */
  function keepBelowHorizon(a: Actor, canFly = false): boolean {
    const v = beyondHorizon(a.x, a.y)
    if (!v) return false
    // The hero has a medium for every zone: a broom for sky, a boat for sea.
    if (canFly) return false
    // Keep a small buffer rather than pinning to the line itself: standing
    // exactly on the horizon reads as standing *in* the distance.
    const line = horizonYAt(v, a.x) + 4
    a.y = line
    a.ty = Math.max(a.ty, line + 4)
    a.vy = 0
    if (v.water && clock > a.rippleAt) {
      // Throttled per entity, or the surface boils.
      a.rippleAt = clock + 0.35
      ripples.push({ x: a.x, y: line, life: 0 })
    }
    return true
  }

  /**
   * Clustered placement. Uniform random scatter reads as noise; real landscapes
   * grow in copses with clear ground between them. Seeds a few clump centres,
   * then rejects anything that lands too close to an existing item.
   */
  function placeNatural(
    rand: () => number,
    count: number,
    clump: number,
    spacing: number,
    topPad: number,
    bottom: number,
    placed: { x: number; y: number }[],
  ): { x: number; y: number }[] {
    const out: { x: number; y: number }[] = []
    // Round UP: rounding down turned a 7-item, 5-per-clump entry into a single
    // clump, which frequently landed entirely off-screen and looked like the
    // sprite had failed to render at all.
    const clumps = Math.max(1, Math.ceil(count / Math.max(clump, 1)))
    for (let c = 0; c < clumps; c++) {
      const band = bandFor(rand() < 0.5 ? 'left' : 'right')
      const cx = band.min + rand() * Math.max(band.max - band.min, 1)
      const cy = topPad + rand() * (bottom - topPad)
      const spread = spacing * 2.2
      for (let i = 0; i < clump && out.length < count; i++) {
        let ok = false
        let x = cx
        let y = cy
        // A few tries, then give up rather than force an overlap.
        for (let attempt = 0; attempt < 8 && !ok; attempt++) {
          x = clamp(cx + (rand() - 0.5) * spread * 2, band.min, band.max)
          y = clamp(cy + (rand() - 0.5) * spread * 2, topPad, bottom)
          ok = true
          for (const p of placed) {
            if (Math.abs(p.x - x) < spacing && Math.abs(p.y - y) < spacing) { ok = false; break }
          }
        }
        if (!ok) continue
        const item = { x, y }
        out.push(item)
        placed.push(item)
      }
    }
    return out
  }

  function ink(key: string): string {
    return palette[key as PaletteKey] ?? '#888888'
  }

  /**
   * Nudges a placement y down out of any vista, so nothing is ever built in the
   * sky or standing in the sea. Returns null when there is no room below.
   */
  function groundY(x: number, y: number, height: number, bottom: number): number | null {
    let out = y
    // Two passes: pushing clear of one vista can land inside the next.
    for (let pass = 0; pass < 2; pass++) {
      const v = beyondHorizon(x, out)
      if (!v) break
      out = horizonYAt(v, x) + 2 + height * 0.15
    }
    if (beyondHorizon(x, out)) return null
    return out > bottom ? null : out
  }

  function buildWorld() {
    theme = themeForRoute(routeName.value)
    const rand = mulberry32(seedForRoute(routeName.value))
    computeBands()

    structures.length = 0
    props.length = 0
    lamps.length = 0
    actors.length = 0
    birds.length = 0
    puffs.length = 0
    pellets.length = 0
    splashes.length = 0
    roads.length = 0
    vistas.length = 0
    ripples.length = 0
    flakes.length = 0
    fish.length = 0

    isNight = document.documentElement.classList.contains('dark')

    // On the very first build of a page load, place the moon at the END of its
    // arc that matches the current theme, and let it settle from there.
    //
    // Night: start below the horizon (0) and RISE to rest (1), so a refresh
    // never shows it popping in fully formed.
    // Day: start already climbed away (2) and STAY there. Parking it at rest
    // instead put a full moon in the daytime sky — the draw pass gates on moonT
    // alone, because a night→day change has to keep drawing it while it exits.
    if (firstBuild) {
      firstBuild = false
      moonT = isNight ? 0 : 2
      moonTarget = isNight ? 1 : 2
    }
    // The moon is effectively at infinity, so it is pinned to the viewport
    // rather than placed in the world — one moon, not one per backdrop band.
    // Gold, not pale: the moon is the scene's largest light source, so it is
    // drawn from the glow ramp like every other lit thing.
    // Kept even by day: the moon has to survive long enough to climb out.
    moonArt = renderMoon(ink, Math.max(Math.round(Hv * 0.06), 6), 'g')

    const sections = measureSections()
    const topPad = 16
    const bottom = Math.max(worldH - 10, topPad + 20)
    const screens = clamp(worldH / Math.max(Hv, 1), 1, 8)
    const perScreen = (n: number, cap = Infinity) => Math.min(Math.round(n * screens), cap)

    // --- roads: wide sweeping curves anchored to section boundaries
    const usable = sections.filter((s) => s > topPad + 40 && s < bottom - 30)
    const roadCount = theme.roads ? perScreen(theme.roads, 3) : 0
    for (let i = 0; i < roadCount; i++) {
      const anchor = usable.length
        ? usable[Math.floor(((i + 1) / (roadCount + 1)) * usable.length)]!
        : topPad + ((i + 1) / (roadCount + 1)) * (bottom - topPad)
      // A road drawn through the sky or the sea was the projects page conflict.
      const grounded = groundY(W * 0.5, anchor, 0, bottom)
      if (grounded === null) continue
      const amp = Hv * (0.16 + rand() * 0.1)
      // Ground the whole CURVE, not just its centreline: the meander swings by
      // ±amp, so a centreline that clears the horizon can still arc back over it.
      const crest = groundY(0, grounded - amp, 0, bottom)
      if (crest === null) continue
      // Clearance below the horizon. Merely *not overlapping* still read as
      // conflicting — a road hugging the skyline looks like it is running along
      // the scenery rather than across the ground in front of it.
      const clearance = Hv * ROAD_CLEARANCE
      roads.push({
        baseY: Math.min(crest + amp + clearance, bottom - amp - 4),
        // Wide, lazy meander: amplitude is a big fraction of a screen so the
        // curve is legible at viewport scale rather than looking like a wobble.
        amp,
        freq: (Math.PI * 2) / (W * (1.3 + rand() * 0.8)),
        phase: rand() * Math.PI * 2,
        width: 9 + Math.round(rand() * 4),
      })
    }

    // --- ONE vista, at the top of the world.
    //
    // Repeating vistas down the page sliced the ground into disconnected strips
    // the character could not walk between. A single generous band gives the
    // scenery its own room to be looked at, and leaves the entire rest of the
    // document as one continuous, walkable landscape.
    // A coast needs THREE zones — sky, then sea, then land — so the boat can be
    // a sea-only medium and the broom a sky-only one. Everything else has a
    // single sky band. The coast's band is taller to fit both.
    const isCoast = theme.vista === 'water'
    const bandH = Math.max(Math.round(Hv * (isCoast ? 1.35 : 0.95)), 40)
    const bandTop = topPad - Math.round(bandH * 0.1)

    if (isCoast) {
      const seaTop = bandTop + Math.round(bandH * COAST_SEA_TOP)
      vistas.push({
        top: bandTop, horizon: seaTop, kind: 'sky', water: false,
        amp: 0, freq: 0, phase: 0,
      })
      vistas.push({
        top: seaTop,
        horizon: bandTop + Math.round(bandH * COAST_SHORE),
        kind: 'water', water: true,
        // A coastline wobbles; a distant skyline does not need to.
        amp: 3 + rand() * 4,
        freq: (Math.PI * 2) / (W * (1.1 + rand() * 0.7)),
        phase: rand() * Math.PI * 2,
      })
    } else {
      vistas.push({
        top: bandTop,
        horizon: topPad + Math.round(bandH * 0.58),
        kind: 'sky', water: false,
        amp: 0, freq: 0, phase: 0,
      })
    }

    // --- backdrop art for the vista
    const seed = seedForRoute(routeName.value)
    backdropBands = [renderBackdrop(theme.backdrop, ink, Math.max(W, 1), bandH, seed)]
    backdropStep = bandH

    // --- fish: the only things allowed beyond a water horizon
    const waterVistas = vistas.filter((v) => v.water)
    const fishCount = waterVistas.length ? perScreen(theme.fish ?? 0, 12) : 0
    for (let i = 0; i < fishCount; i++) {
      const v = waterVistas[i % waterVistas.length]!
      const span = v.horizon - v.top
      const a = makeActor(rand() * W, v.top + span * (0.3 + rand() * 0.55))
      a.speed = 8 + rand() * 7
      a.bandMin = 4
      a.bandMax = Math.max(W - 6, 8)
      a.yMin = v.top
      a.yMax = v.horizon
      a.road = vistas.indexOf(v)
      a.waitUntil = rand() * 3
      fish.push(a)
    }
    // A couple of fins patrolling the same water.
    fins.length = 0
    for (let i = 0; i < Math.min(waterVistas.length * 2, 3); i++) {
      const v = waterVistas[i % waterVistas.length]!
      const span = v.horizon - v.top
      const a = makeActor(rand() * W, v.top + span * (0.35 + rand() * 0.4))
      a.speed = 11 + rand() * 6
      a.dir = rand() < 0.5 ? 1 : -1
      a.mode = 'commute'
      a.road = vistas.indexOf(v)
      fins.push(a)
    }

    // --- fireflies: the insect life of a warm night
    fireflies.length = 0
    if (isNight) {
      const n = Math.round((W * Hv) / 5200)
      for (let i = 0; i < n; i++) {
        fireflies.push({
          x: rand() * W,
          y: topPad + rand() * (bottom - topPad),
          phase: rand() * Math.PI * 2,
          speed: 3 + rand() * 4,
        })
      }
    }

    // --- drifting snow
    if (theme.snow) {
      const count = Math.round((W * Hv) / 900)
      for (let i = 0; i < count; i++) {
        flakes.push({
          x: rand() * W,
          y: rand() * Hv,
          vx: -3 + rand() * 6,
          vy: 6 + rand() * 10,
          phase: rand() * Math.PI * 2,
        })
      }
    }

    // --- structures
    if (!castleArt) castleArt = renderCastle(ink)
    for (const s of theme.structures) {
      // Scaled buildings become ProcArt so the doubling happens once at build
      // time rather than per frame.
      const art = s.proc === 'castle'
        ? castleArt
        : s.sprite && s.scale && s.scale > 1
          ? scaleSprite(s.sprite, Math.round(s.scale), ink)
          : null
      const sprite = art ? null : (s.sprite ?? null)
      const w = art ? art.w : sprite ? spriteWidth(sprite) : 0
      const h = art ? art.h : sprite ? spriteHeight(sprite) : 0
      const band = bandFor(s.side)
      const rawY = topPad + s.t * (bottom - topPad)
      let y = snapToSection(rawY, sections) - h
      // A structure's baseline is its feet, so that is what must clear the
      // horizon — this is what put the lighthouse in the sea.
      const grounded = groundY(0, y + h, h, bottom)
      if (grounded === null) continue
      y = grounded - h
      // A landmark wider than its side band would otherwise be shoved into the
      // reading column. Let it hang off the outer edge of the viewport instead:
      // at this scale a partly off-screen castle reads as monumental, whereas
      // one sitting on the body copy just reads as an obstruction.
      const bandW = band.max - band.min
      let x: number
      if (w > bandW) {
        x = s.side === 'right' ? W - w * 0.8 : -w * 0.2
      } else {
        x = clamp(band.min + rand() * (bandW - w), 2, Math.max(W - w - 2, 2))
      }
      structures.push({
        sprite, proc: art, w, h,
        srcSprite: s.sprite ?? null,
        srcScale: s.scale ?? 1,
        isCastle: s.proc === 'castle',
        x,
        y: clamp(y, topPad, Math.max(bottom - h, topPad)),
        interactive: !!s.interactive,
        smoke: !!s.smoke,
        solid: !!s.solid,
        near: false, openness: 0, emit: 0,
      })
    }

    // --- lamps follow the road curve
    const lampCount = perScreen(theme.lamps, 10)
    for (let i = 0; i < lampCount; i++) {
      const road = roads[i % Math.max(roads.length, 1)]
      const band = bandFor(rand() < 0.5 ? 'left' : 'right')
      const x = clamp(band.min + rand() * (band.max - band.min), band.min, band.max)
      const rawLampY = road ? roadYAt(road, x) : topPad + rand() * (bottom - topPad)
      const lampY = groundY(x, rawLampY, spriteHeight(LAMP), bottom)
      if (lampY === null) continue
      const y = lampY
      lamps.push({
        sprite: LAMP, proc: null,
        srcSprite: null, srcScale: 1, isCastle: false,
        w: spriteWidth(LAMP), h: spriteHeight(LAMP),
        x, y: y - spriteHeight(LAMP),
        interactive: true, smoke: false, solid: false,
        near: false, openness: 0, emit: 0,
      })
    }

    // --- scattered nature, clustered
    const placed: { x: number; y: number }[] = []
    for (const entry of theme.scatter) {
      const n = perScreen(entry.count, 34)
      const spots = placeNatural(
        rand, n, entry.clump ?? 1, entry.spacing ?? 10, topPad, bottom, placed,
      )
      for (const spot of spots) {
        // Trees and rocks belong on the ground, never floating in a vista.
        const py = groundY(spot.x, spot.y, spriteHeight(entry.sprite), bottom)
        if (py === null) continue
        props.push({ sprite: entry.sprite, x: spot.x, y: py })
      }
    }

    // --- villagers
    const villagerCount = perScreen(theme.villagers, 8)
    for (let i = 0; i < villagerCount; i++) {
      const band = bandFor(rand() < 0.5 ? 'left' : 'right')
      const vx = clamp(band.min + rand() * (band.max - band.min), band.min, band.max)
      const vy = groundY(vx, topPad + rand() * (bottom - topPad), 11, bottom)
      if (vy === null) continue
      const a = makeActor(vx, vy)
      a.bandMin = band.min; a.bandMax = band.max
      a.yMin = topPad; a.yMax = bottom
      a.speed = 11
      a.waitUntil = rand() * 4
      actors.push(a)
    }

    // --- pedestrians walking the curve
    const pedCount = roads.length ? perScreen(theme.pedestrians, 9) : 0
    for (let i = 0; i < pedCount; i++) {
      const ri = i % roads.length
      const a = makeActor(rand() * W, roadYAt(roads[ri]!, rand() * W))
      a.mode = 'commute'
      a.road = ri
      a.dir = rand() < 0.5 ? 1 : -1
      a.speed = 12 + rand() * 8
      a.bandMin = 0; a.bandMax = W
      actors.push(a)
    }

    // --- endemic animal for this environment
    critterFrom = actors.length
    critterKind.length = 0
    const critterCount = theme.critters.length ? perScreen(theme.critterCount, 8) : 0
    for (let i = 0; i < critterCount; i++) {
      const band = bandFor(rand() < 0.5 ? 'left' : 'right')
      const cx = clamp(band.min + rand() * (band.max - band.min), band.min, band.max)
      const rawCy = topPad + rand() * (bottom - topPad)
      const cy = groundY(cx, rawCy, 12, bottom)
      if (cy === null) continue
      const a = makeActor(cx, cy)
      a.bandMin = band.min
      a.bandMax = band.max
      a.yMin = topPad
      a.yMax = bottom
      // Deer are stately, foxes dart, cats amble.
      const kind = theme.critters[i % theme.critters.length]!
      critterKind[actors.length] = kind
      a.speed = kind === 'fox' || kind === 'hare' ? 24 : kind === 'deer' || kind === 'boar' ? 13 : 16
      a.waitUntil = rand() * 4
      actors.push(a)
    }
    critterTo = actors.length

    const birdCount = perScreen(theme.birds, 6)
    for (let i = 0; i < birdCount; i++) {
      const baseY = topPad + rand() * (bottom - topPad)
      birds.push({
        x: rand() * W, y: baseY, baseY,
        phase: rand() * Math.PI * 2,
        speed: 9 + rand() * 8,
        amp: 3 + rand() * 4,
      })
    }

    clearAll(targets)
    targets = measureTargets(SCALE)

    buildGround(mulberry32(seedForRoute(routeName.value) ^ 0x9e37))
  }

  function buildGround(rand: () => number) {
    const g = document.createElement('canvas')
    g.width = Math.max(W, 1)
    g.height = Math.max(Math.min(worldH, 8000), 1)
    const gc = g.getContext('2d')!
    const inContent = (x: number) => hasBands && x > leftEdge && x < rightEdge

    // Roads: a wide curved band, edges dithered so it melts into the ground
    // rather than sitting on it as a hard stripe.
    for (const road of roads) {
      for (let x = 0; x < g.width; x++) {
        const cy = roadYAt(road, x)
        const half = road.width / 2
        gc.globalAlpha = 0.6
        gc.fillStyle = palette.p
        gc.fillRect(x, Math.round(cy - half), 1, road.width)
        gc.globalAlpha = 0.35
        for (const edge of [cy - half - 1, cy + half]) {
          if (rand() > 0.45) gc.fillRect(x, Math.round(edge), 1, 1)
        }
        gc.globalAlpha = 1
        // Centre dashes give the curve direction.
        if (Math.round(x) % 8 < 3) {
          gc.fillStyle = palette.f
          gc.fillRect(x, Math.round(cy), 1, 1)
        }
      }
    }

    // The shoreline. Everything else in the scene is dithered; this one edge is
    // crisp, because the whole point of the coast is that land and sea are
    // unmistakably different places. It is drawn from the SAME vista horizon
    // that excludes walkers, so the visual edge and the physical edge agree.
    for (const v of vistas) {
      if (!v.water) continue
      for (let x = 0; x < g.width; x++) {
        const line = horizonYAt(v, x)
        gc.globalAlpha = 0.45
        gc.fillStyle = palette.p
        gc.fillRect(x, Math.round(v.top), 1, Math.round(line - v.top))
        gc.globalAlpha = 1
        gc.fillStyle = palette.f
        gc.fillRect(x, Math.round(line) - 1, 1, 1)
        // Wet sand just below the waterline.
        gc.globalAlpha = 0.25
        gc.fillRect(x, Math.round(line), 1, 3)
        gc.globalAlpha = 1
      }
      // Static surface texture; moving highlights are drawn per frame.
      gc.globalAlpha = 0.5
      gc.fillStyle = palette.f
      for (let x = 0; x < g.width; x += 3) {
        const line = horizonYAt(v, x)
        for (let y = v.top + 4; y < line - 2; y += 4) {
          if ((x * 7 + Math.round(y) * 13) % 11 < 4) gc.fillRect(x, Math.round(y), 2, 1)
        }
      }
      gc.globalAlpha = 1
    }

    const tufts = Math.round((g.width * g.height) / theme.grass)
    gc.fillStyle = palette.f
    for (let i = 0; i < tufts; i++) {
      const x = Math.round(rand() * g.width)
      const y = Math.round(rand() * g.height)
      if (inContent(x) && rand() > 0.12) continue
      // Never sprout grass in the sky or out at sea.
      if (beyondHorizon(x, y)) continue
      const sprite = GRASS[Math.floor(rand() * GRASS.length)]!
      for (let row = 0; row < sprite.length; row++) {
        const line = sprite[row]!
        for (let col = 0; col < line.length; col++) {
          if (line[col] === '.') continue
          gc.fillRect(x + col, y + row, 1, 1)
        }
      }
    }
    // Speckle stays in the ground layer's MID tone (softened by alpha) rather
    // than the pale used by backdrops — sharing a tone with distant scenery is
    // what made the two layers read as one noisy texture.
    gc.globalAlpha = 0.28
    gc.fillStyle = palette.f
    for (let i = 0; i < tufts; i++) {
      const x = Math.round(rand() * g.width)
      if (inContent(x) && rand() > 0.1) continue
      gc.fillRect(x, Math.round(rand() * g.height), 1, 1)
    }
    gc.globalAlpha = 1
    ground = g
  }

  /* ------------------------------------------------------------ simulation */

  function steer(a: Actor, tx: number, ty: number, maxSpeed: number, dt: number) {
    const dx = tx - a.x
    const dy = ty - a.y
    const dist = Math.hypot(dx, dy)
    let desiredX = 0
    let desiredY = 0
    if (dist > STOP_RADIUS) {
      const speed = dist < ARRIVE_RADIUS ? maxSpeed * (dist / ARRIVE_RADIUS) : maxSpeed
      desiredX = (dx / dist) * speed
      desiredY = (dy / dist) * speed
    }
    const maxDelta = ACCEL * dt
    a.vx += clamp(desiredX - a.vx, -maxDelta, maxDelta)
    a.vy += clamp(desiredY - a.vy, -maxDelta, maxDelta)
    a.x += a.vx * dt
    a.y += a.vy * dt
    a.stride += Math.hypot(a.vx, a.vy) * dt
    if (Math.abs(a.vx) > 1.5) a.facing = a.vx > 0 ? 1 : -1
    return dist
  }

  function resolveCollisions(a: Actor) {
    for (const s of structures) {
      if (!s.solid) continue
      const x0 = s.x + 1
      const x1 = s.x + s.w - 1
      const y0 = s.y + Math.round(s.h * 0.55)
      const y1 = s.y + s.h
      if (a.x < x0 || a.x > x1 || a.y < y0 || a.y > y1) continue
      const dl = a.x - x0, dr = x1 - a.x, dt = a.y - y0, db = y1 - a.y
      const m = Math.min(dl, dr, dt, db)
      if (m === dl) { a.x = x0; a.vx = 0 }
      else if (m === dr) { a.x = x1; a.vx = 0 }
      else if (m === dt) { a.y = y0; a.vy = 0 }
      else { a.y = y1 + 1; a.vy = 0 }
    }
  }

  function updateHero(dt: number) {
    // Crossing a sky horizon puts the character on a broomstick; crossing back
    // lands them. Water still turns them away at the shore.
    const v = beyondHorizon(hero.x, hero.y)
    flying = v?.kind === 'sky'
    boating = v?.kind === 'water'

    // Changing medium gets a puff rather than an instant swap: stepping off the
    // shore into a boat with no transition reads as the sprite glitching.
    const nowMedium = flying ? 'sky' : boating ? 'sea' : 'land'
    if (nowMedium !== medium) {
      medium = nowMedium
      poofs.push({ x: hero.x, y: hero.y - 6, life: 0 })
      poofs.push({ x: hero.x - 4, y: hero.y - 2, life: -0.08 })
      poofs.push({ x: hero.x + 5, y: hero.y - 9, life: -0.14 })
    }

    // A horse covers ground faster; a broom glides faster still.
    const mult = flying ? 1.9 : boating ? 1.25 : vehicle.value === 'horse' ? 1.55 : 1

    if (move.value === 'independent') {
      // Off duty: the character goes about its own business.
      if (clock >= hero.waitUntil) {
        const d = Math.hypot(hero.tx - hero.x, hero.ty - hero.y)
        if (d < STOP_RADIUS + 1) {
          hero.tx = clamp(hero.x + (Math.random() - 0.5) * 90, 8, Math.max(W - 8, 12))
          hero.ty = clamp(hero.y + (Math.random() - 0.5) * 90, camY + 20, camY + Hv - 10)
          hero.waitUntil = clock + 1.4 + Math.random() * 3.5
        }
      }
      steer(hero, hero.tx, hero.ty, WALK_SPEED * 0.55 * mult, dt)
    } else {
      const dx = target.x - hero.x
      const dy = target.y - hero.y
      const dist = Math.hypot(dx, dy)
      if (dist < FOLLOW_DEADZONE) {
        // Inside the deadzone the character stands its ground and just watches
        // the cursor. Without this it crowds the pointer constantly, which makes
        // the fairy — and anything else nearby — very hard to click.
        hero.vx += clamp(-hero.vx, -ACCEL * dt, ACCEL * dt)
        hero.vy += clamp(-hero.vy, -ACCEL * dt, ACCEL * dt)
        hero.x += hero.vx * dt
        hero.y += hero.vy * dt
        if (Math.abs(dx) > 2) hero.facing = dx > 0 ? 1 : -1
      } else {
        steer(hero, target.x, target.y, (dist > RUN_RADIUS ? RUN_SPEED : WALK_SPEED) * mult, dt)
      }
    }
    // Nothing to collide with in the air.
    if (!flying && !boating) resolveCollisions(hero)
    keepBelowHorizon(hero, true)

    // --- fairy: trails the character with a lazy lag and a gentle bob
    if (fairyOn.value) {
      // The side it flies on only changes while the character is genuinely
      // WALKING. Tying it to `facing` meant that reaching for the fairy turned
      // the character toward the cursor, flipped the side, and threw the fairy
      // to the other shoulder — it fled from the pointer every time.
      if (Math.hypot(hero.vx, hero.vy) > 8) fairySide = hero.facing

      // Settle completely while the pointer is on it. A target that keeps
      // drifting and bobbing under the cursor cannot be clicked; holding still
      // on approach is the whole difference between a button and a nuisance.
      const cursorWX = cursor.x
      const cursorWY = cursor.y + camY
      fairyHeld = Math.hypot(cursorWX - fairy.x, cursorWY - fairy.y) < FAIRY_HOLD

      if (!fairyHeld) {
        fairyPhase += dt * 3.2
        const tx = hero.x - fairySide * 9
        const ty = hero.y - 17 + Math.sin(fairyPhase) * 2.5
        fairy.x += (tx - fairy.x) * Math.min(dt * 3.4, 1)
        fairy.y += (ty - fairy.y) * Math.min(dt * 3.4, 1)
      }

      // Publish for the DOM hit target. Throttled normally — it crosses into Vue
      // reactivity — but every frame while held, so the button sits exactly on it.
      fairyPublish -= dt
      if (fairyHeld || fairyPublish <= 0) {
        fairyPublish = 0.08
        const sy = (fairy.y - camY) * SCALE
        fairyScreen.value = {
          x: fairy.x * SCALE,
          y: sy,
          visible: sy > -20 && sy < Hv * SCALE + 20,
        }
      }
    } else {
      fairyHeld = false
      if (fairyScreen.value.visible) {
        fairyScreen.value = { x: -999, y: -999, visible: false }
      }
    }
  }

  function updateActor(a: Actor, dt: number, isCat: boolean) {
    const wet = clock < a.wetUntil
    const fleeing = clock < a.fleeUntil
    const knocked = clock < a.hitUntil

    if (a.mode === 'commute') {
      const speed = fleeing ? a.speed * 2.6 : a.speed
      a.vx += clamp(a.dir * speed - a.vx, -ACCEL * dt, ACCEL * dt)
      a.x += a.vx * dt
      // Follow the curve rather than a flat line.
      const road = roads[a.road]
      if (road) {
        const wantY = roadYAt(road, a.x)
        a.y += (wantY - a.y) * Math.min(dt * 6, 1)
      }
      a.stride += Math.abs(a.vx) * dt
      a.facing = a.dir
      if (a.x > W + 12) a.x = -12
      if (a.x < -12) a.x = W + 12
      resolveCollisions(a)
      keepBelowHorizon(a)
      return
    }

    if (knocked) {
      // Ride out the knockback; steering would fight the impulse.
      a.x += a.vx * dt
      a.y += a.vy * dt
      a.vx *= 0.9
      a.vy *= 0.9
      a.stride += Math.hypot(a.vx, a.vy) * dt
      return
    }

    const dHero = Math.hypot(hero.x - a.x, hero.y - a.y)
    if (!fleeing && dHero < (isCat ? 45 : 34)) {
      a.vx += clamp(-a.vx, -ACCEL * dt, ACCEL * dt)
      a.vy += clamp(-a.vy, -ACCEL * dt, ACCEL * dt)
      a.x += a.vx * dt
      a.y += a.vy * dt
      a.facing = hero.x > a.x ? 1 : -1
      a.tx = a.x; a.ty = a.y
      a.waitUntil = clock + 0.6
      return
    }

    if (clock >= a.waitUntil) {
      const dist = Math.hypot(a.tx - a.x, a.ty - a.y)
      if (dist < STOP_RADIUS + 1) {
        const radius = fleeing ? 90 : 60
        a.tx = clamp(a.x + (Math.random() - 0.5) * radius, a.bandMin, a.bandMax)
        a.ty = clamp(a.y + (Math.random() - 0.5) * radius, a.yMin, a.yMax)
        a.waitUntil = clock + (fleeing ? 0.2 : 1.5 + Math.random() * 4)
      }
    }
    steer(a, a.tx, a.ty, fleeing ? a.speed * 3 : wet ? a.speed * 1.4 : a.speed, dt)
    resolveCollisions(a)
    keepBelowHorizon(a)
  }

  /** Frames for whichever animal this environment has. */
  function critterFrames(i: number): readonly Sprite[] {
    // After dark the daytime animals turn in and the night shift comes out.
    if (isNight) return OWL_FRAMES
    switch (critterKind[i]) {
      case 'fox': return FOX_FRAMES
      case 'deer': return DEER_FRAMES
      case 'owl': return OWL_FRAMES
      case 'hare': return HARE_FRAMES
      case 'boar': return BOAR_FRAMES
      case 'crab': return CRAB_FRAMES
      case 'reindeer': return REINDEER_FRAMES
      case 'lion': return LION_FRAMES
      case 'gull': return GULL_FRAMES
      default: return CAT_FRAMES
    }
  }

  /**
   * Fish never leave their water body, and they ring the surface when they
   * break it — the water has to feel occupied, not decorative.
   */
  function updateFins(dt: number) {
    for (const f of fins) {
      const v = vistas[f.road]
      if (!v || !v.water) continue
      f.vx += clamp(f.dir * f.speed - f.vx, -ACCEL * dt, ACCEL * dt)
      f.x += f.vx * dt
      f.stride += Math.abs(f.vx) * dt
      f.facing = f.dir
      if (f.x > W + 14) f.x = -14
      if (f.x < -14) f.x = W + 14
      // Slow weave so it never tracks a dead-straight line.
      f.y = clamp(
        f.y + Math.sin(clock * 0.6 + f.speed) * 4 * dt,
        v.top + 4, horizonYAt(v, f.x) - 4,
      )
      // Leave a wake behind the fin.
      f.rippleAt -= dt
      if (f.rippleAt <= 0) {
        f.rippleAt = 0.3
        wakes.push({ x: f.x - f.dir * 5, y: f.y + 1, life: 0 })
      }
    }
  }

  function updateFish(dt: number) {
    for (const f of fish) {
      const v = vistas[f.road]
      if (!v || !v.water) continue
      if (clock >= f.waitUntil) {
        const d = Math.hypot(f.tx - f.x, f.ty - f.y)
        if (d < STOP_RADIUS + 1) {
          f.tx = clamp(f.x + (Math.random() - 0.5) * 70, f.bandMin, f.bandMax)
          f.ty = clamp(
            f.y + (Math.random() - 0.5) * 20,
            v.top + 3,
            horizonYAt(v, f.x) - 3,
          )
          f.waitUntil = clock + 0.6 + Math.random() * 2.2
        }
      }
      steer(f, f.tx, f.ty, f.speed, dt)
      // Hard clamp: a fish on the sand would undo the whole boundary.
      f.y = clamp(f.y, v.top + 2, horizonYAt(v, f.x) - 2)
      if (clock > f.rippleAt && Math.hypot(f.vx, f.vy) > f.speed * 0.6) {
        f.rippleAt = clock + 1.2 + Math.random()
        ripples.push({ x: f.x, y: f.y, life: 0 })
      }
    }
  }

  function updateWeather(dt: number) {
    // Slow ease along the arc — the whole point is that it is seen to move.
    if (moonT !== moonTarget) {
      const rate = dt * 0.85
      moonT += clamp(moonTarget - moonT, -rate, rate)
      if (Math.abs(moonTarget - moonT) < 0.005) moonT = moonTarget
    }

    for (let i = poofs.length - 1; i >= 0; i--) {
      poofs[i]!.life += dt
      if (poofs[i]!.life > 0.45) poofs.splice(i, 1)
    }
    for (let i = wakes.length - 1; i >= 0; i--) {
      wakes[i]!.life += dt
      if (wakes[i]!.life > 1.1) wakes.splice(i, 1)
    }
    // A wake only while genuinely under way on the water.
    if (boating && Math.hypot(hero.vx, hero.vy) > 8) {
      wakeAt -= dt
      if (wakeAt <= 0) {
        wakeAt = 0.16
        wakes.push({ x: hero.x - hero.facing * 6, y: hero.y + 1, life: 0 })
      }
    }

    for (const f of fireflies) {
      f.phase += dt * 1.4
      f.x += Math.cos(f.phase * 0.7) * f.speed * dt
      f.y += Math.sin(f.phase) * f.speed * dt
    }
    for (const f of flakes) {
      f.phase += dt * 1.6
      f.x += (f.vx + Math.sin(f.phase) * 5) * dt
      f.y += f.vy * dt
      // Flakes live in viewport space, so they keep falling as the page scrolls.
      if (f.y > Hv) { f.y = -2; f.x = Math.random() * W }
      if (f.x < -4) f.x = W + 2
      if (f.x > W + 4) f.x = -2
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]!
      r.life += dt
      if (r.life > 0.9) ripples.splice(i, 1)
    }
  }

  function updateStructure(s: Structure, dt: number) {
    if (!s.interactive) return
    const cx = s.x + s.w * 0.5
    const cy = s.y + s.h
    const d = Math.hypot(hero.x - cx, hero.y - cy)
    // Big structures need a proportionally bigger trigger, or you have to stand
    // inside the castle wall before the gate notices you — but CAP it: scaled
    // straight off the width, the castle noticed you from half a screen away and
    // sat with its windows lit in broad daylight.
    const scaleUp = clamp(s.w / 30, 1, 2.1)
    s.near = s.near
      ? d < NEAR_EXIT * scaleUp
      : d < NEAR_ENTER * scaleUp
    s.openness += clamp((s.near ? 1 : 0) - s.openness, -dt * 4, dt * 4)
    if (s.smoke && s.near) {
      s.emit -= dt
      if (s.emit <= 0) {
        s.emit = 0.55
        puffs.push({ x: cx - 8, y: s.y + 1, life: 0 })
      }
    }
  }

  /** Content elements light up as the character passes them. */
  function updateContent() {
    for (const t of targets) {
      setNear(t, distanceTo(t, hero.x, hero.y) < CONTENT_NEAR)
      // Drop the strike class once its animation is done, so it can retrigger
      // cleanly and the DOM doesn't accumulate stale state.
      if (t.struckUntil && clock > t.struckUntil) {
        t.struckUntil = 0
        t.el.classList.remove('pixel-struck')
      }
    }
  }

  function soak(a: Actor, fromX: number, fromY: number) {
    a.wetUntil = clock + WET_SECONDS
    a.fleeUntil = clock + FLEE_SECONDS
    if (a.mode === 'commute') {
      a.dir = a.x >= fromX ? 1 : -1
    } else {
      const dx = a.x - fromX, dy = a.y - fromY
      const len = Math.hypot(dx, dy) || 1
      a.tx = clamp(a.x + (dx / len) * 45, a.bandMin, a.bandMax)
      a.ty = clamp(a.y + (dy / len) * 45, a.yMin, a.yMax)
      a.waitUntil = 0
    }
  }

  function knockback(a: Actor, fromX: number, fromY: number, force: number) {
    const dx = a.x - fromX, dy = a.y - fromY
    const len = Math.hypot(dx, dy) || 1
    a.vx = (dx / len) * force
    a.vy = (dy / len) * force
    a.hitUntil = clock + 0.35
    a.fleeUntil = clock + FLEE_SECONDS
  }

  function splashAt(x: number, y: number, doSoak: boolean, sprite: Sprite = SPLASH) {
    splashes.push({ x, y, life: 0, sprite })
    if (!doSoak) return
    for (const a of actors) {
      if (Math.hypot(a.x - x, a.y - y) < SOAK_RADIUS) soak(a, x, y)
    }
  }

  /** Melee: reach out along the facing direction and hit whatever is there. */
  function melee(reach: number, force: number, hitSprite: Sprite) {
    const dirX = target.x >= hero.x ? 1 : -1
    hero.facing = dirX
    const hx = hero.x + dirX * reach * 0.75
    const hy = hero.y - 7
    splashAt(hx, hy, false, hitSprite)
    for (const a of actors) {
      if (Math.hypot(a.x - hx, a.y - 6 - hy) < reach * 0.7) knockback(a, hero.x, hero.y, force)
    }
    // Strike page content in reach, too.
    for (const t of targets) {
      if (distanceTo(t, hx, hy) < reach * 0.8) strike(t, clock)
    }
  }

  function fire(wx: number, wy: number) {
    const kind = weapon.value
    if (kind === 'none') return

    if (kind === 'spear' || kind === 'sword') {
      attackUntil = clock + ATTACK_TIME
      attackKind = kind
      if (kind === 'spear') melee(SPEAR_REACH, 70, THRUST_HIT)
      else melee(SWORD_REACH, 55, SLASH_ARC)
      return
    }

    // Water gun
    if (holder.value === 'cursor') {
      splashAt(wx, wy, true)
      return
    }
    recoilUntil = clock + RECOIL_TIME
    attackKind = 'water'
    const ox = hero.x
    const oy = hero.y - 9
    const dx = wx - ox, dy = wy - oy
    const len = Math.hypot(dx, dy) || 1
    hero.facing = dx >= 0 ? 1 : -1
    pellets.push({
      x: ox, y: oy,
      vx: (dx / len) * PELLET_SPEED,
      vy: (dy / len) * PELLET_SPEED,
      life: 0,
    })
    // Muzzle spray, so the shot has a visible origin.
    splashAt(ox + hero.facing * 6, oy, false)
  }

  function updateProjectiles(dt: number) {
    for (let i = pellets.length - 1; i >= 0; i--) {
      const p = pellets[i]!
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.life += dt
      let hit = false
      for (const a of actors) {
        if (Math.hypot(a.x - p.x, a.y - p.y - 5) < 6) { soak(a, p.x, p.y); hit = true; break }
      }
      if (hit || p.life > PELLET_LIFE || p.x < -10 || p.x > W + 10) {
        splashAt(p.x, p.y, false)
        pellets.splice(i, 1)
      }
    }
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i]!
      s.life += dt
      if (s.life > 0.4) splashes.splice(i, 1)
    }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i]!
      p.life += dt
      p.y -= 7 * dt
      p.x += Math.sin(p.life * 2) * 5 * dt
      if (p.life > 2.2) puffs.splice(i, 1)
    }
  }

  function update(dt: number) {
    clock += dt
    updateHero(dt)
    for (let i = 0; i < actors.length; i++) updateActor(actors[i]!, dt, isCritter(i))
    updateFish(dt)
    updateFins(dt)
    updateWeather(dt)
    for (const s of structures) updateStructure(s, dt)
    for (const l of lamps) updateStructure(l, dt)
    for (const b of birds) {
      b.x += b.speed * dt
      if (b.x > W + 8) b.x = -8
      b.phase += dt * 2.4
      b.y = b.baseY + Math.sin(b.phase) * b.amp
    }
    updateProjectiles(dt)
    updateContent()
  }

  /* ----------------------------------------------------------------- draw */

  const pool: Drawable[] = []
  const active: Drawable[] = []
  let poolUsed = 0

  function push(
    kind: Drawable['kind'], sprite: Sprite | null, proc: ProcArt | null,
    x: number, y: number, baseY: number, facing: 1 | -1,
    wet = false, struct: Structure | null = null,
  ) {
    let d = pool[poolUsed]
    if (!d) { d = { kind, sprite, proc, x, y, baseY, facing, wet, struct }; pool.push(d) }
    else {
      d.kind = kind; d.sprite = sprite; d.proc = proc
      d.x = x; d.y = y; d.baseY = baseY; d.facing = facing; d.wet = wet; d.struct = struct
    }
    poolUsed++
    active.push(d)
  }

  function frameIndex(stride: number, count: number): number {
    const i = Math.floor(stride / STRIDE)
    return Number.isFinite(i) ? ((i % count) + count) % count : 0
  }

  function heroSprite(): Sprite {
    // Flight overrides every other pose: you cannot swing a sword off a broom.
    if (flying) {
      return BROOM_FRAMES[frameIndex(clock * STRIDE * 4, BROOM_FRAMES.length)]!
    }
    if (clock < attackUntil) {
      if (attackKind === 'spear') return WARRIOR_THRUST
      if (attackKind === 'sword') return WARRIOR_SLASH
    }
    if (clock < recoilUntil) return WARRIOR_SHOOT
    // Seated in the boat, and in the saddle: legs bent forward, not walking.
    if (boating || vehicle.value === 'horse') return WARRIOR_RIDE
    const speed = Math.hypot(hero.vx, hero.vy)
    // Armed and standing still: hold a ready stance rather than a neutral idle.
    if (speed < 3) {
      return weapon.value !== 'none' && holder.value === 'hero' ? WARRIOR_AIM : WARRIOR_FRAMES.idle[0]!
    }
    const frames = speed > WALK_SPEED * 1.15 ? WARRIOR_FRAMES.run : WARRIOR_FRAMES.walk
    return frames[frameIndex(hero.stride, frames.length)]!
  }

  function actorSprite(a: Actor, frames: readonly Sprite[]): Sprite {
    if (Math.abs(a.vx) + Math.abs(a.vy) < 2) return frames[0]!
    return frames[frameIndex(a.stride, frames.length)]!
  }

  /** Is this structure's light on? */
  function structureLit(s: Structure): boolean {
    // At night every window and lamp is lit: a dark village with dark windows
    // reads as abandoned, not as night.
    return s.interactive && (isNight || s.openness > 0.35)
  }

  /**
   * Halos for a structure's windows, drawn BEFORE the building itself.
   *
   * This ordering is the whole thing. Drawn afterwards, the halo lies on top of
   * the very wall it is escaping from and buries the building in a brown smear —
   * which is exactly what made the houses and lighthouse look wrong while the
   * fairy, moon and torches looked right: those are drawn over nothing.
   *
   * Radius is tied to the window's own size and kept tight, so a grid of windows
   * reads as several separate lamps instead of merging into one mass.
   */
  function drawStructureGlow(s: Structure) {
    if (!ctx || !structureLit(s)) return
    const bx = Math.round(s.x)
    const by = Math.round(s.y)

    if (s.proc?.windows) {
      for (const w of s.proc.windows) {
        glow(bx + w.x + w.w / 2, by + w.y + w.h / 2, Math.max(w.w, w.h) * 2 + 3, 0.5)
      }
      return
    }
    if (!s.sprite) return
    const cells = dynCells(s.sprite)
    if (!cells.window.length) return
    // Sprite windows are single cells; one tight halo each keeps them distinct.
    for (const c of cells.window) {
      glow(bx + c.col + 0.5, by + c.row + 0.5, 4, 0.42)
    }
  }

  function drawDynamicCells(s: Structure) {
    if (!ctx) return
    const bx = Math.round(s.x)
    const by = Math.round(s.y)
    const lit = structureLit(s)

    if (s.proc) {
      // Procedural art keeps its openings as rects rather than cell lists.
      if (s.proc.windows) {
        ctx.fillStyle = lit ? palette.g : palette.p
        for (const w of s.proc.windows) ctx.fillRect(bx + w.x, by + w.y, w.w, w.h)
      }
      if (s.proc.gate) {
        const g = s.proc.gate
        const open = Math.round(g.w * s.openness)
        ctx.fillStyle = palette.w
        ctx.fillRect(bx + g.x, by + g.y, g.w, g.h)
        if (open > 0) {
          ctx.fillStyle = palette.v
          ctx.fillRect(bx + g.x, by + g.y, open, g.h)
        }
      }
      return
    }
    if (!s.sprite) return

    const cells = dynCells(s.sprite)
    if (!cells.door.length && !cells.window.length) return
    const openCols = Math.round(s.openness * cells.doorCols.length)
    if (cells.window.length) {
      // Halos already drawn behind the building by drawStructureGlow.
      ctx.fillStyle = lit ? palette.g : palette.p
      for (const c of cells.window) ctx.fillRect(bx + c.col, by + c.row, 1, 1)
    }
    for (const c of cells.door) {
      ctx.fillStyle = cells.doorCols.indexOf(c.col) < openCols ? palette.v : palette.w
      ctx.fillRect(bx + c.col, by + c.row, 1, 1)
    }
  }

  function visible(y: number, h: number) {
    return y + h > camY - 30 && y < camY + Hv + 30
  }

  /** The weapon in hand, drawn with the swing/recoil offset baked in. */
  function drawHeldWeapon() {
    if (!ctx || weapon.value === 'none') return
    const attacking = clock < attackUntil
    const dirX: 1 | -1 = target.x >= hero.x ? 1 : -1

    if (holder.value === 'cursor' && weapon.value === 'water') {
      blit(WATER_GUN, cursor.x + 3, cursor.y + camY + 2, cursor.facing)
      return
    }

    const lunge = attacking ? 5 : 0
    const bx = hero.x + dirX * (3 + lunge)
    const by = hero.y - 9

    if (weapon.value === 'water') {
      const kick = clock < recoilUntil ? -3 : 0
      blit(WATER_GUN, dirX === 1 ? bx + kick : bx - 11 - kick, by - 1, dirX)
    } else if (weapon.value === 'spear') {
      blit(SPEAR, dirX === 1 ? bx : bx - 13, by, dirX)
    } else {
      blit(SWORD, dirX === 1 ? bx : bx - 11, attacking ? by - 4 : by, dirX)
    }
  }

  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, W, Hv)

    // --- the sky plane: stars and moon together, on a slow parallax.
    //
    // Pinned to the viewport the moon held still while the world rushed past, so
    // it sank out of the sky and ended up hanging over the castle. Anchored hard
    // to the world it was correct but scrolled away within half a screen. A slow
    // plane keeps it high for far longer AND guarantees it always exits upward,
    // never down into the landscape. Stars share the plane or the sky would
    // visibly shear.
    const sky = vistas[0]
    // Runs past dawn too, so the moon can finish climbing out of frame.
    if (sky && (isNight || moonT < 1.999)) {
      ctx.save()
      // Clip everything celestial to ABOVE the horizon.
      //
      // Relying on the scenery to cover the moon only works where that scenery
      // is opaque; below a treeline the band is just a translucent ground wash,
      // so the moon carried on shining through the earth. Clipping makes it sink
      // behind the land in every theme, whatever the band happens to be made of.
      const screenHorizon = Math.round(sky.horizon - camY)
      ctx.beginPath()
      ctx.rect(0, -Hv, W, Math.max(screenHorizon + Hv, 0))
      ctx.clip()
      ctx.translate(0, -Math.round(camY * SKY_PARALLAX))
      const span = Math.max(sky.horizon - sky.top, 1)

      ctx.globalAlpha = isNight ? 0.5 : 0
      ctx.fillStyle = palette.p
      for (let i = 0; i < 48; i++) {
        ctx.fillRect((i * 79) % W, Math.round(sky.top + ((i * 137) % span)), 1, 1)
      }
      ctx.globalAlpha = 1

      // Drawn while anywhere on its arc, which includes climbing away after
      // dawn — otherwise it would simply vanish the moment the theme flipped.
      if (moonArt && moonT > 0.001 && moonT < 1.999) {
        // Rest position, with the arc carrying it a full span below and above.
        const restY = sky.top + span * 0.16
        const travel = span * 0.95
        const my = Math.round(restY + (1 - moonT) * travel)
        // Drift sideways across the arc so it reads as a path, not a lift.
        const mx = Math.round(W * (0.68 + moonT * 0.08))
        // Fades at both ends of the arc rather than popping.
        const a = Math.min(moonT, 1) * Math.min(2 - moonT, 1)
        glow(mx + moonArt.w / 2, my + moonArt.h / 2, moonArt.w * 1.15, 0.6 * a)
        ctx.globalAlpha = 0.92 * a
        ctx.drawImage(moonArt.canvas, mx, my)
        ctx.globalAlpha = 1
      }
      ctx.restore()
    }

    ctx.save()
    ctx.translate(0, -Math.round(camY))

    // --- distant scenery, drawn IN WORLD SPACE at each vista. No parallax: the
    // horizon has to keep an exact relationship with the ground in front of it,
    // and a slower plane made the two slide apart.
    if (backdropBands.length) {
      // Drawn at FULL alpha. Each band bakes its own per-layer depth alphas, and
      // a translucent band let the moon shine straight through the trees that
      // were supposed to be hiding it.
      for (let i = 0; i < vistas.length; i++) {
        const v = vistas[i]!
        if (!visible(v.top, backdropStep)) continue
        ctx.drawImage(backdropBands[i % backdropBands.length]!.canvas, 0, Math.round(v.top))
      }
    }

    if (ground) ctx.drawImage(ground, 0, 0)

    // --- moonlight on the water. Drawn in the WORLD layer so it sits on the sea
    // surface and slides underneath the moon as the two planes separate, which
    // is what makes the reflection read as physical rather than pasted on.
    if (isNight && moonArt) {
      const sea = vistas.find((v) => v.water)
      if (sea) {
        const mx = W * 0.76 + moonArt.w / 2
        ctx.fillStyle = palette.g
        for (let y = Math.round(sea.top) + 2; y < horizonYAt(sea, mx) - 1; y += 2) {
          if (!visible(y, 2)) continue
          // Widens and fades with distance from the moon's column.
          const t = (y - sea.top) / Math.max(horizonYAt(sea, mx) - sea.top, 1)
          const spread = 2 + t * 9
          ctx.globalAlpha = (1 - t) * 0.34
          const wobble = Math.sin(y * 0.7 + clock * 1.6) * spread * 0.5
          ctx.fillRect(Math.round(mx - spread / 2 + wobble), Math.round(y), Math.round(spread), 1)
        }
        ctx.globalAlpha = 1
      }
    }

    poolUsed = 0
    active.length = 0

    for (const p of props) {
      const h = spriteHeight(p.sprite)
      if (visible(p.y, h)) push(0, p.sprite, null, p.x, p.y, p.y + h, 1)
    }
    for (const l of lamps) {
      if (visible(l.y, l.h)) push(1, l.sprite, null, l.x, l.y, l.y + l.h, 1, false, l)
    }
    for (const s of structures) {
      if (visible(s.y, s.h)) push(1, s.sprite, s.proc, s.x, s.y, s.y + s.h, 1, false, s)
    }
    for (let i = 0; i < actors.length; i++) {
      const a = actors[i]!
      const frames = isCritter(i) ? critterFrames(i) : VILLAGER_FRAMES
      const sp = actorSprite(a, frames)
      const h = spriteHeight(sp)
      if (!visible(a.y - h, h)) continue
      push(isCritter(i) ? 3 : 2, sp, null, a.x - spriteWidth(sp) / 2, a.y - h, a.y,
        a.facing, clock < a.wetUntil)
      // People carry torches after dark. Drawn straight away rather than through
      // the depth list: a torch always belongs in front of the hand holding it.
      if (isNight && !isCritter(i)) {
        const tx = a.x + a.facing * 4
        const ty = a.y - h - 1
        // Flicker keyed off the actor's own index so no two flames pulse in sync.
        const flick = 0.7 + Math.sin(clock * 9 + i * 2.1) * 0.3
        glow(tx + 1, ty + 2, 11 * flick, 0.8)
        blit(TORCH, tx, ty, 1)
      }
    }
    const hs = heroSprite()
    // Riding lifts the character onto the horse's back, and the seat rises and
    // falls with the gait so rider and mount move as one animal rather than a
    // sprite sitting on a moving platform.
    const riding = !flying && !boating && vehicle.value === 'horse'
    const bob = riding ? Math.sin(hero.stride / STRIDE * Math.PI) * 1.2 : 0
    const seat = riding ? 7 + bob : boating ? 4 + Math.sin(clock * 2.2) * 1.2 : 0
    push(4, hs, null, hero.x - spriteWidth(hs) / 2, hero.y - spriteHeight(hs) - seat, hero.y, hero.facing)

    active.sort((a, b) => a.baseY - b.baseY)

    for (const d of active) {
      if (d.kind === 2) shadow(d.x + 2, d.baseY, 4)
      // No contact shadow in the air; a mounted rider casts a wider one.
      if (d.kind === 4 && !flying && !boating) {
        shadow(d.x + 2, d.baseY, vehicle.value === 'horse' ? 14 : 6)
      }
      // The horse is drawn under the rider, sharing its baseline.
      // Afloat: the hull sits under the rider, bobbing on the swell.
      if (d.kind === 4 && boating) {
        const bobY = Math.sin(clock * 2.2) * 1.2
        blit(BOAT, hero.x - spriteWidth(BOAT) / 2, hero.y - spriteHeight(BOAT) + 2 + bobY, hero.facing)
      }
      if (d.kind === 4 && !flying && !boating && vehicle.value === 'horse') {
        const hs = HORSE_FRAMES[frameIndex(hero.stride, HORSE_FRAMES.length)]!
        blit(hs, hero.x - spriteWidth(hs) / 2, hero.y - spriteHeight(hs), hero.facing)
      }
      // Light first, then the thing emitting it — same order as the fairy, the
      // moon and the torches, all of which read correctly.
      if (d.struct) drawStructureGlow(d.struct)
      if (d.proc) {
        ctx.drawImage(d.proc.canvas, Math.round(d.x), Math.round(d.y))
      } else if (d.sprite) {
        blit(d.sprite, d.x, d.y, d.facing, d.wet ? 'wet' : 'base')
      }
      if (d.struct) drawDynamicCells(d.struct)
      if (d.kind === 4) {
        // Both hands are on the broom in flight.
        if (!flying) drawHeldWeapon()
        if (fairyOn.value) {
          const fs = FAIRY_FRAMES[frameIndex(fairyPhase * STRIDE, FAIRY_FRAMES.length)]!
          // The fairy is the one thing that is lit even in daylight; at night it
          // gets a proper halo so it reads as the scene's own little lantern.
          // Brighter while held: a visible affordance that it is now a button.
          glow(fairy.x, fairy.y, fairyHeld ? 18 : 14, fairyHeld ? 1 : 0.8)
          blit(fs, fairy.x - spriteWidth(fs) / 2, fairy.y - spriteHeight(fs) / 2, 1)
        }
      }
    }

    // Fish sit under the surface highlights, so they draw before the ripples.
    for (const f of fish) {
      const sp = actorSprite(f, FISH_FRAMES)
      if (!visible(f.y, spriteHeight(sp))) continue
      ctx.globalAlpha = 0.75
      blit(sp, f.x - spriteWidth(sp) / 2, f.y - spriteHeight(sp) / 2, f.vx >= 0 ? 1 : -1)
      ctx.globalAlpha = 1
    }

    // Wakes: short-lived surface streaks behind anything moving on the water.
    ctx.fillStyle = palette.f
    for (const w of wakes) {
      if (!visible(w.y, 2)) continue
      const t = w.life / 1.1
      ctx.globalAlpha = (1 - t) * 0.5
      const len = 3 + t * 9
      ctx.fillRect(Math.round(w.x - len / 2), Math.round(w.y), Math.round(len), 1)
    }
    ctx.globalAlpha = 1

    for (const f of fins) {
      const sp = actorSprite(f, FIN_FRAMES)
      if (!visible(f.y, spriteHeight(sp))) continue
      blit(sp, f.x - spriteWidth(sp) / 2, f.y - spriteHeight(sp), f.facing)
    }

    // Poofs mark a change of medium.
    for (const p of poofs) {
      if (p.life < 0) continue
      const t = p.life / 0.45
      ctx.globalAlpha = (1 - t) * 0.8
      blit(POOF, p.x - spriteWidth(POOF) / 2, p.y - spriteHeight(POOF) / 2 - t * 5, 1)
    }
    ctx.globalAlpha = 1

    // Expanding rings wherever something met the water.
    for (const r of ripples) {
      const t = r.life / 0.9
      ctx.globalAlpha = clamp(1 - t, 0, 1) * 0.7
      const scale = 1 + t * 1.4
      const c = spriteCanvas(RIPPLE)
      const w = Math.round(c.width * scale)
      const h = Math.max(Math.round(c.height * scale), 1)
      ctx.drawImage(c, Math.round(r.x - w / 2), Math.round(r.y - h / 2), w, h)
    }
    ctx.globalAlpha = 1

    for (const p of pellets) blit(DROPLET, p.x - 1, p.y - 1, 1)
    for (const s of splashes) {
      ctx.globalAlpha = clamp(1 - s.life / 0.4, 0, 1)
      blit(s.sprite, s.x - spriteWidth(s.sprite) / 2, s.y - spriteHeight(s.sprite) / 2, hero.facing)
    }
    ctx.globalAlpha = 1

    for (const a of actors) {
      if (clock >= a.wetUntil) continue
      ctx.globalAlpha = 0.55
      blit(DROPLET, a.x + ((a.stride * 3) % 5) - 2, a.y - 2, 1)
      ctx.globalAlpha = 1
    }
    for (const p of puffs) {
      ctx.globalAlpha = clamp(1 - p.life / 2.2, 0, 1) * 0.5
      blit(SMOKE, p.x, p.y, 1)
    }
    ctx.globalAlpha = 1

    // Fireflies: the only warm points of light out in the open at night.
    if (fireflies.length) {
      ctx.fillStyle = palette.g
      for (const f of fireflies) {
        if (!visible(f.y, 2)) continue
        ctx.globalAlpha = 0.35 + (Math.sin(f.phase * 2) + 1) * 0.3
        ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1)
      }
      ctx.globalAlpha = 1
    }

    for (const b of birds) {
      if (!visible(b.y, 5)) continue
      const flock = isNight ? BAT_FRAMES : BIRD_FRAMES
      blit(flock[frameIndex(b.phase * 1.4 * STRIDE, flock.length)]!, b.x, b.y, 1)
    }

    ctx.restore()

    // --- weather sits in VIEWPORT space, above the world: snow falls past the
    // camera, it does not scroll with the ground.
    if (flakes.length) {
      ctx.fillStyle = palette.f
      for (const f of flakes) {
        ctx.globalAlpha = 0.45 + (f.vy % 6) / 14
        ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1)
      }
      ctx.globalAlpha = 1
    }
  }

  /* ------------------------------------------------------------- lifecycle */

  function frame(now: number) {
    // Clamp both ends: the upper bound stops a backgrounded tab teleporting
    // everything; the lower bound matters because the first rAF timestamp can
    // predate start()'s performance.now(), and negative dt runs time backwards.
    const dt = Math.max(0, Math.min((now - last) / 1000, MAX_DT))
    last = now
    camY = window.scrollY / SCALE
    // The cursor target always tracks, whatever is (or isn't) equipped. Whether
    // the character actually walks to it is decided by the Movement setting.
    target.y = cursor.y + camY
    update(dt)
    draw()
    raf = requestAnimationFrame(frame)
  }

  function start() {
    if (running || !ctx || !enabled.value) return
    if (reduceMotion()) { camY = window.scrollY / SCALE; draw(); return }
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  function measure() {
    const canvas = canvasRef.value
    if (!canvas || !ctx) return
    W = Math.max(Math.ceil(window.innerWidth / SCALE), 1)
    Hv = Math.max(Math.ceil(window.innerHeight / SCALE), 1)
    worldH = Math.max(Math.ceil(document.documentElement.scrollHeight / SCALE), Hv)
    canvas.width = W
    canvas.height = Hv
    canvas.style.width = `${W * SCALE}px`
    canvas.style.height = `${Hv * SCALE}px`
    ctx.imageSmoothingEnabled = false
    camY = window.scrollY / SCALE
  }

  function rebuild() {
    if (!ctx) return
    measure()
    buildWorld()
    hero.x = clamp(hero.x || W * 0.5, 4, Math.max(W - 4, 6))
    hero.y = clamp(hero.y || camY + Hv * 0.6, camY + 16, camY + Hv - 4)
    if (!target.x && !target.y) { target.x = hero.x; target.y = hero.y }
    if (!running) draw()
  }

  let rebuildTimer: ReturnType<typeof setTimeout> | null = null
  function scheduleRebuild() {
    if (rebuildTimer) clearTimeout(rebuildTimer)
    rebuildTimer = setTimeout(() => { rebuildTimer = null; rebuild() }, 140)
  }

  function onPointerMove(e: PointerEvent) {
    const nx = clamp(e.clientX / SCALE, 2, W - 2)
    if (Math.abs(nx - cursor.x) > 1) cursor.facing = nx > cursor.x ? 1 : -1
    cursor.x = nx
    cursor.y = clamp(e.clientY / SCALE, 2, Hv - 2)
    // Not gated on carrying a weapon: this was a leftover from when holstering
    // and roaming were the same switch, and it left an unarmed character unable
    // to follow the cursor at all.
    target.x = cursor.x
    target.y = cursor.y + camY
  }

  /** Never preventDefault: the page's own clicks must still work. */
  function onPointerDown(e: PointerEvent) {
    if (!enabled.value || reduceMotion() || weapon.value === 'none') return
    const wx = e.clientX / SCALE
    const wy = e.clientY / SCALE + camY
    // Handing the weapon over only makes sense for the ranged one. Melee is
    // always swung by the character, so clicking it there must still attack —
    // otherwise you can never strike anything standing where you point.
    if (
      weapon.value === 'water' &&
      Math.abs(wx - hero.x) < HERO_HIT.w / 2 &&
      wy > hero.y - HERO_HIT.h && wy < hero.y + 3
    ) {
      holder.value = holder.value === 'cursor' ? 'hero' : 'cursor'
      return
    }
    fire(wx, wy)
  }

  function onScroll() {
    camY = window.scrollY / SCALE
    if (!running) draw()
  }

  function onVisibility() {
    if (document.hidden) stop()
    else start()
  }

  /**
   * Re-render everything the palette is baked into — and NOTHING else.
   *
   * This used to call scheduleRebuild(), which rebuilt the whole world. Because
   * actors are recreated at their spawn points, every villager, critter and bird
   * teleported the instant you flipped the theme: that was the "glitch". The
   * layout is already correct, so only the artwork needs redoing.
   */
  function refreshPalette() {
    palette = readPalette()
    const wasNight = isNight
    isNight = document.documentElement.classList.contains('dark')

    spriteCache.clear()
    castleArt = renderCastle(ink)
    moonArt = isNight ? renderMoon(ink, Math.max(Math.round(Hv * 0.06), 6), 'g') : moonArt

    // Rebuild each structure's baked art in place, keeping its position.
    for (const st of structures) {
      if (st.isCastle) st.proc = castleArt
      else if (st.srcSprite && st.srcScale > 1) {
        st.proc = scaleSprite(st.srcSprite, Math.round(st.srcScale), ink)
      }
    }

    const bandH = backdropStep || Math.max(Math.round(Hv * 0.95), 40)
    const seed = seedForRoute(routeName.value)
    backdropBands = [renderBackdrop(theme.backdrop, ink, Math.max(W, 1), bandH, seed)]

    // Fireflies only exist at night, and only the palette knows which it is.
    if (wasNight !== isNight) {
      rebuildNightLife()
      if (isNight) {
        // Nightfall: start below the horizon and rise to rest.
        moonT = 0
        moonTarget = 1
      } else {
        // Dawn: keep drawing it while it climbs up and out.
        moonTarget = 2
      }
    }

    buildGround(mulberry32(seed ^ 0x9e37))
    if (!running) draw()
  }

  /** Spawns or clears the night-only ambient life without touching the world. */
  function rebuildNightLife() {
    fireflies.length = 0
    if (!isNight) return
    const rand = mulberry32(seedForRoute(routeName.value) ^ 0x1f0e)
    const n = Math.round((W * Hv) / 5200)
    for (let i = 0; i < n; i++) {
      fireflies.push({
        x: rand() * W,
        y: camY + rand() * Hv,
        phase: rand() * Math.PI * 2,
        speed: 3 + rand() * 4,
      })
    }
  }

  let ro: ResizeObserver | null = null

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    ctx = canvas.getContext('2d')
    if (!ctx) return
    palette = readPalette()
    rebuild()
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('resize', scheduleRebuild, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    ro = new ResizeObserver(scheduleRebuild)
    ro.observe(document.body)
    start()
  })

  onBeforeUnmount(() => {
    stop()
    if (rebuildTimer) clearTimeout(rebuildTimer)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('resize', scheduleRebuild)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('visibilitychange', onVisibility)
    ro?.disconnect()
    ro = null
    clearAll(targets)
    spriteCache.clear()
    ground = null
    backdropBands = []
  })

  watch(enabled, (on) => {
    if (on) { rebuild(); start() }
    else {
      stop()
      clearAll(targets)
      if (ctx) ctx.clearRect(0, 0, W, Hv)
    }
  })

  watch(routeName, () => scheduleRebuild())

  return { refreshPalette, rebuild }
}
