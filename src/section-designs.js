import { designs } from './designs.js';

// One coordinated system for every section. Functional code stays native on
// GitHub; these presets control its masthead, context and surrounding layout.
export const sectionDesigns = {
  canvas: {
    name: 'Canvas',
    heading: 'accent',
    features: 'bento',
    comparison: 'table',
    metrics: 'strip',
    timeline: 'rail',
    links: 'buttons',
    media: 'plain',
    gallery: 'strip',
    steps: 'ordered',
    code: 'native',
  },
  console: {
    name: 'Console',
    heading: 'prompt',
    features: 'terminal-grid',
    comparison: 'reference',
    metrics: 'scoreboard',
    timeline: 'checklist',
    links: 'index',
    media: 'plain',
    gallery: 'stack',
    steps: 'ordered',
    code: 'native',
  },
  journal: {
    name: 'Journal',
    heading: 'folio',
    features: 'lattice',
    comparison: 'definitions',
    metrics: 'columns',
    timeline: 'rail',
    links: 'inline',
    media: 'plain',
    gallery: 'stack',
    steps: 'ordered',
    code: 'native',
  },
  pipeline: {
    name: 'Pipeline',
    heading: 'rail',
    features: 'rows',
    comparison: 'matrix',
    metrics: 'scoreboard',
    timeline: 'rail',
    links: 'inline',
    media: 'plain',
    gallery: 'strip',
    steps: 'ordered',
    code: 'native',
  },
};
export function sectionDesign(config, block = {}) {
  return sectionDesigns[block.design || config.design];
}

export function sectionAnchors(blocks) {
  const anchors = new Map(),
    counts = new Map();
  for (const block of blocks) {
    if (!block.title || ['hero', 'toc'].includes(block.type)) continue;
    const stem =
      block.title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .trim()
        .replace(/\s+/g, '-') || 'section';
    const count = counts.get(stem) || 0;
    counts.set(stem, count + 1);
    anchors.set(block.id, stem + (count ? '-' + count : ''));
  }
  return anchors;
}
export function styleSection(block, design) {
  if (!sectionDesigns[design]) throw new Error('Unknown section design.');
  const styled = structuredClone(block),
    layout = sectionDesigns[design][block.type];
  styled.design = design;
  if (layout) styled.layout = layout;
  // Diagrams keep their actual topology. Their visual treatment follows the
  // system, never a replacement flow with a different meaning.
  return styled;
}
export function sectionVariants(section) {
  return Object.fromEntries(
    Object.entries(sectionDesigns).map(([id, style]) => [
      id,
      {
        name: style.name,
        heading: style.heading,
        font: designs[id].font,
        content:
          section === 'features'
            ? style.features
            : ['configuration', 'data'].includes(section)
              ? style.comparison
              : section === 'benchmarks'
                ? style.metrics
                : section === 'roadmap'
                  ? style.timeline
                  : section === 'architecture'
                    ? id + '-diagram'
                    : section === 'demo'
                      ? style.media
                      : ['quickstart', 'api'].includes(section)
                        ? 'native-code'
                        : section === 'faq'
                          ? 'native-disclosures'
                          : 'native-text',
      },
    ]),
  );
}
