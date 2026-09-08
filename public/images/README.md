smt-enterprises-logo.png is the site's live logo asset — the navbar and
footer load it directly (see `.brand` / `data-brand-logo` in `index.html`
and `src/main.ts`). If it's ever missing, the site falls back to a plain
text wordmark automatically, so nothing breaks.

This file is a processed version of `source-assets/SMT Logo.jpg` (repo
root, not deployed): the original was a JPEG, which cannot store real
transparency, and its background had been exported as a baked-in grey
checkerboard pattern rather than true alpha. This PNG was produced by
keying that checkerboard out (by color saturation — the checkerboard is
pure neutral grey, the logo artwork is not) and trimming the resulting
empty margin; no pixel of the actual logo artwork was redrawn, recolored,
or cropped. See `source-assets/SMT Logo.jpg` for the original.

If a cleaner source (e.g. a native PNG/SVG export with real transparency)
becomes available, it can replace this file directly at the same path.
