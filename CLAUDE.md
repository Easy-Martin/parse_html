# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm test           # run all tests (Vitest)
pnpm test -- -t "test name"  # run a single test by name pattern
pnpm run coverage   # run tests with coverage report
pnpm run test:ui    # Vitest UI mode
pnpm run dev        # tsc --watch (type-checks only)
pnpm run build      # vite build → dist/ (es, cjs, umd + .d.ts)
```

No linter is configured. Prettier settings: `printWidth: 180`, double quotes, semicolons on, no trailing commas.

## Architecture

- **Single source file**: `lib/parse_html.ts` (653 lines) — default export is the `Node` class.
- **Zero runtime dependencies.** Pure TypeScript targeting ES2018.
- **Build**: Vite produces UMD (`dist/parse_html.umd.js`), ESM (`dist/parse_html.es.js`), and type declarations.
- **Tests**: `__tests__/parse_html.test.ts` (~500 lines, 54 tests). No mocks, no fixtures — pure unit tests.

### Node tree model

The `Node` class represents an HTML element tree with these key node types in `tagName`:
- `"#text"` — text content node
- `"#fragment"` — multi-root HTML fragment (created when HTML has 2+ root elements)
- Any lowercase tag name (`div`, `p`, `img`, etc.) — element node

### Key conventions

- Style properties use **camelCase internally**, but both kebab (`font-size`) and camel (`fontSize`) are accepted by `getStyle`/`setStyle`.
- `setAttr(name, null)` removes the attribute; same pattern for `setStyle(name, null)`.
- `getAttr` / `getStyle` return `null` for `#fragment` and `#text` nodes (these nodes have no attributes/styles).
- `setAttr` / `setStyle` throw on `#fragment` and `#text` nodes.
- Self-closing tags (img, br, input, meta, link, hr, area, base, col, embed, param, source, track, wbr) are handled without closing tags.
- All DOM manipulation (`before`, `after`, `insert`) returns `this` for chaining.
