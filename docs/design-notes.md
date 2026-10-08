# Component design notes

The library studies individual components on 21st.dev: their purpose, information hierarchy, public example parameters and preview behavior. The renderer and SVG layouts here are original implementations. No 21st component source, screenshots or third-party artwork is bundled.

| Reference component | Pattern studied | README adaptation |
| --- | --- | --- |
| [Code Block — Manu Arora](https://21st.dev/@manuarora700/components/code-block) | Filename, line numbers, highlighted lines, copyable source | Optional terminal SVG with original-line highlighting; a native code disclosure for copying |
| [Code Block — Prompt Kit](https://21st.dev/@ibelick/components/code-block) | A restrained code surface and a useful header | Native code stays the default; multiple examples use separate disclosures |
| [Timeline — kuratlielia](https://21st.dev/@kuratlielia/components/timeline) | A vertical rail with expandable detail | A status rail plus a readable checklist; no scroll-driven animation |
| [Animated Card Diagram — badtz](https://21st.dev/@badtzx0/components/animated-card-diagram) | A visual relationship as the main content | Data-driven flow, stack and hub diagrams; text describes the actual nodes |
| [Animated Status Badge — Isaiah](https://21st.dev/@isaiahbjork/components/animated-status-badge) | Clear status semantics instead of generic decoration | Static linked facts, in dot, split and outline variants |
| [Hero 03 — Ali Imam](https://21st.dev/@designali-in/components/hero-03) | Typographic scale and asymmetric information placement | Swiss and Studio header compositions |
| [Editorial Collage Hero — felipemenezes098](https://21st.dev/@felipemenezes098/components/hero-04) | Serif hierarchy, open space and media-led composition | Editorial header; real demo images and galleries supplied by the project |

The references are inspiration, not a claim of affiliation or source reuse. Full component source on 21st may require a membership; this project uses publicly visible previews and usage examples.

## Component rules

1. Start with a reader’s question. A diagram must explain real relationships; a metric must describe a supplied value; a feature must state a concrete capability.
2. Expose useful variants. Layout changes should change how information is read, not just recolor the same card.
3. Preserve usable content. Commands remain copyable, visual data has text alternatives, and long answers can be opened without leaving GitHub.
4. Ship local assets. Every generated SVG has light, dark and narrow-screen versions and contains no scripts, external fonts or embedded resources.
5. Use real GitHub interactions. Native links, anchor navigation, details and code-copy behavior survive export. JavaScript tabs, hover motion and web forms do not.

Eight header designs give different starting compositions. Feature, diagram, metric, badge, code, navigation, table, timeline and media components choose their own `layout`; they are not locked to one header theme.
