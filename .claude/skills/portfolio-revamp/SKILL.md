---
name: portfolio-revamp
description: The design formula for a standout developer portfolio, distilled from award-winning sites (Awwwards, Muzli, Figma, Kinsta). Use when revamping, restyling, or building any view/section of THIS Vue 3 portfolio so the result reads as world-class. Covers section anatomy, visual hierarchy, motion, and copy — mapped to this project's stack.
---

# Portfolio Revamp Formula

A reusable recipe for making any view in this repo look like a top-tier developer
portfolio. Apply it section by section. The goal: a visitor understands **who you
are and why it matters within 5 seconds**, then is pulled into 3–6 strong projects.

## This project's stack (use these, don't reinvent)
- **Vue 3** SFCs in `src/views` (pages) and `src/components` (ui / layout / portfolio).
- **Tailwind v4** via `@tailwindcss/vite`. Theme tokens live in `src/assets/style.css`
  as OKLCH CSS vars (`--background`, `--primary`, `--muted-foreground`, `--accent`,
  `--radius`, `--chart-1..5`). **Always use semantic tokens** (`bg-primary`,
  `text-muted-foreground`, `border-border`) — never hardcoded hex. Dark mode is the
  `.dark` class variant; every new style must work in both themes.
- **shadcn-vue style UI** in `src/components/ui` (Card, Button, Badge, Dialog,
  Separator). Reuse and extend these — do not introduce a second component system.
- **lucide-vue-next** for icons (`size-4`/`size-5`, currentColor).
- **Geist Variable** is the only font (`font-sans`). Pinia store `usePortfolioStore`
  feeds data (owner, featuredProjects, techStackSummary, categories).
- **tw-animate-css** is installed — prefer it / Tailwind transitions over new deps.
- Routes: `/` dashboard, `/projects`, `/projects/:slug`, `/about`.

## Committed aesthetic: Editorial / Swiss-mono (THIS project's direction)
This portfolio uses an **editorial brutalist** language — deliberately *not* the
generic "AI dashboard" look. When restyling, hold this line:
- **Typography is the design.** Oversized display headings (`text-6xl`→`text-[15vw]`),
  tight leading/tracking via the `.display` class. Let type carry the page.
- **Monospace metadata.** Geist Mono (`font-mono` / `.text-mono` / `.eyebrow`) for all
  labels, nav, section indexes, tech lists, dates, captions. It reads as "developer".
- **Numbered section indexes**, editorial style: `(01) — Selected Work`, `(02) — Stack`.
  Use the `.eyebrow` class (mono, uppercase, wide tracking).
- **Hard edges & rules, not soft cards.** `--radius` is 2px (near-square). Structure
  with `border-border` hairlines and dividers — avoid drop-shadows, soft glows.
- **Monochrome restraint.** Foreground/background/muted only; near-zero color. No
  multi-stop gradients, no blurred auras, no dot-grids, no glassy pills.
- **Projects as an editorial index**, not a card wall: numbered rows (number · title in
  display type · mono tech list · `ArrowUpRight`), divided by top borders, hover shifts
  the title `translate-x` and lifts the arrow.
- **Motion is restrained:** `v-reveal` fade-up, `link-underline` wipe on hover, one
  full-bleed marquee. No bouncing, no pulsing "available" badges.
- **BANNED (reads as AI-generated):** `.bg-dot-grid`, blurred gradient "aura" blobs,
  status-dot "Available for opportunities" pills, hover-lift shadow cards, rounded-2xl
  soft cards, emoji badges. These were removed deliberately — do not reintroduce them.

## The 5-second test (rank every change against this)
1. **Clarity** — name, role, and value prop legible above the fold, no scroll.
2. **Credibility** — real work, real metrics, real tech — fast.
3. **Craft** — pixel rhythm, restraint, and one or two delightful motion moments.

## Section anatomy (the formula)
Curate, don't dump. 3–6 featured projects beats 20.

1. **Hero** — bold catchy headline (who + what in one line), one-sentence value prop,
   primary CTA (View Projects) + secondary (GitHub / Contact), location, avatar with
   a subtle status accent. Add an availability signal if relevant ("Open to work").
2. **Proof strip** — compact stats (projects, technologies, years) OR logos. Keep it
   to one row; it's seasoning, not the meal.
3. **Featured projects** — the foundation. Alternating left/right media+content rows
   (already the pattern in `DashboardView.vue`). Each: category badge, title,
   1–2 line outcome-focused overview, tech badges, "View Details" + "Live Demo".
4. **Project case studies** (`/projects/:slug`) — Problem → Approach → Result, with a
   measurable outcome ("cut load time 40%"), screenshots/gallery, stack, and links.
5. **About** — short narrative, what you're great at, tools, a human photo.
6. **Contact / footer** — email, socials, response expectation. Make it always reachable.

## Visual hierarchy & craft
- **Type scale**: hero `text-4xl sm:text-5xl font-bold tracking-tight`; section H2
  `text-2xl sm:text-3xl font-bold`; body `text-muted-foreground leading-relaxed`.
  Use `tracking-tight` on large headings only.
- **Spacing rhythm**: section vertical padding `py-16 sm:py-24`; content max width
  `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`. Consistent gaps (`gap-4`/`gap-8`).
- **Whitespace > decoration**. Let sections breathe; group related items.
- **Contrast & focus**: one accent direction. Use `from-primary/5 ... to-accent/5`
  gradients sparingly for depth (see hero). Primary color = action, not background noise.
- **Radii**: use the `--radius` scale (`rounded-xl`, `rounded-2xl`) consistently.
- **Imagery**: real screenshots in device/browser frames beat stock. Always set
  `alt`, lazy-load below the fold, and reserve aspect ratio to avoid layout shift.

## Motion (subtle = premium, busy = amateur)
- Reveal-on-scroll for sections, staggered project cards, hover lift on cards
  (`transition hover:-translate-y-1 hover:shadow-lg`). Keep durations 150–300ms.
- One signature moment max (animated hero headline or gradient) — not on every element.
- **Respect `prefers-reduced-motion`** — gate non-essential animation behind it.

## Copy
- Outcome over output: "Built X that did Y" not "Used React and Node".
- Active voice, specific numbers, no buzzword soup. Headline should be memorable.

## Accessibility & performance (non-negotiable for "award-winning")
- Semantic landmarks (`header`/`main`/`section`/`footer`), logical heading order.
- Keyboard-navigable, visible focus (`outline-ring`), color-contrast AA in both themes.
- Lazy-load route chunks (already done) and images; keep CLS ~0; optimize the hero.

## Workflow when revamping a view
1. Read the target view + the ui components it uses; identify which formula sections apply.
2. Restyle with existing tokens/components; extract repeated markup into `components/`.
3. Verify both light and dark themes, responsive (sm/lg breakpoints), and reduced-motion.
4. Run `yarn type-check` and `yarn lint` before declaring done.

## Sources
- [Awwwards — Portfolio winners](https://www.awwwards.com/websites/winner_category_portfolio/)
- [Muzli — 100 Best Portfolio Websites](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/)
- [Figma — Portfolio website examples & tips](https://www.figma.com/resource-library/portfolio-website-examples/)
- [Kinsta — Anatomy of a Perfect Portfolio](https://kinsta.com/blog/portfolio-website/)
- [webportfolios.dev — Best Developer Portfolios](https://www.webportfolios.dev/blog/best-developer-portfolio-websites)
