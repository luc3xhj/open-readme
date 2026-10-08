import { readFile, writeFile, mkdir, copyFile, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  render,
  schema,
  designs,
  createStarter,
  createComposition,
  compositionReferences,
} from '../src/index.js';
import { renderSvg } from '../src/svg.js';
import { samples, sampleBlocks } from './samples.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const packageVersion = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')).version;
async function output(config, folder) {
  const result = render(config);
  await rm(resolve(folder, 'assets/open-readme'), { recursive: true, force: true });
  await mkdir(resolve(folder, 'assets/open-readme'), { recursive: true });
  await writeFile(resolve(folder, 'README.md'), result.markdown);
  for (const [name, svg] of result.assets)
    await writeFile(resolve(folder, 'assets/open-readme', name), svg);
  if (config.blocks.some((b) => ['media', 'gallery'].includes(b.type)))
    for (const file of ['demo.svg', 'demo-editorial.svg'])
      await copyFile(resolve(root, 'assets', file), resolve(folder, 'assets', file));
}
const config = JSON.parse(await readFile(resolve(root, 'open-readme.json'), 'utf8'));
// Curated examples render in nested folders and downloadable bundles. Their
// documentation links must keep pointing to this project's actual source.
const exampleLinks = (value) => {
  if (typeof value === 'string')
    return value.replace(
      /\]\(\.\/([^\s)]+)\)/g,
      '](' + 'https://github.com/luc3xhj/open-readme/blob/main/$1)',
    );
  if (Array.isArray(value)) return value.map(exampleLinks);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        key === 'url' && typeof item === 'string' && item.startsWith('./')
          ? 'https://github.com/luc3xhj/open-readme/blob/main/' + item.slice(2)
          : exampleLinks(item),
      ]),
    );
  return value;
};
const completeDesigns = Object.entries(compositionReferences).map(([id, info]) => {
  const composed = exampleLinks(createComposition(config, id)),
    hero = composed.blocks.find((b) => b.type === 'hero');
  const start = composed.blocks.find((b) => b.id === 'quickstart');
  start.code = start.code.replace('--design canvas', '--design ' + id);
  if (id === 'console') {
    hero.previewLabel = 'FILES AFTER RENDER';
    hero.preview = 'README.preview.md\nassets/open-readme/\n  hero-light.svg\n  hero-dark.svg';
    hero.command = 'open-readme render --out README.preview.md';
  } else if (id === 'journal') {
    delete hero.preview;
    delete hero.previewLabel;
    hero.headline = 'The useful parts.\nCarefully composed.';
    hero.meta = 'An open-source field guide';
  } else if (id === 'pipeline') {
    hero.preview = 'open-readme.json\nREADME.md\nSVG assets';
    hero.previewLabel = 'INPUT / OUTPUT';
  }
  return { id, ...info, config: composed };
});
await mkdir(resolve(root, 'docs/lib'), { recursive: true });
await mkdir(resolve(root, 'docs/examples'), { recursive: true });
await mkdir(resolve(root, 'docs/assets'), { recursive: true });
await mkdir(resolve(root, 'assets'), { recursive: true });
for (const [file, design] of [
  ['demo.svg', 'blueprint'],
  ['demo-editorial.svg', 'editorial'],
]) {
  const cfg = { ...config, design, theme: designs[design].theme };
  const data = renderSvg(sampleBlocks.hero, cfg);
  await writeFile(resolve(root, 'assets', file), data);
  await writeFile(resolve(root, 'docs/assets', file), data);
}
await output(config, root);
await mkdir(resolve(root, 'examples/designs'), { recursive: true });
for (const design of completeDesigns) {
  await writeFile(
    resolve(root, 'examples/designs', design.id + '.json'),
    JSON.stringify(design.config, null, 2) + '\n',
  );
  await output(design.config, resolve(root, 'examples/designs', design.id));
}
for (const file of await readdir(resolve(root, 'src')))
  if (file.endsWith('.js')) {
    const source = await readFile(resolve(root, 'src', file), 'utf8');
    await writeFile(
      resolve(root, 'docs/lib', file),
      source.replace(/(from\s+['"])(\.\/[^'"]+\.js)(['"])/g, `$1$2?v=${packageVersion}$3`),
    );
  }
await writeFile(resolve(root, 'schema.json'), JSON.stringify(schema, null, 2) + '\n');
await copyFile(resolve(root, 'schema.json'), resolve(root, 'docs/schema.json'));
await writeFile(
  resolve(root, 'docs/examples/catalog.json'),
  JSON.stringify(samples, null, 2) + '\n',
);
await writeFile(
  resolve(root, 'docs/examples/designs.json'),
  JSON.stringify(completeDesigns, null, 2) + '\n',
);
const sampler = {
  version: 1,
  project: 'cli',
  design: 'swiss',
  theme: 'minimal',
  style: { density: 'compact' },
  blocks: Object.values(sampleBlocks).map((b) => structuredClone(b)),
};
sampler.blocks.find((b) => b.type === 'features').layout = 'columns';
sampler.blocks.find((b) => b.type === 'metrics').layout = 'strip';
sampler.blocks.find((b) => b.type === 'diagram').layout = 'flow';
await writeFile(resolve(root, 'examples/components.json'), JSON.stringify(sampler, null, 2) + '\n');
await writeFile(
  resolve(root, 'examples/starter.json'),
  JSON.stringify(createStarter(), null, 2) + '\n',
);
const examples = {
  repository: 'open-readme.json',
  directory: 'examples/startup-accelerators.json',
  components: 'examples/components.json',
};
for (const [name, path] of Object.entries(examples))
  await copyFile(resolve(root, path), resolve(root, 'docs/examples', name + '.json'));
await rm(resolve(root, 'examples/rendered'), { recursive: true, force: true });
for (const design of Object.keys(designs))
  await output(
    { ...config, design, theme: designs[design].theme },
    resolve(root, 'examples/rendered', design),
  );
for (const sample of samples)
  await output(sample.config, resolve(root, 'examples/components', sample.id));
await output(
  JSON.parse(await readFile(resolve(root, 'examples/startup-accelerators.json'), 'utf8')),
  resolve(root, 'examples/rendered/startup-accelerators'),
);
await writeFile(resolve(root, 'docs/.nojekyll'), '');
console.log(
  `Built ${samples.length} component examples, ${completeDesigns.length} complete README designs, README, schema and browser library.`,
);
