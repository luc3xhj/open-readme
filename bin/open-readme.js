#!/usr/bin/env node
import { readFile, writeFile, mkdir, lstat, rename, unlink } from 'node:fs/promises';
import { resolve, dirname, relative, basename, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { randomUUID } from 'node:crypto';
import {
  render,
  updateSection,
  validateConfig,
  catalog,
  themes,
  designs,
  sections,
  projects,
  variants,
  componentInfo,
  auditConfig,
  createStarter,
} from '../src/index.js';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const help = `open-readme ${pkg.version}

  init       Create an editable JSON configuration
  render     Generate Markdown and local SVG assets
  check      Validate configuration and local image references
  catalog    List components, variants and their configuration fields
  designs    List the eight header / composition designs
  sections   List README sections and reader questions
  projects   List project types and essential sections
  audit      Report missing essential / recommended sections
  themes     List available palettes

Options:
  --config <file>      Configuration (default: open-readme.json; - reads stdin)
  --out <file>         Output Markdown (default: README.md)
  --assets <dir>       Asset directory, relative to output (default: assets/open-readme)
  --theme <name>       terminal, minimal or editorial
  --design <name>     Header / composition design (see designs)
  --project <name>    cli, library, application, directory, research or profile
  --name <name>        Project name for init
  --block <id>         Render one block
  --section <id>       Append/update a marked section; preserve other content
  --readme <file>      Check local image references in this README
  --force             Replace conflicting generated/output files
  --json              Machine-readable result and errors
  --help, --version

Examples:
  open-readme init --theme terminal
  open-readme render --config open-readme.json --out README.preview.md --json
  open-readme render --block hero --section design --force
  open-readme check --readme README.md --json
`;

const argv = process.argv.slice(2);
const jsonMode = argv.includes('--json');
function report(result) {
  if (jsonMode) process.stdout.write(JSON.stringify(result) + '\n');
  else if (!result.ok)
    process.stderr.write(
      (result.errors || [{ message: result.message }])
        .map((e) => `${e.path || 'open-readme'}: ${e.message}`)
        .join('\n') + '\n',
    );
  else if (result.data) process.stdout.write(JSON.stringify(result.data, null, 2) + '\n');
  else process.stdout.write(result.message + '\n');
}
async function exists(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}
async function configuration(path) {
  let input;
  if (path === '-') {
    input = '';
    for await (const chunk of process.stdin) {
      input += chunk;
      if (input.length > 1_000_000) throw new Error('Configuration exceeds 1 MB.');
    }
  } else input = await readFile(path, 'utf8');
  try {
    return JSON.parse(input);
  } catch {
    throw new Error('Configuration must be valid JSON.');
  }
}
async function save(files, force = false, allowed = new Set()) {
  // Preflight the full export so an overwrite conflict does not create half an export.
  for (const [path, content] of files) {
    const stat = await exists(path);
    if (stat && !stat.isFile()) throw new Error(`Output must be a regular file: ${path}`);
    if (stat && !force && !allowed.has(path) && (await readFile(path, 'utf8')) !== content)
      throw new Error(
        `File exists: ${path}. Choose another output or use --force after reviewing it.`,
      );
  }
  for (const [path, content] of files) {
    if ((await exists(path)) && (await readFile(path, 'utf8')) === content) continue;
    await mkdir(dirname(path), { recursive: true });
    const temporary = resolve(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, content, { flag: 'wx' });
      await rename(temporary, path);
    } finally {
      await unlink(temporary).catch(() => {});
    }
  }
}
async function checkImages(path) {
  const markdown = await readFile(path, 'utf8');
  const refs = new Set([
    ...[...markdown.matchAll(/<(?:img|source)\b[^>]*?\b(?:src|srcset)="([^"]+)"/g)].map(
      (m) => m[1],
    ),
    ...[...markdown.matchAll(/!\[[^\]]*\]\((<?[^\s)]+>?)\)/g)].map((m) =>
      m[1].replace(/^<|>$/g, ''),
    ),
  ]);
  const errors = [];
  for (const ref of refs) {
    if (/^(https?:|data:)/.test(ref)) continue;
    let file;
    try {
      file = decodeURIComponent(ref.split(/[?#]/)[0].replace(/&amp;/g, '&'));
    } catch {
      errors.push({ path: ref, message: 'Invalid image path encoding.' });
      continue;
    }
    if (!(await exists(resolve(dirname(path), file)))?.isFile())
      errors.push({ path: ref, message: 'Local image is missing.' });
  }
  return errors;
}

try {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      config: { type: 'string', default: 'open-readme.json' },
      out: { type: 'string', default: 'README.md' },
      assets: { type: 'string', default: 'assets/open-readme' },
      theme: { type: 'string' },
      name: { type: 'string' },
      design: { type: 'string' },
      project: { type: 'string' },
      block: { type: 'string' },
      section: { type: 'string' },
      readme: { type: 'string' },
      force: { type: 'boolean' },
      json: { type: 'boolean' },
      help: { type: 'boolean' },
      version: { type: 'boolean' },
    },
  });
  if (values.version) {
    process.stdout.write(pkg.version + '\n');
  } else if (values.help || !positionals.length) {
    process.stdout.write(help);
  } else {
    if (positionals.length !== 1) throw new Error('Provide exactly one command.');
    const command = positionals[0];
    if (['themes', 'catalog', 'designs', 'sections', 'projects'].includes(command)) {
      const data = {
        themes,
        designs,
        sections,
        projects,
        catalog: Object.fromEntries(
          Object.entries(catalog).map(([type, info]) => [
            type,
            { ...info, ...componentInfo[type], variants: variants[type] },
          ]),
        ),
      };
      report({ ok: true, data: data[command] });
    } else if (command === 'init') {
      if (values.config === '-') throw new Error('init needs a file path.');
      const config = createStarter(
        values.project || 'cli',
        values.design || (values.theme === 'minimal' ? 'plain' : values.theme) || 'plain',
        values.name || 'Your project',
      );
      if (values.theme) config.theme = values.theme;
      if (values.name) config.blocks[0].title = values.name;
      const errors = validateConfig(config);
      if (errors.length) throw Object.assign(new Error('Invalid configuration.'), { errors });
      await save(
        new Map([[resolve(values.config), JSON.stringify(config, null, 2) + '\n']]),
        values.force,
      );
      report({
        ok: true,
        message: `Created ${values.config}. Edit the content, then run open-readme render.`,
        config: resolve(values.config),
      });
    } else if (['check', 'render', 'audit'].includes(command)) {
      const config = await configuration(values.config);
      if (values.theme) config.theme = values.theme;
      if (values.design) config.design = values.design;
      if (values.project) config.project = values.project;
      const errors = validateConfig(config);
      if (errors.length) throw Object.assign(new Error('Invalid configuration.'), { errors });
      if (command === 'audit') report({ ok: true, data: auditConfig(config) });
      else if (command === 'check') {
        const imageErrors = values.readme ? await checkImages(resolve(values.readme)) : [];
        if (imageErrors.length)
          throw Object.assign(new Error('Missing images.'), { errors: imageErrors });
        report({
          ok: true,
          message: 'Configuration and requested image references are valid.',
          blocks: config.blocks.length,
        });
      } else {
        const out = resolve(values.out),
          assetsDir = resolve(dirname(out), values.assets);
        const prefix =
          relative(dirname(out), assetsDir).split(sep).map(encodeURIComponent).join('/') || '.';
        const portable = structuredClone(config);
        const configDir = values.config === '-' ? process.cwd() : dirname(resolve(values.config));
        for (const b of portable.blocks)
          for (const item of b.type === 'media' ? [b] : b.type === 'gallery' ? b.items : []) {
            if (/^https?:/.test(item.src)) continue;
            const [path, suffix = ''] = item.src.split(/(?=[?#])/);
            item.src =
              relative(dirname(out), resolve(configDir, decodeURIComponent(path)))
                .split(sep)
                .map(encodeURIComponent)
                .join('/') + suffix;
          }
        const result = render(portable, { assetPrefix: prefix, block: values.block });
        const previous = values.section && (await exists(out)) ? await readFile(out, 'utf8') : '';
        const markdown = values.section
          ? updateSection(previous, result.markdown, values.section)
          : result.markdown;
        const files = new Map([[out, markdown]]);
        for (const [name, data] of result.assets) {
          const target = resolve(assetsDir, name);
          if (files.has(target)) throw new Error('Markdown output collides with an asset path.');
          files.set(target, data);
        }
        await save(files, values.force, values.section ? new Set([out]) : new Set());
        report({
          ok: true,
          message: `Rendered ${out} and ${result.assets.size} SVG assets.`,
          output: out,
          assets: [...result.assets.keys()],
          theme: config.theme,
        });
      }
    } else throw new Error(`Unknown command: ${command}. Run open-readme --help.`);
  }
} catch (error) {
  report({
    ok: false,
    message: error.message,
    errors: error.errors || [{ message: error.message }],
  });
  process.exitCode = 1;
}
