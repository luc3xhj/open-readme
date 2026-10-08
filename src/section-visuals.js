import { wrap, label, line, rect, svg } from './drawing.js';

export function sectionHeading(block, t, w, mobile) {
  const design = t.designId,
    ordinal = String(block.ordinal || 1).padStart(2, '0'),
    size = mobile
      ? design === 'journal'
        ? 38
        : 32
      : (design === 'journal' ? 31 : 27) * (t.scale || 1),
    left = design === 'canvas' ? 28 : design === 'journal' ? 43 : design === 'pipeline' ? 54 : 0,
    font = t.customFont || t.font,
    title = (design === 'console' ? '> ' : '') + block.title,
    rows = wrap(title, w - left - 4, size, font),
    y = size + 6,
    height = y + (rows.length - 1) * size * 1.2 + 12;
  let body = label(rows, left, y, size, t.fg, font, design === 'journal' ? 400 : 600, 1.2);
  if (design === 'canvas') body += rect(0, y - 18, 13, 3, t.accent);
  if (design === 'journal') body += label(ordinal, 0, y - 1, mobile ? 17 : 12, t.muted, 'mono');
  if (design === 'pipeline')
    body +=
      line(1, 8, 1, height - 8, t.accent, 2) +
      label(ordinal, 15, y - 2, mobile ? 17 : 12, t.accent, 'mono');
  return svg(w, height, body, block.title, t, false);
}

export function systemBeam(block, t, w, mobile) {
  if (!['canvas', 'console', 'journal', 'pipeline'].includes(t.designId) || block.items.length < 3)
    return null;
  const design = t.designId,
    items = block.items,
    font = t.customFont || t.font,
    ts = mobile ? 24 : 20 * (t.scale || 1),
    ds = mobile ? 21 : 15 * (t.scale || 1),
    gap = mobile ? 26 : 20,
    alt =
      items[0].title +
      ' → ' +
      items[1].title +
      '; parallel outputs: ' +
      items
        .slice(2)
        .map((i) => i.title)
        .join(', '),
    vertical = mobile || design === 'console',
    nw = vertical ? w - 80 : w * 0.28;
  function node(item, x, y, index) {
    const titles = wrap(item.title, nw - 32, ts, font),
      desc = item.description
        ? wrap(item.description, nw - 32, ds, design === 'console' ? 'mono' : 'sans')
        : [],
      dy = 30 + (titles.length - 1) * ts * 1.25 + 28,
      height = dy + Math.max(0, desc.length - 1) * ds * 1.4 + 22;
    let body =
      design === 'journal'
        ? line(x, y, x + nw, y, t.border)
        : rect(
            x + 0.5,
            y + 0.5,
            nw - 1,
            height - 1,
            t.surface,
            index === 1 ? t.accent : t.border,
            t.radius,
          );
    body += label(titles, x + 16, y + 30, ts, t.fg, font, design === 'journal' ? 400 : 500, 1.25);
    if (desc.length)
      body += label(
        desc,
        x + 16,
        y + dy,
        ds,
        t.muted,
        design === 'console' ? 'mono' : 'sans',
        400,
        1.4,
      );
    return { body, height };
  }
  let body = '',
    height;
  if (vertical) {
    let y = 8,
      parentBottom;
    items.forEach((item, i) => {
      const x = i < 2 ? 32 : 64,
        n = node(item, x, y, i);
      if (i === 1)
        body +=
          line(16, parentBottom - 20, 16, y + 22, t.accent) + line(16, y + 22, x, y + 22, t.accent);
      if (i >= 2)
        body +=
          line(16, parentBottom - 20, 16, y + 22, t.border) + line(16, y + 22, x, y + 22, t.accent);
      body += n.body;
      if (i < 2) parentBottom = y + n.height;
      y += n.height + gap;
    });
    height = y - gap + 8;
  } else {
    let y = 8,
      outputs = [];
    items.slice(2).forEach((item, i) => {
      const n = node(item, w - nw, y, i + 2);
      outputs.push({ ...n, y });
      y += n.height + gap;
    });
    height = y - gap + 8;
    const first = node(items[0], 0, 0, 0),
      middle = node(items[1], w * 0.36, 0, 1),
      y0 = (height - first.height) / 2,
      y1 = (height - middle.height) / 2;
    const connector = (x1, y1, x2, y2) =>
      design === 'pipeline'
        ? `<path d="M${x1} ${y1}H${(x1 + x2) / 2}V${y2}H${x2}" fill="none" stroke="${t.accent}" stroke-width="1.5"/>`
        : `<path d="M${x1} ${y1}C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}" fill="none" stroke="${t.accent}" stroke-width="1.2"/>`;
    body += connector(nw, y0 + first.height / 2, w * 0.36, y1 + middle.height / 2);
    outputs.forEach((n) => {
      body += connector(w * 0.36 + nw, y1 + middle.height / 2, w - nw, n.y + n.height / 2);
    });
    body += node(items[0], 0, y0, 0).body + node(items[1], w * 0.36, y1, 1).body;
    outputs.forEach((n) => {
      body += n.body;
    });
  }
  return svg(w, height, body, alt, t, false);
}
