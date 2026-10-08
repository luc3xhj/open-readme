import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { render, createZip } from '../src/index.js';
const config = JSON.parse(
  await readFile(new URL('../examples/components.json', import.meta.url), 'utf8'),
);
const result = render(config),
  files = new Map([['README.md', result.markdown]]);
for (const [name, content] of result.assets) files.set('assets/open-readme/' + name, content);
for (const file of ['demo.svg', 'demo-editorial.svg'])
  files.set(
    'assets/' + file,
    await readFile(new URL('../assets/' + file, import.meta.url), 'utf8'),
  );
files.set('中文.txt', 'Unicode filenames work.');
await mkdir('.work', { recursive: true });
await writeFile('.work/smoke.zip', createZip(files));
