import { fonts } from './themes.js?v=0.2.0';
export const xml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char],
  );
const advance = (char, size, font) =>
  size *
  (/[^\u0000-\u00ff]/.test(char)
    ? 1
    : font === 'mono'
      ? 0.62
      : /[MW@#]/.test(char)
        ? 0.85
        : /[il.,:! ']/.test(char)
          ? 0.3
          : 0.56);
export function wrap(value, width, size, font = 'sans') {
  const lines = [];
  for (const paragraph of String(value).split('\n')) {
    let line = '',
      measured = 0;
    for (const segment of paragraph.split(/(\s+)/)) {
      const length = [...segment].reduce((n, ch) => n + advance(ch, size, font), 0);
      if (line && measured + length > width) {
        lines.push(line.trimEnd());
        line = '';
        measured = 0;
      }
      for (const char of segment) {
        const next = advance(char, size, font);
        if (line && measured + next > width) {
          lines.push(line.trimEnd());
          line = '';
          measured = 0;
        }
        if (!line && /\s/.test(char)) continue;
        line += char;
        measured += next;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}
export const label = (
  value,
  x,
  y,
  size,
  color,
  font = 'sans',
  weight = 400,
  leading = 1.35,
  anchor = 'start',
  italic = false,
) =>
  `<text x="${x}" y="${y}" font-family="${xml(fonts[font])}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ''}>${(Array.isArray(value) ? value : [value]).map((line, i) => `<tspan x="${x}" dy="${i ? size * leading : 0}">${xml(line || ' ')}</tspan>`).join('')}</text>`;
export const line = (x1, y1, x2, y2, color, width = 1) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
export const rect = (x, y, w, h, fill, stroke = 'none', radius = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
export const circle = (x, y, r, fill, stroke = 'none') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}"/>`;
export const measure = (value, size, font) =>
  [...value].reduce((n, ch) => n + advance(ch, size, font), 0);
export function svg(w, h, body, alt, t, background = true) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${Math.ceil(h)}" viewBox="0 0 ${w} ${Math.ceil(h)}" role="img" aria-labelledby="title"><title id="title">${xml(alt)}</title>${background ? rect(0, 0, w, Math.ceil(h), t.bg) : ''}${body}</svg>\n`;
}
