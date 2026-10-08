import { systemBeam } from './section-visuals.js';
import { xml, wrap, label, line, rect, circle, svg } from './drawing.js';

const paragraph = (text, x, y, width, size, color, font = 'sans', weight = 400, leading = 1.35) => {
  const rows = wrap(text, width, size, font);
  return {
    body: label(rows, x, y, size, color, font, weight, leading),
    bottom: y + (rows.length - 1) * size * leading,
  };
};
const curve = (x1, y1, x2, y2, color, width = 1.5) => {
  const mid = (x1 + x2) / 2;
  return `<path d="M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
};
function codePicture(source, x, y, width, t, size = 14, maxLines = 7) {
  size *= t.scale || 1;
  const rows = source.split('\n').flatMap((s) => wrap(s, width, size, 'mono'));
  let body = '';
  rows.slice(0, maxLines).forEach((s, i) => {
    const color = /^\s*(#|\/\/)/.test(s) ? t.muted : /["':{}]/.test(s) ? t.accent : t.fg;
    body += label(s, x, y + i * size * 1.5, size, color, 'mono');
  });
  if (rows.length > maxLines)
    body += label('… full example below', x, y + maxLines * size * 1.5, size - 1, t.muted, 'mono');
  return { body, height: Math.min(rows.length, maxLines + 1) * size * 1.5 };
}
function pagePicture(source, x, y, width, t, size = 16) {
  const rows = source.split('\n').filter(Boolean);
  let body = '',
    bottom = y;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const heading = /^#/.test(rows[i]);
    const text = rows[i].replace(/^#+\s*/, '');
    const p = paragraph(
      text,
      x,
      bottom,
      width,
      i === 0 ? size * 1.6 : size,
      i === 0 ? t.fg : t.muted,
      heading ? 'sans' : 'mono',
      heading ? 600 : 400,
    );
    body += p.body;
    bottom = p.bottom + size * (heading ? 1.8 : 1.7);
    if (heading) body += line(x, bottom - size * 0.9, x + width, bottom - size * 0.9, t.border);
  }
  return { body, height: bottom - y };
}

// A masthead belongs to the document's text column. Keep it transparent and
// aligned with native Markdown; a demo is opt-in, never a second UI inside it.
export function compositionHero(block, t, w, mobile, design) {
  if (!['canvas', 'console', 'journal', 'pipeline'].includes(design)) return null;
  const space = t.pad - 28,
    font =
      t.customFont || (design === 'console' ? 'mono' : design === 'journal' ? 'serif' : 'sans'),
    inset = design === 'pipeline' ? 24 : 0,
    width = w - inset - 2,
    size = mobile ? 40 : design === 'journal' ? 60 : 48;
  let body = '',
    y = 17 + space;
  if (block.eyebrow) {
    const eyebrow = paragraph(block.eyebrow, inset, y, width, mobile ? 17 : 12, t.muted, 'mono');
    body += eyebrow.body;
    y = eyebrow.bottom + 54;
  } else y = size + 5 + space;
  if (design === 'journal') {
    body += line(0, 1 + space, w, 1 + space, t.border);
  }
  const name = (design === 'console' ? '> ' : '') + block.title;
  const title = paragraph(
    name,
    inset,
    y,
    width,
    size,
    t.fg,
    font,
    design === 'journal' ? 400 : 600,
    1.12,
  );
  body += title.body;
  y = title.bottom + 34;
  if (block.headline && block.headline !== block.title) {
    const headline = paragraph(
      block.headline,
      inset,
      y,
      width,
      mobile ? 22 : 24,
      t.fg,
      font,
      400,
      1.3,
    );
    body += headline.body;
    y = headline.bottom + 32;
  }
  const sub = paragraph(
    block.subtitle,
    inset,
    y,
    width,
    mobile ? 23 : 20 * (t.scale || 1),
    t.muted,
    design === 'console' ? 'mono' : 'sans',
    400,
    1.45,
  );
  body += sub.body;
  y = sub.bottom + 28;
  if (block.command) {
    const command = paragraph(
      '$ ' + block.command,
      inset,
      y,
      width,
      mobile ? 18 : 16,
      t.accent,
      'mono',
    );
    body += command.body;
    y = command.bottom + 26;
  }
  if (block.meta) {
    const meta = paragraph(block.meta, inset, y, width, 13 * (t.scale || 1), t.muted, 'mono');
    body += meta.body;
    y = meta.bottom + 24;
  }
  // When provided, render a single restrained example. The Markdown renderer
  // preserves its complete, exact source as selectable text.
  if (block.preview) {
    const offset = block.previewLabel ? 60 : 38;
    const example = codePicture(
      block.preview,
      inset + 18,
      y + offset,
      width - 36,
      t,
      mobile ? 18 : 16,
      8,
    );
    const height = example.height + offset + 20;
    body += rect(inset, y, width, height, t.surface, t.border, t.customRadius ?? 4);
    if (block.previewLabel)
      body += label(block.previewLabel, inset + 18, y + 24, 12, t.muted, 'mono');
    body += example.body;
    y += height + 24;
  }
  if (design === 'pipeline') body += line(1, 4 + space, 1, y - 18, t.accent, 3);
  if (design === 'canvas') body += line(0, y - 5, 38, y - 5, t.accent, 3);
  if (design === 'console' || design === 'journal') body += line(0, y - 5, w, y - 5, t.border);
  return svg(
    w,
    y + 5 + space,
    body,
    [block.title, block.headline, block.subtitle, block.meta, block.preview]
      .filter(Boolean)
      .join(' — '),
    t,
    false,
  );
}

function illustration(item, x, y, width, t, mobile, expanded = false) {
  const kind = item.visual || (item.example ? 'code' : 'none');
  if (kind === 'none') return { body: '', height: 0 };
  if (kind === 'metric') {
    const value = paragraph(
      item.value || item.example || '',
      x,
      y + 44,
      width,
      48,
      t.fg,
      t.customFont || t.font,
      600,
      1.1,
    );
    return { body: value.body, height: value.bottom - y + 20 };
  }
  if (kind === 'palette') {
    const colors = item.example?.match(/#[0-9a-fA-F]{6}/g) || [t.accent, t.fg, t.border];
    let body = '';
    colors.slice(0, 5).forEach((color, i) => {
      body += circle(x + 15 + i * 38, y + 17, 14, color, t.border);
    });
    const code = item.example
      ? codePicture(item.example, x, y + 56, width, t, mobile ? 16 : 13, 3)
      : null;
    if (code) body += code.body;
    return { body, height: code ? code.height + 56 : 38 };
  }
  if (kind === 'flow') {
    const names = (item.example || '')
      .split(/\n|→/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (!names.length) return { body: '', height: 0 };
    if (expanded) {
      const cardWidth = Math.min(300, width - 48),
        size = 17;
      const cards = names.map((name, i) => {
        const rows = wrap(name, cardWidth - 67, size, 'mono');
        return {
          rows,
          x: x + (i % 2 ? width - cardWidth : 0),
          height: Math.max(74, 30 + rows.length * size * 1.4),
        };
      });
      let cursor = y,
        body = '';
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        if (i) {
          const prev = cards[i - 1],
            startX = prev.x + cardWidth * 0.6,
            endX = c.x + cardWidth * 0.4;
          body += `<path d="M${startX} ${cursor - 28}C${startX} ${cursor - 10} ${endX} ${cursor - 18} ${endX} ${cursor}" fill="none" stroke="${t.accent}" stroke-width="1.5"/>`;
        }
        body += rect(c.x + 4, cursor + 5, cardWidth, c.height, t.accent + '0A', 'none', 9);
        body += rect(c.x, cursor, cardWidth, c.height, t.surface, t.border, t.customRadius ?? 9);
        body += rect(c.x + 17, cursor + 21, 22, 28, t.bg, t.accent, 3);
        body += label(String(i + 1), c.x + 28, cursor + 40, 11, t.accent, 'mono', 500, 1, 'middle');
        body += label(c.rows, c.x + 52, cursor + 37, size, t.fg, 'mono', 400, 1.4);
        cursor += c.height + 28;
      }
      return { body, height: cursor - y - 28 };
    }
    const horizontal = width >= 350,
      cw = horizontal ? width / names.length : width;
    let body = '',
      bottom = y,
      cursor = y + 25;
    names.forEach((name, i) => {
      const nx = horizontal ? x + cw * i + cw / 2 : x + 18;
      const ny = horizontal ? y + 30 : cursor;
      if (i)
        body += horizontal
          ? line(nx - cw + 16, ny, nx - 16, ny, t.border, 1.5)
          : line(nx, ny - 26, nx, ny - 16, t.border, 1.5);
      body +=
        circle(nx, ny, 14, t.surface, t.accent) +
        label(String(i + 1), nx, ny + 4, 10, t.accent, 'mono', 500, 1, 'middle');
      const rows = wrap(name, horizontal ? cw - 12 : width - 52, mobile ? 16 : 13, 'mono');
      body += label(
        rows,
        horizontal ? nx : nx + 31,
        horizontal ? ny + 37 : ny + 5,
        mobile ? 16 : 13,
        t.fg,
        'mono',
        400,
        1.3,
        horizontal ? 'middle' : 'start',
      );
      const textEnd =
        (horizontal ? ny + 37 : ny + 5) + (rows.length - 1) * (mobile ? 16 : 13) * 1.3;
      bottom = Math.max(bottom, textEnd + 20);
      cursor = Math.max(ny + 42, textEnd + 30);
    });
    return { body, height: Math.max(horizontal ? 96 : 22 + names.length * 42, bottom - y) };
  }
  if (kind === 'preview') {
    const preview = pagePicture(
      item.example || '',
      x + 17,
      y + 36,
      width - 34,
      t,
      mobile ? 16 : 14,
    );
    return {
      body: rect(x, y, width, preview.height + 52, t.surface, t.border, 8) + preview.body,
      height: preview.height + 52,
    };
  }
  const code = codePicture(item.example || '', x + 16, y + 31, width - 32, t, mobile ? 17 : 14, 5);
  const body =
    rect(
      x,
      y,
      width,
      code.height + 44,
      t.surface,
      t.border,
      t.customRadius ?? (kind === 'files' ? 0 : 8),
    ) + code.body;
  return { body, height: code.height + 44 };
}

export function featureBoard(block, t, w, mobile, layout) {
  if (layout === 'rows' && block.items.some((i) => i.visual)) {
    const p = 1,
      inner = w - p * 2;
    let body = '',
      y = p;
    block.items.forEach((item, i) => {
      const textWidth = mobile ? inner : inner * 0.44,
        size = mobile ? 26 : 23;
      const title = paragraph(
        item.title,
        p,
        y + 37,
        textWidth,
        size,
        t.fg,
        t.customFont || t.font,
        600,
        1.15,
      );
      const desc = paragraph(
        item.description,
        p,
        title.bottom + 30,
        textWidth,
        mobile ? 21 : 16 * (t.scale || 1),
        t.muted,
      );
      const vx = mobile ? p : p + inner * 0.53,
        vy = mobile ? desc.bottom + 28 : y + 5;
      const image = illustration(item, vx, vy, mobile ? inner : inner * 0.47, t, mobile);
      const bottom = Math.max(desc.bottom, vy + image.height) + 28;
      body += label(String(i + 1).padStart(2, '0'), p, y + 10, 10, t.accent, 'mono');
      body += title.body + desc.body + image.body + line(p, bottom, w - p, bottom, t.border);
      y = bottom + 25;
    });
    return svg(
      w,
      y,
      body,
      block.items
        .map((i) => [i.title, i.description, i.example].filter(Boolean).join(': '))
        .join('; '),
      t,
      false,
    );
  }
  if (!['bento', 'lattice', 'terminal-grid'].includes(layout)) return null;
  const p = 1,
    gap = layout === 'lattice' ? 0 : 12,
    inner = w - 2 * p;
  const terminal = layout === 'terminal-grid',
    lattice = layout === 'lattice';
  const ts = mobile ? 26 : (lattice ? 27 : 22) * (t.scale || 1),
    ds = mobile ? 21 : 16 * (t.scale || 1);
  function cell(item, x, y, width, height, index) {
    const pad = (mobile ? 23 : 26) + t.pad - 28,
      usable = width - 2 * pad;
    const title = wrap(
      item.title,
      usable,
      ts,
      t.customFont || (terminal ? 'mono' : lattice ? 'serif' : 'sans'),
    );
    const desc = wrap(item.description, usable, ds, t.customFont || (terminal ? 'mono' : 'sans'));
    const contentTop = 37 + (title.length - 1) * ts * 1.15;
    const descY = contentTop + 29,
      descEnd = descY + (desc.length - 1) * ds * 1.35;
    const image = illustration(
      item,
      x + pad,
      y + pad + descEnd + 22,
      usable,
      t,
      mobile,
      index === 0 && !mobile && !terminal,
    );
    const natural = pad + descEnd + 22 + image.height + pad;
    const finalHeight = Math.max(height || 0, natural);
    let body = rect(
      x,
      y,
      width,
      finalHeight,
      lattice ? t.bg : t.surface,
      lattice ? t.border : t.border,
      t.customRadius ?? (lattice || terminal ? 0 : t.radius),
    );
    body += label(
      (terminal ? '> ' : '') + String(index + 1).padStart(2, '0'),
      x + pad,
      y + pad + 11,
      10,
      t.accent,
      'mono',
    );
    body += label(
      title,
      x + pad,
      y + pad + 37,
      ts,
      t.fg,
      t.customFont || (terminal ? 'mono' : lattice ? 'serif' : 'sans'),
      lattice ? 400 : 600,
      1.15,
    );
    body += label(
      desc,
      x + pad,
      y + pad + descY,
      ds,
      t.muted,
      t.customFont || (terminal ? 'mono' : 'sans'),
      400,
      1.35,
    );
    body += image.body;
    return { body, height: finalHeight };
  }
  let body = '',
    y = p;
  if (mobile) {
    block.items.forEach((item, i) => {
      const c = cell(item, p, y, inner, 0, i);
      body += c.body;
      y += c.height + gap;
    });
  } else if (!terminal && block.items.length >= 3) {
    const left = inner * 0.61,
      right = inner - left - gap;
    const r1 = cell(block.items[1], p + left + gap, y, right, 0, 1);
    const r2 = cell(block.items[2], p + left + gap, y + r1.height + gap, right, 0, 2);
    const main = cell(block.items[0], p, y, left, r1.height + r2.height + gap, 0);
    body += main.body + r1.body + r2.body;
    y += Math.max(main.height, r1.height + r2.height + gap) + gap;
    for (let start = 3; start < block.items.length; start += 2) {
      const count = Math.min(2, block.items.length - start),
        cw = (inner - gap * (count - 1)) / count;
      const row = Array.from({ length: count }, (_, c) =>
        cell(block.items[start + c], p + c * (cw + gap), y, cw, 0, start + c),
      );
      const height = Math.max(...row.map((c) => c.height));
      row.forEach((c, i) => {
        body += cell(block.items[start + i], p + i * (cw + gap), y, cw, height, start + i).body;
      });
      y += height + gap;
    }
  } else {
    for (let start = 0; start < block.items.length; ) {
      const count = terminal && start === 0 ? 1 : Math.min(2, block.items.length - start),
        cw = (inner - gap * (count - 1)) / count;
      const row = Array.from({ length: count }, (_, c) =>
        cell(block.items[start + c], p + c * (cw + gap), y, cw, 0, start + c),
      );
      const height = Math.max(...row.map((c) => c.height));
      row.forEach((c, i) => {
        body += cell(block.items[start + i], p + i * (cw + gap), y, cw, height, start + i).body;
      });
      y += height + gap;
      start += count;
    }
  }
  return svg(
    w,
    y + p - gap,
    body,
    block.items
      .map((i) => [i.title, i.description, i.example, i.value].filter(Boolean).join(': '))
      .join('; '),
    t,
    false,
  );
}

export function beamDiagram(block, t, w, mobile) {
  const styled = systemBeam(block, t, w, mobile);
  if (styled) return styled;
  const items = block.items,
    p = mobile ? 30 : 50,
    inner = w - 2 * p;
  if (items.length < 3) {
    const cw = inner / items.length;
    let body = '',
      height = 180;
    items.forEach((item, i) => {
      const x = p + cw * (i + 0.5);
      if (i) body += curve(x - cw + 28, 70, x - 28, 70, t.accent, 2);
      const title = wrap(item.title, cw - 15, 18, t.customFont || t.font);
      height = Math.max(height, 152 + (title.length - 1) * 18 * 1.3);
      body +=
        circle(x, 70, 28, t.surface, t.border) +
        label(String(i + 1), x, 76, 17, t.accent, 'mono', 500, 1, 'middle') +
        label(title, x, 122, 18, t.fg, t.customFont || t.font, 500, 1.3, 'middle');
    });
    return svg(w, height, body, items.map((i) => i.title).join(' → '), t);
  }
  const nodeBottom = (item) => {
    const titleRows = wrap(
      item.title,
      mobile ? 130 : 200,
      mobile ? 19 : 18,
      t.customFont || t.font,
    ).length;
    const titleEnd = 65 + (titleRows - 1) * (mobile ? 19 : 18) * 1.25;
    return (
      titleEnd +
      (item.description && !mobile
        ? 24 + (wrap(item.description, 200, 13, t.customFont || t.font).length - 1) * 13 * 1.35
        : 0)
    );
  };
  const outputs = items.slice(2),
    gap = Math.max(mobile ? 122 : 112, ...outputs.map((item) => nodeBottom(item) + 52));
  const h = Math.max(mobile ? 310 : 240, outputs.length * gap + 80),
    cy = h / 2;
  const x0 = mobile ? p + 40 : p + inner * 0.13,
    x1 = mobile ? p + inner * 0.45 : p + inner * 0.46,
    x2 = mobile ? w - p - 44 : p + inner * 0.84;
  let body =
    curve(x0 + 26, cy, x1 - 34, cy, t.border, 2.5) + curve(x0 + 26, cy, x1 - 34, cy, t.accent, 1.1);
  outputs.forEach((item, i) => {
    const y = cy + (i - (outputs.length - 1) / 2) * gap;
    body +=
      curve(x1 + 34, cy, x2 - 25, y, t.border, 2.5) + curve(x1 + 34, cy, x2 - 25, y, t.accent, 1.1);
  });
  function node(item, x, y, index, central = false) {
    let b = central
      ? rect(x - 34, y - 34, 68, 68, t.surface, t.accent, 16)
      : circle(x, y, 26, t.surface, t.border);
    b += label(
      central ? '↗' : index === 0 ? '{ }' : '/' + String(index - 1),
      x,
      y + 6,
      central ? 24 : 17,
      t.accent,
      'mono',
      500,
      1,
      'middle',
    );
    const width = mobile ? 130 : 200,
      size = mobile ? 19 : 18;
    const title = wrap(item.title, width, size, t.customFont || t.font);
    b += label(title, x, y + 65, size, t.fg, t.customFont || t.font, 500, 1.25, 'middle');
    if (item.description && !mobile)
      b += label(
        wrap(item.description, width, 13, t.customFont || t.font),
        x,
        y + 89 + (title.length - 1) * size * 1.25,
        13,
        t.muted,
        t.customFont || t.font,
        400,
        1.35,
        'middle',
      );
    return b;
  }
  body += node(items[0], x0, cy, 0) + node(items[1], x1, cy, 1, true);
  outputs.forEach((item, i) => {
    body += node(item, x2, cy + (i - (outputs.length - 1) / 2) * gap, i + 2);
  });
  const height = Math.max(
    h + 55,
    cy + Math.max(...items.slice(0, 2).map(nodeBottom)) + 30,
    cy + ((outputs.length - 1) / 2) * gap + Math.max(...outputs.map(nodeBottom)) + 30,
  );
  return svg(
    w,
    height,
    body,
    items[0].title + ' → ' + items[1].title + ' → ' + outputs.map((i) => i.title).join(', '),
    t,
  );
}
