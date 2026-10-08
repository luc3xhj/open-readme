import { sectionDesign } from './section-designs.js';
import { comparisonView } from './reference.js';
import { validateConfig } from './schema.js';
import { designFor } from './designs.js';
import { renderSvg, xml } from './svg.js';
export const md = (value) =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/([\[\]*_`#<>|])/g, '\\$1')
    .replace(/\r?\n/g, ' ');
export const link = (label, url) => `[${md(label)}](<${url.replace(/>/g, '%3E')}>)`;
export function fence(code, language = '') {
  const longest = Math.max(0, ...(code.match(/`+/g) || []).map((s) => s.length));
  const delimiter = '`'.repeat(Math.max(3, longest + 1));
  return `${delimiter}${language}\n${code.replace(/\r\n/g, '\n')}\n${delimiter}`;
}
export function render(config, options = {}) {
  const errors = validateConfig(config);
  if (errors.length) throw Object.assign(new Error('Invalid configuration.'), { errors });
  const prefix = options.assetPrefix ?? 'assets/open-readme';
  if (/[<>"\x00-\x1f]/.test(prefix)) throw new Error('Invalid asset prefix.');
  const assets = new Map(),
    selected = options.block ? config.blocks.filter((b) => b.id === options.block) : config.blocks,
    output = [];
  if (!selected.length) throw new Error(`Unknown block id: ${options.block}.`);
  function picture(block, stem, alt) {
    const responsive = Boolean(sectionDesign(config, block)),
      variants = responsive ? [false, 'compact', true] : [false, true],
      suffix = (variant) => (variant === 'compact' ? '-compact' : variant ? '-mobile' : '');
    for (const mode of ['light', 'dark'])
      for (const variant of variants)
        assets.set(
          `${stem}-${mode}${suffix(variant)}.svg`,
          renderSvg(block, config, mode, variant),
        );
    const url = (mode, variant = false) => xml(`${prefix}/${stem}-${mode}${suffix(variant)}.svg`),
      dimension = ['badge', 'link'].includes(block.type)
        ? ''
        : ` width="${config.style?.width || 960}"`,
      sources = responsive
        ? `<source media="(prefers-color-scheme: dark) and (max-width: 520px)" srcset="${url('dark', true)}">\n  <source media="(max-width: 520px)" srcset="${url('light', true)}">\n  <source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="${url('dark', 'compact')}">\n  <source media="(max-width: 840px)" srcset="${url('light', 'compact')}">`
        : `<source media="(prefers-color-scheme: dark) and (max-width: 840px)" srcset="${url('dark', true)}">\n  <source media="(max-width: 840px)" srcset="${url('light', true)}">`;
    const image = `<picture>\n  ${sources}\n  <source media="(prefers-color-scheme: dark)" srcset="${url('dark')}">\n  <img src="${url('light')}" alt="${xml(alt)}"${dimension}>\n</picture>`;
    return block.url ? `<a href="${xml(block.url)}">${image.replace(/>\n\s*</g, '><')}</a>` : image;
  }
  const disclosure = (summary, body) =>
    `<details>\n<summary>${xml(summary)}</summary>\n\n${body}\n\n</details>`;
  const media = (item, width = 960) => {
    const img = `<img src="${xml(item.src)}" alt="${xml(item.alt)}" width="${width}">`;
    return item.url ? `<a href="${xml(item.url)}">${img}</a>` : img;
  };
  const table = (block) => {
    const view = comparisonView(block);
    if (view.kind === 'reference') return fence(view.text, 'text');
    if (view.kind === 'definitions')
      return view.entries
        .map(
          (entry) =>
            `**${md(view.label)}: ${md(entry.term)}**\n\n` +
            entry.fields.map((field) => `${md(field.label)}: ${md(field.value)}`).join(' · '),
        )
        .join('\n\n');
    return [view.columns, view.columns.map(() => '---'), ...view.rows]
      .map((row) => '| ' + row.map(md).join(' | ') + ' |')
      .join('\n');
  };
  const steps = (block) =>
    block.items
      .map(
        (step, i) =>
          `${i + 1}. **${md(step.title)}**\n\n   ${md(step.description)}${
            step.code
              ? '\n\n' +
                fence(step.code, step.language)
                  .split('\n')
                  .map((line) => '   ' + line)
                  .join('\n')
              : ''
          }`,
      )
      .join('\n\n');
  const headingSlugs = new Map(),
    slugCounts = new Map();
  for (const b of config.blocks)
    if (b.title && b.type !== 'hero' && b.type !== 'toc') {
      const stem = b.title
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s_-]/gu, '')
          .replace(/\s/g, '-'),
        n = slugCounts.get(stem) || 0;
      slugCounts.set(stem, n + 1);
      headingSlugs.set(b.id, stem + (n ? '-' + n : ''));
    }
  for (const block of selected) {
    const heading =
      block.title && block.type !== 'hero'
        ? sectionDesign(config, block)
          ? `<a id="${xml(headingSlugs.get(block.id) || 'contents')}"></a>\n<h2>\n${picture({ type: 'heading', title: block.title, design: block.design, style: block.style, ordinal: config.blocks.filter((b) => b.title && b.type !== 'hero').findIndex((b) => b.id === block.id) + 1 }, block.id + '__heading', block.title)}\n</h2>\n\n`
          : `## ${md(block.title)}\n\n`
        : '';
    switch (block.type) {
      case 'hero':
        output.push(
          picture(
            block,
            block.id,
            [block.title, block.headline, block.subtitle].filter(Boolean).join(' — '),
          ) +
            (block.preview
              ? '\n\n' + disclosure('Preview source', fence(block.preview, 'text'))
              : ''),
        );
        break;
      case 'badges':
        output.push(
          '<p>\n' +
            block.items
              .map((item, i) =>
                picture(
                  { ...item, type: 'badge', layout: block.layout, style: block.style },
                  `${block.id}-${i + 1}`,
                  `${item.label}: ${item.value}`,
                ),
              )
              .join('\n') +
            '\n</p>',
        );
        break;
      case 'links':
        output.push(
          block.layout === 'buttons'
            ? '<p>\n' +
                block.items
                  .map((item, i) =>
                    picture(
                      { ...item, type: 'link', layout: 'outline', style: block.style },
                      `${block.id}-${i + 1}`,
                      item.label,
                    ),
                  )
                  .join('\n') +
                '\n</p>'
            : block.layout === 'index'
              ? block.items.map((item, i) => `${i + 1}. ${link(item.label, item.url)}`).join('\n')
              : block.items.map((item) => link(item.label, item.url)).join(' · '),
        );
        break;
      case 'features': {
        const layout = block.layout || designFor(config).features;
        const examples =
          block.examples !== 'none' && block.items.some((item) => item.example)
            ? '\n\n' +
              disclosure(
                'Feature examples',
                block.items
                  .map(
                    (item) =>
                      `**${md(item.title)}** — ${md(item.description)}` +
                      (item.example ? '\n\n' + fence(item.example, 'text') : ''),
                  )
                  .join('\n\n'),
              )
            : '';
        if (layout === 'native')
          output.push(
            heading +
              block.items
                .map(
                  (item) =>
                    `- **${item.url ? link(item.title, item.url) : md(item.title)}** — ${md(item.description)}`,
                )
                .join('\n') +
              examples,
          );
        else
          output.push(
            heading +
              picture(
                { ...block, layout },
                block.id,
                block.items
                  .map((i) =>
                    [i.title, i.description, i.example, i.value].filter(Boolean).join(': '),
                  )
                  .join('; '),
              ) +
              (block.items.some((i) => i.url)
                ? '\n\n' +
                  block.items
                    .filter((i) => i.url)
                    .map((i) => link(i.title, i.url))
                    .join(' · ')
                : '') +
              examples,
          );
        break;
      }
      case 'code': {
        const source = fence(block.code, block.language);
        output.push(
          heading +
            (block.layout === 'terminal'
              ? picture(block, block.id, block.code) +
                '\n\n' +
                disclosure('Copyable command / source', source)
              : source) +
            (block.caption ? `\n\n${md(block.caption)}` : ''),
        );
        break;
      }
      case 'codegroup':
        output.push(
          heading +
            block.items
              .map(
                (item, i) =>
                  `<details${i === 0 ? ' open' : ''}>\n<summary>${xml(item.label)}</summary>\n\n${fence(item.code, item.language)}\n\n</details>`,
              )
              .join('\n\n'),
        );
        break;
      case 'steps':
        output.push(
          heading +
            (block.layout === 'flow'
              ? picture(
                  { ...block, type: 'diagram', layout: 'flow' },
                  block.id,
                  block.items.map((i) => i.title).join(' → '),
                ) + '\n\n'
              : '') +
            steps(block),
        );
        break;
      case 'comparison':
        output.push(
          heading +
            (block.layout === 'scorecard'
              ? picture(block, block.id, block.title || 'Comparison') +
                '\n\n' +
                disclosure('View the table as text', table(block))
              : table(block)),
        );
        break;
      case 'markdown':
        output.push(heading + block.body.trim());
        break;
      case 'media':
        output.push(
          heading +
            (block.layout === 'window'
              ? picture({ type: 'windowbar', label: block.alt }, block.id + '-frame', block.alt) +
                '\n\n'
              : '') +
            media(block, block.width || config.style?.width || 960) +
            (block.caption ? '\n\n' + md(block.caption) : ''),
        );
        break;
      case 'gallery':
        output.push(
          heading +
            (block.layout === 'strip'
              ? '<p>\n' +
                block.items
                  .map((item) =>
                    media(item, Math.floor((config.style?.width || 960) / block.items.length)),
                  )
                  .join('\n') +
                '\n</p>'
              : block.items
                  .map(
                    (item) =>
                      media(item, config.style?.width || 960) +
                      (item.caption ? '\n\n' + md(item.caption) : ''),
                  )
                  .join('\n\n')),
        );
        break;
      case 'diagram': {
        const relationship =
          block.layout === 'beam' && block.items.length >= 3
            ? block.items[0].title +
              ' → ' +
              block.items[1].title +
              '; parallel outputs: ' +
              block.items
                .slice(2)
                .map((i) => i.title)
                .join(', ')
            : block.items.map((i) => i.title).join(block.layout === 'hub' ? ' · ' : ' → ');
        output.push(
          heading +
            picture(
              block,
              block.id,
              relationship +
                '; ' +
                block.items
                  .map((i) => [i.title, i.description].filter(Boolean).join(': '))
                  .join('; '),
            ) +
            (sectionDesign(config, block)
              ? ''
              : '\n\n' +
                disclosure(
                  'Diagram description',
                  (block.layout === 'beam' && block.items.length >= 3
                    ? md(relationship) + '\n\n'
                    : '') +
                    block.items
                      .map(
                        (i) =>
                          `- **${md(i.title)}**${i.description ? ' — ' + md(i.description) : ''}`,
                      )
                      .join('\n'),
                )) +
            (block.caption ? '\n\n' + md(block.caption) : ''),
        );
        break;
      }
      case 'metrics':
        output.push(
          heading +
            picture(block, block.id, block.items.map((i) => `${i.label}: ${i.value}`).join('; ')) +
            '\n\n' +
            block.items
              .map(
                (i) =>
                  `${md(i.value)} ${md(i.label)}${i.source ? ' (' + link('source', i.source) + ')' : ''}`,
              )
              .join(' · ') +
            (block.caption ? '\n\n' + md(block.caption) : ''),
        );
        break;
      case 'timeline': {
        const checklist = block.items
          .map(
            (item) =>
              `- [${item.status === 'shipped' ? 'x' : ' '}] **${md(item.title)}** (${item.status}) — ${md(item.description)}`,
          )
          .join('\n');
        output.push(
          heading +
            (block.layout === 'rail'
              ? picture(
                  block,
                  block.id,
                  block.items.map((i) => `${i.status}: ${i.title}`).join('; '),
                ) +
                '\n\n' +
                disclosure('Roadmap as text', checklist)
              : checklist),
        );
        break;
      }
      case 'callout':
        output.push(
          heading +
            `> [!${block.kind.toUpperCase()}]\n` +
            block.body
              .trim()
              .split('\n')
              .map((line) => '> ' + line)
              .join('\n'),
        );
        break;
      case 'toc':
        output.push(
          heading +
            config.blocks
              .filter((b) => headingSlugs.has(b.id))
              .map((b) => `- ${link(b.title, '#' + headingSlugs.get(b.id))}`)
              .join('\n'),
        );
        break;
      case 'details':
        output.push(disclosure(block.summary, block.markdown.trim()));
        break;
    }
  }
  return {
    markdown:
      '<!-- Generated with open-readme. Edit the JSON configuration to regenerate. -->\n\n' +
      output.join('\n\n') +
      '\n',
    assets,
  };
}
export function updateSection(existing, content, id = 'design') {
  if (!/^[a-z][a-z0-9-]{0,47}$/.test(id)) throw new Error('Invalid section id.');
  const start = `<!-- open-readme:${id}:start -->`,
    end = `<!-- open-readme:${id}:end -->`,
    starts = existing.split(start).length - 1,
    ends = existing.split(end).length - 1;
  if (starts !== ends || starts > 1 || (starts && existing.indexOf(start) > existing.indexOf(end)))
    throw new Error('Section markers are missing, duplicated or out of order.');
  const section = `${start}\n${content.trim()}\n${end}`;
  if (!starts) return existing.trimEnd() + (existing.trim() ? '\n\n' : '') + section + '\n';
  return (
    existing.slice(0, existing.indexOf(start)) +
    section +
    existing.slice(existing.indexOf(end) + end.length)
  );
}
