---
name: open-readme
description: Design clear, coherent GitHub READMEs for coding agents. Inspect repository facts, choose only useful sections, apply a consistent whole-document layout and export native Markdown with local SVG assets. Use when creating, simplifying or redesigning a README, or changing its content and visual configuration.
---

# Open Readme

Use `open-readme` from the installed package or `node <checkout>/bin/open-readme.js`. Requires Node 22+. Package files, examples and schema live under `node_modules/@luc3xhj/open-readme/`.

## Inspect and compose the document

1. Read the current README, package metadata, commands, public API, license and relevant docs. Preserve useful content and the author's preferences. Verify claims, install instructions, requirements and demo paths. Do not turn placeholders into claims.
2. Choose a project type: cli, library, application, directory, research or profile. Use `open-readme sections --json` and `open-readme projects --json`. A software README needs an overview, a working start, actual usage and a license. Applications benefit from a real demo; libraries need API examples; datasets need sources, method and a snapshot date. Skip sections that add no information.
3. Start with a complete design from `examples/designs/`: Canvas (open sans masthead), Console (restrained mono), Journal (asymmetric serif masthead and editorial rows) or Pipeline (numbered technical headings and architecture lanes). Each supplies coordinated section headings, feature layouts, configuration/data formats and diagrams. Prose and code remain native and selectable. Those example configs describe open-readme; replace their content with the target project's verified facts. `open-readme init --project <type> --design <design>` creates an essential-section starter.
4. Edit `open-readme.json`. Use stable ids and semantic `section` values. Apply the same system to every useful section, not just the cover. Keep one alignment grid, heading rhythm, accent, frame treatment and code presentation across the document. Every semantic section exposes four design variants through `sections --json`. Use `block.design` only for a deliberate section override. Main sections lead; reference and housekeeping sections use the smaller supporting heading. Set `importance` to `primary` or `supporting` only when the semantic default needs adjusting. Avoid large display type in every section. Consult `docs/configuration.md` and the bundled schema for exact fields. Offer two materially different designs with the same facts when a visual redesign needs comparison.

## Use visual primitives selectively

When the user wants designed bodies across the whole README, use `presentation: "visual"` and `createComposition`. Structure the verified content as command-guide steps, usage journeys with factual results, requirement tiles, annotated code, repository maps and described documentation links. The four systems give these bodies different compositions. Keep exact commands and table data in their native disclosures. A conceptual filter/comparison/collection illustration must not masquerade as a live screenshot or invent program data. Avoid turning an unchanged paragraph into a decorative image; the composition should clarify sequence, prerequisites, paths or the next action.

Use `topology` for separate sources with explicit destination branches; include `via` for actual adapters. Use `sequence` for named actors, ordered interactions and explicit `gate` conditions. Actor indices must reference declared actors. Both preserve native descriptions. Use journey `fields` to show concrete inspection criteria or retained artifacts; avoid empty A/B placeholders. For a real product image, use a verified capture, give its date, and keep historical record values distinct from current availability.

`open-readme catalog --json` exposes advanced primitives to agents. Use them only when a reader needs a real demo, comparison, relationship diagram or sourced result. Do not assemble a sampler of unrelated styles. Prefer native feature lists, copyable commands and ordinary links. Avoid duplicate preview/source sections, decorative badges, fake terminal windows, generic statistics, empty roadmaps and repeated framed cards.

Command and code disclosures contain only the copyable command or source. Keep labels short (`Commands`, `Code`); do not repeat step descriptions, outcomes or annotations already shown in the visual above.

The four complete designs use matching mastheads, accessible SVG section headings, feature layouts, reference formats and diagrams. These align with native Markdown. `createComposition` applies a complete system; `styleSection` styles one section without rewriting facts. Add `preview` only for exact, useful source not already explained below. An optional visual feature takes a real `example`, not a generic icon. A `beam` diagram means input → processor → parallel outputs; `flow` means a sequence. Changing a design must preserve the actual relationship. Measure labels, align nodes by stage, attach arrows to boundaries, and preserve shared branch junctions. Keep annotations smaller than titles and avoid ambiguous crossing lines. Eight additional cover styles remain in the API for specific needs.

## Render and review the whole README

```sh
open-readme audit --config open-readme.json --json
open-readme check --config open-readme.json --json
open-readme render --config open-readme.json --out README.preview.md --json
open-readme check --config open-readme.json --readme README.preview.md --json
```

Audit checks section coverage, not truth. Review the document as a whole: masthead-to-body transition, adjacent sections, consistent spacing and code treatment. Check light/dark/compact/mobile assets and actual media paths. Keep commands, prose and reference tables selectable. SVGs need meaningful text alternatives. Font/density controls apply to SVGs; GitHub controls native Markdown typography.

For a targeted region:

```sh
open-readme render --block hero --section header --out README.md --json
```

Section mode preserves surrounding text and rejects broken markers. Conflicting assets and whole-file output require `--force`; review before using it. Commit referenced SVGs and original media with Markdown. Local media paths are relative to the config; the CLI rewrites output references without copying source media. Publishing, committing or pushing follows the user's task authorization; loading this skill alone does not authorize it.

## GitHub behavior

Native links, code-copy controls, details and automatic light/dark images work. Browser JavaScript tabs, hover animation and forms need an external page. Code groups export as disclosures; use them only when multiple alternatives are useful. Supplied metrics need actual sources and dates. The renderer does not fetch statistics, analyze code or invent content. The browser workbench previews complete READMEs, edits section variants and config and exports bundles with the same renderer.
