export const sections = {
  overview: {
    name: 'Overview',
    question: 'What is it, who is it for, and why would I use it?',
    blocks: ['hero', 'markdown'],
    priority: 'essential',
  },
  demo: {
    name: 'Demo',
    question: 'What does it actually look like or produce?',
    blocks: ['media', 'code', 'links'],
    priority: 'recommended for visual products',
  },
  quickstart: {
    name: 'Quick start',
    question: 'What is the shortest verified path to a working result?',
    blocks: ['code', 'steps'],
    priority: 'essential for software',
  },
  features: {
    name: 'Features',
    question: 'Which concrete capabilities distinguish the project?',
    blocks: ['features', 'comparison'],
    priority: 'optional',
  },
  usage: {
    name: 'Usage',
    question: 'How do I complete a real task after installation?',
    blocks: ['code', 'steps', 'markdown'],
    priority: 'essential for software',
  },
  configuration: {
    name: 'Configuration',
    question: 'Which options do I need, with defaults and examples?',
    blocks: ['comparison', 'code', 'details'],
    priority: 'when configurable',
  },
  api: {
    name: 'API reference',
    question: 'What are the public inputs, outputs and errors?',
    blocks: ['code', 'comparison', 'links'],
    priority: 'for libraries and APIs',
  },
  architecture: {
    name: 'Architecture',
    question: 'How do the parts fit together?',
    blocks: ['diagram', 'markdown', 'code'],
    priority: 'when it helps understanding',
  },
  compatibility: {
    name: 'Requirements & limits',
    question: 'Which versions, platforms and limitations matter?',
    blocks: ['callout', 'comparison', 'details'],
    priority: 'recommended',
  },
  benchmarks: {
    name: 'Results & benchmarks',
    question: 'What measured evidence exists, with source and method?',
    blocks: ['metrics', 'comparison', 'media'],
    priority: 'only with evidence',
  },
  data: {
    name: 'Data & methodology',
    question: 'Where is the data, how was it collected, and when?',
    blocks: ['comparison', 'markdown', 'links'],
    priority: 'for datasets and directories',
  },
  roadmap: {
    name: 'Roadmap',
    question: 'What is shipped, in progress and planned?',
    blocks: ['timeline', 'markdown'],
    priority: 'only if maintained',
  },
  faq: {
    name: 'FAQ & troubleshooting',
    question: 'Which recurring blockers have a useful answer?',
    blocks: ['details', 'callout'],
    priority: 'when needed',
  },
  contributing: {
    name: 'Contributing',
    question: 'How can someone report a problem or contribute?',
    blocks: ['markdown', 'links'],
    priority: 'for collaborative projects',
  },
  credits: {
    name: 'Credits & citation',
    question: 'Who should be credited and how should the work be cited?',
    blocks: ['markdown', 'code', 'links'],
    priority: 'when applicable',
  },
  license: {
    name: 'License',
    question: 'What can people use, modify and redistribute?',
    blocks: ['markdown', 'links'],
    priority: 'essential for open source',
  },
};
export const projects = {
  cli: {
    name: 'CLI / developer tool',
    essential: ['overview', 'quickstart', 'usage', 'license'],
    recommended: ['features', 'configuration', 'compatibility', 'contributing'],
  },
  library: {
    name: 'Library / SDK',
    essential: ['overview', 'quickstart', 'usage', 'api', 'license'],
    recommended: ['compatibility', 'contributing'],
  },
  application: {
    name: 'Application',
    essential: ['overview', 'quickstart', 'usage', 'license'],
    recommended: ['demo', 'features', 'configuration', 'compatibility', 'contributing'],
  },
  directory: {
    name: 'Directory / dataset',
    essential: ['overview', 'data', 'usage', 'license'],
    recommended: ['compatibility', 'contributing'],
  },
  research: {
    name: 'Research',
    essential: ['overview', 'quickstart', 'data', 'credits', 'license'],
    recommended: ['benchmarks', 'architecture', 'compatibility'],
  },
  profile: {
    name: 'Profile / portfolio',
    essential: ['overview'],
    recommended: ['features', 'credits'],
  },
};
export function auditConfig(config) {
  const present = new Set(config.blocks.map((block) => block.section).filter(Boolean));
  const profile = projects[config.project || 'cli'];
  return {
    project: config.project || 'cli',
    present: [...present],
    missing: profile.essential.filter((section) => !present.has(section)),
    recommended: profile.recommended.filter((section) => !present.has(section)),
    notes: config.blocks.some((block) => block.type === 'metrics')
      ? ['Metrics are supplied values. Keep the source and measurement date in the README.']
      : [],
  };
}
