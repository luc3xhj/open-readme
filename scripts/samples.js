import { variants, designs } from '../src/index.js';
import { readFile } from 'node:fs/promises';
const project = JSON.parse(await readFile(new URL('../open-readme.json', import.meta.url), 'utf8'));
const repo = 'https://github.com/luc3xhj/open-readme';
export const sampleBlocks = {
  hero: {
    id: 'hero',
    type: 'hero',
    section: 'overview',
    title: 'open-readme',
    subtitle: 'A component library for GitHub READMEs. Built for coding agents.',
    eyebrow: 'MERIDIAN STARTUPS / OPEN SOURCE',
    mark: 'or',
    command: 'open-readme render --out README.preview.md',
    meta: 'Markdown + SVG',
  },
  badges: {
    id: 'status',
    type: 'badges',
    items: [
      { label: 'license', value: 'MIT', url: repo + '/blob/main/LICENSE' },
      { label: 'runtime', value: 'Node 22+' },
      { label: 'deps', value: '0' },
    ],
  },
  links: {
    id: 'navigation',
    type: 'links',
    items: [
      { label: 'Playground', url: 'https://luc3xhj.github.io/open-readme/' },
      { label: 'Agent skill', url: repo + '/tree/main/skills/open-readme' },
      { label: 'Docs', url: repo + '/blob/main/docs/configuration.md' },
    ],
  },
  features: {
    id: 'features',
    type: 'features',
    section: 'features',
    title: 'Choose what helps the reader',
    items: [
      {
        title: 'Compose',
        description: 'Choose components for the sections your project actually needs.',
      },
      {
        title: 'Customize',
        description: 'Edit layout, accent, density and content in one JSON config.',
      },
      { title: 'Export', description: 'Keep Markdown and SVG assets in your own repository.' },
    ],
  },
  code: {
    id: 'quickstart',
    type: 'code',
    section: 'quickstart',
    title: 'Quick start',
    language: 'sh',
    filename: 'terminal',
    code: 'npm install --save-dev github:luc3xhj/open-readme#v0.2.2\nnpx open-readme init --design swiss\nnpx open-readme render --out README.preview.md',
    highlight: [3],
  },
  codegroup: {
    id: 'install-methods',
    type: 'codegroup',
    section: 'quickstart',
    title: 'Choose an installation method',
    items: [
      {
        label: 'Install in your project',
        language: 'sh',
        code: 'npm install --save-dev github:luc3xhj/open-readme#v0.2.2',
      },
      {
        label: 'Work from source',
        language: 'sh',
        code: 'git clone https://github.com/luc3xhj/open-readme.git\ncd open-readme\nnode bin/open-readme.js --help',
      },
    ],
  },
  steps: {
    id: 'workflow',
    type: 'steps',
    section: 'usage',
    title: 'From your project to a README',
    items: [
      { title: 'Inspect', description: 'Read the repository and keep verified facts.' },
      { title: 'Compose', description: 'Choose sections, components and variants.' },
      { title: 'Render', description: 'Export a preview with local assets.' },
    ],
  },
  comparison: {
    id: 'formats',
    type: 'comparison',
    section: 'compatibility',
    title: 'Pick the output that fits',
    columns: ['Format', 'Best for', 'Interaction'],
    rows: [
      ['Markdown', 'Commands, prose and tables', 'Copy, search, anchor links'],
      ['SVG', 'Headers, diagrams and visual data', 'Links and automatic light / dark'],
      ['HTML', 'Screenshots and FAQ', 'Images and expandable details'],
    ],
  },
  diagram: {
    id: 'architecture',
    type: 'diagram',
    section: 'architecture',
    title: 'How the output is built',
    center: 'README',
    items: [
      { title: 'Config', description: 'Project facts + components' },
      { title: 'Renderer', description: 'Validate and compose' },
      { title: 'Markdown', description: 'Readable, copyable content' },
      { title: 'SVG assets', description: 'Local visual components' },
    ],
  },
  metrics: {
    id: 'catalog-size',
    type: 'metrics',
    section: 'benchmarks',
    title: 'The component catalog',
    items: [
      {
        value: String(Object.keys(variants).length),
        label: 'component types',
        source: repo + '/blob/main/src/variants.js',
      },
      {
        value: String(Object.values(variants).flat().length),
        label: 'component variants',
        source: repo + '/blob/main/src/variants.js',
      },
      {
        value: String(Object.keys(designs).length),
        label: 'header designs',
        source: repo + '/blob/main/src/designs.js',
      },
    ],
    caption: 'Counts describe this release’s catalog; these are not fetched GitHub statistics.',
  },
  timeline: {
    id: 'roadmap',
    type: 'timeline',
    section: 'roadmap',
    title: 'Build status',
    items: [
      {
        title: 'Local renderer & CLI',
        description: 'JSON validation and portable export are implemented.',
        status: 'shipped',
      },
      {
        title: 'Component gallery',
        description: 'Preview, customize and export individual components.',
        status: 'shipped',
      },
      {
        title: 'Dynamic data adapters',
        description: 'A future extension; not included in this release.',
        status: 'planned',
      },
    ],
  },
  media: {
    id: 'demo',
    type: 'media',
    section: 'demo',
    title: 'A component, rendered',
    src: './assets/demo.svg',
    alt: 'A Blueprint header generated by open-readme',
    url: 'https://luc3xhj.github.io/open-readme/',
    caption: 'Replace this example with your real screenshot, GIF or demo image.',
  },
  gallery: {
    id: 'screenshots',
    type: 'gallery',
    section: 'demo',
    title: 'Two header compositions',
    items: [
      { src: './assets/demo.svg', alt: 'Blueprint header' },
      { src: './assets/demo-editorial.svg', alt: 'Editorial header' },
    ],
  },
  details: {
    id: 'faq',
    type: 'details',
    section: 'faq',
    summary: 'Do I need a hosted image service?',
    markdown:
      'No. Generated SVG assets live in your repository alongside README.md. Commit both together.',
  },
  callout: {
    id: 'requirements',
    type: 'callout',
    section: 'compatibility',
    kind: 'note',
    body: 'Requires Node.js 22 or newer. The renderer has no runtime dependencies.',
  },
  markdown: {
    id: 'license',
    type: 'markdown',
    section: 'license',
    title: 'License',
    body: 'MIT. See [LICENSE](https://github.com/luc3xhj/open-readme/blob/main/LICENSE).',
  },
  toc: { id: 'contents', type: 'toc', title: 'On this page' },
};
export const samples = Object.entries(variants).flatMap(([type, layouts]) =>
  layouts.map((layout) => {
    const block = structuredClone(sampleBlocks[type]);
    if (type === 'features')
      Object.assign(block, structuredClone(project.blocks.find((b) => b.type === 'features')));
    if (type === 'hero' && ['canvas', 'console', 'journal', 'pipeline'].includes(layout)) {
      Object.assign(block, structuredClone(project.blocks.find((b) => b.type === 'hero')));
      if (layout === 'console') {
        block.preview = 'README.preview.md\nassets/open-readme/\n  hero-light.svg\n  hero-dark.svg';
        block.previewLabel = 'FILES AFTER RENDER';
      }
      if (layout === 'journal') {
        delete block.preview;
        delete block.previewLabel;
      }
      if (layout === 'pipeline') {
        block.preview = 'open-readme.json\nREADME.md\nSVG assets';
      }
    }
    if (type === 'diagram' && layout === 'hub') {
      block.title = 'A reader’s route through the README';
      block.center = 'README';
      block.items = [
        { title: 'Demo', description: 'Show the result' },
        { title: 'Quick start', description: 'Get running' },
        { title: 'Usage', description: 'Complete a task' },
        { title: 'License', description: 'Know the terms' },
      ];
    }
    if (type === 'hero') {
    } else if (layouts.length > 1) block.layout = layout;
    const design = type === 'hero' ? layout : 'plain';
    const config = {
      version: 1,
      project: 'cli',
      design,
      theme: designs[design].theme,
      style: { density: 'compact' },
      blocks:
        type === 'toc'
          ? [block, structuredClone(sampleBlocks.code), structuredClone(sampleBlocks.markdown)]
          : [block],
    };
    return { id: type + '-' + layout, type, variant: layout, config };
  }),
);
