# Component design notes

The designs study specific components inside 21st.dev: their hierarchy, spacing, layout and demonstration patterns. The SVG renderer here is an original implementation. No third-party component source, screenshots or artwork is bundled.

## Four complete compositions

| Design   | Specific reference                                                                        | What was studied                                                              | Applied to this README                                                                      |
| -------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Canvas   | [Product Hero with Demo Panel](https://21st.dev/@felipemenezes098/components/hero-14)     | Centered headline, broad visual field, overlapping demo panel                 | Overview shows the actual README preview with a renderer command layered over it            |
| Canvas   | [Bento Product Features](https://21st.dev/@kavikatiyar/components/bento-product-features) | Unequal priority and a different functional visual in each cell               | Features show a document flow, actual JSON accent, copyable command and generated file tree |
| Console  | [TerminalBentoGrid](https://21st.dev/@dhileepkumargm/components/terminal-bento-grid)      | Shared mono rhythm, prompt markers and thin partitions                        | Compact command cover, output files and a terminal feature grid                             |
| Console  | [Code Block — Manu Arora](https://21st.dev/@manuarora700/components/code-block)           | File label, original line numbers, emphasis and copyable source               | Terminal code preview with exact native source in a disclosure                              |
| Journal  | [Feature Overview Bento](https://21st.dev/@mohammadshehadeh/components/feature-10)        | Large serif statement, smaller supporting facts, continuous fine-rule lattice | Editorial cover and connected feature partitions with different information weights         |
| Journal  | [Editorial Collage Hero](https://21st.dev/@felipemenezes098/components/hero-04)           | Asymmetric type scale and supporting copy beside the headline                 | Short serif statement beside an explanatory sentence; compact margin labels                 |
| Pipeline | [Animated Beam](https://21st.dev/@dillionverma/components/animated-beam)                  | Small distinct nodes, curved anchored connectors, central processor           | Cover and architecture show config → renderer → Markdown + SVG outputs                      |
| Pipeline | [Animated Card Diagram](https://21st.dev/@badtzx0/components/animated-card-diagram)       | A useful relationship is the main visual                                      | Illustrated feature rows put explanation beside the actual flow/config/code/files           |

[Preview all four complete READMEs](https://luc3xhj.github.io/open-readme/), or read their [exported Markdown and SVGs](../examples/designs/). The same renderer generates the website previews and committed GitHub examples.

The adaptation uses static vector layouts plus GitHub's native interactions. Curved connections remain visual relationships; JavaScript animation is not exported. Long commands and examples remain exact selectable text below visual previews. No decorative statistics, testimonials or unsupported performance claims are added.

## Additional component references

| Reference                                                                               | README adaptation                                                     |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Code Block — Prompt Kit](https://21st.dev/@ibelick/components/code-block)              | Restrained native code and separate disclosures for multiple examples |
| [Timeline](https://21st.dev/@kuratlielia/components/timeline)                           | A vertical status rail and readable checklist                         |
| [Animated Status Badge](https://21st.dev/@isaiahbjork/components/animated-status-badge) | Static linked facts in dot, split and outline variants                |
| [Hero 03](https://21st.dev/@designali-in/components/hero-03)                            | Swiss and Studio cover compositions                                   |

References credit the designs studied, without claiming affiliation or source reuse. Research used publicly visible component previews and usage examples.

## Design rules

1. Start with the reader's question. Overview, a working start, actual usage and license are essential for software; other sections must earn their place.
2. Show a feature's actual function. Use real source, output, media or relationships instead of repeating a box with a generic icon and paragraph.
3. Change information hierarchy when changing layouts. Four complete designs coordinate cover, features and code presentation; component layouts and block-level styles remain editable.
4. Preserve facts and relationships. Recomposition does not rewrite commands, sources or a diagram's topology. Beam is input → processor → parallel outputs; flow is a sequential chain.
5. Preserve usable content. Native code, links, anchor navigation and disclosures work on GitHub. Assets have light, dark and narrow-screen variants; supplied metrics need actual sources.
