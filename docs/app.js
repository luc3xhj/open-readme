import {
  render,
  designFor,
  createComposition,
  createZip,
  schema,
  validateConfig,
  sectionDesign,
  sectionDesigns,
  styleSection,
  comparisonView,
} from './lib/index.js?v=0.3.1';
import { renderSvg } from './lib/svg.js?v=0.3.1';
const $ = (id) => document.getElementById(id),
  node = (tag, text, cls) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  };
const target = (url) =>
  url.startsWith('./') && !url.startsWith('./assets/')
    ? 'https://github.com/luc3xhj/open-readme/blob/main/' + url.slice(2)
    : url;
function anchor(text, url) {
  const a = node('a', text);
  a.href = target(url);
  return a;
}
function inline(el, text) {
  const re =
    /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)\s]+|#[^)\s]+|\.\.?\/[^)\s]+)\))/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    el.append(document.createTextNode(text.slice(last, m.index)));
    if (m[2]) el.append(node('strong', m[2]));
    else if (m[3]) el.append(node('code', m[3]));
    else el.append(anchor(m[4], m[5]));
    last = m.index + m[0].length;
  }
  el.append(document.createTextNode(text.slice(last)));
  return el;
}
function prose(el, body) {
  const lines = body.split('\n');
  let list,
    paragraph = [];
  const flush = () => {
    if (paragraph.length) {
      el.append(inline(node('p'), paragraph.join(' ')));
      paragraph = [];
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i];
    if (/^```/.test(s)) {
      flush();
      let code = [];
      for (i++; i < lines.length && !/^```/.test(lines[i]); i++) code.push(lines[i]);
      const pre = node('pre');
      pre.append(node('code', code.join('\n')));
      el.append(pre);
      list = null;
    } else if (/^> ?/.test(s)) {
      flush();
      const quote = node('blockquote'),
        rows = [s.replace(/^> ?/, '')];
      while (i + 1 < lines.length && /^> ?/.test(lines[i + 1]))
        rows.push(lines[++i].replace(/^> ?/, ''));
      quote.append(inline(node('p'), rows.join(' ')));
      el.append(quote);
      list = null;
    } else if (/^[-*] /.test(s)) {
      flush();
      if (!list) {
        list = node('ul');
        el.append(list);
      }
      list.append(inline(node('li'), s.slice(2)));
    } else if (/^#{1,6} /.test(s)) {
      flush();
      el.append(node('h3', s.replace(/^#+ /, '')));
      list = null;
    } else if (!s.trim()) {
      flush();
      list = null;
    } else {
      paragraph.push(s);
      list = null;
    }
  }
  flush();
}
function visual(block, cfg, mode, narrow) {
  const img = node('img');
  img.src =
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(renderSvg(block, cfg, mode, narrow));
  img.alt =
    block.type === 'heading'
      ? block.title
      : block.subtitle
        ? block.title + ' — ' + block.subtitle
        : block.items
          ? block.items.map((i) => i.title || `${i.label}: ${i.value}`).join('; ')
          : block.code || block.label || 'Component';
  if (block.url) {
    const a = anchor(undefined, block.url);
    a.append(img);
    return a;
  }
  return img;
}
function nativeCode(code) {
  const pre = node('pre', undefined, 'native-code');
  pre.append(node('code', code));
  const copy = node('button', 'Copy', 'copy-code');
  copy.type = 'button';
  copy.setAttribute('aria-label', 'Copy code');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Select code';
    }
  });
  pre.append(copy);
  return pre;
}
function details(summary, body, open = false) {
  const d = node('details');
  d.open = open;
  d.append(node('summary', summary));
  if (typeof body === 'string') prose(d, body);
  else d.append(body);
  return d;
}
function renderDocument(el, cfg, mode = 'light', narrow = false, thumbnail = false) {
  el.replaceChildren();
  el.classList.toggle('dark', mode === 'dark');
  el.classList.toggle('phone', narrow);
  const padding = getComputedStyle(el),
    contentWidth =
      el.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight),
    variant = narrow || contentWidth < 410 ? true : contentWidth < 710 ? 'compact' : false;
  const visualBlock = (b) => visual(b, cfg, mode, variant);
  const heading = (b) => {
    if (b.title) {
      const h = node('h2');
      if (sectionDesign(cfg, b)) {
        h.className = 'styled-heading';
        h.append(
          visualBlock({
            type: 'heading',
            title: b.title,
            design: b.design,
            style: b.style,
            ordinal:
              cfg.blocks
                .filter((x) => x.title && x.type !== 'hero')
                .findIndex((x) => x.id === b.id) + 1,
          }),
        );
      } else h.textContent = b.title;
      h.id = b.title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .replace(/\s/g, '-');
      el.append(h);
    }
  };
  for (const b of cfg.blocks) {
    if (b.type === 'hero') {
      el.append(visualBlock(b));
      if (b.preview && !thumbnail) el.append(details('Preview source', nativeCode(b.preview)));
      continue;
    }
    heading(b);
    if (b.type === 'links' && b.layout === 'index') {
      const ol = node('ol');
      for (const item of b.items) {
        const li = node('li');
        li.append(anchor(item.label, item.url));
        ol.append(li);
      }
      el.append(ol);
    } else if (b.type === 'badges' || b.type === 'links') {
      const row = node(
        'div',
        undefined,
        b.type === 'badges' || b.layout === 'buttons' ? 'badges' : 'links',
      );
      for (const item of b.items)
        row.append(
          b.type === 'badges'
            ? visualBlock({ ...item, type: 'badge', layout: b.layout, style: b.style })
            : b.layout === 'buttons'
              ? visualBlock({ ...item, type: 'link', style: b.style })
              : anchor(item.label, item.url),
        );
      el.append(row);
    }
    if (b.type === 'features') {
      const layout = b.layout || designFor(cfg).features;
      if (layout === 'native') {
        const ul = node('ul', undefined, 'feature-list');
        for (const item of b.items) {
          const li = node('li');
          li.append(node('strong', item.title), document.createTextNode(' — ' + item.description));
          ul.append(li);
        }
        el.append(ul);
      } else el.append(visualBlock({ ...b, layout }));
      if (b.examples !== 'none' && b.items.some((item) => item.example) && !thumbnail) {
        const examples = node('div');
        for (const item of b.items) {
          examples.append(node('strong', item.title), node('p', item.description));
          if (item.example) examples.append(nativeCode(item.example));
        }
        el.append(details('Feature examples', examples));
      }
    }
    if (b.type === 'code') {
      if (b.layout === 'terminal')
        el.append(visualBlock(b), details('Copyable command / source', nativeCode(b.code)));
      else el.append(nativeCode(b.code));
      if (b.caption) el.append(node('p', b.caption, 'caption'));
    }
    if (b.type === 'codegroup')
      b.items.forEach((item, i) => el.append(details(item.label, nativeCode(item.code), i === 0)));
    if (b.type === 'steps') {
      if (b.layout === 'flow') el.append(visualBlock({ ...b, type: 'diagram', layout: 'flow' }));
      const ol = node('ol');
      for (const item of b.items) {
        const li = node('li');
        li.append(node('strong', item.title), node('p', item.description));
        if (item.code) li.append(nativeCode(item.code));
        ol.append(li);
      }
      el.append(ol);
    }
    if (b.type === 'comparison') {
      const view = comparisonView(b);
      if (view.kind === 'reference') el.append(nativeCode(view.text));
      else if (view.kind === 'definitions') {
        for (const entry of view.entries) {
          el.append(node('p', undefined, 'definition-term'));
          el.lastChild.append(node('strong', view.label + ': ' + entry.term));
          el.append(node('p', entry.fields.map((f) => f.label + ': ' + f.value).join(' · ')));
        }
      } else {
        const table = node('table'),
          head = node('thead'),
          body = node('tbody'),
          tr = node('tr');
        for (const cell of view.columns) tr.append(node('th', cell));
        head.append(tr);
        for (const cells of view.rows) {
          const row = node('tr');
          for (const cell of cells) row.append(node('td', cell));
          body.append(row);
        }
        table.append(head, body);
        if (b.layout === 'scorecard')
          el.append(visualBlock(b), details('View the table as text', table));
        else el.append(table);
      }
    }
    if (b.type === 'markdown') prose(el, b.body);
    if (b.type === 'details') el.append(details(b.summary, b.markdown));
    if (b.type === 'callout') {
      const q = node('blockquote');
      q.append(node('strong', b.kind.toUpperCase()));
      prose(q, b.body);
      el.append(q);
    }
    if (b.type === 'diagram') {
      el.append(visualBlock(b));
      const ul = node('ul');
      for (const item of b.items)
        ul.append(node('li', item.title + (item.description ? ' — ' + item.description : '')));
      const description = details('Diagram description', ul);
      description.classList.add('visual-description');
      if (!sectionDesign(cfg, b)) el.append(description);
      if (b.caption) el.append(node('p', b.caption, 'caption'));
    }
    if (b.type === 'metrics') {
      el.append(visualBlock(b));
      const p = node('p', undefined, 'metric-sources');
      b.items.forEach((item, i) => {
        if (i) p.append(' · ');
        p.append(item.value + ' ' + item.label);
        if (item.source) p.append(' ', anchor('source', item.source));
      });
      el.append(p);
      if (b.caption) el.append(node('p', b.caption, 'caption'));
    }
    if (b.type === 'timeline') {
      const ul = node('ul');
      for (const item of b.items)
        ul.append(
          node(
            'li',
            `${item.status === 'shipped' ? '☑' : '☐'} ${item.title} (${item.status}) — ${item.description}`,
          ),
        );
      if (b.layout === 'rail') el.append(visualBlock(b), details('Roadmap as text', ul));
      else el.append(ul);
    }
    if (b.type === 'media' || b.type === 'gallery') {
      const items = b.type === 'media' ? [b] : b.items,
        row = node('div', undefined, b.layout === 'strip' ? 'media-strip' : 'media-stack');
      if (b.layout === 'window') row.append(visualBlock({ type: 'windowbar', label: b.alt }));
      for (const item of items) {
        const img = node('img');
        img.src = item.src;
        img.alt = item.alt;
        if (item.url) {
          const a = anchor(undefined, item.url);
          a.append(img);
          row.append(a);
        } else row.append(img);
        if (item.caption && b.layout !== 'strip') row.append(node('p', item.caption, 'caption'));
      }
      el.append(row);
    }
    if (b.type === 'toc') {
      const ul = node('ul');
      for (const item of cfg.blocks.filter(
        (x) => x.title && x.type !== 'hero' && x.type !== 'toc',
      )) {
        const li = node('li');
        li.append(
          anchor(
            item.title,
            '#' +
              item.title
                .toLowerCase()
                .replace(/[^\p{L}\p{N}\s_-]/gu, '')
                .replace(/\s/g, '-'),
          ),
        );
        ul.append(li);
      }
      el.append(ul);
    }
  }
}

const presets = await (await fetch('./examples/designs.json', { cache: 'no-cache' })).json();
const requested = new URLSearchParams(location.search).get('design');
let config = structuredClone((presets.find((d) => d.id === requested) || presets[0]).config),
  mode = 'light',
  narrow = false,
  editingTab = 'config',
  edited = false,
  zipUrl;
function preview() {
  renderDocument($('readme'), config, mode, narrow);
  document.body.dataset.mode = mode;
  $('document-frame').classList.toggle('narrow', narrow);
  document
    .querySelectorAll('[data-design]')
    .forEach((b) => b.setAttribute('aria-pressed', b.dataset.design === config.design));
  $('mode').textContent = mode === 'light' ? 'Dark' : 'Light';
  $('mode').setAttribute(
    'aria-label',
    mode === 'light' ? 'Preview dark mode' : 'Preview light mode',
  );
  $('narrow').setAttribute('aria-pressed', String(narrow));
  const url = new URL(location.href);
  url.searchParams.set('design', config.design);
  history.replaceState(null, '', url);
}
for (const design of presets) {
  const button = node('button', design.name);
  button.dataset.design = design.id;
  button.title = design.description;
  button.addEventListener('click', () => {
    config = edited ? createComposition(config, design.id) : structuredClone(design.config);
    preview();
    $('status').replaceChildren();
  });
  $('design-picker').append(button);
}
$('mode').addEventListener('click', () => {
  mode = mode === 'light' ? 'dark' : 'light';
  preview();
});
$('narrow').addEventListener('click', () => {
  narrow = !narrow;
  preview();
});
const resize = new ResizeObserver(() => renderDocument($('readme'), config, mode, narrow));
resize.observe($('document-frame'));
function editorTab(tab) {
  editingTab = tab;
  document
    .querySelectorAll('[data-editor-tab]')
    .forEach((b) => b.setAttribute('aria-selected', String(b.dataset.editorTab === tab)));
  $('config-panel').hidden = tab !== 'config';
  $('sections-panel').hidden = tab !== 'sections';
  $('markdown-panel').hidden = tab !== 'markdown';
  $('apply').hidden = tab === 'markdown';
  if (tab === 'sections') sectionControls();
  if (tab === 'markdown') {
    try {
      $('markdown-source').value = render(JSON.parse($('config-source').value)).markdown;
    } catch {
      $('markdown-source').value = render(config).markdown;
    }
  }
}
function syncControls(draft) {
  $('accent').value =
    draft.style?.accent ||
    { canvas: '#6657D8', console: '#24764C', journal: '#9B583D', pipeline: '#256DCE' }[
      draft.design
    ];
  $('density').value = draft.style?.density || 'compact';
  $('font').value = draft.style?.font || '';
}
function sectionControls() {
  $('section-controls').replaceChildren();
  try {
    const draft = JSON.parse($('config-source').value);
    for (const block of draft.blocks.filter((b) => b.title || b.type === 'hero')) {
      const row = node('label', undefined, 'section-control'),
        text = node('span');
      text.append(
        node('strong', block.type === 'hero' ? 'Overview' : block.title),
        node('small', block.section || block.type),
      );
      const select = node('select');
      select.setAttribute(
        'aria-label',
        (block.type === 'hero' ? 'Overview' : block.title) + ' design',
      );
      const inherit = node('option', 'Use ' + (sectionDesigns[draft.design]?.name || draft.design));
      inherit.value = '';
      select.append(inherit);
      for (const [id, system] of Object.entries(sectionDesigns)) {
        const option = node('option', system.name);
        option.value = id;
        select.append(option);
      }
      select.value = block.design || '';
      select.addEventListener('change', () => {
        const next = JSON.parse($('config-source').value),
          i = next.blocks.findIndex((b) => b.id === block.id);
        let changed;
        if (select.value) changed = styleSection(next.blocks[i], select.value);
        else {
          changed = structuredClone(next.blocks[i]);
          delete changed.design;
          const layout = sectionDesigns[next.design]?.[changed.type];
          if (layout) changed.layout = layout;
        }
        next.blocks[i] = changed;
        $('config-source').value = JSON.stringify(next, null, 2);
      });
      row.append(text, select);
      $('section-controls').append(row);
    }
  } catch {
    $('section-controls').append(node('p', 'Fix the JSON to edit section designs.'));
  }
}
$('edit').addEventListener('click', () => {
  $('config-source').value = JSON.stringify(config, null, 2);
  $('editor-status').textContent = '';
  syncControls(config);
  editorTab('sections');
  $('editor').showModal();
});
$('close-editor').addEventListener('click', () => $('editor').close());
$('cancel').addEventListener('click', () => $('editor').close());
$('editor').addEventListener('click', (e) => {
  if (e.target === $('editor')) $('editor').close();
});
document
  .querySelectorAll('[data-editor-tab]')
  .forEach((b) => b.addEventListener('click', () => editorTab(b.dataset.editorTab)));
$('config-source').addEventListener('input', () => {
  try {
    syncControls(JSON.parse($('config-source').value));
    $('editor-status').textContent = '';
  } catch {}
});
for (const id of ['accent', 'density', 'font'])
  $(id).addEventListener('change', () => {
    try {
      const draft = JSON.parse($('config-source').value);
      draft.style ??= {};
      if ($(id).value) draft.style[id] = $(id).value;
      else delete draft.style[id];
      $('config-source').value = JSON.stringify(draft, null, 2);
    } catch {
      $('editor-status').textContent = 'Fix the JSON before changing its style.';
    }
  });
$('apply').addEventListener('click', () => {
  try {
    const draft = JSON.parse($('config-source').value),
      errors = validateConfig(draft);
    if (errors.length) throw new Error(errors.map((e) => e.path + ': ' + e.message).join('\n'));
    render(draft);
    config = draft;
    edited = true;
    preview();
    $('editor').close();
    $('status').textContent = 'Changes applied. Download to keep your config and files.';
  } catch (error) {
    $('editor-status').textContent = error.message;
  }
});
$('copy-source').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(
      $(editingTab === 'markdown' ? 'markdown-source' : 'config-source').value,
    );
    $('editor-status').textContent = 'Copied.';
  } catch {
    $('editor-status').textContent = 'Select the text and copy it.';
  }
});
$('download').addEventListener('click', async () => {
  try {
    const result = render(config),
      files = new Map([
        ['README.md', result.markdown],
        [
          'open-readme.json',
          JSON.stringify({ ...config, $schema: './schema.json' }, null, 2) + '\n',
        ],
        ['schema.json', JSON.stringify(schema, null, 2) + '\n'],
      ]);
    for (const [name, body] of result.assets) files.set('assets/open-readme/' + name, body);
    for (const block of config.blocks) {
      const media = block.type === 'media' ? [block] : block.type === 'gallery' ? block.items : [];
      for (const item of media) {
        if (/^\.\/assets\/[a-z0-9-]+\.svg$/.test(item.src)) {
          const response = await fetch(item.src);
          if (!response.ok) throw new Error('Example image is unavailable.');
          files.set(item.src.slice(2), await response.text());
        } else if (!/^https?:\/\//.test(item.src))
          throw new Error(
            'Include your local media in the repository, or use an https URL before exporting here.',
          );
      }
    }
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    zipUrl = URL.createObjectURL(new Blob([createZip(files)], { type: 'application/zip' }));
    const a = node('a', 'Download ZIP');
    a.href = zipUrl;
    a.download = 'open-readme-' + config.design + '.zip';
    $('status').replaceChildren('README, config and assets ready. ', a);
    a.click();
  } catch (error) {
    $('status').textContent = error.message;
  }
});
preview();
