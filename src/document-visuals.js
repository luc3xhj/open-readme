import { wrap, label, line, rect, circle, svg } from './drawing.js';
import { typeScale, glyph, arrow } from './design-scale.js';

const systems = ['canvas', 'console', 'journal', 'pipeline'];
function text(value, x, y, width, size, color, font, weight = 400, leading = 1.4) {
  const rows = wrap(value, width, size, font);
  return {
    body: label(rows, x, y, size, color, font, weight, leading),
    bottom: y + (rows.length - 1) * size * leading,
  };
}

export function compositionHero(block, t, w, mobile, design) {
  if (!systems.includes(design)) return null;
  const s = typeScale(t, mobile),
    p = t.pad - 28,
    split = !mobile && ['journal', 'pipeline'].includes(design),
    left = design === 'pipeline' ? 20 : 0,
    titleWidth = split ? w * 0.43 - left : w - left - 2,
    subX = split ? w * 0.49 : left,
    subWidth = split ? w - subX - 2 : Math.min(w - left - 2, w * 0.9);
  let body = '',
    y = p + 6;
  if (design === 'journal') body += line(0, y, w, y, t.fg, 1.25);
  if (block.eyebrow) {
    const eyebrow = text(block.eyebrow, left, y + s.note + 10, w - left, s.note, t.accent, 'mono');
    body += eyebrow.body;
    y = eyebrow.bottom + 13;
  } else y += 16;
  const titleY = y + s.name,
    title = text(
      (design === 'console' ? '$ ' : '') + block.title,
      left,
      titleY,
      titleWidth,
      s.name,
      t.fg,
      s.font,
      design === 'journal' ? 400 : 600,
      1.1,
    );
  body += title.body;
  let subY = split ? titleY - s.name + s.intro + 4 : title.bottom + 28;
  if (block.headline && block.headline !== block.title) {
    const headline = text(block.headline, subX, subY, subWidth, s.title, t.fg, s.font, 500);
    body += headline.body;
    subY = headline.bottom + 25;
  }
  const sub = text(block.subtitle, subX, subY, subWidth, s.intro, t.muted, s.textFont);
  body += sub.body;
  y = Math.max(title.bottom, sub.bottom) + 24;
  if (block.command) {
    const command = text('$ ' + block.command, left, y, w - left, s.code, t.accent, 'mono');
    body += command.body;
    y = command.bottom + 23;
  }
  if (block.meta) {
    const meta = text(block.meta, left, y, w - left, s.note, t.muted, 'mono');
    body += meta.body;
    y = meta.bottom + 20;
  }
  if (block.preview) {
    const py = y + 4,
      inset = 14,
      extra = block.previewLabel ? s.note + 14 : 0;
    const source = text(
      block.preview,
      left + inset,
      py + 25 + extra,
      w - left - inset * 2,
      s.code,
      t.fg,
      'mono',
      400,
      1.55,
    );
    body += rect(left, py, w - left - 1, source.bottom - py + 18, t.surface, t.border, t.radius);
    if (block.previewLabel)
      body += label(block.previewLabel, left + inset, py + 21, s.note, t.muted, 'mono');
    body += source.body;
    y = source.bottom + 32;
  }
  if (design === 'pipeline') body += line(0.75, p + 18, 0.75, y - 10, t.accent, 1.5);
  if (design === 'canvas') body += line(0, y - 4, 32, y - 4, t.accent, 2);
  if (design === 'journal' || design === 'console') body += line(0, y - 4, w, y - 4, t.border);
  return svg(
    w,
    y + p + 3,
    body,
    [block.title, block.headline, block.subtitle, block.meta, block.preview]
      .filter(Boolean)
      .join(' — '),
    t,
    false,
  );
}

// Illustrations are small evidence inside a section, never another mock app.
// Sources are kept verbatim in the SVG title/Markdown alternative text.
function evidence(item, x, y, width, t, s, vertical = false) {
  const kind = item.visual || (item.example ? 'code' : 'none');
  if (kind === 'none') return { body: '', height: 0 };
  const cs = s.code;
  if (kind === 'metric') {
    const value = text(
      item.value || item.example || '',
      x,
      y + s.value,
      width,
      s.value,
      t.fg,
      s.font,
      500,
    );
    return { body: value.body, height: value.bottom - y + 8 };
  }
  if (kind === 'flow') {
    const names = (item.example || '')
      .split(/\n|→/)
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (!names.length) return { body: '', height: 0 };
    let body = '',
      cursor = y;
    if (!vertical && width >= 300) {
      const gap = 24,
        cw = (width - gap * (names.length - 1)) / names.length,
        cells = names.map((name) => wrap(name, cw - 12, cs, 'mono')),
        height = 28 + Math.max(...cells.map((r) => r.length)) * cs * 1.4;
      names.forEach((name, i) => {
        const nx = x + i * (cw + gap);
        if (i)
          body +=
            line(nx - gap, y + height / 2, nx - 2, y + height / 2, t.border) +
            arrow(nx - 2, y + height / 2, t.muted, 'right', 3);
        body += rect(nx, y, cw, height, t.surface, i === 1 ? t.accent : t.border, t.radius);
        body += label(cells[i], nx + 6, y + 16, cs, t.fg, 'mono', 400, 1.4);
      });
      return { body, height };
    }
    names.forEach((name, i) => {
      const p = text(name, x + 24, cursor + cs, width - 24, cs, i === 1 ? t.accent : t.fg, 'mono');
      const h = p.bottom - cursor + 14;
      if (i)
        body +=
          line(x + 6, cursor - 10, x + 6, cursor + 4, t.border) +
          arrow(x + 6, cursor + 4, t.muted, 'down', 3);
      body += glyph(i === 1 ? 'layers' : 'file', x, cursor, 14, t.muted) + p.body;
      cursor += h + 9;
    });
    return { body, height: cursor - y - 9 };
  }
  if (kind === 'palette') {
    const colors = item.example?.match(/#[0-9a-fA-F]{6}/g) || [t.accent, t.fg, t.border];
    let body = '';
    colors.slice(0, 5).forEach((color, i) => {
      body += rect(x + i * 22, y, 14, 14, color, t.border, t.radius);
    });
    const p = text(item.example || '', x, y + 37, width, cs, t.muted, 'mono', 400, 1.5);
    return { body: body + p.body, height: p.bottom - y + 8 };
  }
  if (kind === 'files') {
    let body = '',
      cursor = y;
    for (const name of (item.example || '').split('\n')) {
      const p = text(name, x + 25, cursor + cs, width - 25, cs, t.muted, 'mono');
      body += glyph(name.endsWith('/') ? 'folder' : 'file', x, cursor - 1, 15, t.muted) + p.body;
      cursor = p.bottom + 13;
    }
    return { body, height: cursor - y - 3 };
  }
  const source = (item.example || '').replace(kind === 'preview' ? /^#+\s*/gm : /$^/, '');
  const p = text(source, x + 12, y + cs + 13, width - 24, cs, t.fg, 'mono', 400, 1.5);
  return {
    body: rect(x, y, width, p.bottom - y + 14, t.surface, t.border, t.radius) + p.body,
    height: p.bottom - y + 14,
  };
}

export function featureBoard(block, t, w, mobile, layout) {
  if (!['bento', 'lattice', 'terminal-grid', 'rows'].includes(layout)) return null;
  const s = typeScale(t, mobile),
    p = t.pad - 28,
    font =
      t.customFont ||
      (layout === 'lattice' ? 'serif' : layout === 'terminal-grid' ? 'mono' : 'sans'),
    bodyFont = t.customFont || (layout === 'terminal-grid' ? 'mono' : 'sans'),
    alt = block.items
      .map((i) => [i.title, i.description, i.example, i.value].filter(Boolean).join(': '))
      .join('; ');
  let body = '',
    y = p + 2;
  if (layout === 'bento' && !mobile) {
    // A shared baseline and open columns make the section scan as one unit.
    const cols = block.items.length === 4 ? 2 : Math.min(3, block.items.length),
      gap = 30,
      cw = (w - gap * (cols - 1) - p * 2 - 2) / cols;
    for (let start = 0; start < block.items.length; start += cols) {
      const cells = block.items.slice(start, start + cols).map((item, j) => {
        const x = p + j * (cw + gap),
          ty = y + 43,
          title = text(item.title, x, ty, cw, s.title, t.fg, font, 600, 1.2),
          desc = text(item.description, x, title.bottom + 25, cw, s.body, t.muted, bodyFont);
        return { item, x, title, desc };
      });
      const exampleY = Math.max(...cells.map((c) => c.desc.bottom)) + 24;
      const proofs = cells.map((c) => evidence(c.item, c.x, exampleY, cw, t, s, true));
      const bottom = exampleY + Math.max(...proofs.map((e) => e.height), 0) + 14;
      cells.forEach((c, j) => {
        body += glyph(
          c.item.visual === 'flow' ? 'layers' : c.item.visual === 'palette' ? 'settings' : 'file',
          c.x,
          y + 1,
          19,
          t.accent,
        );
        body +=
          c.title.body +
          c.desc.body +
          proofs[j].body +
          line(c.x, bottom, c.x + cw, bottom, t.border);
      });
      y = bottom + s.gap;
    }
  } else {
    block.items.forEach((item, i) => {
      const numbered = layout === 'rows' || layout === 'terminal-grid',
        left = p + (numbered ? 34 : 0),
        inline = !mobile,
        titleWidth = inline
          ? w * (layout === 'lattice' ? 0.29 : layout === 'rows' ? 0.44 : 0.35) - left
          : w - left - p,
        descX = inline && layout !== 'rows' ? w * (layout === 'terminal-grid' ? 0.43 : 0.36) : left,
        proofX = inline
          ? w * (layout === 'rows' ? 0.55 : layout === 'terminal-grid' ? 0.04 : 0.75)
          : left,
        descWidth = inline
          ? w * (layout === 'terminal-grid' ? 0.55 : layout === 'rows' ? 0.44 : 0.35) -
            (layout === 'rows' ? left : 0)
          : w - left - p,
        title = text(
          item.title,
          left,
          y + s.title + 10,
          titleWidth,
          s.title + (layout === 'lattice' ? 1 : 0),
          t.fg,
          font,
          layout === 'lattice' ? 400 : 500,
          1.25,
        ),
        desc = text(
          item.description,
          descX,
          inline && layout !== 'rows' ? y + s.body + 12 : title.bottom + 23,
          descWidth,
          s.body,
          t.muted,
          bodyFont,
        ),
        proofY = inline
          ? layout === 'terminal-grid'
            ? title.bottom + 21
            : y + 9
          : desc.bottom + 21,
        proofWidth = inline
          ? layout === 'terminal-grid'
            ? w * 0.33
            : w - proofX - p - 2
          : w - left - p - 2,
        proof = evidence(item, proofX, proofY, proofWidth, t, s, layout !== 'rows'),
        bottom = Math.max(title.bottom, desc.bottom, proofY + proof.height) + s.gap;
      body += line(p, y, w - p, y, t.border);
      if (numbered)
        body += label(String(i + 1).padStart(2, '0'), p, y + s.title + 9, s.note, t.accent, 'mono');
      body += title.body + desc.body + proof.body;
      y = bottom;
    });
    body += line(p, y, w - p, y, t.border);
    y += 3;
  }
  return svg(w, y + p, body, alt, t, false);
}
