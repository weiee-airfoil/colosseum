# Zendō ink stage — illustration component

The Zendō homepage illustrations with liquid watercolor dissolves, stripped
to a bare component for integration. `index.html` contains only the stage
(it fills its container), the SVG dissolve machinery, and a small API —
no nav, headline, or page chrome.

## Integration

Copy the `<div class="ink-stage">…</div>` markup and the `<script>` into your
page (or embed the file), keep `assets/v2/` alongside, and drive it from your
own nav:

    link.addEventListener('pointerenter', () => ZendoInk.show('benchmarks'));
    nav.addEventListener('pointerleave', () => ZendoInk.show('default'));

API — `window.ZendoInk`:
- `show(name)` — dissolves that painting in over the current one
  (`default`, `benchmarks`, `careers`, `contact`, `clients`); safe to call
  rapidly, transitions hand off cleanly.
- `replay()` — replays the initial load reveal.

The load reveal for `default` plays automatically; `prefers-reduced-motion`
gets instant swaps.

## The dissolve

A fractal-noise field is added to a centre-biased radial seed and swept by an
animated threshold: pigment surfaces as translucent patches that grow and
merge outward from the centre — a liquid, wet-into-wet dissolve rather than a
geometric wipe. The incoming painting stays translucent for the first ~30% so
the two washes mix, and a faint breath of light passes over the stage with
each transition. Load takes 1.6s, transitions 1.15s.

## Assets

Exact Figma exports at 1.5x (each state frame's full illustration container:
painting + enso + paper texture): `assets/v2/{default,benchmarks,careers,
contact,clients}.png`. Fetched from the design file
([Figma](https://www.figma.com/design/YrJTS0mLQRqnanoWtkEUg8/Zendo-Labs---Website-Design?node-id=12760-11533)).
`rail.png` / `logo.svg` remain from the full-page prototype (git history has
that page if needed).
