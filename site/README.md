# Colosseum 2026 — Editorial subpages

Eight subpage designs built in the editorial system from the approved homepage
render: Hackathon, Eternal, Accelerator, Companies, Cofounder Matching, Copilot,
About, and Sign up.

Open `index.html` for a contact sheet linking all eight. The masthead works
across every page, so you can also just click through.

## Read this first — what the designs are based on

Two of the intended source materials were unreachable from the build
environment, so the work is grounded differently than briefed:

- **The Figma file was not accessible.** The Figma MCP connection authenticates
  as `josephd@airfoil.studio`, which has no access — not even view — to
  `Colosseum 2026 — Editorial` (`KStKNeh3J0F0YhLqT8fZ73`). Nothing in these
  pages was read from that file. To use it, add Joseph as an Editor.
- **colosseum.com was blocked** by the environment's network policy (the proxy
  refuses the CONNECT), so the live subpages were never seen.

What the designs *are* built from: the **homepage PNG**, which is a full-page
render of the same system and a solid style reference on its own. Colours,
typographic hierarchy, the rubricated eyebrows, chamfered plates, roman
numerals, crop marks and the oxblood colophon are all derived from it.

**All body copy is drafted, not real.** Programme facts (dates, $250K, 5,400+
submissions, the five hackathon names) come from public web search and are
plausible but unverified. Treat every word as placeholder for the real copy.

## The system

Everything lives in `assets/css/base.css` — one token block, then components.
No framework, no build for the CSS.

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#F5F2EC` | Bone page ground |
| `--ink` | `#1A1917` | Body and display type |
| `--crimson` | `#C41E27` | Rubrication — eyebrows, numerals, primary buttons |
| `--oxblood` | `#7E1319` | Colophon ground |
| `--rule` | `#D9D4C9` | Hairlines and plate borders |

Type is **Libre Caslon Display** for headlines, **Libre Caslon Text** for body,
and **IBM Plex Mono** for the letterspaced marginalia — labels, nav, captions
and buttons. All three load from Google Fonts.

Recurring parts: `.eyebrow` (hairline with lozenge terminals), `.plate`
(chamfered cell), `.cropped` (corner registration marks), `.index__row`
(numeral table), `.stat`, `.timeline`, `.card`, `.closer`, `.colophon`.

## Illustrations

The engravings in `assets/svg/` are generated geometry, not stock art — coffers,
voussoirs and arcades are regular subdivisions, so they're computed rather than
hand-drawn. Source: `gen-svg.js` — run `node site/gen-svg.js` to regenerate; the
committed SVGs are the output.

`dome` · `arch` · `arcade` · `column` · `laurel` · `trophy` · `obelisk`, plus
eight abstract company marks.

## Editing

The eight `.html` files are generated so the masthead and colophon can't drift
apart. Edit `build.js`, then:

```
node site/build.js
```

Page content lives in the `pages` object; shared chrome lives in `layout()`.
The generated HTML is committed too, so you can preview without running
anything.

## Known placeholders

- The countdown is anchored to page load (`now + 40d 18h 52m`) rather than a
  fixed date, so the comps never render `00:00:00:00` once a season passes.
  Point it at the real deadline before this goes anywhere near production.
- Company names, cofounder profiles and hall-of-fame entries are invented.
- Every `href="#"` is a stub.
- The sign-up form does not submit.
