# Section design systems

Design the sections first, then compose a complete README. A system defines a shared type hierarchy, alignment grid, accent, line weight and framing. The website shows complete documents; there is no separate component gallery.

## Four coordinated systems

| System   | Layout                                                           | Reference and architecture                                           |
| -------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| Canvas   | Compact sans masthead; open feature columns on a shared baseline | Native options table; rounded nodes and a grouped artifact branch    |
| Console  | Mono manual; numbered two-column entries                         | Aligned text reference; an indented file tree with anchored branches |
| Journal  | Asymmetric serif masthead; three-column editorial entries        | Inline definitions; unframed file/processor relationships            |
| Pipeline | Numbered technical headings; explanation/figure pairs            | Transposed matrix; input, process and output lanes                   |

Every semantic section has four system variants. License, credits and explanatory prose use the matching section heading with selectable text. Installation, usage and API examples use the matching heading/context with native code-copy behavior. Demo, metrics and roadmap figures inherit the system's font, colors and frame treatment. Do not include a section merely to fill a template.

[Preview complete READMEs](https://luc3xhj.github.io/open-readme/), or inspect the [GitHub exports](../examples/designs/). The same renderer generates both. The Customize dialog permits a section override; by default every section inherits the selected complete system. Dark, compact and narrow vector assets are generated locally.

## Specific component research

Research used components inside 21st.dev to study hierarchy, spacing and functional illustrations. The SVG implementation is original. No component source, screenshots or artwork is bundled.

| Reference                                                                                 | Principle used                                              |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [Bento Product Features](https://21st.dev/@kavikatiyar/components/bento-product-features) | Give related capabilities different weights within one grid |
| [TerminalBentoGrid](https://21st.dev/@dhileepkumargm/components/terminal-bento-grid)      | A shared mono rhythm, prompt markers and thin partitions    |
| [Feature Overview Bento](https://21st.dev/@mohammadshehadeh/components/feature-10)        | Serif hierarchy and connected fine-rule partitions          |
| [Editorial Collage Hero](https://21st.dev/@felipemenezes098/components/hero-04)           | Contrast a display title with readable explanatory copy     |
| [Code Block](https://21st.dev/@manuarora700/components/code-block)                        | Exact, copyable source with restrained context              |
| [Animated Beam](https://21st.dev/@dillionverma/components/animated-beam)                  | Connect actual inputs, a processor and parallel outputs     |
| [Animated Card Diagram](https://21st.dev/@badtzx0/components/animated-card-diagram)       | Let a real relationship carry the feature illustration      |

Static relationships replace browser animation in GitHub exports. A beam always keeps its actual topology. Full commands, prose and table facts remain available in native Markdown. Explanatory feature illustrations may omit a duplicate source disclosure when the alternative text already preserves the facts.

## Document-scale hierarchy

The complete systems share size roles: project name 30–38 SVG units, primary section 23, supporting section 18, figure title 18, explanation 15 and annotation 11. Compact/mobile assets compensate for the narrower column without using landing-page display sizes. Native Markdown uses GitHub's own typography. Captions use GitHub-supported small text; service descriptions use body size, while paths and adapters use annotation size.

`section` supplies the default hierarchy: overview, features, quick start and usage lead; configuration, API, architecture, compatibility and project housekeeping are supporting. `importance: "primary"` or `"supporting"` explicitly overrides a titled section. The workbench exposes both emphasis and section design. Density changes whitespace, not project facts.

## Diagram research

The implementation is original SVG code. We inspected rendered examples and read the source projects' documentation:

- [D2 ELK examples](https://d2lang.com/examples/elk/): align related nodes by stage, contain related outputs and route edges through clear gaps.
- [D2 containers](https://d2lang.com/tour/containers/) and [connections](https://d2lang.com/tour/connections/): use grouping and explicit arrow endpoints to explain relationships.
- [Mermaid architecture](https://mermaid.js.org/syntax/architecture.html): distinguish services, groups, edges and junctions; connect edges to consistent node sides.
- [Excalidraw](https://github.com/excalidraw/excalidraw): keep labels attached to meaningful objects and connections. We did not adopt sketch styling for a technical reference document.

The beam renderer measures labels before positioning nodes. Input → processor → parallel outputs is a preserved topology; output files never become a sequential chain when changing themes. Connections terminate on node boundaries, share a branch junction and stay out of unrelated node interiors. Narrow assets reflow into a tree. The small router is limited to this topology; it is not a replacement for D2 or Mermaid on arbitrary graphs. No upstream source, screenshots or artwork is bundled.

## Whole-document review

For independent runtime paths, the topology component separates source-owned branches, names each destination, and attaches adapters to the relationship they belong to. The interaction sequence keeps actor columns and message order separate from privacy gates. Both provide exact native descriptions. These patterns follow [Mermaid's named services and groups](https://mermaid.js.org/syntax/architecture.html), [21st's File Tree](https://21st.dev/@jatin-yadav05/components/file-tree) for a legible hierarchy, and [Animated Card Diagram](https://21st.dev/@badtzx0/components/animated-card-diagram) for making explanatory graphics lead the content. Original static SVG replaces browser motion.

Comparison illustrations identify the fields a reader needs to verify; they do not draw empty A/B score dots. Saved-work illustrations name the retained record and distinguish private notes. Four Canvas features use an aligned two-by-two grid; runtime annotations stay smaller than service names. Requirements use quieter values than headline metrics.

1. Choose a system and apply it across the useful sections.
2. Keep one alignment grid, a small type hierarchy and consistent borders/corners.
3. Show actual capabilities, source, media or relationships instead of decorating generic copy.
4. Remove repeated explanations, decorative badges and unnecessary disclosures.
5. Review adjacent sections, light/dark assets, compact and narrow layouts together.

References credit designs studied without claiming affiliation or source reuse.
