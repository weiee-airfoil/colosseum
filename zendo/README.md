# Zendō hero — ink reveal & wet-ink bleed

A motion prototype of the Zendō homepage hero
([Figma](https://www.figma.com/design/YrJTS0mLQRqnanoWtkEUg8/Zendo-Labs---Website-Design?node-id=12327-23590)).
One self-contained file, no build step: open `index.html` in a browser.

## The two effects

**Loading — ink-blot reveal.** The illustration is uncovered by a growing ink
blot: an SVG `<mask>` whose white blob is roughened by two stacked
`feTurbulence` + `feDisplacementMap` passes (large lobes + fine feathering),
then thresholded back to a crisp feathered edge. A SMIL `<animate>` grows the
blot radius from a splat to full coverage over ~2s, with three satellite
droplets that the main blot swallows on its way out. The headline, subtext and
CTA then "dry in" (blur + rise) on a stagger. The **Replay ink** button in the
corner restarts the timeline (`svg.setCurrentTime(0)`).

**Hover — cursor smudge.** Moving the cursor over the illustration smudges
the pigment locally: each pointer position spawns an ink bloom in a mask —
grown with a fibrous, turbulence-feathered edge — that reveals a second copy
of the painting whose pigment is displaced and softened (`#wetInk`). Blooms
hold while wet, then dry away, so the smear trails the cursor and the
painting heals back crisp. The wet layer is display:none whenever no blooms
are alive, so the idle artwork costs nothing.

Both effects respect `prefers-reduced-motion` (art shows instantly, bleed
disabled).

## Fidelity notes

- Design tokens come straight from the Figma file: `#fffcf3` (bg),
  `#191b19` (high-emphasis), `#606c66` (mid-emphasis), `#61a074` (green).
- The Figma fonts (DGM Sprinter, Test Söhne, GT Flexa Mono) are commercial;
  the prototype substitutes Hanken Grotesk and IBM Plex Mono from Google
  Fonts. Swap the `--sans` / `--mono` custom properties when the licensed
  webfonts are available.
- The illustration uses the exact Figma layer exports (`assets/mountain.png`,
  `assets/water.png`, `assets/sun.png`, exported at 2x), placed per the
  design's geometry inside `<g id="art">`; the reveal mask wraps the group
  and the smudge layer reuses it via `<use>`. The exports are flattened
  against a `#fffcf3` ground (no alpha), so they composite with
  `mix-blend-mode: darken` — that reproduces Figma's blending, lets the
  water tuck under the mountain, and makes the grounds vanish against the
  page background (which must stay `#fffcf3`).
