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

**Hover — liquid warp.** Once the reveal finishes, a WebGL canvas fades in
over the SVG, drawing the identical artwork (same exports, geometry and
darken blending, composited into a texture). Every pointer move splats its
velocity vector into a low-res, self-decaying flowmap; the fragment shader
drags the artwork's pixels along that field with a short 3-tap motion smear.
The painting liquefies around the cursor — pigment pulled in the direction
you move — and elastically relaxes back when you stop. The render loop only
runs while flow energy remains, so the idle page costs nothing; without
WebGL the page simply stays on the crisp SVG artwork.

**Ink lab.** The panel behind the "Ink lab" button (bottom right) tunes the
smudge live: strength, brush radius, rebound (how fast the painting springs
back), organic (value-noise that breaks the warp into uneven watercolor
tendrils), and smear (motion-trail length). Reset restores the defaults.

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
  `assets/water.png`, exported at 2x), placed per the
  design's geometry inside `<g id="art">`; the reveal mask wraps the group
  and the smudge layer reuses it via `<use>`. The exports are flattened
  against a `#fffcf3` ground (no alpha), so they composite with
  `mix-blend-mode: darken` — that reproduces Figma's blending, lets the
  water tuck under the mountain, and makes the grounds vanish against the
  page background (which must stay `#fffcf3`).
- The sun (`assets/sun-full.png`) is the uncropped source scan of the
  watercolor blob — the Figma node clips it to a 48px window, which showed a
  hard edge at the top — extracted from the original artwork, color-matched
  to the design's crop, with its paper ground balanced to `#fffcf3`.
  (`assets/sun.png` is the original cropped export, kept for reference.)
