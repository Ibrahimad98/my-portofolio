/**
 * Pixel sprites, authored in code as index maps against the locked palette ramp
 * (see --pixel-* tokens in src/assets/style.css).
 *
 * Why not PNG spritesheets: these re-colour themselves on theme change for free,
 * they diff readably in git, and they cost zero network requests. If the scene
 * ever outgrows this, pre-render each sprite once to an offscreen canvas.
 *
 * Legend:
 *   '.' transparent
 *   'k' ink          's' shade        'm' mid
 *   'f' soft         'p' pale
 *   'd' brownDark    'b' brown        'w' brownSoft    'l' brownPale
 *   'g' glow (lit window only — the single warm accent in the scene)
 */

export type Sprite = readonly string[]

/* --------------------------------------------------------------- warrior */

/**
 * The main character: an armoured warrior, 13x16.
 *
 * Plumed helm, a lit visor slit and a trailing scarf. The plume rises straight
 * up rather than sweeping out to the sides: side-swept crests read as HORNS at
 * this size, which made the figure look demonic rather than knightly.
 * They are also the only place in the scene that uses the accent tokens; the
 * world around them stays monochrome plus brown.
 *
 * Extra legend for this block:
 *   'c' crest (cool)   'r' scarf (warm)   'e' eye (lit)
 */
export const WARRIOR_IDLE: Sprite = [
  '......c......',
  '.....ccc.....',
  '.....ccc.....',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  '..rrrrrrrrr..',
  '.rrkmmmmmkrr.',
  'rr.kmmmmmk.rr',
  '...kmsssmk...',
  '...kmmmmmk...',
  '...kk...kk...',
  '..kk.....kk..',
]

export const WARRIOR_WALK_A: Sprite = [
  '......c......',
  '.....ccc.....',
  '.....ccc.....',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  '..rrrrrrrrr..',
  'rrrkmmmmmkr..',
  'rr.kmmmmmk...',
  '...kmsssmk...',
  '...kmmmmmk...',
  '..kk...kk....',
  '.kk.....kk...',
]

export const WARRIOR_WALK_B: Sprite = [
  '......c......',
  '.....ccc.....',
  '.....ccc.....',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  '..rrrrrrrrr..',
  '.rrkmmmmmkrr.',
  '.r.kmmmmmk.r.',
  '...kmsssmk...',
  '...kmmmmmk...',
  '...kkkkkkk...',
  '..kk.....kk..',
]

export const WARRIOR_RUN: Sprite = [
  '......c......',
  '.....ccc.....',
  '.....ccc.....',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  'rrrrrrrrrrr..',
  'rrrkmmmmmk...',
  'rr.kmmmmmk...',
  '...kmsssmk...',
  '..kk...kk....',
  '.kk.....kk...',
  'kk.......kk..',
]

/** Braced, front arm extended — held while a ranged weapon is armed. */
export const WARRIOR_AIM: Sprite = [
  '......c......',
  '.....ccc.....',
  '.....ccc.....',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  '..rrrrrrrrr..',
  '.rrkmmmmmkkk.',
  'rr.kmmmmmk.rr',
  '...kmsssmk...',
  '...kmmmmmk...',
  '...kk...kk...',
  '..kk.....kk..',
]

/** Recoil: weight thrown back, shoulders dropped. */
export const WARRIOR_SHOOT: Sprite = [
  '......c......',
  '.....ccc.....',
  '.....ccc.....',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  'rrrrrrrrrr...',
  'rrkkmmmmmkk..',
  'r..kmmmmmk...',
  '...kmsssmk...',
  '..kk...kk....',
  '.kk.....kk...',
  'kk.......kk..',
]

/** Spear thrust: deep lunge, both arms forward. */
export const WARRIOR_THRUST: Sprite = [
  '......c......',
  '.....ccc.....',
  '.....ccc.....',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  '..rrrrrrrrrr.',
  '.rrkmmmmmkkkk',
  'rr.kmmmmmk...',
  '...kmsssmk...',
  '..kk...kk....',
  '.kk.....kk...',
  'kk.......kk..',
]

/** Sword slash: torso rotated, blade swept high. */
export const WARRIOR_SLASH: Sprite = [
  '......c...kk.',
  '.....ccc.kk..',
  '.....ccckk...',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  '..rrrrrrrrr..',
  '.rrkmmmmmkrr.',
  'rr.kmmmmmk.rr',
  '...kmsssmk...',
  '...kmmmmmk...',
  '..kk...kk....',
  '.kk.....kk...',
]

/** Seated: legs bent forward, for saddle and boat alike. */
export const WARRIOR_RIDE: Sprite = [
  '......c......',
  '.....ccc.....',
  '.....ccc.....',
  '....kkkkk....',
  '...kmmmmmk...',
  '...kmmmmmk...',
  '...kmeeemk...',
  '...kmmmmmk...',
  '....kkkkk....',
  '..rrrrrrrrr..',
  '.rrkmmmmmkrr.',
  'rr.kmmmmmk.rr',
  '...kmsssmkk..',
  '...kkkkkkkk..',
  '...kk....kk..',
  '...dd....dd..',
]

export const WARRIOR_FRAMES = {
  idle: [WARRIOR_IDLE],
  walk: [WARRIOR_WALK_A, WARRIOR_IDLE, WARRIOR_WALK_B, WARRIOR_IDLE],
  run: [WARRIOR_RUN, WARRIOR_WALK_B],
} as const

/** Lit torch carried by night walkers — 3x6, flame on top. */
export const TORCH: Sprite = [
  '.g.',
  'ggg',
  'ggg',
  '.g.',
  '.d.',
  '.d.',
]

/** Main character — 10x14. Tallest, highest-contrast silhouette in the scene. */
export const HERO_IDLE: Sprite = [
  '...kkkk...',
  '..kffffk..',
  '..kfkfkf..',
  '..kffffk..',
  '...kfffk..',
  '..kkkkkk..',
  '.kksssskk.',
  '.k.ssss.k.',
  '...ssss...',
  '...ssss...',
  '...kk.kk..',
  '...kk.kk..',
  '...kk.kk..',
  '..dd...dd.',
]

export const HERO_WALK_A: Sprite = [
  '...kkkk...',
  '..kffffk..',
  '..kfkfkf..',
  '..kffffk..',
  '...kfffk..',
  '..kkkkkk..',
  '.kksssskk.',
  '.k.ssss.k.',
  '...ssss...',
  '...ssss...',
  '..kk..kk..',
  '..kk...kk.',
  '.kk....kk.',
  '.dd....dd.',
]

export const HERO_WALK_B: Sprite = [
  '...kkkk...',
  '..kffffk..',
  '..kfkfkf..',
  '..kffffk..',
  '...kfffk..',
  '..kkkkkk..',
  '.kksssskk.',
  '.k.ssss.k.',
  '...ssss...',
  '...ssss...',
  '...kkkk...',
  '...kkkk...',
  '...kk.kk..',
  '..dd..dd..',
]

/** Slight bob on the run — sells the weight shift. */
export const HERO_RUN_A: Sprite = [
  '..........',
  '...kkkk...',
  '..kffffk..',
  '..kfkfkf..',
  '..kffffk..',
  '...kfffk..',
  '.kkkkkkk..',
  'kksssskk..',
  'k..ssss.k.',
  '...ssss...',
  '..kkk.kk..',
  '.kk....kk.',
  'kk......k.',
  'dd.....dd.',
]

/** Braced stance, front arm out — held while a ranged weapon is armed. */
export const HERO_AIM: Sprite = [
  '...kkkk...',
  '..kffffk..',
  '..kfkfkf..',
  '..kffffk..',
  '...kfffk..',
  '..kkkkkk..',
  '.kkssssk..',
  '.k.sssskk.',
  '...ssss...',
  '...ssss...',
  '..kk..kk..',
  '..kk...kk.',
  '.kk.....k.',
  '.dd....dd.',
]

/** Recoil: weight thrown back, shoulders dropped. One frame, ~120ms. */
export const HERO_SHOOT: Sprite = [
  '..........',
  '..kkkk....',
  '.kffffk...',
  '.kfkfkf...',
  '.kffffk...',
  '..kfffk...',
  '.kkkkkk...',
  'kksssskkk.',
  'k..ssss...',
  '...ssss...',
  '..kk.kk...',
  '.kk...kk..',
  '.kk....kk.',
  'dd.....dd.',
]

/** Spear thrust: deep lunge, both arms forward. */
export const HERO_THRUST: Sprite = [
  '..........',
  '..kkkk....',
  '.kffffk...',
  '.kfkfkf...',
  '.kffffk...',
  '..kfffk...',
  '.kkkkkkkk.',
  '.kssssk...',
  '..ssss....',
  '..ssss....',
  '.kk..kk...',
  'kk....kk..',
  'k......kk.',
  'dd.....dd.',
]

/** Sword slash: torso rotated, arm swept high. */
export const HERO_SLASH: Sprite = [
  '.......k..',
  '..kkkk.k..',
  '.kffffkk..',
  '.kfkfkf...',
  '.kffffk...',
  '..kfffk...',
  '..kkkkkk..',
  '.kkssssk..',
  '..ssss....',
  '..ssss....',
  '..kk.kk...',
  '..kk..kk..',
  '.kk....kk.',
  '.dd....dd.',
]

export const HERO_FRAMES = {
  idle: [HERO_IDLE],
  walk: [HERO_WALK_A, HERO_IDLE, HERO_WALK_B, HERO_IDLE],
  run: [HERO_RUN_A, HERO_WALK_B],
} as const

/* ---------------------------------------------------------------- weapons */

/** Spear — 13x3, tip to the right. */
export const SPEAR: Sprite = [
  '.........fff.',
  'dddddddddffff',
  '.........fff.',
]

/** Sword — 11x5, blade right, crossguard and grip left. */
export const SWORD: Sprite = [
  '....f......',
  '..ddfffffff',
  'dddddffffff',
  '..ddfffffff',
  '....f......',
]

/** Swing arc drawn ahead of a sword slash — 6x11. */
export const SLASH_ARC: Sprite = [
  '...f..',
  '..ff..',
  '.ff...',
  'ff....',
  'ff....',
  'ff....',
  'ff....',
  '.ff...',
  '..ff..',
  '...f..',
  '...f..',
]

/** Thrust impact burst for the spear — 5x5. */
export const THRUST_HIT: Sprite = [
  'f...f',
  '.f.f.',
  '..f..',
  '.f.f.',
  'f...f',
]

/**
 * Villager — 8x11. Deliberately shorter than the hero and drawn in the SOFT end
 * of the ramp, not ink. Two levels of contrast separation so the hero still
 * reads as the protagonist even when they stand side by side.
 */
export const VILLAGER_A: Sprite = [
  '..ffff..',
  '.fmmmmf.',
  '.fmfmfm.',
  '.fmmmmf.',
  '..ffff..',
  '.ffffff.',
  'f.ffff.f',
  '..ffff..',
  '..ff.ff.',
  '..ff.ff.',
  '.ww...ww',
]

export const VILLAGER_B: Sprite = [
  '..ffff..',
  '.fmmmmf.',
  '.fmfmfm.',
  '.fmmmmf.',
  '..ffff..',
  '.ffffff.',
  'f.ffff.f',
  '..ffff..',
  '..ffff..',
  '..ff.ff.',
  '..ww.ww.',
]

export const VILLAGER_FRAMES = [VILLAGER_A, VILLAGER_B] as const

/**
 * Cat — 10x5. Faces left: ears, head, long low body, tail up at the right.
 * The silhouette has to be unmistakably low-and-long, otherwise at this size it
 * just reads as a piece of furniture.
 */
export const CAT_A: Sprite = [
  '.b.b.....b',
  'bbbbb...bb',
  'bbbbbbbbb.',
  '.bbbbbbbb.',
  '.b.b..b.b.',
]

export const CAT_B: Sprite = [
  '.b.b.....b',
  'bbbbb...bb',
  'bbbbbbbbb.',
  '.bbbbbbbb.',
  '..bb..bb..',
]

export const CAT_FRAMES = [CAT_A, CAT_B] as const

/* ------------------------------------------------- endemic fauna per theme */

/** Arctic fox — 11x5. Low and long like the cat, but with a bushy tail. */
export const FOX_A: Sprite = [
  'b.b.......b',
  'bbbb....bbb',
  'bbbbbbbbbb.',
  '.bbbbbbbbb.',
  '.b.b..b.b..',
]

export const FOX_B: Sprite = [
  'b.b.......b',
  'bbbb....bbb',
  'bbbbbbbbbb.',
  '.bbbbbbbbb.',
  '..bb..bb...',
]

export const FOX_FRAMES = [FOX_A, FOX_B] as const

/** Deer — 13x13. Antlers are the whole silhouette; without them it's a dog. */
export const DEER_A: Sprite = [
  '...d.....d...',
  '..dd.....dd..',
  '...ddd.ddd...',
  '.....www.....',
  '.....www.....',
  '.....ww......',
  '.wwwwwww.....',
  'wwwwwwwwww...',
  'wwwwwwwwww...',
  '.wwwwwwwww...',
  '.w.w...w.w...',
  '.w.w...w.w...',
  '.d.d...d.d...',
]

export const DEER_B: Sprite = [
  '...d.....d...',
  '..dd.....dd..',
  '...ddd.ddd...',
  '.....www.....',
  '.....www.....',
  '.....ww......',
  '.wwwwwww.....',
  'wwwwwwwwww...',
  'wwwwwwwwww...',
  '.wwwwwwwww...',
  '..ww...ww....',
  '.w..w.w..w...',
  '.d..d.d..d...',
]

export const DEER_FRAMES = [DEER_A, DEER_B] as const

/** Owl — 7x6. Perched, front-facing; the eyes carry it at this size. */
export const OWL_A: Sprite = [
  '.m...m.',
  '.mmmmm.',
  'mkmmmkm',
  'mmmmmmm',
  '.mmmmm.',
  '..d.d..',
]

export const OWL_B: Sprite = [
  '.m...m.',
  '.mmmmm.',
  'mmmmmmm',
  'mmmmmmm',
  '.mmmmm.',
  '..d.d..',
]

export const OWL_FRAMES = [OWL_A, OWL_B] as const

/** Fish — 7x5. Lives only in water; forked tail to the left. */
export const FISH_A: Sprite = [
  'f...ff.',
  'ff.ffff',
  'fffffff',
  'ff.ffff',
  'f...ff.',
]

export const FISH_B: Sprite = [
  'f..fff.',
  'ff.ffff',
  'fffffff',
  'ff.ffff',
  'f..fff.',
]

export const FISH_FRAMES = [FISH_A, FISH_B] as const

/** Hare — 9x6. Ears are the whole read at this size. */
export const HARE_A: Sprite = [
  '..f...f..',
  '..f...f..',
  '..fff.f..',
  '.fffffff.',
  'fffffffff',
  '.f.f.f.ff',
]

export const HARE_B: Sprite = [
  '..f..f...',
  '..f..f...',
  '..fff.f..',
  '.fffffff.',
  'fffffffff',
  '..ff..ff.',
]

export const HARE_FRAMES = [HARE_A, HARE_B] as const

/** Reindeer — 15x14. Broad palmate antlers, heavier than the deer. */
export const REINDEER_A: Sprite = [
  '..d.d.....d.d..',
  '.ddddd...ddddd.',
  '..ddd.....ddd..',
  '...dd.....dd...',
  '......www......',
  '......www......',
  '......ww.......',
  '.wwwwwww.......',
  'wwwwwwwwwww....',
  'wwwwwwwwwww....',
  '.wwwwwwwwww....',
  '.w.w....w.w....',
  '.w.w....w.w....',
  '.d.d....d.d....',
]

export const REINDEER_B: Sprite = [
  '..d.d.....d.d..',
  '.ddddd...ddddd.',
  '..ddd.....ddd..',
  '...dd.....dd...',
  '......www......',
  '......www......',
  '......ww.......',
  '.wwwwwww.......',
  'wwwwwwwwwww....',
  'wwwwwwwwwww....',
  '.wwwwwwwwww....',
  '..ww....ww.....',
  '.w..w..w..w....',
  '.d..d..d..d....',
]

export const REINDEER_FRAMES = [REINDEER_A, REINDEER_B] as const

/** Lion — 14x9. The mane is the entire silhouette read. */
export const LION_A: Sprite = [
  '.bbb.........b',
  'bbbbb.......bb',
  'bbbbbb.bbbbbb.',
  'bbbbbbbbbbbbb.',
  '.bbbbbbbbbbbb.',
  '.bbbbbbbbbbbb.',
  '..bbbbbbbbbb..',
  '..b.b....b.b..',
  '..b.b....b.b..',
]

export const LION_B: Sprite = [
  '.bbb.........b',
  'bbbbb.......bb',
  'bbbbbb.bbbbbb.',
  'bbbbbbbbbbbbb.',
  '.bbbbbbbbbbbb.',
  '.bbbbbbbbbbbb.',
  '..bbbbbbbbbb..',
  '...bb....bb...',
  '..b..b..b..b..',
]

export const LION_FRAMES = [LION_A, LION_B] as const

/** Shark fin cutting the surface — 9x5. Only ever drawn in water. */
export const FIN_A: Sprite = [
  '....k....',
  '...kk....',
  '..kkkk...',
  '.kkkkkk..',
  'ffffffff.',
]

export const FIN_B: Sprite = [
  '....k....',
  '...kkk...',
  '..kkkk...',
  '.kkkkkkk.',
  '.fffffff.',
]

export const FIN_FRAMES = [FIN_A, FIN_B] as const

/** Puff of displaced air when the character changes medium — 11x7. */
export const POOF: Sprite = [
  '..pp...pp..',
  '.pppp.pppp.',
  'pppppppppp.',
  '.pppppppp..',
  '..pp..pp...',
  '.p......p..',
  '...........',
]

/** Boar — 12x7. Low, heavy, snout forward with a tusk. */
export const BOAR_A: Sprite = [
  '.....ww.....',
  '...wwwwww...',
  '.wwwwwwwww..',
  'wwwwwwwwwwd.',
  'wwwwwwwwwwd.',
  '.wwwwwwwww..',
  '.d.d...d.d..',
]

export const BOAR_B: Sprite = [
  '.....ww.....',
  '...wwwwww...',
  '.wwwwwwwww..',
  'wwwwwwwwwwd.',
  'wwwwwwwwwwd.',
  '.wwwwwwwww..',
  '..dd...dd...',
]

export const BOAR_FRAMES = [BOAR_A, BOAR_B] as const

/** Seagull — 9x4, gliding. Coast only. */
export const GULL_A: Sprite = [
  '.ff...ff.',
  'f..fff..f',
  '....k....',
  '.........',
]

export const GULL_B: Sprite = [
  '.........',
  'ff.....ff',
  '.fffffff.',
  '....k....',
]

export const GULL_FRAMES = [GULL_A, GULL_B] as const

/** Crab — 9x5. Scuttles along the shoreline. */
export const CRAB_A: Sprite = [
  'b.......b',
  '.b.....b.',
  '.bbbbbbb.',
  'bbbbbbbbb',
  '.b.b.b.b.',
]

export const CRAB_B: Sprite = [
  '.b.....b.',
  'b.......b',
  '.bbbbbbb.',
  'bbbbbbbbb',
  'b.b...b.b',
]

export const CRAB_FRAMES = [CRAB_A, CRAB_B] as const

/* ------------------------------------------------- night fauna and insects */

/** Bat — 7x3, wings up. Replaces the daytime birds after dark. */
export const BAT_A: Sprite = [
  'mm...mm',
  '.mmmmm.',
  '..m.m..',
]

export const BAT_B: Sprite = [
  '.m...m.',
  'mmmmmmm',
  '..mmm..',
]

export const BAT_FRAMES = [BAT_A, BAT_B] as const

/* ------------------------------------------------------- vehicle & companion */

/** Horse — 16x11. The rider is drawn on top, reusing the hero's own frames. */
export const HORSE_A: Sprite = [
  '............dd..',
  '...........dddd.',
  '...........dddd.',
  'd..ddddddddddd..',
  'dddddddddddddd..',
  'dddddddddddddd..',
  '.ddddddddddddd..',
  '.dd..dd...dd....',
  '.dd..dd...dd....',
  '.dd..dd...dd....',
  '.dd..dd...dd....',
]

export const HORSE_B: Sprite = [
  '............dd..',
  '...........dddd.',
  '...........dddd.',
  'd..ddddddddddd..',
  'dddddddddddddd..',
  'dddddddddddddd..',
  '.ddddddddddddd..',
  '..dd.dd..dd.....',
  '..dd.dd..dd.....',
  '.dd..dd...dd....',
  'dd...dd....dd...',
]

export const HORSE_FRAMES = [HORSE_A, HORSE_B] as const

/**
 * Broomstick flight — 14x11. Used the moment the character crosses a sky
 * horizon: the sky is a different medium, not a wall.
 */
export const BROOM_A: Sprite = [
  '.......kkkk.......',
  '......kffffk......',
  '......kfkfkf......',
  '......kffffk......',
  '.......kfffk......',
  '......kkkkkk......',
  '.d...kksssskk.....',
  'ddd..k.ssss.k.....',
  'dddddddddddddddddd',
  'ddd....kk..kk.....',
  '.d.....kk..kk.....',
  '.......dd..dd.....',
]

export const BROOM_B: Sprite = [
  '.......kkkk.......',
  '......kffffk......',
  '......kfkfkf......',
  '......kffffk......',
  '.......kfffk......',
  '......kkkkkk......',
  'dd...kksssskk.....',
  'dd...k.ssss.k.....',
  'dddddddddddddddddd',
  'dd.....kk..kk.....',
  'dd.....kk..kk.....',
  '.d.....dd..dd.....',
]

export const BROOM_FRAMES = [BROOM_A, BROOM_B] as const

/**
 * Fairy — 9x7. Doubles as the scene's options button, so it is sized to be
 * comfortably clickable rather than as a decorative spark.
 */
export const FAIRY_A: Sprite = [
  '.g.....g.',
  'ggg...ggg',
  'gggg.gggg',
  '.gg.g.gg.',
  '...ggg...',
  '...ggg...',
  '....g....',
]

export const FAIRY_B: Sprite = [
  '..g...g..',
  '.ggg.ggg.',
  '.gggggggg',
  '..gg.gg..',
  '...ggg...',
  '...ggg...',
  '....g....',
]

export const FAIRY_FRAMES = [FAIRY_A, FAIRY_B] as const

/** Expanding ring where something touches the water — 9x3. */
export const RIPPLE: Sprite = [
  '..fffff..',
  '.f.....f.',
  '..fffff..',
]

/** Bird — 7x5, two wing positions. */
export const BIRD_UP: Sprite = [
  '.s...s.',
  '.ss.ss.',
  '..sss..',
  '..sk...',
  '.......',
]

export const BIRD_DOWN: Sprite = [
  '.......',
  '..sss..',
  '.sssss.',
  '..sk...',
  '..s.s..',
]

export const BIRD_FRAMES = [BIRD_UP, BIRD_DOWN] as const

/** Tree — 15x20. Foliage stays on the grey ramp; only the trunk is brown. */
export const TREE: Sprite = [
  '.....mmm.....',
  '...mmmmmmm...',
  '..mmmmmmmmm..',
  '.mmmsssmmmmm.',
  'mmmssssssmmmm',
  'mmssssssssmmm',
  'mmsssssssssmm',
  'mmmsssssssmmm',
  '.mmmssssssmm.',
  '..mmmsssmmm..',
  '...mmmmmmm...',
  '.....ddd.....',
  '.....ddd.....',
  '.....dbd.....',
  '.....dbd.....',
  '.....dbd.....',
  '....ddbdd....',
  '...dd...dd...',
  '..dd.....dd..',
  '.............',
]

/**
 * Small shrub — 7x5. Kept on the LIGHT end of the ramp: at this size the mid
 * grey used by TREE reads as a dark blob (an insect, not a plant). Foliage this
 * small needs to be lighter than the canopy it sits beneath.
 */
export const SHRUB: Sprite = [
  '..fff..',
  '.fffff.',
  'ffsfsff',
  'fffffff',
  '.d...d.',
]

/** Rock — 7x4. */
export const ROCK: Sprite = [
  '..fff..',
  '.fmmmf.',
  'fmmmmmf',
  '.fffff.',
]

/** Grass tufts — 3 variants, scattered procedurally. */
export const GRASS: readonly Sprite[] = [
  ['.f.f.', 'f.f.f'],
  ['f...f', '.fff.'],
  ['..f..', '.f.f.'],
]

/**
 * House — 26x20. The one interactive prop.
 * 'D' marks the door cavity and 'W' the window: both are painted at draw time
 * so they can open / light up without duplicating the whole sprite.
 */
export const HOUSE: Sprite = [
  '.................ddd......',
  '.................d.d......',
  '.......ddddd.....ddd......',
  '......ddddddd....ddd......',
  '.....ddddddddd...ddd......',
  '....ddddddddddd..ddd......',
  '...ddddddddddddddddd......',
  '..ddddddddddddddddddd.....',
  '.ddddddddddddddddddddd....',
  'ddddddddddddddddddddddd...',
  '.wwwwwwwwwwwwwwwwwwwww....',
  '.wwwwwwwwwwwwwwwwwwwww....',
  '.ww.WWWWW.wwwwwww.....w...',
  '.ww.WWWWW.wwwDDDDD....w...',
  '.ww.WWWWW.wwwDDDDD....w...',
  '.wwwwwwwwwwwwDDDDD....w...',
  '.wwwwwwwwwwwwDDDDD....w...',
  '.wwwwwwwwwwwwDDDDD....w...',
  '.wwwwwwwwwwwwDDDDD....w...',
  'dddddddddddddddddddddddd..',
]

/** Chimney smoke puff — 5x4, scaled down as it rises. */
export const SMOKE: Sprite = [
  '..ff.',
  '.ffff',
  'fffff',
  '.fff.',
]

/* ------------------------------------------------- structures (per theme) */

/**
 * Castle — 32x24. The landmark of the home theme.
 * Two towers, a keep behind, a curtain wall, and an interactive gate ('D').
 */
export const CASTLE: Sprite = [
  'm.m.m.m..................m.m.m.m',
  'mmmmmmm..................mmmmmmm',
  'mmmmmmm..................mmmmmmm',
  'mfffffm..................mfffffm',
  'mfffffm...m.m.m.m.m.m....mfffffm',
  'mfWWffm...mmmmmmmmmmm....mfWWffm',
  'mfWWffm...mmfffffffmm....mfWWffm',
  'mfffffm...mmfWWfWWfmm....mfffffm',
  'mfffffm...mmfWWfWWfmm....mfffffm',
  'mfffffm...mmfffffffmm....mfffffm',
  'mfffffm...mmmmmmmmmmm....mfffffm',
  'mfffffm...mmmmmmmmmmm....mfffffm',
  'mfWWffm...mmfffffffmm....mfWWffm',
  'mfWWffm...mmfffffffmm....mfWWffm',
  'mfffffmm.m.m.m.m.m.m.m.m.mfffffm',
  'mfffffmffffffffffffffffffmfffffm',
  'mfffffmffWWffffffffffWWffmfffffm',
  'mfffffmffffffffffffffffffmfffffm',
  'mfffffmfffffffDDDDfffffffmfffffm',
  'mfffffmfffffffDDDDfffffffmfffffm',
  'mfffffmfffffffDDDDfffffffmfffffm',
  'mfffffmfffffffDDDDfffffffmfffffm',
  'mfffffmfffffffDDDDfffffffmfffffm',
  'mmmmmmmmmmmmmmDDDDmmmmmmmmmmmmmm',
]

/** Two-storey house — 26x22. Bigger sibling of HOUSE, for the home theme. */
export const BIG_HOUSE: Sprite = [
  '...................ddd....',
  '...................d.d....',
  '........dddddddddddd......',
  '......dddddddddddddddd....',
  '....dddddddddddddddddddd..',
  '..dddddddddddddddddddddd..',
  '.dddddddddddddddddddddddd.',
  'dddddddddddddddddddddddddd',
  '.wwwwwwwwwwwwwwwwwwwwwwww.',
  '.wwwwwwwwwwwwwwwwwwwwwwww.',
  '.wwWWWwwwwWWWwwwwWWWwwwww.',
  '.wwWWWwwwwWWWwwwwWWWwwwww.',
  '.wwwwwwwwwwwwwwwwwwwwwwww.',
  'wwwwwwwwwwwwwwwwwwwwwwwwww',
  '.wwwwwwwwwwwwwwwwwwwwwwww.',
  '.wwwwwwwwwwwwwwwwwwwwwwww.',
  '.wWWWwwwwwwDDDDwwwwwwWWWw.',
  '.wWWWwwwwwwDDDDwwwwwwWWWw.',
  '.wWWWwwwwwwDDDDwwwwwwWWWw.',
  '.wwwwwwwwwwDDDDwwwwwwwwww.',
  '.wwwwwwwwwwDDDDwwwwwwwwww.',
  'dddddddddddDDDDddddddddddd',
]

/** Workshop / warehouse — 22x16. Projects theme. */
export const WORKSHOP: Sprite = [
  '....dddddddddddddddddd',
  '..dddddddddddddddddddd',
  'dddddddddddddddddddddd',
  '.wwwwwwwwwwwwwwwwwwww.',
  '.wwwwwwwwwwwwwwwwwwww.',
  '.wWWWWwwwwwwwwwwWWWWw.',
  '.wWWWWwwwwwwwwwwWWWWw.',
  '.wwwwwwwwwwwwwwwwwwww.',
  '.wwwwwwwwwwwwwwwwwwww.',
  '.wwwwDDDDDDDDDDDDwwww.',
  '.wwwwDDDDDDDDDDDDwwww.',
  '.wwwwDDDDDDDDDDDDwwww.',
  '.wwwwDDDDDDDDDDDDwwww.',
  '.wwwwDDDDDDDDDDDDwwww.',
  '.wwwwDDDDDDDDDDDDwwww.',
  'ddddDDDDDDDDDDDDdddddd',
]

/** Street lamp — 5x14. 'W' lights up when the hero walks past. */
export const LAMP: Sprite = [
  '.WWW.',
  'WWWWW',
  '.WWW.',
  '..m..',
  '..m..',
  '..m..',
  '..m..',
  '..m..',
  '..m..',
  '..m..',
  '..m..',
  '..m..',
  '..m..',
  '.mmm.',
]

/** Bench — 9x5. Project-detail theme. */
export const BENCH: Sprite = [
  'ddddddddd',
  '.........',
  'ddddddddd',
  '.d.....d.',
  '.d.....d.',
]

/** Crate — 7x7. Projects theme. */
export const CRATE: Sprite = [
  'ddddddd',
  'dwwwwwd',
  'dwddwwd',
  'ddddddd',
  'dwwddwd',
  'dwwwwwd',
  'ddddddd',
]

/** Pine — 11x22. Tall and conical: reads as mountain/forest, not orchard. */
export const PINE: Sprite = [
  '.....m.....',
  '.....m.....',
  '....mmm....',
  '....mmm....',
  '...mmsmm...',
  '...mmsmm...',
  '..mmsssmm..',
  '..mmsssmm..',
  '.mmsssssmm.',
  '.mmsssssmm.',
  'mmsssssssmm',
  '..mmsssmm..',
  '.mmsssssmm.',
  'mmsssssssmm',
  'mmsssssssmm',
  '.....d.....',
  '.....d.....',
  '.....d.....',
  '.....d.....',
  '....ddd....',
  '...dd.dd...',
  '..dd...dd..',
]

/** Lighthouse — 11x26. The coast theme's landmark; 'W' is the lamp. */
export const LIGHTHOUSE: Sprite = [
  '...fffff...',
  '..fWWWWWf..',
  '..fWWWWWf..',
  '..fWWWWWf..',
  '...fffff...',
  '..fffffff..',
  '...fffff...',
  '...fmmmf...',
  '...fmmmf...',
  '..ffmmmff..',
  '..fmmmmmf..',
  '..fmmmmmf..',
  '.ffmmmmmff.',
  '.fmmmmmmmf.',
  '.fmmWWWmmf.',
  '.fmmWWWmmf.',
  'ffmmmmmmmff',
  'fmmmmmmmmmf',
  'fmmmmmmmmmf',
  'fmmmDDDmmmf',
  'fmmmDDDmmmf',
  'fmmmDDDmmmf',
  'ffmmDDDmmff',
  '.ffmDDDmff.',
  '..fffffff..',
  '.ddddddddd.',
]

/**
 * Rowing boat — 24x11. Sized to actually carry the 13px warrior: the previous
 * 14x6 hull was narrower than the figure sitting in it, which read as a plank.
 * Raked bow, mast and a furled sail give it a boat's profile rather than a wedge.
 */
export const BOAT: Sprite = [
  '..........k.............',
  '..........k.............',
  '.........kkk............',
  '.........kkk............',
  '.........kkk............',
  '.........kkk............',
  '...d.....kkk.........d..',
  '..dd.................dd.',
  '.dddddddddddddddddddddd.',
  '.dwwwwwwwwwwwwwwwwwwwwd.',
  '..dddddddddddddddddddd..',
]

/** Mine head — 18x16. Mountain theme structure. */
export const MINE: Sprite = [
  '.......dd.......',
  '......dddd......',
  '.....dd..dd.....',
  '....dd....dd....',
  '...dd......dd...',
  '..dd........dd..',
  '.dd..........dd.',
  'dddddddddddddddd',
  '.mmmmmmmmmmmmmm.',
  '.mmmmmmmmmmmmmm.',
  '.mmWWmmmmmmWWmm.',
  '.mmWWmmmmmmWWmm.',
  '.mmmmmDDDDmmmmm.',
  '.mmmmmDDDDmmmmm.',
  '.mmmmmDDDDmmmmm.',
  'dddddddDDDDddddd',
]

/** Tent — 13x10. About theme. */
export const TENT: Sprite = [
  '......m......',
  '.....mmm.....',
  '....mmfmm....',
  '...mmfffmm...',
  '..mmfffffmm..',
  '..mfffkfffm..',
  '.mmffkkkffmm.',
  '.mffkkkkkffm.',
  'mmffkkkkkffmm',
  'mmmmmmmmmmmmm',
]

/** Campfire — 7x6. About theme. The single other warm accent besides windows. */
export const CAMPFIRE: Sprite = [
  '..W..W.',
  '.WWWWW.',
  '.WWWWW.',
  '..WWW..',
  'dd...dd',
  '.ddddd.',
]

/** Pond — 14x6. Project-detail theme. */
export const POND: Sprite = [
  '...ffffff...',
  '.ffpppppppf.',
  'ffpppppppppf',
  'ffpppppppppf',
  '.ffpppppppf.',
  '...ffffff...',
]

/* ------------------------------------------------------------ water gun */

/** Water gun — 9x6, barrel pointing right. Flipped when aiming left. */
export const WATER_GUN: Sprite = [
  '...ffffff',
  '..fffffff',
  '.ffff....',
  '.ffff....',
  '.ff......',
  '.ff......',
]

/** In-flight water pellet — 3x3. */
export const DROPLET: Sprite = [
  '.f.',
  'fff',
  '.f.',
]

/** Impact splash — 7x4. */
export const SPLASH: Sprite = [
  '.f...f.',
  '..f.f..',
  '.fffff.',
  'f.f.f.f',
]

/* ---------------------------------------------------------------- clouds */

export function spriteWidth(sprite: Sprite): number {
  return sprite.reduce((max, row) => Math.max(max, row.length), 0)
}

export function spriteHeight(sprite: Sprite): number {
  return sprite.length
}
