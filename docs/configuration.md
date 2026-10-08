# Configuration

A config contains `version: 1`, a palette (`theme`), and ordered `blocks`. `design` chooses a header/composition style; each component’s `layout` can override its default. `project` determines the section audit. Use the [schema](../schema.json) and [41 rendered examples](../examples/components/) for exact fields.

```json
{
  "version": 1,
  "project": "cli",
  "design": "swiss",
  "theme": "minimal",
  "style": { "density": "compact" },
  "blocks": [
    { "id": "hero", "type": "hero", "section": "overview", "title": "Your project", "subtitle": "One factual sentence about what it does." },
    { "id": "start", "type": "code", "section": "quickstart", "title": "Quick start", "language": "sh", "code": "your-verified-command" }
  ]
}
```

`design`: plain, swiss, editorial, terminal, blueprint, product, studio, atlas. `theme`: minimal, terminal, editorial (background palette). `project`: cli, library, application, directory, research, profile. The CLI’s `init --design` sets the matching palette automatically.

## Components and variants

| Type | Layout / variant | Required content |
| --- | --- | --- |
| hero | Eight designs, chosen by `design` | title, subtitle; optional eyebrow, mark, command, meta, url |
| badges | dot, split, outline | items: label, value, optional url |
| links | inline, buttons, index | items: label, url |
| features | native, rows, columns, index | items: title, description, optional url |
| code | native, terminal | code; optional language, filename, highlighted original line numbers, caption |
| codegroup | Native disclosures | items: label, code, optional language |
| steps | ordered, flow | items: title, description, optional code and language |
| comparison | table, scorecard | columns, rows; row width must match columns |
| diagram | flow, stack, hub | items: title, optional description; `center` labels a hub |
| metrics | strip, columns, scoreboard | items: label, value, optional source; caption for date/method |
| timeline | checklist, rail | items: title, description, status (shipped, in-progress, planned) |
| media | plain, window | src, alt; optional demo url, caption, width |
| gallery | stack, strip | items: src, alt, optional url and caption |
| details | Disclosure | summary, markdown |
| callout | GitHub alert | kind (note, tip, important, warning, caution), body |
| markdown | Native prose | body; optional title |
| toc | Section links | No content required; links to existing titled blocks |

Every component requires unique `id` and `type`. Most components accept a heading `title`. Use `section` to map it to a reader question from the [section guide](./sections.md). Unknown fields, unsafe schemes and mismatched rows produce errors with field paths. The CLI catalog returns fields and variants as JSON.

## Visual controls

| Field in `style` | Values |
| --- | --- |
| accent | Six-digit hex color |
| density | compact or comfortable |
| radius | 0–24 pixels on framed components |
| width | 640–1200 pixels; narrow variants use 560 |
| font | mono, sans or serif system fonts |

Each component can also override `accent`, `density`, `radius` and `font` in its own `style` object. The composer keeps explicit component customization when you add it to a README. Controls apply to generated SVGs. GitHub controls native Markdown typography. Fonts depend on the viewer’s system. Metrics are supplied values, with no network fetching or fabricated statistics.

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
import { render, validateConfig, auditConfig, updateSection, createZip } from '@luc3xhj/open-readme';
const errors = validateConfig(config);
const { markdown, assets } = render(config, { assetPrefix: 'assets/open-readme' });
// Pure rendering: assets is Map<filename, SVG string>; no writes or requests.
const updated = updateSection(previousReadme, markdown, 'design');
const zip = createZip(new Map([
  ['README.md', markdown],
  ...[...assets].map(([name, svg]) => ['assets/open-readme/' + name, svg]),
]));
```

The API preserves media URLs as supplied; callers moving the output must resolve local media paths. Browser exports include this library’s example media; user-supplied local media files must be included by the caller.

## GitHub compatibility

Light/dark/mobile SVG variants use `<picture>`. Links wrap visual assets. Commands, prose and tables remain available as native Markdown. Code groups and FAQ use expandable details; alerts use GitHub’s native syntax. JavaScript tabs, forms and embedded web apps require an external demo. See [GitHub Flavored Markdown](https://github.github.com/gfm/#disallowed-raw-html-extension-) and [collapsed sections](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections).

## Install

```sh
npm install --save-dev github:luc3xhj/open-readme#v0.1.1
npx open-readme --help
```

Or clone and run `node bin/open-readme.js --help`. `@luc3xhj/open-readme` is not yet published to npm. The unscoped npm name is an unrelated package. GitHub installation and release tarballs do not require an npm account.
