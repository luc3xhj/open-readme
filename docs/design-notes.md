# Section design systems

Design the sections first, then compose a complete README. A system defines a shared type hierarchy, alignment grid, accent, line weight and framing. The website shows complete documents; there is no separate component gallery.

## Four coordinated systems

| System   | Overview and section headings            | Features                    | Configuration            | Architecture                          |
| -------- | ---------------------------------------- | --------------------------- | ------------------------ | ------------------------------------- |
| Canvas   | Open sans masthead, small accent markers | Illustrated bento cells     | Compact native table     | Rounded nodes, curved connections     |
| Console  | Mono project name and prompt headings    | Compact terminal grid       | Aligned text reference   | File-tree diagram                     |
| Journal  | Serif masthead and folio headings        | Connected fine-rule lattice | Definition lists         | Unframed nodes with fine connectors   |
| Pipeline | Technical masthead and numbered rails    | Open illustrated rows       | Transposed native matrix | Sharp nodes and orthogonal connectors |

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

## Whole-document review

1. Choose a system and apply it across the useful sections.
2. Keep one alignment grid, a small type hierarchy and consistent borders/corners.
3. Show actual capabilities, source, media or relationships instead of decorating generic copy.
4. Remove repeated explanations, decorative badges and unnecessary disclosures.
5. Review adjacent sections, light/dark assets, compact and narrow layouts together.

References credit designs studied without claiming affiliation or source reuse.
