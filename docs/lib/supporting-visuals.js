import { wrap, label, line, rect, circle, svg } from './drawing.js?v=0.5.0';
import { typeScale } from './design-scale.js?v=0.5.0';

export function systemMetrics(block, t, w, mobile) {
  const s = typeScale(t, mobile),
    p = t.pad - 28,
    list = block.layout === 'columns',
    columns = mobile ? 2 : Math.min(4, block.items.length),
    gap = 24,
    cw = (w - p * 2 - gap * (columns - 1)) / columns;
  let body = '',
    y = p + 2;
  if (list) {
    for (const item of block.items) {
      const values = wrap(item.value, w * 0.35, s.value, s.font),
        names = wrap(item.label, w * 0.59, s.body, s.textFont),
        bottom =
          Math.max(
            y + s.value + (values.length - 1) * s.value * 1.1,
            y + s.body + (names.length - 1) * s.body * 1.4,
          ) + s.gap;
      body +=
        line(p, y, w - p, y, t.border) +
        label(values, p, y + s.value + 10, s.value, t.fg, s.font, 400, 1.1) +
        label(names, w * 0.4, y + s.body + 14, s.body, t.muted, s.textFont);
      y = bottom + 10;
    }
  } else {
    for (let start = 0; start < block.items.length; start += columns) {
      let bottom = y;
      block.items.slice(start, start + columns).forEach((item, i) => {
        const x = p + i * (cw + gap),
          values = wrap(item.value, cw, s.value, s.font),
          names = wrap(item.label, cw, s.body, s.textFont),
          ny = y + s.value + 10 + (values.length - 1) * s.value * 1.1 + 24;
        body +=
          line(
            x,
            y,
            x + cw,
            y,
            block.layout === 'scoreboard' ? t.accent : t.border,
            block.layout === 'scoreboard' ? 1.5 : 1,
          ) +
          label(values, x, y + s.value + 10, s.value, t.fg, s.font, 500, 1.1) +
          label(names, x, ny, s.body, t.muted, s.textFont);
        bottom = Math.max(bottom, ny + (names.length - 1) * s.body * 1.4);
      });
      y = bottom + s.gap + 12;
    }
  }
  return svg(w, y + p, body, block.items.map((i) => `${i.label}: ${i.value}`).join('; '), t, false);
}

export function systemTimeline(block, t, w, mobile) {
  const s = typeScale(t, mobile),
    p = t.pad - 28,
    statusWidth = mobile ? 0 : 120 * (t.scale || 1);
  let body = '',
    y = p + 3;
  const items = block.items.map((item) => {
    const x = p + 23 + statusWidth,
      titles = wrap(item.title, w - x - p - 2, s.title, s.font),
      descriptions = wrap(item.description, w - x - p - 2, s.body, s.textFont),
      titleY = y + s.title + (mobile ? s.note + 13 : 5),
      descY = titleY + (titles.length - 1) * s.title * 1.25 + 25,
      end = descY + (descriptions.length - 1) * s.body * 1.4 + s.gap;
    const node = { item, x, y, titleY, descY, titles, descriptions, end };
    y = end + 8;
    return node;
  });
  for (const [i, n] of items.entries()) {
    const dotY = n.y + (mobile ? s.note + 2 : s.title + 1);
    if (i < items.length - 1)
      body += line(
        p + 5,
        dotY,
        p + 5,
        items[i + 1].y + (mobile ? s.note + 2 : s.title + 1),
        t.border,
      );
    body += circle(p + 5, dotY, 3.5, n.item.status === 'shipped' ? t.accent : t.surface, t.accent);
    body +=
      label(
        n.item.status.toUpperCase().replace('-', ' '),
        p + 23,
        mobile ? n.y + s.note + 5 : n.y + s.title + 5,
        s.note,
        t.accent,
        'mono',
      ) +
      label(n.titles, n.x, n.titleY, s.title, t.fg, s.font, 500, 1.25) +
      label(n.descriptions, n.x, n.descY, s.body, t.muted, s.textFont, 400, 1.4);
  }
  return svg(
    w,
    y + p,
    body,
    block.items.map((i) => `${i.status}: ${i.title} — ${i.description}`).join('; '),
    t,
    false,
  );
}
