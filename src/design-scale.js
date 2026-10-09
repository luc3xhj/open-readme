// Sizes are document sizes, not landing-page display sizes. The compact and
// phone assets compensate for their smaller physical width in GitHub's column.
export function typeScale(t, mobile = false) {
  const factor = mobile ? 1.18 : t.scale || 1;
  const size = (value) => Math.round(value * factor * 10) / 10;
  return {
    name: size(t.designId === 'journal' ? 38 : t.designId === 'console' ? 30 : 36),
    section: size(23),
    supporting: size(18),
    title: size(18),
    body: size(15),
    intro: size(17),
    code: mobile ? 16 : size(12),
    note: mobile ? 14 : size(11),
    value: size(30),
    gap: t.pad === 40 ? 28 : 18,
    font: t.customFont || t.font,
    textFont: t.customFont || (t.designId === 'console' ? 'mono' : 'sans'),
  };
}

export function sectionImportance(block) {
  return (
    block.importance ||
    ([
      'configuration',
      'api',
      'architecture',
      'compatibility',
      'faq',
      'contributing',
      'credits',
      'license',
    ].includes(block.section)
      ? 'supporting'
      : 'primary')
  );
}

// Small original vector glyphs. Every glyph uses the same 20-unit stroke grid.
export function glyph(kind, x, y, size, color) {
  const paths = {
    file: '<path d="M5 2h7l4 4v12H5zM12 2v5h4M8 11h5M8 14h5"/>',
    code: '<path d="m7 5-5 5 5 5m6-10 5 5-5 5m-2-12-2 14"/>',
    layers: '<path d="m2 6 8-4 8 4-8 4zM2 10l8 4 8-4M2 14l8 4 8-4"/>',
    settings: '<path d="M3 5h14M3 10h14M3 15h14M7 3v4M13 8v4M8 13v4"/>',
    folder: '<path d="M2 5h6l2 2h8v10H2zM2 5V3h6l2 2"/>',
    check: '<path d="m4 10 4 4 8-8"/>',
    filter: '<path d="M2 4h16l-6 7v6l-4-2v-4z"/>',
    bookmark: '<path d="M5 2h10v16l-5-4-5 4z"/>',
    lock: '<path d="M6 8V6a4 4 0 0 1 8 0v2M4 8h12v10H4zM10 12v3"/>',
    database: '<ellipse cx="10" cy="4" rx="7" ry="3"/><path d="M3 4v12c0 4 14 4 14 0V4M3 10c0 4 14 4 14 0"/>',
    cloud: '<path d="M5 15a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4.5 4.5 0 0 1 1 9z"/>',
    people: '<circle cx="7" cy="6" r="3"/><path d="M1 17v-2a6 6 0 0 1 12 0v2M14 3a3 3 0 0 1 0 6M16 12a5 5 0 0 1 3 5"/>',
  };
  return `<g transform="translate(${x} ${y}) scale(${size / 20})" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${paths[kind] || paths.file}</g>`;
}

export function arrow(x, y, color, direction = 'right', size = 4) {
  const d =
    direction === 'left'
      ? `M${x + size} ${y - size}L${x} ${y}L${x + size} ${y + size}`
      : direction === 'down'
      ? `M${x - size} ${y - size}L${x} ${y}L${x + size} ${y - size}`
      : `M${x - size} ${y - size}L${x} ${y}L${x - size} ${y + size}`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>`;
}
