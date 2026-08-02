/**
 * Procedurally drawn art.
 *
 * Hand-authored text sprites (see sprites.ts) stop being practical past roughly
 * 30x30 — a colossal castle is ~3000 characters of string literal that no one can
 * edit safely, and a parallax mountain range needs to be sized to the viewport at
 * runtime. Those are built here instead, baked once into an offscreen canvas.
 */

export interface ProcArt {
  canvas: HTMLCanvasElement
  w: number
  h: number
  /** Gate opening, animated on hero proximity. */
  gate?: { x: number; y: number; w: number; h: number }
  /** Windows that light up on hero proximity. */
  windows?: { x: number; y: number; w: number; h: number }[]
}

export type Ink = (key: string) => string

function make(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return { c, g: c.getContext('2d')! }
}

/** Crenellated top edge — the shape that instantly reads as "castle". */
function battlements(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  color: string,
  merlon = 2,
  gap = 2,
) {
  g.fillStyle = color
  for (let i = 0; i < w; i += merlon + gap) {
    g.fillRect(x + i, y, Math.min(merlon, w - i), 3)
  }
}

/** Conical spire with a pennant — the silhouette that says "castle", not "fort". */
function spire(
  g: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  halfW: number,
  height: number,
  roof: string,
  dark: string,
  flagDir: 1 | -1,
) {
  // Stepped cone: each row narrows, so the slope stays on the pixel grid.
  for (let i = 0; i < height; i++) {
    const t = i / height
    const w = Math.max(Math.round(halfW * (1 - t) * 2), 1)
    g.fillStyle = roof
    g.fillRect(Math.round(cx - w / 2), baseY - i, w, 1)
    // Shaded side gives the cone volume instead of reading as a flat triangle.
    if (w > 2) {
      g.fillStyle = dark
      g.fillRect(Math.round(cx + w / 2) - 1, baseY - i, 1, 1)
    }
  }
  // Mast + pennant
  const topY = baseY - height
  g.fillStyle = dark
  g.fillRect(Math.round(cx), topY - 5, 1, 5)
  g.fillRect(Math.round(cx) + (flagDir === 1 ? 1 : -3), topY - 5, 3, 2)
}

/** Arched window: a lancet with a sill, rather than a bare rectangle. */
function lancet(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: string,
) {
  g.fillStyle = frame
  g.fillRect(x - 1, y - 1, w + 2, 1) // arch cap
  g.fillRect(x - 1, y + h, w + 2, 1) // sill
}

/**
 * A gothic castle: a dense, deliberately asymmetric cluster of towers of
 * differing heights and widths, all spired, over a curtain wall and gatehouse.
 *
 * The reference silhouette this is built from gets its character from *irregular
 * massing* — a symmetric keep-plus-two-towers reads as a toy fort. Windows are
 * scattered rather than gridded for the same reason.
 */
export function renderCastle(ink: Ink, W = 132, H = 112, seedSalt = 0x1a7e): ProcArt {
  const { c, g } = make(W, H)
  const stone = ink('m')
  const light = ink('f')
  const dark = ink('s')
  const wood = ink('w')
  const rand = mulberry(seedSalt)
  const windows: ProcArt['windows'] = []
  const baseY = H
  const wallTop = Math.round(H * 0.66)

  /** One tower: shaft, lit/shadow edges, battlements and a spire. */
  const tower = (cx: number, wTower: number, topY: number, spireH: number, flag: 1 | -1) => {
    const x = Math.round(cx - wTower / 2)
    g.fillStyle = stone
    g.fillRect(x, topY, wTower, baseY - topY)
    g.fillStyle = light
    g.fillRect(x + 1, topY, 1, baseY - topY)
    g.fillStyle = dark
    g.fillRect(x + wTower - 2, topY, 2, baseY - topY)
    battlements(g, x, topY - 3, wTower, stone, 3, 3)
    spire(g, cx, topY - 3, wTower / 2 + 1, spireH, stone, dark, flag)

    // Windows scattered down the shaft, not on a strict grid.
    for (let wy = topY + 7; wy < baseY - 10; wy += 9 + Math.round(rand() * 4)) {
      if (rand() < 0.28) continue
      const wx = x + 1 + Math.round(rand() * Math.max(wTower - 5, 1))
      windows.push({ x: wx, y: wy, w: 2, h: 4 })
      lancet(g, wx, wy, 2, 4, dark)
    }
  }

  // --- curtain wall spanning the whole footprint
  g.fillStyle = stone
  g.fillRect(4, wallTop, W - 8, baseY - wallTop)
  g.fillStyle = light
  g.fillRect(4, wallTop + 3, W - 8, 1)
  battlements(g, 4, wallTop - 3, W - 8, stone, 3, 3)

  // --- the cluster. Heights and widths deliberately uneven; the tallest mass
  // sits off-centre so the skyline has a direction rather than a mirror line.
  const towers: [number, number, number, number][] = [
    [0.10, 0.10, 0.50, 0.10],
    [0.24, 0.13, 0.34, 0.15],
    [0.40, 0.09, 0.44, 0.12],
    [0.55, 0.17, 0.16, 0.20],
    [0.72, 0.11, 0.38, 0.14],
    [0.88, 0.13, 0.28, 0.16],
  ]
  for (const [fx, fw, ft, fs] of towers) {
    tower(
      Math.round(W * fx),
      Math.max(Math.round(W * fw), 6),
      Math.round(H * ft),
      Math.round(H * fs),
      fx < 0.5 ? -1 : 1,
    )
  }

  // --- masonry texture: a few darker courses stop it reading as a flat cut-out
  const block = ridge(seedSalt)
  g.fillStyle = dark
  for (let y = Math.round(H * 0.18); y < baseY - 4; y += 5) {
    for (let x = 2; x < W - 2; x += 7) {
      const jog = (Math.floor(y / 5) % 2) * 3
      if (block(x + y * 31, 11) > 0.66) g.fillRect(x + jog, y, 4, 1)
    }
  }

  // --- windows along the curtain wall
  for (let wx = 10; wx < W - 12; wx += 9) {
    if (rand() < 0.35) continue
    const wy = wallTop + 6 + Math.round(rand() * 6)
    windows.push({ x: wx, y: wy, w: 2, h: 4 })
    lancet(g, wx, wy, 2, 4, dark)
  }

  // --- gatehouse with a stepped arch and portcullis
  const gateW = Math.round(W * 0.11)
  const gateX = Math.round(W * 0.55 - gateW / 2)
  const gateH = Math.round(H * 0.24)
  const gateY = baseY - gateH
  g.fillStyle = dark
  g.fillRect(gateX - 3, gateY - 5, gateW + 6, gateH + 5)
  g.fillStyle = light
  g.fillRect(gateX - 3, gateY - 5, gateW + 6, 1)
  g.fillStyle = wood
  g.fillRect(gateX, gateY, gateW, gateH)
  g.fillStyle = dark
  g.fillRect(gateX, gateY, 2, 2)
  g.fillRect(gateX + gateW - 2, gateY, 2, 2)
  for (let px = gateX + 2; px < gateX + gateW - 1; px += 3) g.fillRect(px, gateY + 2, 1, gateH - 2)
  for (let py = gateY + 4; py < gateY + gateH; py += 4) g.fillRect(gateX, py, gateW, 1)

  // --- foundation + contact shadow so the mass sits on the ground
  g.fillStyle = dark
  g.fillRect(0, baseY - 4, W, 4)
  g.globalAlpha = 0.35
  g.fillRect(2, baseY - 1, W - 4, 1)
  g.globalAlpha = 1

  return { canvas: c, w: W, h: H, gate: { x: gateX, y: gateY, w: gateW, h: gateH }, windows }
}

/**
 * Bayer 8x8 threshold matrix, normalised to 0..1.
 *
 * 8x8 rather than 4x4: a 4x4 matrix only has 16 gradient steps, so the midpoint
 * of the ramp collapses into an obvious checkerboard. 64 steps reads as a smooth
 * fade at this scale.
 */
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((v) => v / 64))

/**
 * Dissolves the bottom rows of a band so it melts into the page instead of
 * ending on a hard horizontal cut — the give-away that a backdrop is a
 * rectangle rather than distant scenery.
 *
 * Uses an ORDERED dither, not random. Random per-pixel erasure produces noise
 * that is indistinguishable from the scattered grass in the ground layer, so
 * the two textures fight each other. An ordered matrix reads as a deliberate
 * gradient ramp and stays visually separate from organic scatter.
 */
function fadeBottom(g: CanvasRenderingContext2D, W: number, H: number) {
  const rows = Math.max(Math.round(H * 0.14), 6)
  g.save()
  g.globalCompositeOperation = 'destination-out'
  g.fillStyle = '#000'
  for (let i = 0; i < rows; i++) {
    const y = H - rows + i
    const t = (i + 1) / rows
    // Ease so the ramp moves quickly through the ~50% mark, where any ordered
    // dither is at its most visible as a pattern.
    const cut = t * t * (3 - 2 * t)
    const bayerRow = BAYER[y & 7]!
    for (let x = 0; x < W; x++) {
      if (bayerRow[x & 7]! < cut) g.fillRect(x, y, 1, 1)
    }
  }
  g.restore()
}

/** Deterministic value noise, so ridgelines are organic but reproducible. */
function ridge(seed: number) {
  const rand = (i: number) => {
    let t = Math.imul(i ^ seed, 0x6d2b79f5)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return (x: number, scale: number) => {
    const i = Math.floor(x / scale)
    const f = x / scale - i
    const s = f * f * (3 - 2 * f) // smoothstep
    return rand(i) * (1 - s) + rand(i + 1) * s
  }
}

/**
 * Distant mountain range. Two overlapping ridges give depth without a second
 * parallax layer, and snow caps read at this size where texture would not.
 */

/** Small local PRNG so procgen does not depend on the scene module. */
function mulberry(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Where land meets sky inside a backdrop band, as a fraction of band height.
 * Every scenery silhouette is grounded on this line, so the horizon is a single
 * unambiguous edge instead of each layer ending wherever it happens to.
 */
const HORIZON = 0.7

/**
 * Draws the ground plane under the scenery.
 *
 * This is what separates "distant scenery" from "the ground you walk on". A
 * backdrop that simply dissolves leaves the two reading as one soft smear; a
 * crisp line plus a wash below states the boundary explicitly.
 */
function drawGroundPlane(
  g: CanvasRenderingContext2D,
  W: number,
  H: number,
  ink: Ink,
  strength = 1,
) {
  drawGroundPlaneAt(g, W, H, ink, HORIZON, strength)
}

/**
 * Scatters small dark silhouettes along a horizon so it stops reading as a ruled
 * line. Distance never produces a hard edge in reality — there is always scrub,
 * treetops or haze breaking it — and a 1px rule is the single most artificial
 * thing a backdrop can do.
 */
function softenHorizon(
  g: CanvasRenderingContext2D,
  W: number,
  hy: number,
  ink: Ink,
  seed: number,
  density = 3,
) {
  const rand = mulberry(seed ^ 0x51a7)
  g.fillStyle = ink('f')
  for (let x = -2; x < W + 2; x += density) {
    if (rand() < 0.35) continue
    const h = 1 + Math.round(rand() * 3)
    const w = 1 + Math.round(rand() * 2)
    g.globalAlpha = 0.35 + rand() * 0.4
    g.fillRect(x, Math.round(hy) - h + 1, w, h)
  }
  g.globalAlpha = 1
}

function drawGroundPlaneAt(
  g: CanvasRenderingContext2D,
  W: number,
  H: number,
  ink: Ink,
  fraction: number,
  strength = 1,
) {
  const hy = Math.round(H * fraction)
  // Gradient wash rather than a solid block: a flat fill has to be dithered away
  // all at once at the bottom, which reads as a discrete band of noise. Falling
  // off gradually leaves almost nothing for fadeBottom to erase.
  g.fillStyle = ink('f')
  const depth = H - hy
  for (let i = 0; i < depth; i++) {
    const t = i / depth
    g.globalAlpha = 0.34 * (1 - t) * (1 - t)
    g.fillRect(0, hy + i, W, 1)
  }
  g.globalAlpha = 1
  // The single hardest edge in the backdrop: the horizon itself. `strength`
  // lets a theme state it more emphatically where the land is otherwise pale.
  g.fillStyle = ink('m')
  g.globalAlpha = Math.min(0.55 * strength, 1)
  g.fillRect(0, hy, W, 1)
  g.fillStyle = ink('f')
  g.globalAlpha = Math.min(0.7 * strength, 1)
  g.fillRect(0, hy - 1, W, 1)
  g.globalAlpha = Math.min(0.4 * strength, 1)
  g.fillRect(0, hy + 1, W, 1)
  g.globalAlpha = 1
}

/** Ridged silhouette grounded on the horizon. Shared by hills/plains/snow. */
function ridgeLayer(
  g: CanvasRenderingContext2D,
  W: number,
  H: number,
  seed: number,
  alpha: number,
  amp: number,
  scale: number,
  color: string,
  snowCap = 0,
) {
  const n = ridge(seed)
  const hy = H * HORIZON
  g.globalAlpha = alpha
  g.fillStyle = color
  for (let x = 0; x < W; x++) {
    const h = (n(x, scale) * 0.65 + n(x, scale * 0.35) * 0.35) * H * amp
    const top = hy - h
    g.fillRect(x, Math.round(top), 1, Math.round(hy - top))
    if (snowCap > 0 && h > H * snowCap) {
      // Erase back toward bare canvas so the cap reads lighter than the rock.
      g.save()
      g.globalCompositeOperation = 'destination-out'
      g.fillStyle = '#000'
      g.globalAlpha = 0.6
      g.fillRect(x, Math.round(top), 1, Math.max(Math.round(h * 0.2), 1))
      g.restore()
      g.globalAlpha = alpha
      g.fillStyle = color
    }
  }
  g.globalAlpha = 1
}

/** Rolling hills — the quietest backdrop. */
export function renderHills(ink: Ink, W: number, H: number, seed: number): ProcArt {
  const { c, g } = make(W, H)
  ridgeLayer(g, W, H, seed + 11, 0.28, 0.34, 70, ink('p'))
  ridgeLayer(g, W, H, seed + 53, 1, 0.2, 46, ink('p'))
  drawGroundPlane(g, W, H, ink, 0.7)
  softenHorizon(g, W, H * HORIZON, ink, seed, 4)
  fadeBottom(g, W, H)
  return { canvas: c, w: W, h: H }
}

/**
 * Plains with a mountain range behind them — the landing theme.
 * Three depth steps (far peaks, near hills, ground) so the eye reads distance.
 */
export function renderPlains(ink: Ink, W: number, H: number, seed: number): ProcArt {
  const { c, g } = make(W, H)
  // Stronger alphas than a pure-distance reading would suggest: at this scale
  // and behind body copy, a properly faint range simply disappears.
  ridgeLayer(g, W, H, seed + 7, 0.26, 0.62, 52, ink('p'))
  ridgeLayer(g, W, H, seed + 29, 0.44, 0.36, 74, ink('p'))
  ridgeLayer(g, W, H, seed + 61, 1, 0.16, 40, ink('f'))
  drawGroundPlane(g, W, H, ink, 0.8)
  softenHorizon(g, W, H * HORIZON, ink, seed, 3)
  fadeBottom(g, W, H)
  return { canvas: c, w: W, h: H }
}

/**
 * A distant treeline on a horizon — the forest theme's own scenery.
 *
 * The canopy backdrop had no horizon at all, so the About page read as texture
 * with no sense of place. A ridge of conifer silhouettes gives it the same
 * "here is the far edge of the world" reading the other themes have, without
 * borrowing their mountains.
 */
export function renderTreeline(ink: Ink, W: number, H: number, seed: number): ProcArt {
  const { c, g } = make(W, H)
  const rand = mulberry(seed)
  const hy = H * HORIZON

  // Two ranks of conifers, the far one paler.
  for (const [alpha, scale, jitter] of [
    [0.34, 0.34, 0.5],
    [1, 0.24, 0.35],
  ] as const) {
    g.globalAlpha = alpha
    g.fillStyle = ink('p')
    for (let x = -6; x < W + 6; x += 3 + Math.round(rand() * 3)) {
      const th = H * scale * (0.6 + rand() * jitter)
      const halfW = Math.max(th * 0.22, 2)
      // Stepped triangle: a conifer silhouette on the pixel grid.
      const rows = Math.round(th)
      for (let i = 0; i < rows; i++) {
        const t = i / rows
        const w = Math.max(Math.round(halfW * 2 * t), 1)
        g.fillRect(Math.round(x - w / 2), Math.round(hy - rows + i), w, 1)
      }
    }
  }
  g.globalAlpha = 1
  drawGroundPlane(g, W, H, ink, 0.75)
  // Undergrowth along the treeline, so forest does not end on a ruled edge.
  softenHorizon(g, W, H * HORIZON, ink, seed, 2)
  fadeBottom(g, W, H)
  return { canvas: c, w: W, h: H }
}

/** Snow-capped range for the winter theme; peaks taller and sharper. */
export function renderSnowfield(ink: Ink, W: number, H: number, seed: number): ProcArt {
  const { c, g } = make(W, H)
  ridgeLayer(g, W, H, seed + 3, 0.24, 0.7, 40, ink('p'), 0.42)
  ridgeLayer(g, W, H, seed + 41, 1, 0.44, 26, ink('p'), 0.3)
  drawGroundPlane(g, W, H, ink, 0.7)
  softenHorizon(g, W, H * HORIZON, ink, seed, 5)
  // Snow lies on the ground plane, so the wash below the horizon is lightened
  // back toward bare canvas rather than left as plain shaded earth.
  const hy = Math.round(H * HORIZON)
  g.save()
  g.globalCompositeOperation = 'destination-out'
  g.globalAlpha = 0.45
  g.fillStyle = '#000'
  g.fillRect(0, hy + 2, W, H - hy - 2)
  g.restore()
  fadeBottom(g, W, H)
  return { canvas: c, w: W, h: H }
}

/**
 * Open sea meeting the shore. The waterline is deliberately hard: this theme's
 * whole point is that land and water are separate places.
 */
export function renderSea(ink: Ink, W: number, H: number, seed: number): ProcArt {
  const { c, g } = make(W, H)
  const water = ink('p')
  const n = ridge(seed)
  // Must match COAST_SEA_TOP / COAST_SHORE in usePixelScene: the art and the
  // walk-exclusion describe the same water.
  const hy = Math.round(H * 0.72)
  const top = Math.round(H * 0.34)

  g.globalAlpha = 0.5
  g.fillStyle = water
  g.fillRect(0, top, W, hy - top)
  g.globalAlpha = 1
  // Crests, denser toward the shore.
  for (let y = top + 3; y < hy; y += 3) {
    const density = 0.62 - ((y - top) / (hy - top)) * 0.2
    for (let x = 0; x < W; x += 2) {
      if (n(x + y * 13, 9) > density) g.fillRect(x, y, 3, 1)
    }
  }
  // The sky/sea horizon, hard and level — this is the line the boat cannot cross.
  g.globalAlpha = 0.8
  g.fillStyle = ink('f')
  g.fillRect(0, top, W, 1)
  g.globalAlpha = 0.4
  g.fillRect(0, top - 1, W, 1)
  g.globalAlpha = 1
  drawGroundPlaneAt(g, W, H, ink, 0.72, 1.1)
  fadeBottom(g, W, H)
  return { canvas: c, w: W, h: H }
}

/**
 * Dense forest canopy.
 *
 * Repeated with almost no gap, so it must tile seamlessly in Y — laying foliage
 * out in horizontal rows produced obvious grey stripes down the page. Blobs are
 * scattered across the full band height and any blob crossing an edge is redrawn
 * on the opposite side.
 */
export function renderCanopy(ink: Ink, W: number, H: number, seed: number): ProcArt {
  const { c, g } = make(W, H)
  const rand = mulberry(seed)
  const unit = Math.max(H * 0.045, 3)

  const blob = (cx: number, cy: number, r: number) => {
    for (let dy = -r; dy <= r; dy++) {
      const half = Math.sqrt(Math.max(r * r - dy * dy, 0))
      g.fillRect(Math.round(cx - half), Math.round(cy + dy), Math.max(Math.round(half * 2), 1), 1)
    }
  }

  // Loose background foliage first, so whole trees sit in front of it.
  g.globalAlpha = 0.45
  g.fillStyle = ink('p')
  for (let i = 0; i < 34; i++) {
    const cx = rand() * (W + unit * 2) - unit
    const cy = rand() * H
    const r = unit * 1.15 * (0.65 + rand() * 0.7)
    blob(cx, cy, r)
    if (cy - r < 0) blob(cx, cy + H, r)
    if (cy + r > H) blob(cx, cy - H, r)
  }

  // Whole trees: each trunk gets its own crown directly above it. Scattering
  // trunks and foliage independently leaves bare vertical lines that read as
  // scratches rather than as woodland.
  for (let i = 0; i < 12; i++) {
    const tx = Math.round(rand() * W)
    const crownY = rand() * H
    const trunkLen = unit * (2.2 + rand() * 2.2)

    g.globalAlpha = 0.42
    g.fillStyle = ink('f')
    g.fillRect(tx, Math.round(crownY), 2, Math.round(trunkLen))
    // Wrap the trunk so it survives the vertical tile seam.
    if (crownY + trunkLen > H) g.fillRect(tx, Math.round(crownY - H), 2, Math.round(trunkLen))

    g.globalAlpha = 0.85
    g.fillStyle = ink('p')
    for (let b = 0; b < 3; b++) {
      const bx = tx + 1 + (rand() - 0.5) * unit * 2
      const by = crownY - unit * (0.2 + rand() * 0.9)
      const r = unit * (0.8 + rand() * 0.6)
      blob(bx, by, r)
      if (by - r < 0) blob(bx, by + H, r)
      if (by + r > H) blob(bx, by - H, r)
    }
  }
  g.globalAlpha = 1
  return { canvas: c, w: W, h: H }
}

/**
 * Pixel-doubles a hand-authored sprite into a ProcArt, carrying its door and
 * window cells across as scaled rects.
 *
 * A 16px hut standing next to an 11px villager reads as a doll house. Rather
 * than redraw every building larger, buildings are scaled by an INTEGER factor —
 * anything else would resample the art and destroy the pixel grid.
 */
export function scaleSprite(
  sprite: readonly string[],
  scale: number,
  ink: Ink,
): ProcArt {
  const sw = sprite.reduce((m, r) => Math.max(m, r.length), 0)
  const sh = sprite.length
  const W = sw * scale
  const H = sh * scale
  const { c, g } = make(W, H)
  const windows: NonNullable<ProcArt['windows']> = []
  let gx0 = Infinity, gx1 = -1, gy0 = Infinity, gy1 = -1

  for (let row = 0; row < sh; row++) {
    const line = sprite[row]!
    for (let col = 0; col < line.length; col++) {
      const ch = line[col]!
      if (ch === '.') continue
      if (ch === 'W') {
        windows.push({ x: col * scale, y: row * scale, w: scale, h: scale })
        continue
      }
      if (ch === 'D') {
        gx0 = Math.min(gx0, col * scale); gx1 = Math.max(gx1, col * scale + scale)
        gy0 = Math.min(gy0, row * scale); gy1 = Math.max(gy1, row * scale + scale)
        continue
      }
      g.fillStyle = ink(ch)
      g.fillRect(col * scale, row * scale, scale, scale)
    }
  }

  return {
    canvas: c, w: W, h: H, windows,
    gate: gx1 > 0 ? { x: gx0, y: gy0, w: gx1 - gx0, h: gy1 - gy0 } : undefined,
  }
}

/** Moon disc with a few maria. Drawn once, effectively fixed to the viewport. */
export function renderMoon(ink: Ink, r: number, tone = 'p'): ProcArt {
  const size = r * 2 + 2
  const { c, g } = make(size, size)
  const cx = size / 2
  const cy = size / 2
  g.fillStyle = ink(tone)
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.sqrt(Math.max(r * r - dy * dy, 0))
    g.fillRect(Math.round(cx - half), Math.round(cy + dy), Math.max(Math.round(half * 2), 1), 1)
  }
  // Maria erased rather than painted, so they stay a shade of the disc itself.
  g.save()
  g.globalCompositeOperation = 'destination-out'
  g.globalAlpha = 0.3
  g.fillStyle = '#000'
  for (const [ox, oy, rr] of [
    [-0.3, -0.25, 0.26],
    [0.25, 0.1, 0.2],
    [-0.05, 0.4, 0.14],
  ] as const) {
    const mr = r * rr
    for (let dy = -mr; dy <= mr; dy++) {
      const half = Math.sqrt(Math.max(mr * mr - dy * dy, 0))
      g.fillRect(
        Math.round(cx + ox * r - half),
        Math.round(cy + oy * r + dy),
        Math.max(Math.round(half * 2), 1),
        1,
      )
    }
  }
  g.restore()
  return { canvas: c, w: size, h: size }
}

export type BackdropKind = 'plains' | 'snow' | 'sea' | 'treeline' | 'hills'

/**
 * Vertical spacing between repeats, as a multiple of the band height.
 * Below 1 the bands overlap into a continuous mass (dense forest); above 2 they
 * leave open sky between distant features.
 */
export const BACKDROP_STEP: Record<BackdropKind, number> = {
  plains: 2.2,
  hills: 2.4,
  snow: 2.0,
  sea: 1.9,
  treeline: 2.0,
}

export function renderBackdrop(
  kind: BackdropKind,
  ink: Ink,
  W: number,
  H: number,
  seed: number,
): ProcArt {
  switch (kind) {
    case 'plains':
      return renderPlains(ink, W, H, seed)
    case 'snow':
      return renderSnowfield(ink, W, H, seed)
    case 'sea':
      return renderSea(ink, W, H, seed)
    case 'treeline':
      return renderTreeline(ink, W, H, seed)
    default:
      return renderHills(ink, W, H, seed)
  }
}
