import { systemBeam } from './section-visuals.js';
import { xml, wrap, label, line, rect, circle, svg } from './drawing.js';
export { compositionHero, featureBoard } from './document-visuals.js';
const curve = (x1, y1, x2, y2, color, width = 1.5) => {
  const mid = (x1 + x2) / 2;
  return `<path d="M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
};
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
