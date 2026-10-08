import { designs } from './designs.js?v=0.2.0';
import { sections, projects } from './sections.js?v=0.2.0';
const text = { type: 'string', minLength: 1, maxLength: 10000, pattern: '\\S' };
const short = { ...text, maxLength: 160 };
const href = {
  ...short,
  maxLength: 2048,
  pattern: '^(https?://|mailto:|#|\\.?\\.?/|[a-zA-Z0-9_-]+[/\\.])[^\\s<>"\\x00-\\x1f]*$',
};
const array = (items, maxItems = 24) => ({ type: 'array', minItems: 1, maxItems, items });
const object = (properties, required) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});
const item = (properties, required) => object(properties, required);
const block = (type, properties, required) =>
  object(
    {
      id: { ...short, maxLength: 48, pattern: '^[a-z][a-z0-9-]*$' },
      type: { const: type },
      section: { type: 'string', enum: Object.keys(sections) },
      style: object(
        {
          accent: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
          density: { type: 'string', enum: ['compact', 'comfortable'] },
          font: { type: 'string', enum: ['mono', 'sans', 'serif'] },
          radius: { type: 'number', minimum: 0, maximum: 24 },
        },
        [],
      ),
      ...properties,
    },
    ['id', 'type', ...required],
  );

export const blocks = {
  hero: block(
    'hero',
    {
      title: short,
      subtitle: { ...text, maxLength: 420 },
      eyebrow: short,
      url: href,
      mark: { ...short, maxLength: 8 },
      command: { ...text, maxLength: 240 },
      meta: short,
      headline: { ...short, maxLength: 240 },
      preview: { ...text, maxLength: 2000 },
      previewLabel: short,
    },
    ['title', 'subtitle'],
  ),
  badges: block(
    'badges',
    {
      layout: { type: 'string', enum: ['dot', 'split', 'outline'] },
      items: array(item({ label: short, value: short, url: href }, ['label', 'value']), 12),
    },
    ['items'],
  ),
  links: block(
    'links',
    {
      layout: { type: 'string', enum: ['inline', 'buttons', 'index'] },
      items: array(item({ label: short, url: href }, ['label', 'url']), 12),
    },
    ['items'],
  ),
  features: block(
    'features',
    {
      title: short,
      layout: {
        type: 'string',
        enum: ['bento', 'lattice', 'terminal-grid', 'native', 'rows', 'columns', 'index'],
      },
      items: array(
        item(
          {
            title: short,
            description: { ...text, maxLength: 800 },
            url: href,
            visual: {
              type: 'string',
              enum: ['code', 'flow', 'files', 'palette', 'metric', 'preview', 'none'],
            },
            example: { ...text, maxLength: 2000 },
            value: short,
          },
          ['title', 'description'],
        ),
        12,
      ),
    },
    ['items'],
  ),
  code: block(
    'code',
    {
      filename: short,
      highlight: array({ type: 'integer', minimum: 1, maximum: 1000 }, 30),
      layout: { type: 'string', enum: ['native', 'terminal'] },
      title: short,
      language: { type: 'string', maxLength: 30, pattern: '^[a-zA-Z0-9_+-]*$' },
      code: text,
      caption: text,
    },
    ['code'],
  ),
  steps: block(
    'steps',
    {
      layout: { type: 'string', enum: ['ordered', 'flow'] },
      title: short,
      items: array(
        item(
          {
            title: short,
            description: text,
            code: text,
            language: { type: 'string', maxLength: 30, pattern: '^[a-zA-Z0-9_+-]*$' },
          },
          ['title', 'description'],
        ),
        12,
      ),
    },
    ['items'],
  ),
  comparison: block(
    'comparison',
    {
      layout: { type: 'string', enum: ['table', 'scorecard'] },
      title: short,
      columns: array(short, 8),
      rows: array(array({ type: 'string', maxLength: 1000 }, 8), 30),
    },
    ['columns', 'rows'],
  ),
  toc: block('toc', { title: short }, []),
  codegroup: block(
    'codegroup',
    {
      title: short,
      items: array(
        item(
          {
            label: short,
            code: text,
            language: { type: 'string', maxLength: 30, pattern: '^[a-zA-Z0-9_+-]*$' },
          },
          ['label', 'code'],
        ),
        8,
      ),
    },
    ['items'],
  ),
  gallery: block(
    'gallery',
    {
      title: short,
      layout: { type: 'string', enum: ['stack', 'strip'] },
      items: array(item({ src: href, alt: short, url: href, caption: short }, ['src', 'alt']), 6),
    },
    ['items'],
  ),
  markdown: block('markdown', { title: short, body: text }, ['body']),
  media: block(
    'media',
    {
      layout: { type: 'string', enum: ['plain', 'window'] },
      title: short,
      src: href,
      alt: short,
      caption: text,
      url: href,
      width: { type: 'integer', minimum: 100, maximum: 1200 },
    },
    ['src', 'alt'],
  ),
  diagram: block(
    'diagram',
    {
      layout: { type: 'string', enum: ['beam', 'flow', 'stack', 'hub'] },
      center: short,
      title: short,
      items: array(item({ title: short, description: short }, ['title']), 8),
      caption: text,
    },
    ['items'],
  ),
  metrics: block(
    'metrics',
    {
      layout: { type: 'string', enum: ['strip', 'columns', 'scoreboard'] },
      title: short,
      items: array(item({ label: short, value: short, source: href }, ['label', 'value']), 6),
      caption: text,
    },
    ['items'],
  ),
  timeline: block(
    'timeline',
    {
      layout: { type: 'string', enum: ['checklist', 'rail'] },
      title: short,
      items: array(
        item(
          {
            title: short,
            description: text,
            status: { type: 'string', enum: ['shipped', 'in-progress', 'planned'] },
          },
          ['title', 'description', 'status'],
        ),
        12,
      ),
    },
    ['items'],
  ),
  callout: block(
    'callout',
    {
      title: short,
      kind: { type: 'string', enum: ['note', 'tip', 'important', 'warning', 'caution'] },
      body: text,
    },
    ['kind', 'body'],
  ),
  details: block('details', { summary: short, markdown: text }, ['summary', 'markdown']),
};

export const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://luc3xhj.github.io/open-readme/schema.json',
  title: 'Open Readme configuration',
  ...object(
    {
      $schema: { type: 'string' },
      version: { const: 1 },
      design: { type: 'string', enum: Object.keys(designs) },
      project: { type: 'string', enum: Object.keys(projects) },
      theme: { type: 'string', enum: ['terminal', 'minimal', 'editorial'] },
      style: object(
        {
          accent: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
          density: { type: 'string', enum: ['compact', 'comfortable'] },
          radius: { type: 'number', minimum: 0, maximum: 24 },
          width: { type: 'integer', minimum: 640, maximum: 1200 },
          font: { type: 'string', enum: ['mono', 'sans', 'serif'] },
        },
        [],
      ),
      blocks: array({ oneOf: Object.values(blocks) }, 64),
    },
    ['version', 'theme', 'blocks'],
  ),
};

export const catalog = Object.fromEntries(
  Object.entries(blocks).map(([name, definition]) => [
    name,
    {
      format: ['hero', 'badges', 'features', 'diagram', 'metrics'].includes(name)
        ? 'SVG + Markdown'
        : 'native Markdown / HTML',
      required: definition.required,
      fields: Object.keys(definition.properties),
    },
  ]),
);

// This validator implements the JSON Schema keywords used in the exported schema.
function inspect(value, spec, path, errors) {
  const fail = (message) => errors.push({ path, message });
  if (spec.oneOf) {
    const candidate = spec.oneOf.find((s) => s.properties.type.const === value?.type);
    if (!candidate) {
      fail(`Unknown block type. Choose: ${Object.keys(blocks).join(', ')}.`);
      return;
    }
    inspect(value, candidate, path, errors);
    return;
  }
  if ('const' in spec && value !== spec.const) fail(`Expected ${JSON.stringify(spec.const)}.`);
  if (spec.enum && !spec.enum.includes(value)) fail(`Choose: ${spec.enum.join(', ')}.`);
  const types = {
    string: (v) => typeof v === 'string',
    number: (v) => typeof v === 'number' && Number.isFinite(v),
    integer: Number.isInteger,
    array: Array.isArray,
    object: (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
  };
  if (spec.type && !types[spec.type](value)) {
    fail(`Expected ${spec.type}.`);
    return;
  }
  if (typeof value === 'string') {
    if (spec.minLength && [...value].length < spec.minLength) fail('Must not be empty.');
    if (spec.maxLength && [...value].length > spec.maxLength)
      fail(`Maximum length is ${spec.maxLength}.`);
    if (spec.pattern && !new RegExp(spec.pattern).test(value))
      fail('Value does not match the allowed format.');
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value))
      fail('Contains unsupported control characters.');
  }
  if (typeof value === 'number') {
    if (value < spec.minimum) fail(`Minimum is ${spec.minimum}.`);
    if (value > spec.maximum) fail(`Maximum is ${spec.maximum}.`);
  }
  if (Array.isArray(value)) {
    if (value.length < spec.minItems || value.length > spec.maxItems)
      fail(`Expected ${spec.minItems}–${spec.maxItems} items.`);
    value.forEach((v, i) => inspect(v, spec.items, `${path}[${i}]`, errors));
  } else if (spec.type === 'object') {
    for (const key of spec.required)
      if (!(key in value)) errors.push({ path: `${path}.${key}`, message: 'Required field.' });
    for (const [key, v] of Object.entries(value)) {
      if (!(key in spec.properties))
        errors.push({ path: `${path}.${key}`, message: 'Unknown field.' });
      else inspect(v, spec.properties[key], `${path}.${key}`, errors);
    }
  }
}

export function validateConfig(config) {
  const errors = [];
  inspect(config, schema, '$', errors);
  if (Array.isArray(config?.blocks)) {
    const ids = new Set();
    config.blocks.forEach((b, i) => {
      if (b?.id && ids.has(b.id))
        errors.push({ path: `$.blocks[${i}].id`, message: 'Block ids must be unique.' });
      ids.add(b?.id);
      for (const media of b?.type === 'media'
        ? [b]
        : b?.type === 'gallery' && Array.isArray(b.items)
          ? b.items
          : [])
        if (typeof media?.src === 'string' && /^(mailto:|#)/.test(media.src))
          errors.push({
            path: `$.blocks[${i}].src`,
            message: 'Images need an HTTP(S) URL or relative file path.',
          });
      if (b?.type === 'comparison' && Array.isArray(b.rows) && Array.isArray(b.columns)) {
        b.rows.forEach((row, r) => {
          if (Array.isArray(row) && row.length !== b.columns.length)
            errors.push({
              path: `$.blocks[${i}].rows[${r}]`,
              message: 'Cell count must match columns.',
            });
        });
      }
    });
  }
  return errors;
}
