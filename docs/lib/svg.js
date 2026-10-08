import { tokens } from './themes.js?v=0.2.0';
import { designFor } from './designs.js?v=0.2.0';
import { xml, wrap, label, line, rect, circle, measure, svg } from './drawing.js?v=0.2.0';
import { compositionHero, featureBoard, beamDiagram } from './composed-visuals.js?v=0.2.0';
export { xml, wrap } from './drawing.js?v=0.2.0';

function hero(block, config, t, w, mobile) {
  const composed = compositionHero(block, t, w, mobile, designFor(config).hero);
  if (composed) return composed;
  const design = designFor(config).hero,
    p = t.pad,
    inner = w - 2 * p;
  const eyebrow = block.eyebrow || '',
    meta = block.meta || '',
    mark = block.mark || '/';
  let body = '',
    h = 0;
  const rule = (y) => line(p, y, w - p, y, t.border);
  const titleAt = (x, y, width, size, font = t.font, weight = 600, anchor = 'start') => {
    const rows = wrap(block.title, width, size, font);
    body += label(rows, x, y, size, t.fg, font, weight, 1.07, anchor);
    return y + (rows.length - 1) * size * 1.07;
  };
  const subAt = (x, y, width, size = 18, anchor = 'start') => {
    const rows = wrap(block.subtitle, width, size, 'sans');
    body += label(rows, x, y, size, t.muted, 'sans', 400, 1.45, anchor);
    return y + (rows.length - 1) * size * 1.45;
  };
  if (design === 'plain') {
    body +=
      rect(p, p, 30, 30, t.accent, 'none', 7) +
      label(mark, p + 15, p + 21, 17, t.bg, 'mono', 500, 1, 'middle');
    if (eyebrow) body += label(eyebrow, p + 43, p + 21, 12, t.muted, 'mono');
    let y = titleAt(p, p + 84, inner, mobile ? 39 : 50);
    y = subAt(p, y + 35, Math.min(inner, 740));
    h = y + p + 25;
    body += rule(h - 12);
  }
  if (design === 'swiss') {
    body += rect(0, 0, 9, w, t.accent);
    body += label(eyebrow.toUpperCase(), p + 9, p + 15, 12, t.muted, 'mono');
    const right = mobile ? 0 : 130,
      size = mobile ? 52 : 76;
    let y = titleAt(p + 9, p + 103, inner - right, size, 'sans', 700);
    if (!mobile)
      body +=
        rect(w - p - 92, p + 52, 92, 92, t.accent) +
        label(mark, w - p - 46, p + 118, 60, t.bg, 'sans', 500, 1, 'middle');
    y = subAt(p + 9, y + 44, inner - right);
    h = y + p + 40;
    body += line(p + 9, h - 19, w - p, h - 19, t.fg, 2);
    if (meta) body += label(meta, w - p, h - 2, 10, t.muted, 'mono', 400, 1, 'end');
  }
  if (design === 'editorial') {
    body += rule(p) + label(eyebrow.toUpperCase(), p, p + 23, 11, t.muted, 'mono');
    let y = titleAt(p, p + 105, inner, mobile ? 54 : 74, 'serif', 400);
    y = subAt(p, y + 40, Math.min(inner, 760), 19);
    h = y + p + 40;
    body += rule(h - 16);
    if (meta) body += label(meta, p, h - 1, 10, t.muted, 'mono');
  }
  if (design === 'terminal') {
    body += rect(1, 1, w - 2, 42, t.surface, t.border, t.radius);
    body += circle(20, 21, 4, t.muted) + circle(36, 21, 4, t.border) + circle(52, 21, 4, t.border);
    body += label(eyebrow || 'README.md', w / 2, 25, 11, t.muted, 'mono', 400, 1, 'middle');
    body += label('>_', p, 88, 28, t.accent, 'mono', 600);
    let y = titleAt(p + 48, 88, inner - 48, mobile ? 33 : 43, 'mono', 500);
    y = subAt(p, y + 34, inner, 17);
    if (block.command) {
      const rows = wrap('$ ' + block.command, inner, 14, 'mono');
      y += 39;
      body += label(rows, p, y, 14, t.accent, 'mono');
      y += (rows.length - 1) * 19;
    }
    h = y + p + 22;
    body += rect(1, 43, w - 2, h - 44, 'none', t.border, t.radius);
  }
  if (design === 'blueprint') {
    body +=
      `<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">${circle(1, 1, 0.8, t.border)}</pattern></defs>` +
      rect(0, 0, w, 340, 'url(#grid)');
    body +=
      line(p, p, w - p, p, t.accent) +
      label(eyebrow.toUpperCase(), p, p + 24, 11, t.accent, 'mono');
    let y = titleAt(p, p + 110, inner, mobile ? 38 : 58, 'mono', 500);
    y = subAt(p, y + 38, Math.min(inner, 730));
    h = y + p + 35;
    for (const x of [p, w - p])
      body += line(x - 7, h - 17, x + 7, h - 17, t.accent) + line(x, h - 24, x, h - 10, t.accent);
    if (meta) body += label(meta, w - p, h - 32, 10, t.muted, 'mono', 400, 1, 'end');
  }
  if (design === 'product') {
    body +=
      circle(w / 2, p + 12, 17, t.accent) +
      label(mark, w / 2, p + 18, 18, t.bg, 'sans', 600, 1, 'middle');
    if (eyebrow) body += label(eyebrow, w / 2, p + 59, 11, t.muted, 'mono', 400, 1, 'middle');
    let y = titleAt(w / 2, p + 125, inner - 20, mobile ? 45 : 65, 'sans', 650, 'middle');
    y = subAt(w / 2, y + 39, Math.min(inner - 20, 740), 18, 'middle');
    h = y + p + 30;
    body += line(w / 2 - 35, h - 12, w / 2 + 35, h - 12, t.accent, 3);
  }
  if (design === 'studio') {
    const right = mobile ? 0 : 240;
    body += label(eyebrow.toUpperCase(), p, p + 18, 11, t.muted, 'mono');
    let y = titleAt(p, p + 101, inner - right, mobile ? 50 : 65, 'sans', 500);
    y = subAt(p, y + 42, inner - right, 18);
    h = y + p + 30;
    if (!mobile) {
      const x = w - p - 115,
        cy = Math.max(145, h / 2);
      body +=
        circle(x, cy, 82, t.accent) +
        rect(x - 17, cy - 115, 34, 230, t.fg) +
        label(mark, x, cy + 25, 62, t.bg, 'serif', 400, 1, 'middle');
    }
    body += rule(h - 12);
  }
  if (design === 'atlas') {
    body +=
      rect(p, p, inner, 24, t.surface) +
      label(eyebrow.toUpperCase(), p + 12, p + 16, 10, t.muted, 'mono');
    let y = titleAt(p, p + 110, inner, mobile ? 51 : 73, 'sans', 500);
    y = subAt(p, y + 40, Math.min(inner, 700), 18);
    h = y + p + 30;
    body += rect(p, h - 15, 60, 5, t.accent) + line(p + 70, h - 13, w - p, h - 13, t.border);
    if (meta) body += label(meta, w - p, p + 16, 10, t.muted, 'mono', 400, 1, 'end');
  }
  return svg(w, h, body, `${block.title} — ${block.subtitle}`, t);
}
function features(block, t, w, mobile, fallback) {
  const layout = block.layout || fallback,
    p = t.pad,
    inner = w - 2 * p;
  const board = featureBoard(block, t, w, mobile, layout);
  if (board) return board;
  let y = p,
    body = '';
  if (layout === 'columns') {
    const cols = mobile ? 1 : Math.min(3, block.items.length),
      cw = inner / cols;
    for (let start = 0; start < block.items.length; start += cols) {
      let maxH = 0;
      for (let c = 0; c < cols && start + c < block.items.length; c++) {
        const item = block.items[start + c],
          x = p + c * cw,
          usable = cw - 28,
          title = wrap(item.title, usable, 22, t.font),
          desc = wrap(item.description, usable, 16, 'sans');
        body +=
          line(x, y, x + usable, y, t.border) +
          label(String(start + c + 1).padStart(2, '0'), x, y + 25, 11, t.accent, 'mono');
        body += label(title, x, y + 63, 22, t.fg, t.font, 600, 1.2);
        const dy = y + 63 + (title.length - 1) * 26 + 32;
        body += label(desc, x, dy, 16, t.muted, 'sans');
        maxH = Math.max(maxH, dy - y + (desc.length - 1) * 23 + 28);
      }
      y += maxH + 14;
    }
  } else
    for (let i = 0; i < block.items.length; i++) {
      const item = block.items[i],
        index = layout === 'index',
        left = index ? 52 : 0,
        titleWidth = mobile ? inner - left : inner * 0.4 - left;
      const title = wrap(item.title, titleWidth, 22, t.font),
        descWidth = mobile ? inner - left : inner * 0.56,
        desc = wrap(item.description, descWidth, 16, 'sans');
      body += line(p, y, w - p, y, t.border);
      if (index) body += label(String(i + 1).padStart(2, '0'), p, y + 35, 13, t.accent, 'mono');
      body += label(title, p + left, y + 36, 22, t.fg, t.font, 500, 1.2);
      const descY = mobile ? y + 36 + (title.length - 1) * 26 + 29 : y + 32,
        descX = mobile ? p + left : p + inner * 0.44;
      body += label(desc, descX, descY, 16, t.muted, 'sans');
      y = Math.max(y + 36 + (title.length - 1) * 26, descY + (desc.length - 1) * 23) + 27;
    }
  body += line(p, y, w - p, y, t.border);
  return svg(w, y + p, body, block.items.map((i) => `${i.title}: ${i.description}`).join('; '), t);
}
function diagram(block, t, w, mobile) {
  const p = t.pad,
    inner = w - 2 * p,
    layout = block.layout || 'flow';
  if (layout === 'beam') return beamDiagram(block, t, w, mobile);
  let body = '',
    h;
  if (layout === 'hub') {
    const n = block.items.length,
      cx = w / 2,
      cy = mobile ? 230 : 200,
      r = mobile ? 145 : 150;
    h = cy + r + 75;
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n - Math.PI / 2,
        x = cx + Math.cos(a) * (mobile ? r : r * 1.85),
        y = cy + Math.sin(a) * r;
      body += line(cx, cy, x, y, t.border, 2) + circle(x, y, 6, t.accent);
      body += label(
        wrap(block.items[i].title, mobile ? 140 : 180, 16, 'sans'),
        x,
        y + 28,
        16,
        t.fg,
        'sans',
        500,
        1.3,
        'middle',
      );
    }
    body +=
      circle(cx, cy, mobile ? 56 : 68, t.surface, t.accent) +
      label(
        wrap(block.center || 'System', 100, 18, 'sans'),
        cx,
        cy - 3,
        18,
        t.fg,
        'sans',
        600,
        1.2,
        'middle',
      );
  } else if (layout === 'stack' || mobile) {
    let y = p;
    for (let i = 0; i < block.items.length; i++) {
      const item = block.items[i],
        title = wrap(item.title, inner - 100, 21, t.font),
        desc = item.description ? wrap(item.description, inner - 100, 14, 'sans') : [],
        rh = 42 + title.length * 24 + desc.length * 20;
      if (i) body += line(w / 2, y - 20, w / 2, y, t.accent, 2);
      body +=
        rect(p, y, inner, rh, t.surface, t.border, 4) +
        label(String(i + 1).padStart(2, '0'), p + 16, y + 37, 12, t.accent, 'mono') +
        label(title, p + 58, y + 37, 21, t.fg, t.font, 500, 1.15);
      if (desc.length)
        body += label(desc, p + 58, y + 37 + title.length * 24 + 3, 14, t.muted, 'sans');
      y += rh + 25;
    }
    h = y;
  } else {
    const n = block.items.length,
      cw = inner / n,
      gap = 20;
    let max = 100;
    for (const item of block.items)
      max = Math.max(
        max,
        wrap(item.title, cw - 40, 20, t.font).length * 24 +
          (item.description ? wrap(item.description, cw - 40, 14, 'sans').length * 20 : 0) +
          67,
      );
    const y = p + 28;
    for (let i = 0; i < n; i++) {
      const item = block.items[i],
        x = p + i * cw,
        title = wrap(item.title, cw - gap - 22, 20, t.font),
        desc = item.description ? wrap(item.description, cw - gap - 22, 14, 'sans') : [];
      if (i)
        body +=
          line(x - gap, y + max / 2, x, y + max / 2, t.accent, 2) +
          `<path d="M${x - 5} ${y + max / 2 - 4}l5 4-5 4" stroke="${t.accent}" fill="none"/>`;
      body +=
        rect(x, y, cw - gap, max, t.surface, t.border, 4) +
        label(String(i + 1).padStart(2, '0'), x + 12, y + 23, 10, t.accent, 'mono') +
        label(title, x + 12, y + 57, 20, t.fg, t.font, 500, 1.2);
      if (desc.length)
        body += label(desc, x + 12, y + 57 + title.length * 24 + 3, 14, t.muted, 'sans');
    }
    h = y + max + p;
  }
  return svg(w, h, body, block.items.map((i) => i.title).join(layout === 'hub' ? ' · ' : ' → '), t);
}
function metrics(block, t, w, mobile) {
  const p = t.pad,
    inner = w - p * 2,
    layout = block.layout || 'strip';
  let body = '',
    h = 0;
  if (layout === 'columns' || (mobile && block.items.length > 3)) {
    let y = p;
    for (const item of block.items) {
      const vals = wrap(item.value, inner * 0.4, 40, t.font),
        names = wrap(item.label, inner * 0.5, 16, 'sans'),
        rh = Math.max(vals.length * 46, names.length * 23) + 28;
      body +=
        line(p, y, w - p, y, t.border) +
        label(vals, p, y + 49, 40, t.fg, t.font, 500, 1.15) +
        label(names, p + inner * 0.46, y + 40, 16, t.muted, 'sans');
      y += rh;
    }
    body += line(p, y, w - p, y, t.border);
    h = y + p;
  } else {
    const n = block.items.length,
      cw = inner / n,
      size = mobile ? 31 : 44;
    let max = 0;
    for (let i = 0; i < n; i++) {
      const item = block.items[i],
        x = p + i * cw,
        values = wrap(item.value, cw - 20, size, t.font),
        names = wrap(item.label, cw - 20, 14, 'sans'),
        ny = p + size + (values.length - 1) * size * 1.1 + 31;
      if (layout === 'scoreboard') body += line(x, p, x + cw - 17, p, t.accent, 3);
      else if (i) body += line(x - 15, p, x - 15, ny + names.length * 20, t.border);
      body +=
        label(values, x, p + size + 17, size, t.fg, t.font, 500, 1.1) +
        label(names, x, ny + 17, 14, t.muted, 'sans');
      max = Math.max(max, ny + 17 + (names.length - 1) * 20);
    }
    h = max + p;
  }
  return svg(w, h, body, block.items.map((i) => `${i.label}: ${i.value}`).join('; '), t);
}
function rail(block, t, w) {
  let y = t.pad,
    body = '',
    p = t.pad;
  for (let i = 0; i < block.items.length; i++) {
    const item = block.items[i],
      title = wrap(item.title, w - 2 * p - 40, 22, t.font),
      desc = wrap(item.description, w - 2 * p - 40, 16, 'sans'),
      dy = y + 35 + title.length * 26,
      rh = 35 + title.length * 26 + desc.length * 23 + 27;
    if (i < block.items.length - 1) body += line(p + 5, y + 11, p + 5, y + rh + 11, t.border, 2);
    body +=
      circle(p + 5, y + 11, 5, item.status === 'shipped' ? t.accent : t.bg, t.accent) +
      label(item.status.toUpperCase().replace('-', ' '), p + 27, y + 15, 10, t.accent, 'mono');
    body +=
      label(title, p + 27, y + 49, 22, t.fg, t.font, 500, 1.2) +
      label(desc, p + 27, dy + 26, 16, t.muted, 'sans');
    y += rh;
  }
  return svg(
    w,
    y + t.pad,
    body,
    block.items.map((i) => `${i.status}: ${i.title} — ${i.description}`).join('; '),
    t,
  );
}
export function renderSvg(block, config, mode = 'light', mobile = false) {
  config = { ...config, style: { ...config.style, ...block.style } };
  const t = tokens(config, mode),
    w = mobile ? 560 : t.width,
    p = t.pad,
    inner = w - 2 * p;
  if (block.type === 'hero') return hero(block, config, t, w, mobile);
  if (block.type === 'features') return features(block, t, w, mobile, designFor(config).features);
  if (block.type === 'feature')
    return features({ items: [block], layout: 'rows' }, t, w, mobile, 'rows');
  if (block.type === 'diagram' || block.type === 'steps') return diagram(block, t, w, mobile);
  if (block.type === 'metrics') return metrics(block, t, w, mobile);
  if (block.type === 'timeline') return rail(block, t, w);
  if (block.type === 'badge' || block.type === 'link') {
    const isLink = block.type === 'link',
      str = isLink ? block.label : `${block.label} / ${block.value}`,
      layout = block.layout || 'dot',
      size = isLink ? 14 : 12,
      bw = Math.ceil(Math.min(w, Math.max(80, measure(str, size, 'mono') + 36))),
      rows = wrap(str, bw - 30, size, 'mono'),
      h = 32 + (rows.length - 1) * 18;
    let body = '';
    if (layout === 'split' && !isLink && rows.length === 1) {
      const lw = Math.min(bw - 25, Math.ceil(measure(block.label, 12, 'mono') + 20));
      body += rect(0, 0, bw, h, t.surface, t.border, 3) + rect(lw, 0, bw - lw, h, t.accent);
      body +=
        label(block.label, 10, 21, 12, t.fg, 'mono') +
        label(block.value, lw + 10, 21, 12, t.bg, 'mono');
    } else {
      if (layout === 'outline' || isLink)
        body += rect(0.5, 0.5, bw - 1, h - 1, t.bg, t.border, t.radius);
      if (layout === 'dot') body += circle(11, 16, 3, t.accent);
      body += label(rows, layout === 'dot' ? 22 : 12, 21, size, t.fg, 'mono');
      if (isLink) body += label('↗', bw - 13, 20, 13, t.accent, 'sans');
    }
    return svg(bw, h, body, str, t, false);
  }
  if (block.type === 'code') {
    const rows = block.code.split('\n').flatMap((source, i) =>
      wrap(source, inner - 42, 15, 'mono').map((value, j) => ({
        value,
        number: i + 1,
        first: j === 0,
      })),
    );
    let body =
      rect(0.5, 0.5, w - 1, 42, t.surface, t.border, t.radius) +
      label(block.filename || block.language || 'shell', p, 26, 11, t.muted, 'mono');
    body += circle(w - 26, 22, 3, t.accent);
    let y = 74;
    for (let i = 0; i < rows.length; i++) {
      if (block.highlight?.includes(rows[i].number))
        body += rect(p - 8, y - 17, inner + 16, 23, t.surface);
      body +=
        label(
          rows[i].first ? String(rows[i].number).padStart(2, ' ') : '',
          p,
          y,
          11,
          t.muted,
          'mono',
        ) +
        label(rows[i].value, p + 35, y, 15, rows[i].value.startsWith('#') ? t.muted : t.fg, 'mono');
      y += 23;
    }
    body += rect(0.5, 42, w - 1, y + p - 43, 'none', t.border, t.radius);
    return svg(w, y + p, body, block.code, t);
  }
  if (block.type === 'comparison') {
    const n = block.columns.length,
      cw = inner / n,
      bodyRows = [block.columns, ...block.rows];
    let y = p,
      body = '';
    for (let i = 0; i < bodyRows.length; i++) {
      const rows = bodyRows[i].map((value) =>
          wrap(value, cw - 25, i ? 15 : 12, i ? 'sans' : 'mono'),
        ),
        rh = Math.max(...rows.map((r) => r.length)) * 22 + 27;
      if (i === 0) body += rect(p, y, inner, rh, t.surface);
      body += line(p, y + rh, w - p, y + rh, t.border);
      for (let c = 0; c < n; c++)
        body += label(
          rows[c],
          p + c * cw + 10,
          y + 25,
          i ? 15 : 12,
          i ? t.fg : t.accent,
          i ? 'sans' : 'mono',
          i ? 400 : 600,
        );
      y += rh;
    }
    return svg(w, y + p, body, block.title || 'Comparison', t);
  }
  if (block.type === 'windowbar')
    return svg(
      w,
      36,
      rect(0.5, 0.5, w - 1, 35, t.surface, t.border, 5) +
        circle(17, 18, 3, t.muted) +
        circle(30, 18, 3, t.border) +
        circle(43, 18, 3, t.border) +
        label(block.label || 'Demo', w / 2, 23, 11, t.muted, 'mono', 400, 1, 'middle'),
      block.label || 'Demo',
      t,
    );
  throw new Error(`No SVG renderer for ${block.type}.`);
}
