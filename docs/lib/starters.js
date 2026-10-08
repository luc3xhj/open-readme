import { designs } from './designs.js';
import { projects } from './sections.js';
export function createStarter(project = 'cli', design = 'plain', name = 'Your project') {
  if (!projects[project])
    throw new Error('Unknown project type. Choose: ' + Object.keys(projects).join(', '));
  if (!designs[design])
    throw new Error('Unknown design. Choose: ' + Object.keys(designs).join(', '));
  const content = {
    overview: {
      id: 'overview',
      type: 'hero',
      section: 'overview',
      title: name,
      subtitle: 'Replace with one factual sentence: what the project does and who uses it.',
      eyebrow: 'OPEN SOURCE',
    },
    quickstart: {
      id: 'quickstart',
      type: 'code',
      section: 'quickstart',
      title: 'Quick start',
      language: 'sh',
      code: '# Replace with verified installation and first-run commands.',
    },
    usage: {
      id: 'usage',
      type: 'code',
      section: 'usage',
      title: 'Usage',
      language: project === 'library' ? 'js' : 'sh',
      code: '# Replace with a real task and its expected result.',
    },
    api: {
      id: 'api',
      type: 'comparison',
      section: 'api',
      title: 'API',
      columns: ['Input', 'Output', 'Notes'],
      rows: [
        ['Replace with an actual API', 'Document its return value', 'Link to detailed reference'],
      ],
    },
    data: {
      id: 'data',
      type: 'markdown',
      section: 'data',
      title: 'Data & methodology',
      body: 'Document sources, collection method, snapshot date, scope and limitations. Link to the actual data files.',
    },
    credits: {
      id: 'credits',
      type: 'markdown',
      section: 'credits',
      title: 'Credits & citation',
      body: 'Credit the actual authors and sources. Add a verified citation if applicable.',
    },
    license: {
      id: 'license',
      type: 'markdown',
      section: 'license',
      title: 'License',
      body: 'State the repository’s actual license and link to its LICENSE file. Do not assume a license.',
    },
  };
  return {
    version: 1,
    project,
    design,
    theme: designs[design].theme,
    style: { density: 'compact' },
    blocks: projects[project].essential.map((id) => content[id]),
  };
}
