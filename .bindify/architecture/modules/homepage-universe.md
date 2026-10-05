# Homepage universe

**id:** `homepage-universe`
**type:** `module`
**status:** `evolving`
**repo:** `workroom`
**layer:** `ui`

---

## Responsibility

Viewport-locked homepage surface: horizontal timeline strip, hero title/hint chrome, and input mapping (wheel, mouse drag, touch, arrows) that scrolls the strip through time.

---

## Depends on

- [[architecture/modules/timeline-renderer]] — builds nodes into the strip canvas
- [[architecture/data/timeline-events]] — event source shown on the strip

---

## Used by

- [[architecture/system/denree-site]] — primary landing experience

---

## Standards & patterns

- [[architecture/standards/static-cache-busting]] — CSS/JS linked from `index.html`

---

## Change log

- 2026-07-25 — bootstrap skeleton
- 2026-07-25 — [[development/fixes/homepage-timeline/plans/vertical-swipe-scroll/updates.md]] — strip `touch-action` → `pinch-zoom`; homepage asset pins bumped
- 2026-08-02 — [[development/fixes/homepage-timeline/plans/next-marker-redesign/updates.md]] — NEXT target-lock animation + upcoming list under coming node; always-`_coming` head
- 2026-10-05 — scroll intro: coming-next starts centred under the title; first `max(260px, 0.55·vh)` of scroll slides it left, fades nodes in and draws the line, then the strip scrolls. All inputs share one virtual position (`setScroll`); strip is `.is-intro` (no native x-scroll) until docked. Coming-next starts at `INTRO_SCALE` and the title lifts/fades over the first `TITLE_OUT` of the intro
- 2026-10-05 — scroll highlight (`applyFocus`): event nearest the focus line (`FOCUS_AT` of strip width) scales up to `1 + FOCUS_SCALE`, pivoting on its marker so the line stays attached; nearest gets `.is-focus` (hover photo look)
- 2026-10-05 — focus line at centre; canvas tail lets the last event scroll to centre; strip side fade via CSS `mask-image` driven by `--edge-l` / `--edge-r` (left edge stays solid until `EDGE_LEFT_IN` px of scroll so docked coming-next isn't faded). Fixed intro stagger leaving nodes past ~7 permanently transparent (stagger index capped at 5)
- 2026-10-05 — parallax + gallery depth in `applyFocus`: per-node `depthOf(i)` drift (`PARALLAX_X/Y`, vertical alternates by index), side shrink (`SIDE_SHRINK`), photo stacks `rotateY` toward centre (`COVER_ANGLE`). Line is redrawn per frame from `markerBase` + `nodeOffsets` (`writeLine`), so the CSS transform transition on nodes was removed to keep it in sync

---

## Related

- [[architecture/_map.md]]
- [[architecture/modules/timeline-renderer]]
