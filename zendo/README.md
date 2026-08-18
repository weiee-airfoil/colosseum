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

**Hover — wet-ink bleed.** Hovering the illustration re-wets the ink: a
`wetness` value springs toward 1 (soaking is fast) and back toward 0 on leave
(drying is slower), driving a filter chain of edge displacement, gaussian
blur, and an alpha-gamma boost — the gamma is what makes pigment *spread
outward* like ink into wet paper rather than simply blurring. Saturation dips
slightly while wet. The filter is removed entirely at rest so the idle
artwork stays crisp.

Both effects respect `prefers-reduced-motion` (art shows instantly, bleed
disabled).

## Fidelity notes

- Design tokens come straight from the Figma file: `#fffcf3` (bg),
  `#191b19` (high-emphasis), `#606c66` (mid-emphasis), `#61a074` (green).
- The Figma fonts (DGM Sprinter, Test Söhne, GT Flexa Mono) are commercial;
  the prototype substitutes Hanken Grotesk and IBM Plex Mono from Google
  Fonts. Swap the `--sans` / `--mono` custom properties when the licensed
  webfonts are available.
- The watercolor is repainted as inline SVG (the sandbox this was built in
  cannot fetch Figma's asset exports, and those URLs expire after 7 days).
  To use the original raster exports instead: drop the PNGs into
  `zendo/assets/` and replace the contents of `<g id="art">` with plain
  `<image>` tags positioned per the Figma layout — the reveal mask and the
  bleed filter wrap that group and keep working unchanged. Keep the PNGs'
  transparent backgrounds; the bleed effect needs real alpha edges to chew on.
