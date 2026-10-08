---
name: open-readme
description: Compose and design GitHub READMEs with open-readme’s component library. Use for README sections, headers, badges, code examples, diagrams, metrics, timelines, galleries and FAQ. Choose useful components and export GitHub-compatible Markdown with local SVG assets while preserving verified project facts.
---

# Open Readme

Use `open-readme` from an installed package or `node <checkout>/bin/open-readme.js`. Requires Node 22+. Package files, examples and schema live under `node_modules/@luc3xhj/open-readme/`.

## Inspect, choose, compose

1. Read the current README, package metadata, commands, public API, license and relevant docs. Keep the author’s useful content and preferences. Verify claims, install instructions, requirements and demo paths in the repository. Do not turn placeholders into claims.
2. Choose a project type: cli, library, application, directory, research or profile. Run `open-readme sections --json` and `open-readme projects --json`. Overview, a working start, real usage and license are essentials for software. Applications benefit from a real demo; libraries need API examples; datasets need sources, method and a snapshot date. Skip sections that add no information.
3. Run `open-readme catalog --json` and `open-readme designs --json`. Choose components by their purpose, then select their variants. A README does not need all 17 types. Do not repeat framed cards as the only visual language. Use feature indices/columns, relationship diagrams, source-linked metrics, real media or compact native text when they fit.
4. Use `open-readme init --project <type> --design <design>`, then edit `open-readme.json`. Assign stable ids and semantic `section` values. Component `layout` overrides the composition default. Refer to the bundled schema and `docs/configuration.md` for fields.

The eight header designs are plain, swiss, editorial, terminal, blueprint, product, studio and atlas. A visual redesign should usually offer two materially different compositions using the same facts. Do not add decorative statistics, generic badges, empty roadmaps or a technical stack list with no explanatory value.

## Render and verify

```sh
open-readme audit --config open-readme.json --json
open-readme check --config open-readme.json --json
open-readme render --config open-readme.json --out README.preview.md --json
open-readme check --config open-readme.json --readme README.preview.md --json
```

Audit checks section coverage, not truth. Review the preview, light/dark/mobile assets and referenced media. Keep instructions and source code copyable. SVGs must have meaningful alternatives. Local media paths are relative to the config file; the CLI rewrites output references without copying source media.

For one component or a targeted region:

```sh
open-readme render --block hero --section header --out README.md --json
```

Section mode preserves surrounding text. Broken markers are rejected. Conflicting assets and whole-file output require `--force`; review before using it. Commit referenced SVGs and original media with the Markdown. Publishing, committing or pushing follows the user’s task authorization; loading this skill alone does not authorize it.

## Real GitHub behavior

Links, anchor navigation, expandable details, native code-copy and automatic light/dark images work. JavaScript tabs, hover animations, forms and embedded apps need an external page. Code groups export as disclosures. Static supplied metrics need actual sources/date; the renderer does not fetch repository statistics, analyze code or invent content. The browser library previews components, edits config and exports bundles using the same renderer.
