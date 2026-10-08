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

export function compositionHero(block, t, w, mobile, design) {
  if (!['canvas', 'console', 'journal', 'pipeline'].includes(design)) return null;
  const p = mobile ? 28 : 44,
    inner = w - 2 * p;
  const headline = block.headline || block.title;
  let body = '',
    y = p,
    h;
  const alt = [block.title, block.headline, block.subtitle, block.preview]
    .filter(Boolean)
    .join(' — ');
  if (design === 'canvas') {
    const eyebrow = block.eyebrow || block.title;
    const ew = Math.min(inner, eyebrow.length * 7 + 30);
    body += rect((w - ew) / 2, y, ew, 25, t.surface, t.border, 13);
    body += label(eyebrow, w / 2, y + 17, 10, t.muted, 'mono', 400, 1, 'middle');
    y += 79;
    const title = paragraph(
      headline,
      w / 2,
      y,
      inner - 20,
      mobile ? 44 : 58,
      t.fg,
      'sans',
      650,
      1.06,
    );
    body += title.body.replaceAll(`text-anchor="start"`, `text-anchor="middle"`);
    y = title.bottom + 36;
    const sub = paragraph(
      block.subtitle,
      w / 2,
      y,
      Math.min(inner - 20, 690),
      mobile ? 20 : 18,
      t.muted,
    );
    body += sub.body.replaceAll(`text-anchor="start"`, `text-anchor="middle"`);
    y = sub.bottom + 34;
    if (block.preview) {
      const sx = p,
        sw = inner;
      const pw = mobile ? sw - 42 : sw * 0.64,
        px = mobile ? sx + 21 : sx + sw * 0.29,
        py = y + 25;
      const page = pagePicture(block.preview, px + 24, py + 69, pw - 48, t, mobile ? 18 : 15);
      const stageHeight = Math.max(mobile ? 270 : 236, page.height + 123);
      body += `<defs><linearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${t.accent}" stop-opacity=".17"/><stop offset=".5" stop-color="${t.accent}" stop-opacity=".04"/><stop offset="1" stop-color="${t.accent}" stop-opacity=".20"/></linearGradient></defs>`;
      body += rect(sx, y, sw, stageHeight, 'url(#wash)', 'none', 20);
      for (let i = 0; i < 8; i++)
        body += curve(sx, y + 30 + i * 25, sx + sw, y + 130 + i * 13, t.accent + '18', 1);
      body += rect(px + 5, py + 7, pw, stageHeight - 40, t.fg + '0A', 'none', 10);
      body += rect(px, py, pw, stageHeight - 40, t.surface, t.border, 10);
      body += line(px, py + 34, px + pw, py + 34, t.border);
      body +=
        circle(px + 16, py + 17, 3, t.border) +
        circle(px + 27, py + 17, 3, t.border) +
        circle(px + 38, py + 17, 3, t.border);
      body += label(
        block.previewLabel || 'README.md',
        px + pw - 16,
        py + 21,
        10,
        t.muted,
        'mono',
        400,
        1,
        'end',
      );
      body += page.body;
      if (!mobile && block.command) {
        const cx = sx + 18,
          cy = y + 129,
          cw = sw * 0.4;
        body += rect(cx + 4, cy + 5, cw, 87, t.fg + '0C', 'none', 10);
        body += rect(cx, cy, cw, 87, t.fg, 'none', 10);
        body += label('AGENT → LOCAL FILES', cx + 16, cy + 23, 9, t.bg + 'AA', 'mono');
        const rows = wrap('$ ' + block.command, cw - 32, 11, 'mono');
        body += label(rows.slice(0, 3), cx + 16, cy + 47, 11, t.bg, 'mono', 400, 1.4);
      }
      y += stageHeight + 14;
    }
    h = y + p / 2;
  } else if (design === 'console') {
    body += rect(p, p, inner, 27, t.surface, t.border, 0);
    body += label(block.eyebrow || 'README', p + 14, p + 18, 10, t.muted, 'mono');
    body += label(
      block.meta || 'MARKDOWN + SVG',
      w - p - 14,
      p + 18,
      10,
      t.accent,
      'mono',
      400,
      1,
      'end',
    );
    y = p + 86;
    const lw = mobile ? inner : inner * 0.58;
    body += label('>_', p, y, 30, t.accent, 'mono', 500);
    const title = paragraph(
      block.title,
      p + 51,
      y,
      lw - 51,
      mobile ? 36 : 47,
      t.fg,
      'mono',
      500,
      1.1,
    );
    body += title.body;
    y = title.bottom + 35;
    const sub = paragraph(
      block.subtitle,
      p,
      y,
      lw - (mobile ? 0 : 25),
      mobile ? 20 : 17,
      t.muted,
      'mono',
      400,
      1.4,
    );
    body += sub.body;
    y = sub.bottom + 34;
    if (block.command) {
      body += codePicture('$ ' + block.command, p, y, lw - 16, t, mobile ? 17 : 14, 4).body;
      y +=
        wrap('$ ' + block.command, lw - 16, mobile ? 17 : 14, 'mono').length * (mobile ? 25.5 : 21);
    }
    if (block.preview) {
      const px = mobile ? p : p + inner * 0.64,
        py = mobile ? y + 17 : p + 77,
        pw = mobile ? inner : inner * 0.36;
      const code = codePicture(block.preview, px + 15, py + 49, pw - 30, t, mobile ? 18 : 14, 6);
      body += rect(px, py, pw, code.height + 68, 'none', t.border, 0);
      body += label(block.previewLabel || 'OUTPUT FILES', px + 15, py + 23, 10, t.muted, 'mono');
      body += line(px, py + 32, px + pw, py + 32, t.border) + code.body;
      y = Math.max(y, py + code.height + 68);
    }
    h = y + p;
    body += line(p, h - 7, w - p, h - 7, t.border);
  } else if (design === 'journal') {
    body += line(p, y, w - p, y, t.fg, 1.5);
    body += label(block.eyebrow || 'OPEN SOURCE', p, y + 25, 10, t.muted, 'mono');
    if (block.meta) body += label(block.meta, w - p, y + 25, 10, t.muted, 'mono', 400, 1, 'end');
    y += 83;
    const title = paragraph(block.title, p, y, inner, mobile ? 52 : 76, t.fg, 'serif', 400, 1.06);
    body += title.body;
    y = title.bottom + 40;
    body += line(p, y - 15, w - p, y - 15, t.border);
    if (block.headline) {
      const main = paragraph(
        block.headline,
        p,
        y + 15,
        mobile ? inner : inner * 0.54,
        mobile ? 30 : 31,
        t.fg,
        'serif',
        400,
        1.15,
      );
      body += main.body;
      const sub = paragraph(
        block.subtitle,
        mobile ? p : p + inner * 0.62,
        mobile ? main.bottom + 32 : y + 13,
        mobile ? inner : inner * 0.38,
        mobile ? 20 : 17,
        t.muted,
      );
      body += sub.body;
      y = Math.max(main.bottom, sub.bottom) + 32;
    } else {
      const sub = paragraph(block.subtitle, p, y + 15, inner, mobile ? 20 : 19, t.muted);
      body += sub.body;
      y = sub.bottom + 32;
    }
    body += line(p, y, w - p, y, t.border);
    h = y + 15;
  } else {
    body += label(block.eyebrow || 'OPEN SOURCE', p, p + 10, 10, t.muted, 'mono');
    const lw = mobile ? inner : inner * 0.56;
    const title = paragraph(block.title, p, p + 79, lw, mobile ? 44 : 55, t.fg, 'sans', 600, 1.1);
    body += title.body;
    const sub = paragraph(block.subtitle, p, title.bottom + 34, lw - 14, mobile ? 20 : 18, t.muted);
    body += sub.body;
    y = sub.bottom + 30;
    if (block.preview) {
      const names = block.preview.split('\n').filter(Boolean).slice(0, 3);
      const dx = mobile ? p : p + inner * 0.62,
        dy = mobile ? y + 30 : p + 36,
        dw = mobile ? inner : inner * 0.38;
      const left = dx + (mobile ? 70 : 23),
        mid = dx + dw * 0.47,
        right = dx + dw - (mobile ? 70 : 25),
        cy = dy + 66;
      body += curve(left + 18, cy, mid - 23, cy, t.border, 2);
      for (const offset of [-44, 44])
        body += curve(mid + 23, cy, right - 18, cy + offset, t.border, 2);
      body += curve(left + 18, cy, mid - 23, cy, t.accent, 1.2);
      for (const offset of [-44, 44])
        body += curve(mid + 23, cy, right - 18, cy + offset, t.accent, 1.2);
      body +=
        circle(left, cy, 18, t.surface, t.border) +
        label('{ }', left, cy + 5, 13, t.accent, 'mono', 500, 1, 'middle');
      body +=
        circle(mid, cy, 25, t.surface, t.accent) +
        label(block.mark || '↗', mid, cy + 6, 17, t.accent, 'mono', 500, 1, 'middle');
      for (const [i, offset] of [-44, 44].entries()) {
        body += rect(right - 18, cy + offset - 18, 36, 36, t.surface, t.border, 7);
        body += label(
          i ? 'SVG' : 'MD',
          right,
          cy + offset + 4,
          9,
          t.accent,
          'mono',
          500,
          1,
          'middle',
        );
      }
      const captionSize = mobile ? 17 : 11;
      const inputRows = wrap(names[0] || '', Math.min(130, dw * 0.44), captionSize, 'mono').slice(
        0,
        3,
      );
      let diagramBottom = cy + 44 + (inputRows.length - 1) * captionSize * 1.3;
      body += label(inputRows, left, cy + 44, captionSize, t.muted, 'mono', 400, 1.3, 'middle');
      names.slice(1).forEach((name, i) => {
        const rows = wrap(name, 130, captionSize, 'mono').slice(0, 3);
        diagramBottom = Math.max(
          diagramBottom,
          cy + [-44, 44][i] + 36 + (rows.length - 1) * captionSize * 1.3,
        );
        body += label(
          rows,
          right,
          cy + [-44, 44][i] + 36,
          captionSize,
          t.muted,
          'mono',
          400,
          1.3,
          'middle',
        );
      });
      y = Math.max(y, dy + 185, diagramBottom + 22);
    }
    h = y + p / 2;
    body += line(p, h - 5, w - p, h - 5, t.border);
  }
  return svg(w, h, body, alt, t);
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
      'sans',
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
        body += rect(c.x, cursor, cardWidth, c.height, t.surface, t.border, 9);
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
    rect(x, y, width, code.height + 44, t.surface, t.border, kind === 'files' ? 0 : 8) + code.body;
  return { body, height: code.height + 44 };
}

export function featureBoard(block, t, w, mobile, layout) {
  if (layout === 'rows' && block.items.some((i) => i.visual)) {
    const p = mobile ? 28 : 42,
      inner = w - p * 2;
    let body = '',
      y = p;
    block.items.forEach((item, i) => {
      const textWidth = mobile ? inner : inner * 0.44,
        size = mobile ? 26 : 23;
      const title = paragraph(item.title, p, y + 37, textWidth, size, t.fg, 'sans', 600, 1.15);
      const desc = paragraph(
        item.description,
        p,
        title.bottom + 30,
        textWidth,
        mobile ? 20 : 16,
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
    );
  }
  if (!['bento', 'lattice', 'terminal-grid'].includes(layout)) return null;
  const p = mobile ? 22 : 28,
    gap = layout === 'lattice' ? 0 : 12,
    inner = w - 2 * p;
  const terminal = layout === 'terminal-grid',
    lattice = layout === 'lattice';
  const ts = mobile ? 26 : lattice ? 27 : 22,
    ds = mobile ? 20 : 16;
  function cell(item, x, y, width, height, index) {
    const pad = mobile ? 23 : 26,
      usable = width - 2 * pad;
    const title = wrap(item.title, usable, ts, terminal ? 'mono' : lattice ? 'serif' : 'sans');
    const desc = wrap(item.description, usable, ds, terminal ? 'mono' : 'sans');
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
      lattice || terminal ? 0 : 14,
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
      terminal ? 'mono' : lattice ? 'serif' : 'sans',
      lattice ? 400 : 600,
      1.15,
    );
    body += label(
      desc,
      x + pad,
      y + pad + descY,
      ds,
      t.muted,
      terminal ? 'mono' : 'sans',
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
    for (let start = 0; start < block.items.length;) {
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
  );
}

export function beamDiagram(block, t, w, mobile) {
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
      const title = wrap(item.title, cw - 15, 18, 'sans');
      height = Math.max(height, 152 + (title.length - 1) * 18 * 1.3);
      body +=
        circle(x, 70, 28, t.surface, t.border) +
        label(String(i + 1), x, 76, 17, t.accent, 'mono', 500, 1, 'middle') +
        label(title, x, 122, 18, t.fg, 'sans', 500, 1.3, 'middle');
    });
    return svg(w, height, body, items.map((i) => i.title).join(' → '), t);
  }
  const nodeBottom = (item) => {
    const titleRows = wrap(item.title, mobile ? 130 : 200, mobile ? 19 : 18, 'sans').length;
    const titleEnd = 65 + (titleRows - 1) * (mobile ? 19 : 18) * 1.25;
    return (
      titleEnd +
      (item.description && !mobile
        ? 24 + (wrap(item.description, 200, 13, 'sans').length - 1) * 13 * 1.35
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
    const title = wrap(item.title, width, size, 'sans');
    b += label(title, x, y + 65, size, t.fg, 'sans', 500, 1.25, 'middle');
    if (item.description && !mobile)
      b += label(
        wrap(item.description, width, 13, 'sans'),
        x,
        y + 89 + (title.length - 1) * size * 1.25,
        13,
        t.muted,
        'sans',
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
