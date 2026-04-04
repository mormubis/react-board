# Backlog

Last updated: 2026-04-04

## High

- [x] ~~Highlight squares persist~~ — decided to keep `highlight` generic;
      consumers manage clearing. No `lastMove` prop needed.
- [ ] CSS-variable-based theming — refactor `BoardTheme` so all styling is
      driven by CSS custom properties. Consumers should be able to override the
      board's look purely via CSS without the `theme` prop.
- [ ] Coordinate labels too large — font size ~15% of square size (down from
      25%), semi-bold weight, two coordinate colors (one for light squares, one
      for dark squares) defaulting to opposite square color. Depends on theming
      refactor.
- [ ] No turn restriction — the board allows moving any piece regardless of
      whose turn it is. Add a `turn` prop (`'white' | 'black'`) that restricts
      which color can be dragged/clicked. When set, pieces of the wrong color
      are not interactive.

## Medium

- [ ] Promotion UI — when a pawn reaches the last rank, show a piece selection
      dialog instead of auto-promoting to queen.
- [ ] Move sound effects — play sounds on move, capture, check. Optional,
      disabled by default.
- [ ] Piece shadow during drag — add a subtle drop shadow to the floating ghost
      piece for better visual feedback.

## Future (v2)

- [ ] Arrow drawing (SVG overlay)
- [ ] Premove support
- [ ] Right-click annotations
- [ ] Touch gesture improvements
- [ ] Additional bundled piece sets
