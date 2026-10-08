<!-- Generated with open-readme. Edit the JSON configuration to regenerate. -->

<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/hero-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/hero-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/hero-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/hero-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/hero-dark.svg">
  <img src="assets/open-readme/hero-light.svg" alt="open-readme — Clear, designed READMEs.
Made for your coding agent." width="960">
</picture>

<h2 id="what-you-get"><a href="#what-you-get">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/features__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/features__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/features__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/features__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/features__heading-dark.svg">
  <img src="assets/open-readme/features__heading-light.svg" alt="What you get" width="960">
</picture>
</a></h2>

<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/features-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/features-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/features-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/features-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/features-dark.svg">
  <img src="assets/open-readme/features-light.svg" alt="Content comes first: Keep project facts, section order and design in one editable JSON file.: Project facts → JSON → README; Control every section: Choose a complete system. Adjust a section’s style, typography or density when you need to.: #24764C
&quot;density&quot;: &quot;compact&quot;; Files you own: Local Markdown and light/dark SVGs. Commit the files; your README needs no image service.: README.md
open-readme.json
assets/open-readme/" width="960">
</picture>

<h2 id="get-started"><a href="#get-started">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/quickstart__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/quickstart__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/quickstart__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/quickstart__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/quickstart__heading-dark.svg">
  <img src="assets/open-readme/quickstart__heading-light.svg" alt="Get started" width="960">
</picture>
</a></h2>

```sh
npm install --save-dev github:luc3xhj/open-readme#v0.4.0
npx open-readme init --project cli --design console
npx open-readme render --out README.preview.md --json
```

_Node.js 22+. Fill in your project’s facts, then render a preview._

<h2 id="use-with-your-agent"><a href="#use-with-your-agent">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/agent__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/agent__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/agent__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/agent__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/agent__heading-dark.svg">
  <img src="assets/open-readme/agent__heading-light.svg" alt="Use with your agent" width="960">
</picture>
</a></h2>

Load the [agent skill](https://github.com/luc3xhj/open-readme/blob/main/skills/open-readme/SKILL.md), then ask:

> Design this repository’s README with open-readme. Verify the install and usage commands. Choose the useful sections, show me two complete design systems, and render to README.preview.md first.

Your agent inspects the repository, edits the config and runs the CLI. Review the result before replacing your README.

<h2 id="configuration"><a href="#configuration">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/configuration__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/configuration__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/configuration__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/configuration__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/configuration__heading-dark.svg">
  <img src="assets/open-readme/configuration__heading-light.svg" alt="Configuration" width="960">
</picture>
</a></h2>

```text
Option         Default         Controls
design         plain           The complete design system
style.accent   Design default  Color across sections
style.density  compact         Spacing in SVG sections
block.design   Inherited       One section’s design variant
```

```json
{
  "design": "console",
  "style": {
    "accent": "#24764C",
    "density": "compact"
  }
}
```

_Override the complete system or one block. Your content stays in the same config._

<h2 id="rendering-pipeline"><a href="#rendering-pipeline">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/architecture__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/architecture__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/architecture__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/architecture__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/architecture__heading-dark.svg">
  <img src="assets/open-readme/architecture__heading-light.svg" alt="Rendering pipeline" width="960">
</picture>
</a></h2>

<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/architecture-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/architecture-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/architecture-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/architecture-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/architecture-dark.svg">
  <img src="assets/open-readme/architecture-light.svg" alt="open-readme.json → Renderer; parallel outputs: README.md, Local SVGs; open-readme.json: Project facts + chosen sections; Renderer: Validate and compose; README.md: Copyable native Markdown; Local SVGs: Light, dark and narrow layouts" width="960">
</picture>

<h2 id="javascript-api"><a href="#javascript-api">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/api__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/api__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/api__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/api__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/api__heading-dark.svg">
  <img src="assets/open-readme/api__heading-light.svg" alt="JavaScript API" width="960">
</picture>
</a></h2>

```js
import { render } from "@luc3xhj/open-readme";

const { markdown, assets } = render(config);
// assets is a Map of local SVG filenames and contents.
```

_The CLI and browser use this same renderer. The output has no runtime dependency._

<h2 id="works-on-github"><a href="#works-on-github">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/compatibility__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/compatibility__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/compatibility__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/compatibility__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/compatibility__heading-dark.svg">
  <img src="assets/open-readme/compatibility__heading-light.svg" alt="Works on GitHub" width="960">
</picture>
</a></h2>

Code, prose, references and links remain native Markdown. GitHub chooses light or dark SVGs automatically. Commit `README.md` and `assets/open-readme/` together.

Read the [configuration reference](https://github.com/luc3xhj/open-readme/blob/main/docs/configuration.md) and [section guide](https://github.com/luc3xhj/open-readme/blob/main/docs/sections.md).

<h2 id="contribute"><a href="#contribute">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/contributing__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/contributing__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/contributing__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/contributing__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/contributing__heading-dark.svg">
  <img src="assets/open-readme/contributing__heading-light.svg" alt="Contribute" width="960">
</picture>
</a></h2>

[Report an issue](https://github.com/luc3xhj/open-readme/issues) or read the [contribution guide](https://github.com/luc3xhj/open-readme/blob/main/CONTRIBUTING.md). Design a section around a reader’s task, then check it within the complete README.

<h2 id="license-credits"><a href="#license-credits">
<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="assets/open-readme/license__heading-dark-mobile.svg">
  <source media="(max-width: 520px)" srcset="assets/open-readme/license__heading-light-mobile.svg">
  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="assets/open-readme/license__heading-dark-compact.svg">
  <source media="(max-width: 840px)" srcset="assets/open-readme/license__heading-light-compact.svg">
  <source media="(prefers-color-scheme: dark)" srcset="assets/open-readme/license__heading-dark.svg">
  <img src="assets/open-readme/license__heading-light.svg" alt="License &amp; credits" width="960">
</picture>
</a></h2>

[MIT](https://github.com/luc3xhj/open-readme/blob/main/LICENSE). Built by [Lucas](https://github.com/luc3xhj) at [Meridian Startups](https://meridianstartups.com). [Preview the complete designs](https://luc3xhj.github.io/open-readme/).
