import {
  render,
  designs,
  designFor,
  variants,
  componentInfo,
  sections,
  projects,
  auditConfig,
  createStarter,
  createZip,
  schema,
} from './lib/index.js?v=0.2.1';
import { renderSvg } from './lib/svg.js?v=0.2.1';
const $ = (id) => document.getElementById(id),
  node = (tag, text, cls) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  };
const [samples, examples, completeDesigns] = await Promise.all([
  fetch('./examples/catalog.json', { cache: 'no-cache' }).then((r) => r.json()),
  Promise.all(
    ['repository', 'directory', 'components'].map(async (name) => [
      name,
      await (await fetch('./examples/' + name + '.json', { cache: 'no-cache' })).json(),
    ]),
  ).then(Object.fromEntries),
  fetch('./examples/designs.json', { cache: 'no-cache' }).then((r) => r.json()),
]);
let selectedDesign =
    completeDesigns.find((d) => d.id === new URLSearchParams(location.search).get('design')) ||
    completeDesigns[0],
  designMode = 'light',
  designPhone = false;
let category = 'all',
  galleryMode = 'light',
  config = structuredClone(examples.repository),
  composeMode = 'light',
  phone = false,
  tab = 'preview',
  disabled = new Set(),
  current,
  active,
  modalConfig,
  modalMode = 'light';
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
  img.alt = block.subtitle
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
  const visualBlock = (b) => visual(b, cfg, mode, narrow || (!thumbnail && el.clientWidth < 640));
  const heading = (b) => {
    if (b.title) {
      const h = node('h2', b.title);
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
      if (b.items.some((item) => item.example) && !thumbnail) {
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
      const table = node('table'),
        head = node('thead'),
        body = node('tbody'),
        tr = node('tr');
      for (const cell of b.columns) tr.append(node('th', cell));
      head.append(tr);
      for (const cells of b.rows) {
        const row = node('tr');
        for (const cell of cells) row.append(node('td', cell));
        body.append(row);
      }
      table.append(head, body);
      if (b.layout === 'scorecard')
        el.append(visualBlock(b), details('View the table as text', table));
      else el.append(table);
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
      el.append(description);
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
function showPage(name) {
  document.body.dataset.page = name;
  for (const key of ['designs', 'components', 'compose', 'sections'])
    $('page-' + key).hidden = key !== name;
  document
    .querySelectorAll('[data-page]')
    .forEach((button) => button.setAttribute('aria-pressed', button.dataset.page === name));
  if (name === 'compose') update();
  if (name === 'sections') sectionGuide();
  if (name === 'designs') designPreview();
  window.scrollTo(0, 0);
}
function designPreview() {
  $('design-name').textContent = selectedDesign.name;
  $('design-description').textContent = selectedDesign.description;
  $('design-references').replaceChildren();
  for (const ref of selectedDesign.references) {
    const item = node('div', undefined, 'design-reference');
    item.append(
      anchor(ref.name + ' ↗', ref.url),
      node('small', ref.section),
      node('p', ref.studied),
    );
    $('design-references').append(item);
  }
  document
    .querySelectorAll('[data-readme-design]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', button.dataset.readmeDesign === selectedDesign.id),
    );
  document
    .querySelectorAll('[data-design-mode]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', button.dataset.designMode === designMode),
    );
  $('design-phone').setAttribute('aria-pressed', designPhone);
  renderDocument($('design-preview'), selectedDesign.config, designMode, designPhone);
}
for (const design of completeDesigns) {
  const button = node('button', design.name);
  button.dataset.readmeDesign = design.id;
  button.addEventListener('click', () => {
    selectedDesign = design;
    const url = new URL(location.href);
    url.searchParams.set('design', design.id);
    history.replaceState(null, '', url);
    designPreview();
  });
  $('design-picker').append(button);
}
document.querySelectorAll('[data-design-mode]').forEach((button) =>
  button.addEventListener('click', () => {
    designMode = button.dataset.designMode;
    designPreview();
  }),
);
$('design-phone').addEventListener('click', () => {
  designPhone = !designPhone;
  designPreview();
});
$('use-design').addEventListener('click', () => {
  config = structuredClone(selectedDesign.config);
  $('example').value = 'repository';
  disabled = new Set();
  composeMode = designMode;
  blockControls();
  showPage('compose');
});
$('export-design').addEventListener('click', () =>
  download(selectedDesign.config, 'design-status'),
);
function categories() {
  const all = node('button', 'All components');
  all.dataset.category = 'all';
  all.append(node('span', String(samples.length)));
  $('categories').append(all);
  for (const [type, info] of Object.entries(componentInfo)) {
    const btn = node('button', info.name);
    btn.dataset.category = type;
    btn.append(node('span', String(variants[type].length)));
    $('categories').append(btn);
  }
  document.querySelectorAll('[data-category]').forEach((btn) =>
    btn.addEventListener('click', () => {
      category = btn.dataset.category;
      showPage('components');
      gallery();
    }),
  );
}
const first = [
  'hero-canvas',
  'features-bento',
  'hero-console',
  'features-terminal-grid',
  'hero-journal',
  'features-lattice',
  'hero-pipeline',
  'diagram-beam',
  'hero-swiss',
  'code-terminal',
  'badges-dot',
  'features-columns',
  'diagram-flow',
  'metrics-strip',
  'hero-editorial',
  'timeline-rail',
  'links-buttons',
  'hero-terminal',
  'comparison-scorecard',
  'codegroup-disclosures',
];
function gallery() {
  const query = $('search').value.toLowerCase(),
    sorted = [...samples].sort((a, b) => {
      const ai = first.indexOf(a.id),
        bi = first.indexOf(b.id);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    }),
    shown = sorted.filter(
      (sample) =>
        (category === 'all' || sample.type === category) &&
        `${componentInfo[sample.type].name} ${sample.variant}`.toLowerCase().includes(query),
    );
  $('gallery').replaceChildren();
  for (const sample of shown) {
    const btn = node('button', undefined, 'component-card');
    btn.dataset.component = sample.id;
    const preview = node('div', undefined, 'sample' + (galleryMode === 'dark' ? ' dark' : '')),
      doc = node('div', undefined, 'document');
    doc.inert = true;
    doc.setAttribute('aria-hidden', 'true');
    preview.append(doc);
    const info = componentInfo[sample.type];
    btn.setAttribute('aria-label', info.name + ' — ' + sample.variant);
    const meta = node('div', undefined, 'card-meta'),
      names = node('div');
    names.append(
      node('strong', sample.type === 'hero' ? designs[sample.variant].name + ' header' : info.name),
      node('small', sample.variant),
    );
    meta.append(names, node('span', render(sample.config).assets.size ? 'SVG + MD' : 'Native'));
    btn.append(preview, meta);
    $('gallery').append(btn);
    renderDocument(doc, sample.config, galleryMode, false, true);
    btn.addEventListener('click', () => openComponent(sample));
  }
  document
    .querySelectorAll('[data-category]')
    .forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.category === category));
  $('collection-title').textContent =
    category === 'all' ? 'All components' : componentInfo[category].name;
  $('empty-gallery').hidden = shown.length > 0;
}
function componentUpdate() {
  const errors = [];
  try {
    render(modalConfig);
  } catch (error) {
    errors.push(...(error.errors || [{ message: error.message }]));
  }
  if (errors.length) {
    $('component-error').textContent = errors
      .map((e) => (e.path ? e.path + ': ' + e.message : e.message))
      .join('\n');
    return;
  }
  $('component-error').textContent = '';
  if (active?.type === 'hero')
    $('modal-name').textContent = designFor(modalConfig).name + ' header';
  $('component-config').value = JSON.stringify(modalConfig, null, 2);
  renderDocument($('component-preview'), modalConfig, modalMode);
  $('modal-accent').value =
    modalConfig.blocks[0].style?.accent ||
    modalConfig.style?.accent ||
    designFor(modalConfig).accent;
  document
    .querySelectorAll('[data-modal-mode]')
    .forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.modalMode === modalMode));
}
function openComponent(sample) {
  active = sample;
  modalConfig = structuredClone(sample.config);
  modalMode = galleryMode;
  $('modal-type').textContent =
    componentInfo[sample.type].name.toUpperCase() + ' / ' + componentInfo[sample.type].output;
  $('modal-name').textContent =
    sample.type === 'hero'
      ? designs[sample.variant].name + ' header'
      : componentInfo[sample.type].name;
  $('modal-purpose').textContent = componentInfo[sample.type].purpose;
  $('variant').replaceChildren();
  for (const v of variants[sample.type]) {
    const o = node('option', v);
    o.value = v;
    $('variant').append(o);
  }
  $('variant').value = sample.variant;
  $('component-status').textContent = 'Ready';
  $('component-dialog').showModal();
  componentUpdate();
}
function blockControls() {
  $('blocks').replaceChildren();
  config.blocks.forEach((block, i) => {
    const row = node('div', undefined, 'block-row'),
      label = node('label'),
      check = node('input');
    check.type = 'checkbox';
    check.checked = !disabled.has(block.id);
    check.setAttribute('aria-label', 'Include ' + block.id);
    check.addEventListener('change', () => {
      check.checked ? disabled.delete(block.id) : disabled.add(block.id);
      update();
    });
    label.append(check, node('span', block.title || block.id));
    row.append(label);
    for (const [text, delta] of [
      ['↑', -1],
      ['↓', 1],
    ]) {
      const button = node('button', text);
      button.setAttribute('aria-label', `Move ${block.id} ${delta < 0 ? 'up' : 'down'}`);
      button.disabled = i + delta < 0 || i + delta >= config.blocks.length;
      button.addEventListener('click', () => {
        [config.blocks[i], config.blocks[i + delta]] = [config.blocks[i + delta], config.blocks[i]];
        blockControls();
        update();
      });
      row.append(button);
    }
    $('blocks').append(row);
  });
}
function update() {
  const chosen = { ...config, blocks: config.blocks.filter((b) => !disabled.has(b.id)) };
  $('basket-count').textContent = config.blocks.length;
  $('design').value = config.design || designFor(config).hero;
  $('project').value = config.project || 'cli';
  $('accent').value = config.style?.accent || designFor(config).accent;
  $('density').value = config.style?.density || 'compact';
  $('phone').setAttribute('aria-pressed', phone);
  document
    .querySelectorAll('[data-compose-mode]')
    .forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.composeMode === composeMode));
  for (const key of ['preview', 'markdown']) $(key).hidden = tab !== key;
  $('config-panel').hidden = tab !== 'config';
  document
    .querySelectorAll('[data-tab]')
    .forEach((btn) => btn.setAttribute('aria-selected', btn.dataset.tab === tab));
  if (!chosen.blocks.length) {
    current = null;
    $('preview').replaceChildren();
    $('markdown').textContent = '';
    $('status').textContent = 'Choose at least one component.';
    $('copy').disabled = $('download').disabled = true;
    return;
  }
  current = { config: chosen, ...render(chosen) };
  renderDocument($('preview'), chosen, composeMode, phone);
  $('markdown').textContent = current.markdown;
  $('config').value = JSON.stringify(chosen, null, 2);
  $('copy').disabled = $('download').disabled = false;
  $('copy').textContent = tab === 'markdown' ? 'Copy Markdown' : 'Copy config';
  $('status').textContent =
    `${chosen.blocks.length} components / ${current.assets.size} local SVGs`;
  const audit = auditConfig(chosen);
  $('audit').textContent = audit.missing.length
    ? 'Check these sections: ' + audit.missing.map((s) => sections[s].name).join(', ')
    : 'The essential sections for this project type are present.';
}
function sectionGuide() {
  const profile = projects[$('section-project').value];
  $('section-guide').replaceChildren();
  Object.entries(sections).forEach(([id, section], i) => {
    const row = node('div', undefined, 'section-row'),
      name = node('div'),
      question = node('div');
    name.append(node('h2', section.name));
    question.append(node('p', section.question));
    const a = node('a', 'Components: ' + section.blocks.join(', '));
    a.href = '#';
    a.addEventListener('click', (event) => {
      event.preventDefault();
      category = section.blocks[0];
      showPage('components');
      gallery();
    });
    question.append(a);
    row.append(
      node('span', String(i + 1).padStart(2, '0'), 'number'),
      name,
      question,
      node(
        'small',
        profile.essential.includes(id)
          ? 'Essential'
          : profile.recommended.includes(id)
            ? 'Recommended'
            : 'When useful',
      ),
    );
    $('section-guide').append(row);
  });
}
async function copy(value, status) {
  try {
    await navigator.clipboard.writeText(value);
    $(status).textContent = 'Copied.';
  } catch {
    $(status).textContent = 'Clipboard unavailable. Select and copy the configuration text.';
  }
}
const downloadUrls = new Map();
async function download(cfg, status) {
  try {
    const result = render(cfg),
      files = new Map([
        ['README.md', result.markdown],
        ['open-readme.json', JSON.stringify(cfg, null, 2) + '\n'],
        ['schema.json', JSON.stringify(schema, null, 2) + '\n'],
      ]);
    for (const [name, body] of result.assets) files.set('assets/open-readme/' + name, body);
    for (const block of cfg.blocks) {
      const media = block.type === 'media' ? [block] : block.type === 'gallery' ? block.items : [];
      for (const item of media)
        if (/^\.\/assets\/[a-z0-9-]+\.svg$/.test(item.src)) {
          const response = await fetch(item.src);
          if (!response.ok) throw new Error('Example image is unavailable.');
          files.set(item.src.slice(2), await response.text());
        }
    }
    const url = URL.createObjectURL(new Blob([createZip(files)], { type: 'application/zip' })),
      a = node('a');
    a.href = url;
    a.textContent = 'Download ZIP';
    a.download = 'open-readme-' + (cfg.blocks.length === 1 ? cfg.blocks[0].id : 'bundle') + '.zip';
    if (downloadUrls.has(status)) URL.revokeObjectURL(downloadUrls.get(status));
    downloadUrls.set(status, url);
    $(status).replaceChildren(document.createTextNode('ZIP ready. '), a);
    a.click();
  } catch (error) {
    $(status).textContent = error.message;
  }
}
for (const [id, values] of [
  ['design', designs],
  ['project', projects],
  ['section-project', projects],
])
  for (const [value, info] of Object.entries(values)) {
    const option = node('option', info.name);
    option.value = value;
    $(id).append(option);
  }
document
  .querySelectorAll('[data-page]')
  .forEach((btn) => btn.addEventListener('click', () => showPage(btn.dataset.page)));
document.querySelectorAll('[data-gallery-mode]').forEach((btn) =>
  btn.addEventListener('click', () => {
    galleryMode = btn.dataset.galleryMode;
    document
      .querySelectorAll('[data-gallery-mode]')
      .forEach((b) => b.setAttribute('aria-pressed', b === btn));
    gallery();
  }),
);
document.querySelectorAll('[data-modal-mode]').forEach((btn) =>
  btn.addEventListener('click', () => {
    modalMode = btn.dataset.modalMode;
    componentUpdate();
  }),
);
document.querySelectorAll('[data-compose-mode]').forEach((btn) =>
  btn.addEventListener('click', () => {
    composeMode = btn.dataset.composeMode;
    update();
  }),
);
$('search').addEventListener('input', gallery);
$('close-modal').addEventListener('click', () => $('component-dialog').close());
$('variant').addEventListener('change', () => {
  if (active.type === 'hero') {
    modalConfig.design = $('variant').value;
    modalConfig.theme = designs[modalConfig.design].theme;
    delete modalConfig.style?.accent;
  } else modalConfig.blocks[0].layout = $('variant').value;
  componentUpdate();
});
$('modal-accent').addEventListener('input', () => {
  modalConfig.blocks[0].style ||= {};
  modalConfig.blocks[0].style.accent = $('modal-accent').value;
  componentUpdate();
});
$('apply-component').addEventListener('click', () => {
  try {
    const next = JSON.parse($('component-config').value);
    render(next);
    modalConfig = next;
    componentUpdate();
  } catch (error) {
    $('component-error').textContent =
      error.errors?.map((e) => e.path + ': ' + e.message).join('\n') || error.message;
  }
});
$('copy-component').addEventListener('click', () =>
  copy(JSON.stringify(modalConfig, null, 2) + '\n', 'component-status'),
);
$('download-component').addEventListener('click', () => download(modalConfig, 'component-status'));
$('add-component').addEventListener('click', () => {
  const block = structuredClone(modalConfig.blocks[0]);
  block.style = { ...modalConfig.style, ...block.style };
  if (block.type === 'hero') {
    const i = config.blocks.findIndex((b) => b.type === 'hero');
    if (i >= 0) config.blocks[i] = block;
    else config.blocks.unshift(block);
    config.design = modalConfig.design;
    config.theme = modalConfig.theme;
  } else {
    const stem = block.id;
    let n = 2;
    while (config.blocks.some((b) => b.id === block.id)) block.id = stem + '-' + n++;
    config.blocks.push(block);
  }
  disabled = new Set();
  blockControls();
  update();
  $('component-status').textContent = 'Added to your README.';
  $('add-component').textContent = 'Added ✓';
  setTimeout(() => ($('add-component').textContent = 'Add to README +'), 1200);
});
$('example').addEventListener('change', () => {
  config = structuredClone(examples[$('example').value]);
  disabled = new Set();
  blockControls();
  update();
});
$('design').addEventListener('change', () => {
  config.design = $('design').value;
  config.theme = designs[config.design].theme;
  delete config.style?.accent;
  update();
});
$('project').addEventListener('change', () => {
  config.project = $('project').value;
  update();
});
$('new-starter').addEventListener('click', () => {
  config = createStarter($('project').value, $('design').value);
  disabled = new Set();
  blockControls();
  update();
});
for (const key of ['accent', 'density'])
  $(key).addEventListener('input', () => {
    config.style ||= {};
    config.style[key] = $(key).value;
    update();
  });
$('phone').addEventListener('click', () => {
  phone = !phone;
  update();
});
document.querySelectorAll('[data-tab]').forEach((btn) =>
  btn.addEventListener('click', () => {
    tab = btn.dataset.tab;
    update();
  }),
);
$('apply-config').addEventListener('click', () => {
  try {
    const next = JSON.parse($('config').value);
    render(next);
    config = next;
    disabled = new Set();
    $('config-error').textContent = '';
    blockControls();
    update();
  } catch (error) {
    $('config-error').textContent =
      error.errors?.map((e) => e.path + ': ' + e.message).join('\n') || error.message;
  }
});
$('copy').addEventListener('click', () =>
  copy(
    tab === 'markdown' ? current.markdown : JSON.stringify(current.config, null, 2) + '\n',
    'status',
  ),
);
$('download').addEventListener('click', () => download(current.config, 'status'));
$('section-project').addEventListener('change', sectionGuide);
$('component-count').textContent = samples.length;
categories();
gallery();
blockControls();
update();
sectionGuide();
showPage('designs');
window.addEventListener('resize', () => {
  if (!$('page-designs').hidden)
    renderDocument($('design-preview'), selectedDesign.config, designMode, designPhone);
  if (!$('page-compose').hidden && current)
    renderDocument($('preview'), current.config, composeMode, phone);
  if ($('component-dialog').open) renderDocument($('component-preview'), modalConfig, modalMode);
});
