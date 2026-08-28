# Zendō homepage — hover-driven ink reveals

Prototype of the redesigned Zendō homepage
([Figma](https://www.figma.com/design/YrJTS0mLQRqnanoWtkEUg8/Zendo-Labs---Website-Design?node-id=12760-11533)).
One self-contained page, no build step: open `index.html` in a browser
(assets in `assets/v2/`).

## Behavior

**Load.** The default sumi-e landscape inks in through the blot reveal
(turbulence-feathered mask, splat → soak → sweep), while the headline and
subtext dry in on a stagger. "Replay ink" (bottom left) restarts it.

**Nav hovers.** Each nav link (Benchmarks, Careers, Contact, Clients) has its
own painting. Hovering a link ink-reveals that painting over the current one
— the blot springs from beside the link column, stepped per link — and
leaving the nav drifts back to the default the same way. Reveals are
JS-driven so rapid hovers hand off cleanly: the in-flight painting commits
instantly and the next blot starts fresh. All five paintings are preloaded.

**Link states.** Hover/focus/active-illustration: text darkens
(`text/midem → text/darkem`) with a dotted underline, matching the email
link's treatment. (The Figma component's hover variant isn't published to a
library, so this styling follows the file's visible conventions — adjust if
the design specifies otherwise.)

Everything respects `prefers-reduced-motion` (instant swaps, no animation).

## Fidelity notes

- Tokens from the Figma file: `#f8f6eb` (bg/secondary), `#d8dedc`
  (border/midem), `#191b19` / `#606c66` / `#8e9893` (text darkem/midem/lowem).
- The five illustrations are exact Figma exports of each frame's `image`
  container at 1.5x (painting + enso + paper texture composited as designed),
  drawn with `preserveAspectRatio: slice` on a 1000×580 stage. `rail.png` is
  the 80px side-rail texture export; `logo.svg` the logo component.
- Commercial fonts (DGM Sprinter / Test Söhne / GT Flexa Mono) are
  substituted with Hanken Grotesk + IBM Plex Mono; swap `--sans`/`--mono`
  when licensed webfonts are available.
- The previous hero's liquid-warp smudge, parallax, and Ink lab were retired
  with the old layout (still in git history) and can be rebuilt onto this
  stage if wanted.
