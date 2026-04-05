# Storybook Setup

## Summary

Replace the Vite-based `playground/` with Storybook 10 for interactive component
documentation. Follows the same structure as `react-movesheet`.

## What changes

- Delete `playground/` directory
- Remove `dev:playground` script from `package.json`
- Add `storybook` and `storybook:build` scripts
- Add Storybook 10 dependencies: `storybook`, `@storybook/react-vite`
- Create `.storybook/main.ts` and `.storybook/preview.ts`
- Create `src/__stories__/board.stories.tsx`

## Config

`.storybook/main.ts`:

- Framework: `@storybook/react-vite`
- Stories: `../src/__stories__/**/*.stories.tsx`

`.storybook/preview.ts`:

- Layout: `centered`

## Stories

All in `src/__stories__/board.stories.tsx`, CSF3 format:

- **Default** — starting position, all defaults
- **EmptyBoard** — no pieces (`8/8/8/8/8/8/8/8 w - - 0 1`)
- **CustomPosition** — specific FEN (e.g. mid-game)
- **BlackOrientation** — `orientation="black"`
- **WithHighlights** — highlighted squares (e.g. `['e4', 'e5']`)
- **WithLegalMoves** — legal move dots visible
- **NoCoordinates** — `coordinates={false}`
- **NoAnimation** — `animate={false}`
- **TurnRestriction** — `turn="white"`
- **DarkTheme** — CSS variable overrides via decorator (brown/beige theme)
- **Interactive** — all boolean/string props exposed as arg controls

A decorator wraps the board in a 400px-wide container.

## Dependencies

- `storybook@^10`
- `@storybook/react-vite@^10`

Both as devDependencies.
