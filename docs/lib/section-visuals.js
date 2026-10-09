import { wrap, label, line, rect, circle, svg } from './drawing.js?v=0.5.0';
import { typeScale, sectionImportance, glyph, arrow } from './design-scale.js?v=0.5.0';

export function sectionHeading(block, t, w, mobile) {
  const s = typeScale(t, mobile),
    supporting = sectionImportance(block) === 'supporting',
    design = t.designId,
    ordinal = String(block.ordinal || 1).padStart(2, '0'),
    size = supporting ? s.supporting : s.section,
    left = design === 'journal' ? 32 : design === 'pipeline' ? 35 : design === 'canvas' ? 20 : 0,
    title = (design === 'console' ? (supporting ? '· ' : '> ') : '') + block.title,
    rows = wrap(title, w - left - 4, size, s.font),
    y = size + 3,
    height = y + (rows.length - 1) * size * 1.2 + 7;
  let body = label(
    rows,
    left,
    y,
    size,
    t.fg,
    s.font,
    design === 'journal' ? 400 : supporting ? 500 : 600,
    1.2,
  );
  if (design === 'canvas')
    body += rect(0, y - size * 0.43, supporting ? 5 : 9, 2, supporting ? t.border : t.accent);
  if (design === 'journal') body += label(ordinal, 0, y - 1, s.note, t.muted, 'mono');
  if (design === 'pipeline')
    body += label(ordinal + '/', 0, y - 1, s.note, supporting ? t.muted : t.accent, 'mono');
  return svg(w, height, body, block.title, t, false);
}

// The beam topology is input -> processor -> parallel outputs. Measure before
// drawing and anchor every connection to a node boundary. Not a general router.
export function beamLayout(block, t, w, mobile) {
  const s = typeScale(t, mobile),
    console = t.designId === 'console',
    vertical = mobile || console,
    pad = t.pad === 40 ? 22 : 12,
    nodeWidth = vertical ? w - (console ? 120 : 68) : (w - 156) / 3,
    gap = s.gap,
    nodes = block.items.map((item, i) => {
      const titles = wrap(item.title, nodeWidth - pad * 2 - 26, s.title, s.font),
        descriptions = item.description
          ? wrap(item.description, nodeWidth - pad * 2, s.body, s.textFont)
          : [],
        titleY = pad + s.title,
        descY = titleY + (titles.length - 1) * s.title * 1.25 + (descriptions.length ? 24 : 0),
        height = Math.max(68, descY + Math.max(0, descriptions.length - 1) * s.body * 1.4 + pad),
        role = i === 0 ? 'input' : i === 1 ? 'processor' : 'output';
      return { item, i, role, width: nodeWidth, height, titles, descriptions, titleY, descY, pad };
    });
  const edges = [];
  let height, outputGroup, branch;
  if (vertical) {
    let y = 26;
    nodes.forEach((n, i) => {
      n.x = console ? (i === 0 ? 26 : i === 1 ? 58 : 90) : i < 2 ? 26 : 58;
      n.y = y;
      y += n.height + (i === 0 && !console ? 35 : gap);
    });
    height = y - gap + 12;
    const a = nodes[0],
      b = nodes[1],
      trunkX = 12;
    edges.push({
      from: 0,
      to: 1,
      points: console
        ? [
            [a.x, a.y + a.height / 2],
            [trunkX, a.y + a.height / 2],
            [trunkX, b.y + b.height / 2],
            [b.x, b.y + b.height / 2],
          ]
        : [
            [a.x + a.width / 2, a.y + a.height],
            [b.x + b.width / 2, b.y],
          ],
    });
    branch = { x: console ? 44 : trunkX, y: b.y + b.height / 2 };
    for (const n of nodes.slice(2))
      edges.push({
        from: 1,
        to: n.i,
        points: [
          [b.x, branch.y],
          [branch.x, branch.y],
          [branch.x, n.y + n.height / 2],
          [n.x, n.y + n.height / 2],
        ],
      });
    outputGroup = { x: 48, y: nodes[2].y - 10, width: w - 49, height: height - nodes[2].y + 9 };
  } else {
    let y = 35;
    nodes.slice(2).forEach((n) => {
      n.x = w - nodeWidth - 14;
      n.y = y;
      y += n.height + gap;
    });
    height = Math.max(y - gap + 20, ...nodes.slice(0, 2).map((n) => n.height + 60));
    const a = nodes[0],
      b = nodes[1];
    a.x = 1;
    b.x = (w - nodeWidth) / 2;
    a.y = (height - a.height) / 2 + 8;
    b.y = (height - b.height) / 2 + 8;
    const cy = b.y + b.height / 2,
      trunkX = (b.x + b.width + nodes[2].x) / 2;
    edges.push({
      from: 0,
      to: 1,
      points: [
        [a.x + a.width, a.y + a.height / 2],
        [b.x, cy],
      ],
    });
    branch = { x: trunkX, y: cy };
    for (const n of nodes.slice(2))
      edges.push({
        from: 1,
        to: n.i,
        points: [
          [b.x + b.width, cy],
          [trunkX, cy],
          [trunkX, n.y + n.height / 2],
          [n.x, n.y + n.height / 2],
        ],
      });
    outputGroup = { x: nodes[2].x - 10, y: 23, width: nodeWidth + 22, height: height - 25 };
  }
  return { nodes, edges, branch, outputGroup, height, vertical, s };
}

export function systemBeam(block, t, w, mobile) {
  if (!['canvas', 'console', 'journal', 'pipeline'].includes(t.designId) || block.items.length < 3)
    return null;
  const graph = beamLayout(block, t, w, mobile),
    { nodes, edges, outputGroup: group, height, vertical, s } = graph,
    design = t.designId,
    console = design === 'console',
    journal = design === 'journal';
  let body = '';
  if (design === 'pipeline') {
    body += rect(group.x, group.y, group.width, group.height, t.surface, 'none', 0);
    if (!vertical) body += line(nodes[1].x - 30, 24, nodes[1].x - 30, height, t.border);
  } else if (!console && !journal)
    body += `<rect x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}" rx="${t.radius}" fill="none" stroke="${t.border}" stroke-dasharray="3 4"/>`;
  if (!vertical)
    body +=
      label('INPUT', nodes[0].x, 13, s.note, t.muted, 'mono') +
      label('PROCESS', nodes[1].x, 13, s.note, t.muted, 'mono') +
      label('OUTPUTS', nodes[2].x, 13, s.note, t.muted, 'mono');
  // Routes are drawn behind nodes. Short arrowheads terminate on their boundary.
  for (const e of edges) {
    const points = e.points,
      start = points[0],
      end = points.at(-1),
      turn = Math.sign(end[1] - start[1]),
      d =
        design === 'canvas' && !vertical && points.length > 2 && turn
          ? `M${start[0]} ${start[1]}H${graph.branch.x - 5}Q${graph.branch.x} ${start[1]} ${graph.branch.x} ${start[1] + turn * 5}V${end[1] - turn * 5}Q${graph.branch.x} ${end[1]} ${graph.branch.x + 5} ${end[1]}H${end[0]}`
          : 'M' + points.map((p) => p.join(' ')).join('L');
    body += `<path data-edge="${e.from}-${e.to}" d="${d}" fill="none" stroke="${t.accent}" stroke-width="1.25" stroke-linejoin="round"/>`;
    body += arrow(end[0], end[1], t.accent, points.at(-2)[0] === end[0] ? 'down' : 'right');
  }
  if (nodes.length > 3) body += circle(graph.branch.x, graph.branch.y, 2.5, t.accent);
  for (const n of nodes) {
    const { x, y, width, height: nh, pad } = n,
      processor = n.role === 'processor',
      fill = processor && !console && !journal ? t.surface : 'none';
    body += `<g data-node="${n.i}" data-role="${n.role}">`;
    if (design === 'pipeline') {
      if (processor)
        body +=
          rect(x, y, width, nh, t.surface, t.border, t.radius) +
          line(x, y, x + width, y, t.accent, 1.5);
      else body += circle(x, y + nh / 2, 2.5, t.surface, t.accent);
    } else if (!console && !journal)
      body += rect(x, y, width, nh, fill, processor ? t.accent : t.border, t.radius);
    else if (journal) body += line(x, y + nh, x + width, y + nh, processor ? t.accent : t.border);
    body += glyph(
      processor ? 'code' : n.role === 'input' ? 'settings' : 'file',
      x + pad,
      y + pad + 2,
      18,
      processor ? t.accent : t.muted,
    );
    body += label(
      n.titles,
      x + pad + 26,
      y + n.titleY,
      s.title,
      t.fg,
      s.font,
      journal ? 400 : 500,
      1.25,
    );
    if (n.descriptions.length)
      body += label(n.descriptions, x + pad, y + n.descY, s.body, t.muted, s.textFont, 400, 1.4);
    body += '</g>';
  }
  const alt =
    nodes[0].item.title +
    ' → ' +
    nodes[1].item.title +
    '; parallel outputs: ' +
    nodes
      .slice(2)
      .map((n) => n.item.title)
      .join(', ');
  return svg(
    w,
    height + 2,
    body,
    alt +
      ' — ' +
      nodes
        .filter((n) => n.item.description)
        .map((n) => n.item.title + ': ' + n.item.description)
        .join('; '),
    t,
    false,
  );
}
