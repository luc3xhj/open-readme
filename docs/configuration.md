# Configuration

A config contains `version: 1`, a palette (`theme`), and ordered `blocks`. `design` chooses a header/composition style; each component’s `layout` can override its default. `project` determines the section audit. Use the [schema](../schema.json) and the [rendered API examples](../examples/components/) for exact fields.

```json
{
  "version": 1,
  "project": "cli",
  "design": "canvas",
  "theme": "minimal",
  "style": { "density": "compact" },
  "blocks": [
    {
      "id": "hero",
      "type": "hero",
      "section": "overview",
      "title": "Your project",
      "subtitle": "One factual sentence about what it does."
    },
    {
      "id": "start",
      "type": "code",
      "section": "quickstart",
      "title": "Quick start",
      "language": "sh",
      "code": "your-verified-command"
    }
  ]
}
```

`design`: canvas, console, journal, pipeline, plain, swiss, editorial, terminal, blueprint, product, studio, atlas. `theme`: minimal, terminal, editorial (background palette). `project`: cli, library, application, directory, research, profile. The CLI’s `init --design` sets the matching palette automatically.

## Complete README designs

Start with [Canvas](../examples/designs/canvas/README.md), [Console](../examples/designs/console/README.md), [Journal](../examples/designs/journal/README.md) or [Pipeline](../examples/designs/pipeline/README.md). These examples use the same project facts with coordinated section headings, feature layouts, reference formats and architecture visuals. Each uses one alignment grid and a consistent type hierarchy. The [design notes](./design-notes.md) link each design to the specific components studied.

`examples/designs/<name>.json` is bundled in the package. It documents **open-readme**; agents should replace its content with verified facts from the target project. `init --design canvas` creates only the selected project's essential sections, with placeholders clearly marked for replacement.

For an existing config, `createComposition(config, 'journal')` clones it and sets a coherent palette, section heading treatment and matching feature/reference/metric/timeline layouts. Source code stays native Markdown. It preserves project claims, section order, links, source code and diagram relationships. Preset-supported layouts are replaced; explicit section design overrides and diagram topology are preserved; block-level style overrides remain available.

Set `presentation: "visual"` before calling `createComposition` to design the section bodies as well as their headings. Quick-start steps become a command recipe; usage steps become an illustrated journey; annotated code pairs original lines with their purpose; requirements become fact tiles; repository paths become a directory map; and documentation links become clickable rows with descriptions. Every visual has light, dark, compact and mobile variants. Exact commands and reference data stay available in native disclosures. Omit the field, or set `"native"`, for the earlier native-body presentation.

Use `steps.items[].result` for a factual expected destination or artifact. Optional `visual` is `filters`, `comparison`, `collection` or `output`; these draw conceptual diagrams, not fabricated screenshots or populated example data. `code.annotations` contains `{ "line": 1, "label": "Types", "description": "TypeScript check" }`; line numbers must point to distinct lines in the original source. Documentation links accept a short `description`.

Visual command guides export a `Commands` disclosure containing only their exact commands. Illustrated code exports a `Code` disclosure containing only the original source. Step descriptions, results and annotations remain in the visual above instead of repeating inside the copy area. Workflows without commands retain their text alternative.

## Components and variants

| Type       | Layout / variant                                            | Required content                                                                             |
| ---------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| hero       | Twelve compositions, chosen by `design`                     | title, subtitle; optional headline, eyebrow, mark, command, meta, url, preview, previewLabel |
| badges     | dot, split, outline                                         | items: label, value, optional url                                                            |
| links      | inline, buttons, index, directory                           | items: label, url; optional description                                                     |
| features   | native, rows, columns, index, bento, lattice, terminal-grid | items: title, description; optional url, visual, example, value                              |
| code       | native, terminal, annotated                                 | code; optional language, filename, highlight, caption and line annotations                  |
| codegroup  | Native disclosures                                          | items: label, code, optional language                                                        |
| steps      | ordered, flow, guide, journey                                | items: title, description; optional code, language, result and visual                        |
| comparison | table, definitions, reference, matrix, scorecard, tiles, map | columns, rows; row width must match columns                                                  |
| diagram    | flow, stack, hub, beam                                      | items: title, optional description; `center` labels a hub                                    |
| metrics    | strip, columns, scoreboard                                  | items: label, value, optional source; caption for date/method                                |
| timeline   | checklist, rail                                             | items: title, description, status (shipped, in-progress, planned)                            |
| media      | plain, window                                               | src, alt; optional demo url, caption, width                                                  |
| gallery    | stack, strip                                                | items: src, alt, optional url and caption                                                    |
| details    | Disclosure                                                  | summary, markdown                                                                            |
| callout    | GitHub alert                                                | kind (note, tip, important, warning, caution), body                                          |
| markdown   | Native prose                                                | body; optional title                                                                         |
| toc        | Section links                                               | No content required; links to existing titled blocks                                         |

Every component requires unique `id` and `type`. Optional `design` selects Canvas, Console, Journal or Pipeline for that section; omit it to inherit the complete system. All block types accept an optional heading `title` (required for a hero) and `importance: "primary" | "supporting"`; omit importance to derive the hierarchy from the semantic section. Main sections receive more emphasis than supporting references. The workbench exposes this control alongside each section design. The complete systems render accessible, themed section headings. An explicit anchor preserves navigation links. Use `section` to map it to a reader question from the [section guide](./sections.md). Unknown fields, unsafe schemes and mismatched rows produce errors with field paths. The CLI catalog returns fields and variants as JSON.

### Illustrated features and previews

The four complete designs use compact, transparent mastheads. Journal and Pipeline split the project name and introduction across two columns on wide screens; Console and Canvas use a continuous text column. `title` is the project name and `subtitle` is its factual introduction. Optional `eyebrow`, `headline`, `command` and `meta` add text in the same column. A supplied `preview` is shown as a single restrained source example; its exact text remains in a native disclosure. Omit it when the README already explains the same thing. These complete designs do not add previews, badges or diagrams automatically.

A feature block may set `examples: "none"` when its illustration is explanatory and does not contain instructions to copy; otherwise exact examples appear in a native disclosure. Image alternatives keep the complete supplied facts. A feature's `visual` can be `flow`, `code`, `files`, `palette`, `preview`, `metric` or `none`. `example` supplies the actual demonstration text; `value` supplies a metric. Flow example labels are separated by `→` or newlines. Palette illustrations use six-digit hex colors found in the example. Examples remain available as exact, selectable native text even when the illustration wraps or abbreviates them.

The complete systems interpret `bento` as open feature columns on a shared baseline, `lattice` as editorial title/explanation/evidence rows, and `terminal-grid` as a compact two-column manual. `rows` pairs explanation with a functional illustration. These layouts share the same document-scale text roles without repeated large cards. No data, numbers or examples are fetched or inferred.

A `beam` diagram has a specific relationship: item 1 is the input, item 2 the processor, and remaining items are parallel outputs. Use `flow` for a sequential chain. Changing a design never changes that relationship.

## Visual controls

| Field in `style` | Values                                                                |
| ---------------- | --------------------------------------------------------------------- |
| accent           | Six-digit hex color                                                   |
| density          | compact or comfortable                                                |
| radius           | 0–24 pixels on framed components                                      |
| width            | 640–1200 pixels; compact variants use 760 and narrow variants use 480 |
| font             | mono, sans or serif system fonts                                      |

Each component can also override `accent`, `density`, `radius` and `font` in its own `style` object. Block-level styles are preserved by the renderer. Controls apply to generated SVGs. Display fonts and SVG section spacing can be overridden in the complete designs; optional visual frames also support radius control; source code and filenames keep monospace typography. GitHub controls native Markdown typography. Fonts depend on the viewer’s system. Metrics are supplied values, with no network fetching or fabricated statistics.

## CLI

```sh
open-readme init --project library --design plain --name "Project name"
open-readme catalog --json
open-readme designs --json
open-readme sections --json
open-readme audit --config open-readme.json --json
open-readme render --config open-readme.json --out README.preview.md --json
open-readme render --block hero --out HEADER.md --assets images
open-readme render --block hero --section header --out README.md
open-readme check --config open-readme.json --readme README.preview.md --json
```

`--assets` is relative to the output Markdown. Local media paths are relative to the config file; the CLI rewrites references relative to the output file, without copying the original media. For `--config -`, media paths are relative to the current directory. Commit original media too. `--json` reports structured errors and results; invalid input exits 1.

Whole-file export refuses conflicting files without `--force`. Section export uses `<!-- open-readme:header:start -->` and `<!-- open-readme:header:end -->`, appends missing regions, preserves other content, and rejects broken or duplicated markers. Asset conflicts still need `--force`.

`check` validates config and requested local image references. `audit` checks section coverage. Neither verifies factual claims or fetches external links.

## JavaScript API

```js
import {
  render,
  validateConfig,
  auditConfig,
  updateSection,
  createZip,
  createComposition,
} from '@luc3xhj/open-readme';
const designed = createComposition(config, 'canvas');
const errors = validateConfig(designed);
const { markdown, assets } = render(designed, { assetPrefix: 'assets/open-readme' });
// Pure rendering: assets is Map<filename, SVG string>; no writes or requests.
const updated = updateSection(previousReadme, markdown, 'design');
const zip = createZip(
  new Map([
    ['README.md', markdown],
    ...[...assets].map(([name, svg]) => ['assets/open-readme/' + name, svg]),
  ]),
);
```

The API preserves media URLs as supplied; callers moving the output must resolve and include local media files. Browser exports include SVG, PNG, JPEG, WebP and GIF files served under the preview's `./assets/` directory. Files from another repository must first be available there; remote URLs remain links.

## Relationship diagrams

`topology` describes independent sources and their actual outputs. Each source has `title`, `description`, optional `meta`, and `outputs`. An output has `title`, `description`, optional `via` and `icon`. Repeated destinations remain repeated rather than suggesting an unverified shared processor. Every source reflows into its own branch on narrow layouts.

`sequence` describes declared `actors` and ordered `messages`. Each message uses zero-based `from` and `to` actor indices, a `label`, optional `description`, optional `gate`, and `kind: "reply"` for a dashed response. Indices must refer to different declared actors. Gates display conditions, not live status. Narrow layouts use a readable ordered sender → recipient trace.

```json
{
  "id": "consent",
  "type": "sequence",
  "section": "usage",
  "title": "Share after acceptance",
  "actors": [{ "title": "Sender" }, { "title": "Recipient" }],
  "messages": [
    { "from": 0, "to": 1, "label": "Request a connection" },
    { "from": 1, "to": 0, "label": "Accept the request", "kind": "reply" },
    { "from": 0, "to": 1, "label": "Share selected details", "gate": "Explicit consent" }
  ]
}
```

Journey steps can supply `fields: [{ "label": "Timing", "value": "Deadline + timezone" }]`. These values appear in both the illustration and its native disclosure. Describe what a reader should inspect; do not fill a comparison with invented statistics. Topology and sequence diagrams always include a native text version.

## GitHub compatibility

Light/dark/mobile SVG variants use `<picture>`. Links wrap visual assets. Commands, prose and tables remain available as native Markdown. Code groups and FAQ use expandable details; alerts use GitHub’s native syntax. JavaScript tabs, forms and embedded web apps require an external demo. See [GitHub Flavored Markdown](https://github.github.com/gfm/#disallowed-raw-html-extension-) and [collapsed sections](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections).

## Install

```sh
npm install --save-dev github:luc3xhj/open-readme#v0.5.0
npx open-readme --help
```

Or clone and run `node bin/open-readme.js --help`. `@luc3xhj/open-readme` is not yet published to npm. The unscoped npm name is an unrelated package. GitHub installation and release tarballs do not require an npm account.

## Browser workbench

The [workbench](https://luc3xhj.github.io/open-readme/) previews complete documents. Switch designs, inspect light/dark or narrow layouts, edit the JSON and download a ZIP with `README.md`, config, schema and local SVGs. Switching designs preserves the current content and resets the global accent/font to the selected design defaults. Edit config after choosing a design to override them. Customize also offers a section list with four variants for each section. The advanced primitive catalog remains available through `open-readme catalog --json`; it is not a separate browser page.

## Coordinated section variants

`open-readme sections --json` describes four design variants for every semantic section: overview, demo, quick start, features, usage, configuration, API, architecture, requirements, results, data, roadmap, FAQ, contributing, credits and license. Native code and prose retain GitHub's typography; visual headings and figures carry the selected system.

| System   | Section headings      | Features              | Configuration/data     | Architecture                          |
| -------- | --------------------- | --------------------- | ---------------------- | ------------------------------------- |
| Canvas   | Sans + a small accent | Illustrated bento     | Native table           | Rounded nodes and curved connections  |
| Console  | Mono prompt           | Terminal grid         | Aligned text reference | Vertical file-tree arrangement        |
| Journal  | Serif + folio         | Fine-rule lattice     | Definition lists       | Unframed nodes and fine connections   |
| Pipeline | Numbered accent rail  | Open illustrated rows | Transposed matrix      | Sharp nodes and orthogonal connectors |

`styleSection(block, 'journal')` returns a styled clone without changing its facts. `createComposition(config, 'journal')` applies the whole system. Blocks with an explicit `design` keep their override. Native prose, source code and FAQ disclosures stay readable and usable rather than becoming screenshots.

Give each semantic section a title for the coordinated heading. Blocks that continue the same section can omit it. FAQ, notices, credit links and license prose support the same four heading variants while retaining their native interactions.
