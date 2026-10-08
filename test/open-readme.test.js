import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, readdir, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { render, validateConfig, updateSection, themes, createZip } from '../src/index.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = JSON.parse(await readFile(resolve(root, 'examples/components.json'), 'utf8'));
const cli = (cwd, ...args) =>
  spawnSync(process.execPath, [resolve(root, 'bin/open-readme.js'), ...args], {
    cwd,
    encoding: 'utf8',
  });
async function workspace(t) {
  const dir = await mkdtemp(join(tmpdir(), 'open-readme-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await writeFile(join(dir, 'open-readme.json'), JSON.stringify(fixture));
  await mkdir(join(dir, 'assets'));
  for (const file of ['demo.svg', 'demo-editorial.svg'])
    await writeFile(join(dir, 'assets', file), await readFile(resolve(root, 'assets', file)));
  return dir;
}

test('every palette renders all component types and resolves every generated image', () => {
  for (const theme of Object.keys(themes)) {
    const { markdown, assets } = render({ ...fixture, theme });
    assert.ok(assets.size > 0);
    for (const match of markdown.matchAll(/(?:src|srcset)="assets\/open-readme\/([^"]+)"/g))
      assert.ok(assets.has(match[1]));
    assert.ok(markdown.includes('<details>'));
    assert.ok(markdown.includes('```sh'));
    assert.ok([...assets.keys()].some((name) => name.includes('-dark-mobile')));
    assert.deepEqual(render({ ...fixture, theme }).assets, assets);
  }
});
test('SVG user text is escaped, including script-like strings', () => {
  const config = structuredClone(fixture);
  config.blocks[0].title = '<script>bad & "quoted"</script>';
  const { assets } = render(config);
  for (const svg of assets.values()) {
    assert.ok(!svg.includes('<script>'));
    assert.ok(!svg.includes('<foreignObject'));
    assert.ok(!svg.includes('href="http'));
  }
  assert.ok(assets.get('hero-light.svg').includes('&lt;script&gt;'));
});
test('validation rejects unsafe links, duplicate filenames and unknown fields', () => {
  const config = structuredClone(fixture);
  config.blocks[0].url = 'javascript:alert(1)';
  config.blocks[1].id = 'hero';
  config.style = { accent: 'red" onload="alert(1)', spacing: 22 };
  const paths = validateConfig(config).map((e) => e.path);
  assert.ok(paths.includes('$.blocks[0].url'));
  assert.ok(paths.includes('$.blocks[1].id'));
  assert.ok(paths.includes('$.style.accent'));
  assert.ok(paths.includes('$.style.spacing'));
  config.blocks[0].id = '../overwrite';
  assert.throws(() => render(config));
});
test('validation handles malformed arrays, root values and table shapes', () => {
  for (const value of [null, [], 'text', { version: 1, theme: 'terminal', blocks: [null] }])
    assert.ok(validateConfig(value).length);
  const config = structuredClone(fixture);
  config.blocks.find((b) => b.type === 'comparison').rows[0].pop();
  assert.ok(validateConfig(config).some((e) => e.path.endsWith('.rows[0]')));
});
test('code fences preserve nested backticks and Markdown labels remain literal', () => {
  const config = {
    version: 1,
    theme: 'minimal',
    blocks: [
      {
        id: 'code',
        type: 'code',
        title: 'A | [literal]',
        language: 'md',
        code: '```js\nconsole.log(1)\n```',
      },
    ],
  };
  const { markdown } = render(config);
  assert.ok(markdown.includes('````md\n```js'));
  assert.ok(markdown.includes('A \\| \\[literal\\]'));
});
test('long words and CJK strings receive dynamic-height SVG layouts', () => {
  const config = {
    version: 1,
    theme: 'editorial',
    blocks: [
      {
        id: 'header',
        type: 'hero',
        title: '给创业者和开发者的开源设计工具'.repeat(6),
        subtitle: 'A'.repeat(200),
      },
    ],
  };
  const { assets } = render(config);
  const mobile = assets.get('header-light-mobile.svg');
  const desktop = assets.get('header-light.svg');
  const height = (svg) => Number(svg.match(/height="(\d+(?:\.\d+)?)"/)[1]);
  assert.ok(height(mobile) > height(desktop));
  assert.ok(height(mobile) > 250);
});
test('section updates preserve manual content and reject broken markers', () => {
  const old =
    'Manual intro\n\n<!-- open-readme:design:start -->\nold\n<!-- open-readme:design:end -->\n\nManual footer\n';
  const updated = updateSection(old, 'new');
  assert.ok(updated.startsWith('Manual intro\n\n'));
  assert.ok(updated.endsWith('\n\nManual footer\n'));
  assert.ok(!updated.includes('\nold\n'));
  assert.throws(() => updateSection('<!-- open-readme:design:start -->', 'x'));
  assert.throws(() => updateSection(old + old, 'x'));
});
test('CLI produces portable assets and machine-readable results', async (t) => {
  const dir = await workspace(t);
  const result = cli(
    dir,
    'render',
    '--out',
    'nested/README.md',
    '--assets',
    'images with spaces',
    '--json',
  );
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(JSON.parse(result.stdout).ok, true);
  const check = cli(dir, 'check', '--readme', 'nested/README.md', '--json');
  assert.equal(check.status, 0, check.stdout);
  const readme = await readFile(join(dir, 'nested/README.md'), 'utf8');
  assert.ok(readme.includes('images%20with%20spaces/'));
  const missing = JSON.parse(result.stdout).assets[0];
  await rm(join(dir, 'nested/images with spaces', missing));
  assert.equal(cli(dir, 'check', '--readme', 'nested/README.md', '--json').status, 1);
});
test('CLI overwrite refusal preserves existing README and creates no partial assets', async (t) => {
  const dir = await workspace(t);
  await writeFile(join(dir, 'README.md'), 'Handwritten content');
  const result = cli(dir, 'render', '--json');
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).ok, false);
  assert.equal(await readFile(join(dir, 'README.md'), 'utf8'), 'Handwritten content');
  assert.deepEqual((await readdir(join(dir, 'assets'))).sort(), ['demo-editorial.svg', 'demo.svg']);
});
test('single-block section mode preserves a handwritten file and is idempotent', async (t) => {
  const dir = await workspace(t);
  await writeFile(join(dir, 'README.md'), 'Manual text\n');
  const args = ['render', '--block', 'hero', '--section', 'header', '--json'];
  assert.equal(cli(dir, ...args).status, 0);
  const initial = await readFile(join(dir, 'README.md'), 'utf8');
  assert.ok(initial.startsWith('Manual text\n\n'));
  assert.equal(cli(dir, ...args).status, 0);
  assert.equal(await readFile(join(dir, 'README.md'), 'utf8'), initial);
});
test('CLI flags and invalid configs fail with useful JSON, not stack traces', async (t) => {
  const dir = await workspace(t);
  const result = cli(dir, 'render', '--theem', 'minimal', '--json');
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).ok, false);
  await writeFile(join(dir, 'open-readme.json'), '{invalid');
  assert.equal(cli(dir, 'check', '--json').status, 1);
  assert.ok(!cli(dir, 'check', '--json').stdout.includes('at file:'));
});
test('ZIP export uses UTF-8 filenames and refuses traversal', async (t) => {
  const dir = await workspace(t),
    bytes = createZip(
      new Map([
        ['README.md', 'hello'],
        ['素材/hero.svg', '<svg/>'],
      ]),
    );
  await writeFile(join(dir, 'bundle.zip'), bytes);
  assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x04034b50);
  assert.equal(new DataView(bytes.buffer).getUint16(6, true), 0x800);
  assert.throws(() => createZip(new Map([['../evil', 'no']])));
  // Node's test suite stays platform-independent; ZIP CRC/contents are also
  // checked by the release workflow's Python standard-library smoke test.
});

test('all public component variants validate and export deterministic assets', async () => {
  const { samples } = await import('../scripts/samples.js');
  const { variants } = await import('../src/index.js');
  assert.equal(samples.length, Object.values(variants).flat().length);
  const seen = new Set();
  for (const sample of samples) {
    assert.deepEqual(validateConfig(sample.config), [], sample.id);
    const result = render(sample.config);
    assert.ok(result.markdown.length > 30, sample.id);
    assert.deepEqual(render(sample.config), result, sample.id);
    for (const [name, svg] of result.assets) {
      assert.ok(svg.startsWith('<svg'), sample.id + '/' + name);
      assert.ok(!svg.includes('undefined'), sample.id + '/' + name);
      assert.ok(!/<script|foreignObject|onload=/.test(svg));
    }
    seen.add(sample.type);
  }
  assert.equal(seen.size, 17);
});
test('project starters expose essential sections; audit reports a removed license', async () => {
  const { createStarter, projects, auditConfig } = await import('../src/index.js');
  for (const type of Object.keys(projects)) {
    const config = createStarter(type, 'swiss', 'Real project');
    assert.deepEqual(validateConfig(config), []);
    assert.deepEqual(auditConfig(config).missing, []);
    if (type !== 'profile') {
      config.blocks = config.blocks.filter((b) => b.section !== 'license');
      assert.deepEqual(auditConfig(config).missing, ['license']);
    }
  }
  assert.throws(() => createStarter('invented'));
});
test('native components remain selectable and disclosure code is exact', () => {
  const config = {
    version: 1,
    theme: 'minimal',
    design: 'plain',
    blocks: [
      {
        id: 'features',
        type: 'features',
        layout: 'native',
        items: [{ title: 'Export', description: 'Keeps your code copyable.' }],
      },
      {
        id: 'methods',
        type: 'codegroup',
        items: [
          { label: 'npm', language: 'sh', code: 'npm install exact-package' },
          { label: 'bun', language: 'sh', code: 'bun add exact-package' },
        ],
      },
      { id: 'note', type: 'callout', kind: 'note', body: 'Requires a documented runtime.' },
    ],
  };
  const result = render(config);
  assert.equal(result.assets.size, 0);
  assert.ok(result.markdown.includes('- **Export**'));
  assert.ok(result.markdown.includes('<details open>'));
  assert.ok(result.markdown.includes('```sh\nnpm install exact-package\n```'));
  assert.ok(result.markdown.includes('> [!NOTE]'));
});
test('contents links distinguish duplicate headings and support CJK', () => {
  const config = {
    version: 1,
    theme: 'minimal',
    blocks: [
      { id: 'toc', type: 'toc' },
      { id: 'a', type: 'markdown', title: '使用方法', body: 'First.' },
      { id: 'b', type: 'markdown', title: '使用方法', body: 'Second.' },
    ],
  };
  const text = render(config).markdown;
  assert.ok(text.includes('#使用方法>'));
  assert.ok(text.includes('#使用方法-1>'));
});
test('CLI exposes component variants and creates a project-specific starter', async (t) => {
  const dir = await workspace(t),
    result = cli(dir, 'catalog', '--json');
  assert.equal(JSON.parse(result.stdout).data.diagram.variants.length, 4);
  const created = cli(
    dir,
    'init',
    '--project',
    'library',
    '--design',
    'blueprint',
    '--config',
    'library.json',
    '--json',
  );
  assert.equal(created.status, 0, created.stdout);
  const config = JSON.parse(await readFile(join(dir, 'library.json'), 'utf8'));
  assert.equal(config.design, 'blueprint');
  assert.ok(config.blocks.some((b) => b.section === 'api'));
  const audit = cli(dir, 'audit', '--config', 'library.json', '--json');
  assert.deepEqual(JSON.parse(audit.stdout).data.missing, []);
});

test('component styling overrides the composition without changing siblings', () => {
  const config = {
    version: 1,
    theme: 'minimal',
    design: 'swiss',
    style: { accent: '#113355' },
    blocks: [
      {
        id: 'a',
        type: 'metrics',
        style: { accent: '#cc5533' },
        layout: 'scoreboard',
        items: [{ label: 'Value', value: '7' }],
      },
      { id: 'b', type: 'metrics', layout: 'scoreboard', items: [{ label: 'Value', value: '8' }] },
    ],
  };
  const { assets } = render(config);
  assert.ok(assets.get('a-light.svg').includes('#cc5533'));
  assert.ok(assets.get('b-light.svg').includes('#113355'));
  assert.ok(!assets.get('b-light.svg').includes('#cc5533'));
});

test('complete compositions preserve facts, source code and diagram relationships', async () => {
  const { createComposition, compositionReferences } = await import('../src/index.js');
  const base = JSON.parse(await readFile(resolve(root, 'open-readme.json'), 'utf8'));
  const before = structuredClone(base);
  for (const id of Object.keys(compositionReferences)) {
    const composed = createComposition(base, id);
    assert.deepEqual(validateConfig(composed), []);
    assert.deepEqual(
      composed.blocks.map((b) => b.id),
      base.blocks.map((b) => b.id),
    );
    for (let i = 0; i < base.blocks.length; i++) {
      const { layout: a, ...original } = base.blocks[i];
      const { layout: b, ...changed } = composed.blocks[i];
      assert.deepEqual(changed, original);
      if (original.type === 'diagram') assert.equal(b, a);
    }
    assert.notEqual(render(composed).assets.get('hero-light.svg'), '');
  }
  assert.deepEqual(base, before);
});

test('illustrated previews preserve exact full source in native disclosures', () => {
  const preview = '# A real project\n' + 'Exact source with `ticks` and <tags>.\n'.repeat(30);
  const command = 'node tool.js --output ./README.preview.md --format markdown';
  const config = {
    version: 1,
    theme: 'minimal',
    design: 'canvas',
    blocks: [
      { id: 'hero', type: 'hero', title: 'Project', subtitle: 'A real demo.', preview },
      {
        id: 'features',
        type: 'features',
        layout: 'bento',
        items: [{ title: 'Run', description: 'Actual command.', visual: 'code', example: command }],
      },
    ],
  };
  const { markdown } = render(config);
  assert.ok(markdown.includes(preview));
  assert.ok(markdown.includes(command));
  assert.ok(markdown.includes('<summary>Preview source</summary>'));
  assert.ok(markdown.includes('<summary>Feature examples</summary>'));
});

test('long composed previews and beam labels remain inside SVG height', () => {
  const config = {
    version: 1,
    theme: 'minimal',
    design: 'canvas',
    style: { width: 640 },
    blocks: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Project',
        subtitle: 'Actual project.',
        preview: 'A very long preview line '.repeat(35),
      },
      {
        id: 'features',
        type: 'features',
        layout: 'bento',
        items: [
          {
            title: 'Flow',
            description: 'Actual ordered labels.',
            visual: 'flow',
            example: Array(3).fill('给开发者使用的实际输入和输出文件'.repeat(4)).join(' → '),
          },
          {
            title: 'Palette',
            description: 'Actual config.',
            visual: 'palette',
            example: '#6657D8\n' + 'a very long configuration line '.repeat(15),
          },
          {
            title: 'Output',
            description: 'Actual files.',
            visual: 'files',
            example: 'README.md\nassets/open-readme/hero.svg',
          },
        ],
      },
      {
        id: 'diagram',
        type: 'diagram',
        layout: 'beam',
        items: Array.from({ length: 6 }, (_, i) => ({
          title: 'Output ' + i + ' ' + '实际文件名称'.repeat(12),
          description: 'Actual source description. '.repeat(5),
        })),
      },
    ],
  };
  for (const [name, svg] of render(config).assets) {
    const height = Number(svg.match(/height="([\d.]+)"/)[1]);
    for (const text of svg.matchAll(/<text\b([^>]*)>(.*?)<\/text>/gs)) {
      const baseline = Number(text[1].match(/\by="([\d.]+)"/)[1]);
      const offset = [...text[2].matchAll(/\bdy="([\d.]+)"/g)].reduce(
        (n, m) => n + Number(m[1]),
        0,
      );
      assert.ok(
        baseline + offset < height,
        `${name}: text at ${baseline + offset} outside ${height}`,
      );
    }
  }
});

test('beam text alternatives describe parallel outputs rather than a sequential chain', () => {
  const { markdown } = render({
    version: 1,
    theme: 'minimal',
    blocks: [
      {
        id: 'beam',
        type: 'diagram',
        layout: 'beam',
        items: [{ title: 'Input' }, { title: 'Renderer' }, { title: 'Markdown' }, { title: 'SVG' }],
      },
    ],
  });
  assert.ok(markdown.includes('Input → Renderer; parallel outputs: Markdown, SVG'));
  assert.ok(!markdown.includes('Input → Renderer → Markdown → SVG'));
});

test('masthead controls and optional feature frames honor explicit SVG customization', async () => {
  const base = JSON.parse(await readFile(resolve(root, 'examples/designs/canvas.json'), 'utf8'));

  const original = render(base).assets;
  const changed = render({
    ...base,
    style: { ...base.style, font: 'serif', density: 'comfortable', radius: 0 },
  }).assets;
  const before = original.get('hero-light.svg'),
    after = changed.get('hero-light.svg');
  assert.ok(after.includes('Georgia, &apos;Times New Roman&apos;, serif'));
  assert.ok(Number(after.match(/height="(\d+)"/)[1]) > Number(before.match(/height="(\d+)"/)[1]));
  assert.notEqual(changed.get('features-light.svg'), original.get('features-light.svg'));
  assert.ok(changed.get('features-light.svg').includes('rx="0"'));
  assert.ok(changed.get('features-light.svg').includes('Consolas'));
});

test('complete design systems style every section while preserving copyable instructions', async () => {
  const { createComposition, compositionReferences, sectionDesigns, styleSection, sections } =
    await import('../src/index.js');
  const base = JSON.parse(await readFile(resolve(root, 'open-readme.json'), 'utf8'));
  for (const section of Object.values(sections))
    assert.deepEqual(Object.keys(section.designs), Object.keys(sectionDesigns));
  for (const id of Object.keys(compositionReferences)) {
    const { markdown, assets } = render(createComposition(base, id));
    assert.ok(!markdown.includes('<details>'));
    for (const block of base.blocks.filter((b) => b.title && b.type !== 'hero')) {
      assert.ok(assets.has(block.id + '__heading-light.svg'));
      assert.ok(markdown.includes(`alt="${block.title.replace(/&/g, '&amp;')}"`));
    }
    for (const block of base.blocks.filter((b) => b.type === 'code'))
      assert.ok(markdown.includes(block.code));
    for (const name of markdown.matchAll(/(?:src|srcset)="assets\/open-readme\/([^"]+)"/g))
      assert.ok(assets.has(name[1]));
    const config = createComposition(base, id),
      original = structuredClone(config.blocks[4]),
      changed = styleSection(original, id === 'journal' ? 'console' : 'journal');
    assert.deepEqual(changed.rows, original.rows);
    assert.deepEqual(changed.columns, original.columns);
    assert.equal(changed.layout, id === 'journal' ? 'reference' : 'definitions');
    config.blocks[4] = changed;
    assert.deepEqual(validateConfig(config), []);
    assert.notEqual(
      render(config).assets.get('configuration__heading-light.svg'),
      assets.get('configuration__heading-light.svg'),
    );
  }
});

test('reference variants preserve every table fact without changing relationships', async () => {
  const { comparisonView } = await import('../src/index.js');
  const block = {
    id: 'options',
    type: 'comparison',
    columns: ['Option', 'Default', 'Use'],
    rows: [
      ['accent', '#6657D8', 'Color'],
      ['density', 'compact', 'Spacing'],
    ],
  };
  assert.deepEqual(comparisonView({ ...block, layout: 'matrix' }), {
    kind: 'table',
    columns: ['Option', 'accent', 'density'],
    rows: [
      ['Default', '#6657D8', 'compact'],
      ['Use', 'Color', 'Spacing'],
    ],
  });
  for (const layout of ['table', 'definitions', 'reference', 'matrix']) {
    const { markdown } = render({ version: 1, theme: 'minimal', blocks: [{ ...block, layout }] });
    for (const value of [...block.columns, ...block.rows.flat()])
      assert.ok(markdown.includes(value), layout + ': ' + value);
  }
});

test('section heading assets cannot collide with a valid block filename', () => {
  const { assets, markdown } = render({
    version: 1,
    theme: 'minimal',
    design: 'canvas',
    blocks: [
      { id: 'guide', type: 'markdown', title: 'Guide', body: 'Actual instructions.' },
      { id: 'guide-heading', type: 'hero', title: 'Demo', subtitle: 'Actual result.' },
    ],
  });
  assert.ok(assets.has('guide__heading-light.svg'));
  assert.ok(assets.has('guide-heading-light.svg'));
  assert.ok(assets.get('guide__heading-light.svg').includes('<title id="title">Guide</title>'));
  assert.ok(markdown.includes('guide__heading-light.svg'));
});

test('FAQ, notice and link sections expose coordinated headings with usable native bodies', async () => {
  const { createComposition } = await import('../src/index.js');
  const base = {
    version: 1,
    theme: 'minimal',
    blocks: [
      {
        id: 'faq',
        type: 'details',
        section: 'faq',
        title: 'Questions',
        summary: 'Can I update one section?',
        markdown: 'Yes. Use the documented section command.',
      },
      {
        id: 'notice',
        type: 'callout',
        section: 'compatibility',
        title: 'Requirements',
        kind: 'note',
        body: 'Node.js 22+.',
      },
      {
        id: 'links',
        type: 'links',
        section: 'credits',
        title: 'Credits',
        items: [{ label: 'Source', url: 'https://github.com/luc3xhj/open-readme' }],
      },
    ],
  };
  for (const design of ['canvas', 'console', 'journal', 'pipeline']) {
    const config = createComposition(base, design);
    assert.deepEqual(validateConfig(config), []);
    const { markdown, assets } = render(config);
    assert.ok(markdown.includes('<summary>Can I update one section?</summary>'));
    assert.ok(markdown.includes('Node.js 22+.'));
    for (const id of ['faq', 'notice', 'links']) assert.ok(assets.has(id + '__heading-light.svg'));
    assert.ok(markdown.includes('links__heading-light.svg'));
    assert.ok(markdown.includes('<h2 id="questions"><a href="#questions">'));
  }
});

test('measured architecture layouts preserve branches without overlapping nodes or crossing unrelated nodes', async () => {
  const { beamLayout } = await import('../src/section-visuals.js');
  const { tokens } = await import('../src/themes.js');
  const { designs } = await import('../src/designs.js');
  const segmentHitsInterior = (a, b, n) => {
    const inset = 0.01;
    if (a[0] === b[0])
      return (
        a[0] > n.x + inset &&
        a[0] < n.x + n.width - inset &&
        Math.max(a[1], b[1]) > n.y + inset &&
        Math.min(a[1], b[1]) < n.y + n.height - inset
      );
    return (
      a[1] > n.y + inset &&
      a[1] < n.y + n.height - inset &&
      Math.max(a[0], b[0]) > n.x + inset &&
      Math.min(a[0], b[0]) < n.x + n.width - inset
    );
  };
  for (const design of ['canvas', 'console', 'journal', 'pipeline']) {
    for (const width of [960, 760, 480]) {
      for (const count of [3, 8, 24]) {
        const t = {
            ...tokens({ design, theme: designs[design].theme }),
            scale: width === 760 ? 1.2 : 1,
          },
          block = {
            items: Array.from({ length: count }, (_, i) => ({
              title: i === 0 ? 'configuration-with-a-long-filename.json' : 'Actual 文件 ' + i,
              description: i % 2 ? 'Verified source description. '.repeat(4) : 'Local artifact.',
            })),
          },
          graph = beamLayout(block, t, width, width === 480);
        assert.deepEqual(
          graph.edges.map((e) => [e.from, e.to]),
          [[0, 1], ...Array.from({ length: count - 2 }, (_, i) => [1, i + 2])],
        );
        for (const n of graph.nodes) {
          assert.ok(n.x >= 0 && n.x + n.width <= width, design + ': horizontal bounds');
          assert.ok(n.y >= 0 && n.y + n.height <= graph.height, design + ': vertical bounds');
          for (const other of graph.nodes.filter((m) => m.i > n.i))
            assert.ok(
              n.x + n.width <= other.x ||
                other.x + other.width <= n.x ||
                n.y + n.height <= other.y ||
                other.y + other.height <= n.y,
              design + ': overlapping nodes',
            );
        }
        for (const e of graph.edges) {
          const end = e.points.at(-1),
            target = graph.nodes[e.to];
          assert.ok(
            end[0] === target.x ||
              end[0] === target.x + target.width ||
              end[1] === target.y ||
              end[1] === target.y + target.height,
            design + ': endpoint must attach to target boundary',
          );
          for (let j = 1; j < e.points.length; j++)
            for (const n of graph.nodes.filter((n) => n.i !== e.from && n.i !== e.to))
              assert.ok(
                !segmentHitsInterior(e.points[j - 1], e.points[j], n),
                design + ': edge crosses unrelated node',
              );
        }
      }
    }
  }
});

test('supporting sections have quieter headings and can be explicitly promoted without rewriting content', async () => {
  const config = {
    version: 1,
    design: 'journal',
    theme: 'editorial',
    blocks: [
      {
        id: 'start',
        type: 'code',
        section: 'quickstart',
        title: 'Start',
        code: 'verified-command',
      },
      { id: 'api', type: 'code', section: 'api', title: 'API', code: 'verified-api' },
    ],
  };
  const original = render(config),
    size = (svg) =>
      Math.max(...[...svg.matchAll(/font-size="([\d.]+)"/g)].map((m) => Number(m[1])));
  assert.ok(
    size(original.assets.get('api__heading-light.svg')) <
      size(original.assets.get('start__heading-light.svg')),
  );
  config.blocks[1].importance = 'primary';
  const promoted = render(config);
  assert.equal(
    size(promoted.assets.get('api__heading-light.svg')),
    size(original.assets.get('start__heading-light.svg')),
  );
  assert.ok(promoted.markdown.includes('verified-api'));
  config.blocks[1].importance = 'arbitrary';
  assert.ok(validateConfig(config).some((error) => error.path.includes('importance')));
});
