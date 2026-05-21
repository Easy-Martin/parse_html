# parse_html_to_node — AGENTS.md

## Commands

```sh
pnpm test          # run all tests (Vitest)
pnpm run coverage  # run tests with coverage report
pnpm run test:ui   # Vitest UI mode
pnpm run dev       # tsc --watch (type-checks only, does NOT bundle)
pnpm run build     # vite build → dist/ (es, cjs, umd + .d.ts)
```

- No linter or typecheck script exists. `tsc --watch` is the only type-check path.
- `printWidth: 180` in `.prettierrc` — lines are very wide.

## Architecture

- Single file: `lib/parse_html.ts` (653 lines) — default export is the `Node` class.
- Zero runtime dependencies. Pure TypeScript, `target: ES2018`.
- Not a monorepo. The `pnpm-workspace.yaml` only pins `esbuild` as a built dependency.
- Tests: `__tests__/parse_html.test.ts` (~468 lines, 54 tests, 0 skipped).
- The README references `text.ts` but the file does not exist.

## Conventions

- `#text` for text nodes, `#fragment` for fragment (multi-root) nodes in `tagName`.
- Style properties use camelCase internally; both kebab and camel accepted by `getStyle`.
- `setAttr(name, null)` removes the attribute; same pattern for `setStyle`.
- Prettier with no trailing commas, double quotes, semicolons on.
