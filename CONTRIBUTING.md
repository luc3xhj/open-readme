# Contributing

Useful contributions include themes, visual blocks, rendering fixes and smaller agent workflows. Open an issue with a real README example and the desired output, or send a PR with a focused change.

Use Node 22 or newer. There are no runtime dependencies.

```sh
npm test
npm run build
npm run check
node scripts/smoke-export.js
python3 scripts/check-export.py
```

The rendering core is in `src/`. The schema and validator share one definition in `src/schema.js`. The browser playground imports the same renderer via generated `docs/lib/` files. Run `npm run build` after changing the core, themes or example configs; include the resulting files in your PR.

Keep generated SVGs self-contained, escaped and readable in light/dark modes and at narrow widths. Keep text that users need to copy in native Markdown. Add tests for observable behavior or a bug you fix. Do not add network services, analytics, content generation or unverified project statistics to a visual component.
