# Fisheye

A Figma plugin that bends a section, frame or group into a convex dome or a
concave dish — the coffered-ceiling look of the Pantheon, or a wide barrel like a
lens panning across a row of cards.

Point it at a logo wall, a card grid, a strip of screenshots, anything flat, and
it curves the whole thing as one surface.

## Install

No build step, no dependencies. Clone the repo, then in the Figma desktop app:

1. **Plugins → Development → Import plugin from manifest…**
2. Pick `manifest.json` from this folder.
3. Run it from **Plugins → Development → Fisheye**.

## Using it

Select a single layer — section, frame, group, component or image — and the panel
shows a live preview. Drag the sliders, hit **Apply**.

Start from a preset and adjust:

| Preset | What it gives you |
| --- | --- |
| **Pantheon dome** | Full-frame hemisphere. Rows curve, cells compress hard into the rim. |
| **Wide barrel** | Horizontal cylinder — the middle bulges toward you, the ends roll away. |
| **Porthole** | A circular lens sitting over otherwise untouched artwork. |
| **Soft dent** | A gentle dish pressed into the surface. |
| **Hourglass** | Columns stay straight and evenly spaced; the rows flare apart toward the ends. |

### Controls

- **Shape** — *Convex* pushes the middle toward you; *Concave* dents it away.
- **Curve** — *Sphere* is a true orthographic hemisphere: the rim compresses
  toward infinity, which is what makes the Pantheon read as a dome. *Soft* is a
  polynomial with the same endpoints and a finite rim, for a subtler bulge.
- **Axis** — *Radial* bends both directions at once. *Horizontal* / *Vertical*
  bend one axis only, giving a cylinder instead of a sphere.
- **Lens shape** *(radial only)* — *Fit frame* stretches the dome to the frame's
  proportions; *Circular* keeps it a true circle in pixel space.
- **Amount** — how far toward the full curve to go.
- **Lens size** — 100% puts the rim exactly on the frame's corners, so the whole
  frame is curved. Below that you get a visible lens with flat artwork around it.
- **Bow** *(cylinder only)* — scales the *other* axis by how far round the curve a
  slice sits. Positive foreshortens it, like a barrel turning away from you.
  Negative flares it out into an hourglass: rows spread apart toward the ends
  while the middle pinches. Bow works with **Amount** at 0, which is worth knowing
  — that gives you the cross-axis flare on its own, with the columns left dead
  straight and evenly spaced.
- **Zoom** — scales the artwork under the lens. Useful with *Concave*, which pulls
  content in from beyond the frame edge.
- **Center X / Y** — moves the lens off-center.
- **Edges** — what to read where the warp reaches past the artwork:
  *Stretch* (smear the edge pixels), *Mirror*, *Tile*, or *Clear* (transparent).
- **Quality** — Draft / Good / Best. Sets both the export resolution (1×/2×/3×)
  and how many samples each output pixel averages.
- **Output** — *Replace* drops the result in place and hides the original;
  *Place beside* puts it next to the original and leaves it alone.

Hold the mouse down on the preview to compare against the original.

## How it works

Figma has no mesh-warp API, so the plugin rasterises the selection and warps the
pixels:

1. `code.js` (plugin sandbox) exports the selected node with `exportAsync` and
   posts the PNG bytes to the UI.
2. `ui.html` (iframe) uploads them as a WebGL texture and runs an inverse-mapping
   fragment shader — for every output pixel it computes which source pixel to
   read.
3. The result comes back as PNG bytes, and `code.js` turns it into an image fill
   on a new rectangle sized to the original.

### The mapping

Everything is driven by one function: given a distance `r` from the lens center
(normalised so `1.0` sits on the rim), where should this pixel read from?

**Sphere.** Wrap the artwork over a hemisphere and look at it straight on. A point
at angle `t` off the pole projects to `sin(t)` on screen but sits at arc length
`t / (π/2)` in the artwork. So a screen radius `r` reads from `asin(r) / (π/2)`.
That's *smaller* than `r`, so the middle is magnified and detail piles up against
the rim — where the derivative goes to infinity, which is the coffers-crushing-
into-the-edge effect. Concave is the inverse, `sin(r · π/2)`.

**Soft.** `r + k·r·(1 − r²)`, with `k` carrying the amount and its sign. Same
endpoints (`f(0) = 0`, `f(1) = 1`), but the slope stays finite at the rim.

Both are pinned at `f(1) = 1`, so the lens meets the untouched artwork outside it
without a seam.

For cylinder modes the same curve is applied to one axis, and *Bow* scales the
other axis by `1 + bow · (1 − cos(f(r) · π/2))` — the cosine is the depth of that
slice around the barrel, so the ends are affected most and the centre not at all.
A positive `bow` reads from further out and squashes; a negative one reads from
further in and stretches. Since that term doesn't depend on the along-axis warp,
setting **Amount** to 0 leaves it as the only thing happening.

Output pixels are supersampled on an N×N grid and averaged in premultiplied alpha,
which is what keeps the compressed rim from aliasing.

## Limitations

- **The result is a raster image.** Text and vectors are baked. Plugins can't warp
  live vector geometry, so this is inherent. *Replace* hides the original rather
  than deleting it, so you always have the editable version to go back to.
- Figma rejects images over 4096px on either axis. The plugin lowers the export
  scale to fit and tells you in the panel when it does.
- Concave and zoomed-out warps read past the edge of the artwork. Give the source
  some bleed, or pick a non-transparent **Edges** mode.

## Files

```
manifest.json   plugin manifest
code.js         plugin sandbox — selection, export, placing the result
ui.html         panel UI and the WebGL warp
```
