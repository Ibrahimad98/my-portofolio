---
name: pixel-companion
description: How to build the pixel-art world in THIS Vue 3 portfolio — a character that follows the cursor with real walking physics, through a scroll-linked environment anchored to the page's own sections (castle, houses, roads with pedestrians, animals), with per-route themes, a cursor-held water gun, and cloud page transitions. Use when adding, tuning, or debugging any canvas pixel-art, sprite, cursor-character, ambient-scene, or pixel page-transition feature here. Covers the render pipeline, steering math, document-space camera, sprite authoring, the locked palette, and the performance + accessibility rules that keep it from wrecking the site.
---

# Pixel Companion Scene

A canvas pixel-art layer where the **cursor is the main character**. Not a cursor
trail — an actual little person who *walks* toward where you point, at a speed a
person would walk, through a small world that reacts to them.

Pairs with `portfolio-revamp` (look) and `portfolio-motion` (motion libs). Note:
**this scene does not use motion-v or GSAP.** It is a self-driven `requestAnimationFrame`
simulation. Do not try to drive per-frame character physics through a tween library.

## Non-negotiable constraints

This is decorative. It must never degrade the actual portfolio.

1. **Never intercepts input.** Canvas is `pointer-events: none` and `aria-hidden="true"`.
   Every link, button, and form stays clickable straight through it.
2. **Zero layout impact.** Absolutely/fixed positioned. Must not contribute to CLS.
3. **Off by default where it can't work:**
   - `prefers-reduced-motion: reduce` → do not animate. Render one static frame or nothing.
   - `(pointer: coarse)` / touch → **there is no cursor to follow.** Either disable the
     character or switch it to autonomous wander. Never leave it frozen in a corner.
   - Tab hidden → cancel the rAF loop entirely (`visibilitychange`).
   - Scene scrolled out of view → stop rendering (IntersectionObserver).
4. **One scene per site.** Not per page, not per section.
5. **Give the user an out.** A small mono toggle to disable it, persisted in
   `localStorage`. Some visitors find ambient movement genuinely distracting.

## Render pipeline — the part that makes it look like pixel art

The single most important technique: **render small, upscale with nearest-neighbour.**
Do not draw "pixel-styled" shapes at full resolution — it will never look right.

```ts
const SCALE = 4 // 1 art pixel = 4 CSS pixels

function resize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const W = Math.max(Math.ceil(window.innerWidth / SCALE), 1)
  const H = Math.max(Math.ceil(window.innerHeight / SCALE), 1)

  // Internal buffer is the LOW-RES art grid, not the screen size.
  canvas.width = W
  canvas.height = H

  // Pin the CSS size to an exact integer multiple of the buffer. Letting the
  // browser scale by a fractional factor produces uneven pixel widths.
  canvas.style.width = `${W * SCALE}px`
  canvas.style.height = `${H * SCALE}px`

  ctx.imageSmoothingEnabled = false // must be re-set after every resize
}
```

> **Do not put `devicePixelRatio` in that formula.** It is tempting, but it makes
> the art grid finer on retina, so every sprite renders at half the physical size
> on a 2× display and the scene silently changes scale between machines. Nearest-
> neighbour upscaling is already crisp at any DPR: on a 2× screen, `SCALE = 4`
> means 8 device pixels per art pixel, still an exact integer.

Then scale the canvas back up in CSS with `image-rendering: pixelated`:

```css
.pixel-canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  pointer-events: none;
}
```

Rules that follow from this:
- **All coordinates are art-pixels**, not CSS pixels. Convert pointer position once:
  `artX = (clientX - rect.left) / SCALE * dpr`.
- **Snap on draw, not in state.** Keep `x`/`y` as floats for smooth physics, but
  `Math.round()` them at draw time. Rounding the state kills sub-pixel motion and
  makes walking stutter.
- `imageSmoothingEnabled = false` resets whenever the canvas is resized. Re-set it.

## Character follow — steering, not lerp

The user requirement: *not* cursor speed — a believable character speed, with delay.

A naive `pos += (target - pos) * 0.1` lerp is **wrong** for this: its speed is
proportional to distance, so a far-away cursor makes the character rocket across the
screen. Use an **arrive steering behaviour** with a hard speed cap.

```ts
const WALK_SPEED = 46   // art px/sec — tune by eye
const RUN_SPEED = 92    // when the cursor is far away
const ACCEL = 180       // art px/sec² — how fast it gets up to speed (the "delay")
const ARRIVE_RADIUS = 40 // start slowing down inside this
const STOP_RADIUS = 6    // close enough; go idle
const RUN_RADIUS = 120   // beyond this, break into a run

function step(dt: number) {
  const dx = target.x - pos.x
  const dy = target.y - pos.y
  const dist = Math.hypot(dx, dy)

  let desiredX = 0
  let desiredY = 0

  if (dist > STOP_RADIUS) {
    const maxSpeed = dist > RUN_RADIUS ? RUN_SPEED : WALK_SPEED
    // Ease down as we arrive so it settles instead of overshooting.
    const speed = dist < ARRIVE_RADIUS ? maxSpeed * (dist / ARRIVE_RADIUS) : maxSpeed
    desiredX = (dx / dist) * speed
    desiredY = (dy / dist) * speed
  }

  // Approach the desired velocity at a bounded rate => inertia, i.e. the delay.
  const maxDelta = ACCEL * dt
  vel.x += clamp(desiredX - vel.x, -maxDelta, maxDelta)
  vel.y += clamp(desiredY - vel.y, -maxDelta, maxDelta)

  pos.x += vel.x * dt
  pos.y += vel.y * dt
}
```

Why this satisfies the brief:
- Speed is **capped**, so it always reads as walking/running — never teleporting.
- Acceleration is **bounded**, so it lags behind the cursor and eases in/out. That
  lag *is* the delay, and it looks organic rather than like a spring.
- `ARRIVE_RADIUS` makes it decelerate and settle instead of jittering on the target.

### Delta time — clamp BOTH ends

```ts
let last = performance.now()
function frame(now: number) {
  const dt = Math.max(0, Math.min((now - last) / 1000, 1 / 30)) // CLAMP BOTH
  last = now
  step(dt)
  draw()
  raf = requestAnimationFrame(frame)
}
```

- **Upper bound**: without it, switching tabs for 30 seconds produces one frame
  with `dt = 30`, and the character teleports across the world (or through walls).
- **Lower bound**: the first rAF timestamp can *predate* the `performance.now()`
  captured in `start()`, because the timestamp is the frame's start time, not the
  callback's. That yields a **negative dt** which runs the whole simulation
  backwards. This bit for real: `stride` went negative, and
  `Math.floor(-0.02 / 5) % 2` is `-1`, so `frames[-1]` was `undefined` and the
  entire render loop died on the first frame of movement.

Related: **never index a sprite array with a raw modulo.** Any arithmetic that
feeds a frame index must be floored into range defensively, because one NaN or
negative anywhere upstream takes down the whole loop:

```ts
function frameIndex(stride: number, count: number) {
  const i = Math.floor(stride / STRIDE)
  return Number.isFinite(i) ? ((i % count) + count) % count : 0
}
```

### Give the follow a deadzone

A character that walks all the way onto the cursor crowds it permanently, which
makes anything drawn near it — a companion, a hotspot — nearly impossible to
click. Inside a radius (~34 art px) the character should **stop and just turn to
face the pointer**; only outside it does it walk. Damp the velocity to zero
rather than steering, or it jitters on the boundary.

### Splitting one switch into two leaves landmines

Holstering and roaming were originally the same toggle. When they were separated
into a Weapon setting and a Movement setting, two `weapon !== 'none'` guards were
left behind on the *cursor-target* updates — so choosing "no weapon" silently
stopped the character following at all.

After splitting a control, grep for every reference to the old condition. A
leftover guard on an unrelated system does not fail loudly; it just makes an
apparently unrelated feature stop working.

### A moving thing cannot be a button

If something drawn in the scene doubles as a control, it must **stop moving when
the pointer reaches it**. Two rules, both learned the hard way:

- **Settle on approach.** Freeze the position and the idle bob entirely once the
  cursor is within a small radius, and publish its screen position every frame
  while held so the DOM hit target sits exactly on it. A target that keeps
  drifting and bobbing under the cursor simply cannot be clicked.
- **Never derive a companion's position from `facing`.** With a look-at deadzone,
  reaching toward a companion that sits on the character's off-side turns the
  character toward the cursor, flips `facing`, and throws the companion to the
  other shoulder — so it flees the pointer every single time. Update its side
  only while the character is genuinely *walking*.

Give it a visible affordance too (a brighter halo while held) and a hit box far
larger than the sprite.

### One medium per zone

Where the world has distinct zones, give the character a way through each rather
than a wall: broom for sky, boat for water, horse on land. A zone the character
simply cannot enter reads as a rigid barrier — the same complaint that killed
the repeating-vista layout. Stack the zones as separate vistas (sky above sea
above land) so each has its own horizon and its own medium.

### Animation state
Drive the sprite from velocity, not from the cursor:

```ts
const speed = Math.hypot(vel.x, vel.y)
const state = speed < 4 ? 'idle' : speed > WALK_SPEED * 1.15 ? 'run' : 'walk'
if (Math.abs(vel.x) > 1) facing = vel.x > 0 ? 1 : -1 // don't flip on tiny jitter
```

**Advance walk frames by distance travelled, not by time:**
`frameAccumulator += speed * dt` and step a frame every N art-pixels. This makes the
feet land in sync with movement at any speed — the detail that separates "sprite with
a looping animation" from "character that is actually walking".

Flip with `ctx.save(); ctx.scale(-1, 1); ctx.drawImage(..., -x - w, y); ctx.restore()`.

## Environment

### Seeded scatter
Generate tree/grass/rock placement from a **seeded PRNG** so the world is identical
on every reload and across HMR, but still looks hand-scattered.

```ts
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
```

Never use bare `Math.random()` for placement — the world reshuffling on every route
change or hot reload reads as broken.

### Depth sorting
Sort every drawable by its **baseline y** (feet position) each frame and draw in that
order. This is what lets the character walk *behind* a tree when above it and *in
front* when below. Without it the scene is flat and the illusion dies immediately.

```ts
drawables.sort((a, b) => a.baseY - b.baseY)
```

### Ambient actors (animals, people)
Give them a tiny state machine, not a path: `idle → pick nearby point → walk → idle`,
with randomised dwell times. Reuse the same steering function as the character with a
lower `WALK_SPEED`. Two or three actors is plenty — a crowd turns the scene into noise
and eats frame budget.

Nice touch: have a bird or cat occasionally notice the character and turn to face it.

**Confine every wandering actor to a band — horizontal *and* vertical.**
- Horizontal, because content sits in a centred `max-w-6xl` column: an actor that
  strolls under a paragraph is the single most distracting thing the scene can do.
- Vertical, because an actor that drifts above the tallest prop has nothing left to
  occlude it, so it stops reading as "further away" and starts reading as airborne.
  Ground-dwellers should be clamped below the baseline of whatever they live near.

When a full-viewport scene sits behind copy, thin the ground detail inside the
reading column probabilistically (keep ~10%) rather than clipping it at a hard
edge — a clean cutoff draws a visible seam down the middle of the page.

### The interactive house — use hysteresis
Proximity triggers flicker horribly when the character hovers near the boundary. Use
**two different radii** for enter and exit:

```ts
const NEAR_ENTER = 34
const NEAR_EXIT = 46 // deliberately larger

houseOpen = houseOpen
  ? dist < NEAR_EXIT   // stay open until clearly away
  : dist < NEAR_ENTER  // only open when clearly close
```

**Give the house a solid footprint.** Depth sorting alone is not enough: without
an AABB push-out, the character walks *into* the building, sorts behind it, and
appears to vanish. Push out along the shallowest axis, and when ejecting downward
add +1 to the baseline so the feet clearly sort *in front of* the wall rather than
level with it.

Then animate door + window light over ~200ms rather than snapping. Good reactions:
door swings open, window lights up, smoke puffs from the chimney, a small mono label
fades in above it. Keep it to two or three — an object that does five things at once
reads as a toy, not craft.

## Scroll-linked world (document space)

The scene spans the **whole document**, not the viewport. Keep the canvas
`fixed` and viewport-sized — never size a canvas to the document, that is
megabytes of buffer — and translate by the scroll offset instead:

```ts
camY = window.scrollY / SCALE
ctx.save()
ctx.translate(0, -Math.round(camY)) // round, or the pixel grid shimmers
// ...draw everything in world coordinates...
ctx.restore()
```

- Read `scrollY` **in the rAF loop**, not in a scroll listener — you need it every
  frame anyway, and it stays in sync with rendering for free. Keep a listener only
  to redraw while the loop is paused (reduced motion).
- Cull by world y before pushing to the draw list.
- The pointer is in viewport space; the world is in document space. Convert once:
  `worldY = clientY / SCALE + camY`.
- Rebuild when the document height changes — route swaps and late-loading images
  both change it. `ResizeObserver` on `document.body`, debounced ~140ms.
- **Scale every count by document length.** Densities authored per screenful must
  be multiplied by `worldH / viewportH` (capped), or a long page is empty between
  landmarks. This was the single biggest visual problem when the scene moved from
  a fixed diorama to document space.

### Anchoring to content
The way the world stops feeling like a sticker is to bind it to the page's own
geometry. Measure `main section` boundaries and snap structures to the nearest
one; run roads exactly along those dividers so pedestrians walk the page's own
hairline rules. Fall back to even fractions when nothing is measurable yet.

## Vistas: one definition for where the ground begins

**Do not put the horizon on a parallax plane.** This is the mistake that caused
the worst class of bug in this scene: a backdrop at 0.35 parallax slides
independently of the world, so its horizon has no fixed relationship to anything
that walks. The result was the character standing *above* the horizon (walking in
the sky) and a lighthouse placed *inside* the sea.

Instead define a **vista** in world coordinates:

```ts
interface Vista { top: number; horizon: number; water: boolean }
```

The backdrop band is drawn at `vista.top` **at parallax 1.0**, and the region
above `vista.horizon` is off limits. Because the art and the exclusion are the
same region, the scenery and the world cannot disagree.

**Use ONE vista, at the top of the world — do not repeat them.** Repeating a
vista every screenful slices the ground into disconnected strips the character
cannot walk between, which makes the page feel broken into unrelated sections.
A single generous band (~1 viewport tall) gives the scenery its own room to be
looked at and leaves the whole rest of the document as continuous walkable land.

**A sky horizon should be a medium, not a wall.** Blocking the character at the
skyline reads as a rigid barrier. Let them cross it and switch to flight (a
broomstick here): `keepBelowHorizon(actor, canFly)` exempts the hero from a sky
horizon but never from water — nobody swims. Flight also suppresses the contact
shadow, ground collision, and any held weapon.

Beyond the horizon is either:
- `sky` — nothing is placed there and nothing may walk in;
- `water` — the sea *is* the vista. Land entities get pushed back to the shore,
  fish live in it, contact rings the surface.

Modelling the sea as the vista, rather than as a separate band lower down the
page, is what stops a coast having two unrelated seas.

Two rules that follow:

- **Every placement must be grounded, not just actors.** Structures, scatter,
  lamps and spawn points all need the same check — a structure's *baseline* is
  what must clear the horizon. Pushing only the walkers out is what left the
  lighthouse standing in the water.
- **Excluding a third of the world thins it out.** Per-screen densities tuned
  against the whole page under-fill the land once sky and sea are removed; scale
  them up or the world looks abandoned.
- Keep a few pixels of buffer when pushing entities back — pinning them exactly
  to the line reads as standing *in* the distance.

## Backdrop bands

Distant scenery is drawn at ~0.68 alpha behind everything else, one band per
vista (see above — parallax on the horizon is what broke layer coherence).

**Size the backdrop to the VIEWPORT, then repeat it down the document.** Sizing a
single silhouette to the full document height makes mountain peaks hundreds of
pixels tall and turns the screen into a grey wall. Render a band of about
`0.6 × viewportHeight` and tile it:

- Render **two** variants with different seeds and alternate them, so repeats
  never tile identically.
- Spacing is per-kind: `> 2 ×` band height leaves open sky between distant
  features; `< 1 ×` overlaps into a continuous mass (dense forest).
- A band repeated with little gap must **tile seamlessly in Y**. Laying foliage
  out in horizontal rows produces obvious stripes down the page — scatter blobs
  across the full band height instead, and redraw any blob that crosses an edge
  on the opposite side.
- **Dither the bottom edge away.** A band that simply stops leaves a hard
  horizontal cut, which instantly reads as "a rectangle", not scenery. Erase
  rows stochastically with increasing probability toward the bottom.
- **Atmospheric perspective is not optional.** Distant things must be paler and
  lower-contrast than the foreground. Using the mid grey for a backdrop makes it
  fight the trees in front of it.

### Keeping backdrop and ground from fighting

Two layers of pixel texture in the same tonal range read as one noisy mess. Two
rules keep them harmonious:

**1. One tone per layer.** Assign each depth plane its own step on the ramp and
do not share:

| Layer | Tone | Depth from |
| --- | --- | --- |
| Backdrop scenery | `pale` only | varying **alpha**, never a darker tone |
| Ground detail (grass, speckle, road) | `soft` (mid) | alpha |
| Props, structures | `mid` / `brown` | — |
| Characters | `ink` | — |

The moment a backdrop borrows the ground's tone, the horizon stops receding.

**2. Ordered dither for gradients, random scatter for nature.** This is the one
that actually bit: fading a backdrop's bottom edge with *random* per-pixel
erasure produces noise indistinguishable from scattered grass, so the two
textures visually merge into static. Use a **Bayer matrix** for any gradient —
it reads as a deliberate ramp and stays separate from organic scatter.

Use **8x8, not 4x4**: 16 gradient steps collapse into an obvious checkerboard at
the midpoint, where 64 steps read as a smooth fade. Keep the fade short (~14% of
the band) and ease the ramp (`t·t·(3−2t)`) so it moves quickly through the ~50%
mark, which is where any ordered dither is most visible as a pattern.

### Making the horizon explicit

A backdrop that just dissolves into the page leaves scenery and ground reading as
one soft smear. Give every band an explicit **horizon**: ground all silhouettes
on one line, draw that line crisply, then wash the ground plane below it.

Make that wash a **vertical gradient**, not a flat fill. A flat fill has to be
dithered away all at once at the bottom of the band, which reappears as a
discrete strip of noise — the exact artefact the ordered dither was meant to
remove. Falling off with `alpha × (1−t)²` leaves almost nothing for the fade to
erase.

## Night mode

Night is not just the palette inverting. Four things have to change together or
it reads as "grey daytime" rather than night:

- **Every window and lamp is lit**, unconditionally — not only on the character's
  approach. A dark village with dark windows reads as abandoned.
- **The fauna changes shift.** Swap the daytime animals for nocturnal ones (owls
  in place of cats/foxes/deer, bats in place of birds).
- **Add insects.** Slow-drifting fireflies in the warm accent are the cheapest,
  most effective signal that the night is alive.
- **A moon and stars.** Draw the moon **pinned to the viewport**, not placed in
  the world — it is effectively at infinity, so zero parallax is the physically
  right answer, and it avoids one moon per backdrop band.

**The moon is a light source, not a pale disc.** Draw it from the glow ramp with
a halo. Keep the halo radius near the moon's own diameter — pushed much wider it
stops reading as light and becomes a heavy brown ring.

**Put the sky on its own slow plane (~0.22), and keep stars and moon on it
together.** Both extremes are wrong:

- *Pinned to the viewport*, the moon holds still while the world rushes past, so
  it sinks out of the sky and ends up hanging over the castle and the ground.
- *Anchored hard to the world*, it is correct but scrolls away within half a
  screen.

A slow plane keeps it high for far longer and guarantees it always exits
**upward**, never down into the landscape. Stars must share that plane or the sky
visibly shears. Draw it before the world so nearer things occlude it properly.

**Give the night walkers torches.** A carried flame with a per-actor flicker
(`sin(clock * 9 + i * 2.1)`, offset by index so no two pulse together) does more
for the feeling of a living night than any amount of ambient tuning.

**Cap proximity scaling on large structures.** Scaling the trigger radius
straight off the width meant the castle noticed the character from half a screen
away and sat with its windows lit in broad daylight. Clamp it (~2.1×).

Also: **openings must not invert.** A doorway or gate cavity painted with the
foreground ink turns near-white when the ramp flips for dark mode, so every door
on the site glows. Give cavities their own non-invertible token that is dark in
both themes.

## Water

If water is a *place* rather than decoration, it needs all four of these or the
illusion breaks:

1. **A hard shoreline.** Everything else in the scene is dithered; the waterline
   is the one edge that should be crisp, because the whole point is that land and
   water are different places. Wobble it with `sin(x)` so it isn't a rectangle.
2. **Exclusion.** Land entities get pushed back to the nearer shore every frame.
3. **Reaction.** Ring the surface where something touches it, throttled per
   entity (~0.35s) or the surface boils.
4. **Its own inhabitants.** Fish confined to the body, hard-clamped inside the
   shoreline — one fish on the sand undoes the whole boundary.

Also skip ground scatter inside water regions, or grass sprouts out of the sea.

## Weather

Particles like snow live in **viewport space**, not world space: snow falls past
the camera, it does not scroll with the ground. Draw it after `ctx.restore()`,
outside the world transform, and wrap particles at the viewport edges.

## Trees in a backdrop

Scattering trunks and foliage independently leaves bare vertical lines that read
as scratches. Pair them: each trunk gets its own crown of blobs directly above
it. Wrap both across the tile seam, not just the foliage.

## Roads

Straight roads look like rules, not landscape. Use a broad sine sweep:
`y = baseY + sin(x · freq + phase) · amp`, with `amp` a large fraction of a
screen so the curve is legible at viewport scale rather than looking like a
wobble. Draw it with dithered edges so it melts into the ground, and have
pedestrians ease toward `roadYAt(x)` so they genuinely walk the curve.

## Natural placement

Uniform random scatter reads as noise; landscapes grow in copses with open
ground between. Seed a few clump centres, scatter around them, and reject
anything landing within `spacing` of an existing item.

**Round the clump count UP.** `round(7 / 5)` is 1, which produces a single clump
that frequently lands entirely off-screen and looks exactly like the sprite
failed to render. `ceil` guarantees at least two.

## Oversized landmarks

A structure wider than its side band will be shoved into the reading column.
Let it hang off the **outer edge of the viewport** instead (~20% of its width):
at that scale a partly off-screen castle reads as monumental, whereas one
sitting on the body copy just reads as an obstruction. This is the opposite of
the rule for small props, where clipping reads as a bug.

Past roughly 30×30, stop hand-authoring text sprites — that is 3000 characters
of string literal nobody can edit safely. Draw big structures procedurally into
an offscreen canvas, returning gate/window rects for the interactive parts.
Give them masonry texture and a contact shadow, or they read as flat silhouettes.

## Melee vs ranged

If a weapon can be handed to the character, that transfer must not block
attacking. Clicking the character to pass a *ranged* weapon is fine; applying
the same rule to melee means you can never strike anything standing where you
point. Gate the hand-off on the ranged weapon only, and force melee to be
character-held.

Every attack needs a distinct pose plus a short offset — a lunge for a thrust, a
few pixels of kick for recoil — held for ~0.25s. A hit with no visible motion
reads as a no-op.

## Reacting to page content

Measure real DOM elements (`main h1, main h2, main a[href], …`) into world space
and toggle classes as the character passes or strikes them. Two hard rules:

- **Only colour and transform, never layout.** The character must not be able to
  shift the page or cause CLS.
- **Clean up.** Remove the strike class once its animation is done so it can
  retrigger, and clear every class on unmount and when the scene is toggled off —
  otherwise the DOM keeps state from a scene that no longer exists.

## Per-route themes

Map route name → a theme describing structures, scatter, densities and
inhabitants. Seed the PRNG from the route name so each page's layout is its own
but stable across visits. Keep a shared visual language across themes (same
ramp, same character) — only the *furniture* changes, otherwise the site reads as
four different websites.

Place a theme's identifying landmark **high** (`t ≈ 0.15`), not mid-page. A theme
whose identity only appears after two screens of scrolling does not have one.

## Cursor as a tool (the water gun)

A cursor-attached tool is fine, but it must not compromise the page:

- **Never `preventDefault`** on the pointer handler. The canvas is decorative;
  clicks must still reach links and buttons. The tool's effect is *additive* to
  whatever the click already does.
- **Keep the real system cursor visible.** Draw the tool sprite offset from the
  hotspot, as if held. Hiding the OS cursor to replace it wrecks click precision
  and accessibility.
- Give the tool two distinct modes so transferring it actually changes something.
  Held by the cursor it should act at the pointer (instant, point-blank); handed
  to the character it should fire a travelling projectile the character aims.
  If both modes feel the same, the transfer is a gimmick.
- Reactions sell it: soaked NPCs render one step darker down the ramp, drip, and
  flee for a beat before drying off. A hit with no reaction reads as a no-op.

## Page transitions (cloud wipe)

- The wipe needs its **own canvas at full opacity**, above the page. Drawing it on
  the ambient scene canvas will not work — that layer is deliberately ~0.4 alpha
  and cannot hide anything.
- `await` the cover animation in `router.beforeEach` so the clouds close *before*
  the view swaps; reveal in `afterEach`. That ordering is the entire trick.
- Wait two rAFs before revealing, or the reveal exposes an unpainted frame.
- Once the front is dense, fill behind it with an opaque colour — scattered
  sprites alone never reach full coverage, and gaps show the swap.
- Skip on first load (nothing to transition from) and under reduced motion.
- Use a fixed seed: a cloud front that reshuffles every navigation reads as noise.

## Palette — locked, and themed

Authentic pixel art uses a **small fixed ramp**, not derived semantic tokens. The
existing UI palette is also fully achromatic (every `--foreground`/`--muted` is
`oklch(… 0 0)`), so the soft brown is the first real chroma in this design system —
which is exactly why it must be the *only* one. Monochrome world + one warm brown.

Add to [src/assets/style.css](src/assets/style.css), in both `:root` and `.dark`.
Author these as **hex**, not `oklch()`: canvas `fillStyle` accepts hex everywhere,
whereas CSS Color 4 support in canvas varies by browser version.

```css
:root {
  --pixel-ink: #1c1c1c;
  --pixel-shade: #3d3d3d;
  --pixel-mid: #6b6b6b;
  --pixel-soft: #a3a3a3;
  --pixel-pale: #d9d9d9;
  --pixel-bg: #f5f5f5;
  --pixel-brown-dark: #5a4634;
  --pixel-brown: #8a6f52;
  --pixel-brown-soft: #b39176;
  --pixel-brown-pale: #d8c3ad;
}

.dark {
  --pixel-ink: #ededed;
  --pixel-shade: #bdbdbd;
  --pixel-mid: #8a8a8a;
  --pixel-soft: #5c5c5c;
  --pixel-pale: #3a3a3a;
  --pixel-bg: #242424;
  --pixel-brown-dark: #d8c3ad; /* ramp inverts so brown still reads warm on dark */
  --pixel-brown: #b39176;
  --pixel-brown-soft: #8a6f52;
  --pixel-brown-pale: #5a4634;
}
```

Read them once into a JS palette object, and **re-read on theme change** — the theme
toggle swaps the `.dark` class on `<html>`, so watch it:

```ts
const readPalette = () => {
  const s = getComputedStyle(document.documentElement)
  return { ink: s.getPropertyValue('--pixel-ink').trim(), /* … */ }
}
const mo = new MutationObserver(() => { palette = readPalette() })
mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
onUnmounted(() => mo.disconnect())
```

Usage discipline: **brown only for wood, soil, and fur** (tree trunks, the house,
paths, the cat). Grass, foliage, stone, people, and the character stay on the grey
ramp. That restraint is what keeps the scene tied to the editorial identity instead
of turning into generic RPG clip-art.

## Authoring sprites without art assets

Do not add PNG spritesheets to the repo for v1. Define sprites **in code** as index
maps against the palette ramp — readable, diffable, themeable, and zero network cost.

```ts
// '.' = transparent, digits index the palette ramp
const CAT = [
  '..0..0..',
  '.000000.',
  '.0.00.0.',
  '.000000.',
  '..0000..',
]
```

Blit with a nested loop of `fillRect(x + col, y + row, 1, 1)` in art-pixel space.
At 16×16 or smaller per sprite this is comfortably fast. If the scene later outgrows
this, pre-render each sprite **once** to an offscreen canvas and `drawImage` it —
don't optimise there until you measure a problem.

Keep the character around **12×16 art pixels**. Small enough to be cheap, large
enough for a readable silhouette. Silhouette matters more than detail at this size.

## Performance budget

- Target: **< 3ms per frame**. This is decoration; the site owns the frame budget.
- Redraw the static environment into an **offscreen canvas once**, then blit that
  each frame and only re-render moving actors on top. Re-generating grass every frame
  is the usual reason these scenes tank.
- Do not allocate inside the loop — no array literals, no object literals, no
  `.map()`/`.filter()` per frame. Reuse buffers; GC pauses show up as stutter.
- Cancel the rAF in `onUnmounted`. Never leave a loop running after route change.
- Verify on a throttled CPU (DevTools → Performance → 4× slowdown) before shipping.

## Integration checklist

1. Component in `src/components/pixel/` (new folder), mounted once in
   [src/App.vue](src/App.vue) — not per route.
2. Physics/scene logic in a composable (`usePixelScene.ts`), so it is testable
   without a DOM canvas. Keep the Vue component thin: mount, resize, teardown.
3. Pointer listener on `window` with `{ passive: true }`. Track the last known
   position; on `pointerleave`, let the character keep walking to it and idle there.
4. Layering: `z-index` **below** all content, above the page background. It should
   feel like the site sits on top of the world, not the world on top of the site.
5. Run `yarn type-check` and `yarn lint`. Verify: light theme, dark theme,
   reduced-motion, touch device, and tab-switch.

## Taste guardrails

- **Quiet by default.** Ambient life at the edge of attention. If it pulls the eye
  away from your projects, it has failed — this is seasoning, not the meal.
- **No sound.** Ever, unless explicitly user-initiated.
- **No cursor replacement.** Keep the real system cursor visible. Hiding it to force
  the character to *be* the pointer breaks clickability perception and accessibility.
- **Resist scope creep.** No inventory, no dialogue trees, no minigame, no score. The
  moment it becomes a game, it competes with your work instead of framing it.
- **Fewer, better elements.** One house, one or two trees, one animal, a person or
  two, good grass. A dense world at 12px reads as visual mud.
