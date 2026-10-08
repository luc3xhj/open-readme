import { designs } from './designs.js?v=0.2.0';

export const compositionReferences = {
  canvas: {
    name: 'Canvas',
    description:
      'Show the output first. A layered README preview leads into illustrated, unequal feature cells.',
    references: [
      {
        name: 'Product Hero with Demo Panel',
        url: 'https://21st.dev/@felipemenezes098/components/hero-14',
        section: 'Overview',
        studied:
          'A short centered headline, one broad visual field and an overlapping demonstration panel.',
      },
      {
        name: 'Bento Product Features',
        url: 'https://21st.dev/@kavikatiyar/components/bento-product-features',
        section: 'Features',
        studied:
          'Unequal cell sizes, varied visual content and a functional example inside each feature.',
      },
    ],
  },
  console: {
    name: 'Console',
    description:
      'A compact command manual. Mono typography, thin partitions, useful commands and the files they produce.',
    references: [
      {
        name: 'TerminalBentoGrid',
        url: 'https://21st.dev/@dhileepkumargm/components/terminal-bento-grid',
        section: 'Overview + features',
        studied:
          'A shared monospace rhythm, prompt markers, status labels and cells of different widths.',
      },
      {
        name: 'Code Block',
        url: 'https://21st.dev/@manuarora700/components/code-block',
        section: 'Quick start',
        studied:
          'A file label, original line numbers, an emphasized command and a copyable source.',
      },
    ],
  },
  journal: {
    name: 'Journal',
    description:
      'A readable field guide. Serif hierarchy, margin labels and connected fine-rule partitions give facts different weights.',
    references: [
      {
        name: 'Feature Overview Bento',
        url: 'https://21st.dev/@mohammadshehadeh/components/feature-10',
        section: 'Overview + features',
        studied:
          'A large serif statement, smaller supporting facts and a single hairline lattice instead of separated equal cards.',
      },
      {
        name: 'Editorial Collage Hero',
        url: 'https://21st.dev/@felipemenezes098/components/hero-04',
        section: 'Overview',
        studied:
          'Editorial type scale, asymmetry and a compact piece of explanatory copy beside the main statement.',
      },
    ],
  },
  pipeline: {
    name: 'Pipeline',
    description:
      'Explain a system through its path. The cover and architecture section show inputs, processing and separate outputs.',
    references: [
      {
        name: 'Animated Beam',
        url: 'https://21st.dev/@dillionverma/components/animated-beam',
        section: 'Overview + architecture',
        studied: 'Small distinct nodes, curved anchored connectors and a central processing point.',
      },
      {
        name: 'Animated Card Diagram',
        url: 'https://21st.dev/@badtzx0/components/animated-card-diagram',
        section: 'Features',
        studied:
          'Make a functional diagram the feature’s main visual, with explanation subordinate to it.',
      },
    ],
  },
};

// Recompose existing facts. This function supplies layouts, never project claims.
export function createComposition(base, design) {
  if (!compositionReferences[design]) throw new Error('Unknown complete README design.');
  const config = structuredClone(base);
  config.design = design;
  config.theme = designs[design].theme;
  config.style = { ...config.style, density: 'compact' };
  delete config.style.accent;
  delete config.style.font;
  for (const block of config.blocks) {
    if (block.type === 'features') block.layout = designs[design].features;
    if (block.type === 'code') block.layout = design === 'console' ? 'terminal' : 'native';
  }
  return config;
}
