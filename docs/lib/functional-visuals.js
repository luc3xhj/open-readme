import { label, wrap, line, rect, circle, svg } from './drawing.js?v=0.5.0';
import { typeScale, glyph, arrow } from './design-scale.js?v=0.5.0';

const text = (value, x, y, width, size, color, font = 'sans', weight = 400) => {
  const rows = wrap(value, Math.max(30, width), size, font);
  return { body: label(rows, x, y, size, color, font, weight, 1.4), bottom: y + (rows.length - 1) * size * 1.4 };
};
const fullSteps = (block) => block.items.map(i => [i.title, i.description, i.code, i.result, i.fields?.map(field => field.label + ': ' + field.value).join('; ')].filter(Boolean).join(' — ')).join('; ');
const fullTable = (block) => block.rows.map(row => row.map((value, i) => `${block.columns[i]}: ${value}`).join('; ')).join('\n');
const ordinal = (i) => String(i + 1).padStart(2, '0');

function outcome(item, x, y, width, t, s) {
  const fields = item.fields || (item.result || '').split(/\s*[·•]\s*/).filter(Boolean).map(label => ({label,value:''}));
  const note = s.note, font = t.designId === 'console' ? 'mono' : 'sans';
  let body = '', height;
  if (item.visual === 'filters') {
    body += glyph('filter', x + 14, y + 14, 17, t.accent) + label('NARROW THE LIST', x + 41, y + 27, note, t.muted, 'mono');
    let cy = y + 42;
    fields.forEach((field, i) => {
      const key = text(field.label, x + 15, cy + s.body + 6, width * 0.36, s.body, t.fg, font, 500);
      const value = text(field.value || 'Select a criterion', x + width * 0.43, cy + s.body + 6, width * 0.57 - 15, s.body, t.muted, font);
      const rh = Math.max(key.bottom,value.bottom) - cy + 14;
      body += line(x + 15, cy, x + width - 15, cy, t.border) + key.body + value.body;
      cy += rh;
    });
    body += line(x + 15,cy,x + width - 15,cy,t.border);
    height = cy - y + 17;
  } else if (item.visual === 'comparison') {
    const left = x + 15, fieldW = width * 0.34;
    body += glyph('layers',left,y+14,17,t.accent) + label('COMPARE 2–3 PROGRAMS',left+27,y+27,note,t.muted,'mono');
    let cy = y + 43;
    fields.forEach(field => {
      const name = text(field.label, left, cy + s.body + 7, fieldW - 9, s.body, t.fg, font, 500);
      const value = text(field.value || 'Check the original source',left+fieldW+8,cy+s.body+7,width-fieldW-38,s.body,t.muted,font);
      const rh = Math.max(name.bottom,value.bottom) - cy + 17;
      body += line(left, cy, x + width - 15, cy, t.border) + name.body + value.body;
      cy += rh;
    });
    body += line(left,cy,x+width-15,cy,t.border);
    height = cy - y + 17;
  } else if (item.visual === 'collection') {
    const left = x + 15, cardW = width - 30;
    body += glyph('bookmark',left,y+13,17,t.accent) + label('MY / SAVED',left+27,y+26,note,t.muted,'mono');
    let cy=y+42;
    const saved = fields.length ? fields : [{label:'Record',value:'Program + application batch'},{label:'Notes',value:'Visible only to you'}];
    saved.forEach((field,i)=>{
      const key = text(field.label,left+25,cy+s.body+8,cardW-25,s.body,t.fg,font,500);
      const value = text(field.value || item.result,left+25,key.bottom+22,cardW-25,s.body,t.muted,font);
      body += line(left,cy,left+cardW,cy,t.border) + glyph(i ? 'lock' : 'file',left,cy+13,17,t.accent) + key.body + value.body;
      cy=value.bottom+18;
    });
    height=cy-y+12;
  } else {
    const result = text(item.result || item.title, x + 13, y + 51, width - 26, s.body, t.fg, font, 500);
    body += glyph('file', x + 13, y + 13, 17, t.accent) + result.body;
    height = result.bottom - y + 15;
  }
  const framed = t.designId !== 'console';
  return { body: (framed ? rect(x, y, width, height, t.surface, t.border, t.designId === 'journal' ? 0 : t.radius) : line(x, y, x, y + height, t.accent, 2)) + body, height };
}

// A recipe exposes the command, its purpose and its expected destination.
// Numbers imply order; the destination labels do not pretend to be CLI output.
export function guide(block, t, w, mobile) {
  const s = typeScale(t, mobile), p = mobile ? 18 : 16, inner = w - p * 2;
  let body = '', y = p;
  if (t.designId === 'canvas' && !mobile) {
    const cols = Math.min(3, block.items.length), gap = 24, cw = (inner - gap * (cols - 1)) / cols;
    for (let start = 0; start < block.items.length; start += cols) {
      const cells = block.items.slice(start, start + cols).map((item, j) => {
        const x = p + j * (cw + gap);
        const title = text(item.title, x, y + 59, cw, s.title, t.fg, s.font, 600);
        const desc = text(item.description, x, title.bottom + 25, cw, s.body, t.muted, s.textFont);
        return { item, x, title, desc };
      });
      const codeY = Math.max(...cells.map(c => c.desc.bottom)) + 26;
      const codes = cells.map(c => text(c.item.code || c.item.result || '', c.x + 12, codeY + s.code + 12, cw - 24, s.code, t.fg, 'mono'));
      const codeH = Math.max(...codes.map(c => c.bottom - codeY)) + 16;
      const bottom = codeY + codeH + 25;
      cells.forEach((c, j) => {
        if (j < cells.length - 1) body += line(c.x + 31, y + 14, c.x + cw + gap - 16, y + 14, t.border) + arrow(c.x + cw + gap - 16, y + 14, t.muted);
        body += circle(c.x + 14, y + 14, 14, t.surface, t.border) + label(ordinal(start + j), c.x + 14, y + 18, s.note, t.accent, 'mono', 500, 1, 'middle');
        body += c.title.body + c.desc.body + rect(c.x, codeY, cw, codeH, t.surface, t.border, 5) + codes[j].body;
        if (c.item.result) body += arrow(c.x + 10, bottom + 7, t.accent) + text(c.item.result, c.x + 23, bottom + s.note, cw - 23, s.note, t.muted, 'mono').body;
      });
      y = bottom + s.note * 2.8 + 18;
    }
  } else {
    const console = t.designId === 'console', journal = t.designId === 'journal', pipeline = t.designId === 'pipeline';
    if (console) { body += label('REPOSITORY ROOT / SETUP SEQUENCE', p + 18, y + s.note, s.note, t.muted, 'mono'); y += 38; }
    block.items.forEach((item, i) => {
      const indexX = p + 13, left = p + 43;
      const split = !mobile && !console ? p + inner * (journal ? 0.39 : 0.46) : left;
      const titleWidth = mobile || console ? inner - 44 : split - left - 26;
      const title = text(item.title, left, y + s.title + 7, titleWidth, s.title, t.fg, journal ? 'serif' : s.font, journal ? 400 : 600);
      const desc = text(item.description, left, title.bottom + 24, titleWidth, s.body, t.muted, s.textFont);
      const commandY = mobile || console ? desc.bottom + 28 : y + s.code + 18;
      const commandX = split + (console ? 0 : 12), commandW = mobile || console ? w - p - commandX - 12 : w - p - split - 24;
      const command = text((console && item.code ? '$ ' : '') + (item.code || item.result || ''), commandX, commandY, commandW, s.code + (journal ? 2 : 0), t.fg, 'mono');
      const result = item.result ? text(item.result, commandX, command.bottom + 24, commandW, s.note, t.muted, 'mono') : {body:'',bottom:command.bottom};
      const bottom = Math.max(desc.bottom, result.bottom) + 24;
      if (pipeline) body += rect(p + 1, y, inner - 2, bottom - y - 5, t.surface, 'none', 2);
      if (console) body += line(p, y, p, bottom, t.border, 2);
      else if (journal) body += line(p, y, w - p, y, t.border);
      if (!console && !journal) body += circle(indexX, y + 20, 11, t.bg, t.border);
      body += label(ordinal(i), indexX, y + 24, s.note, t.accent, 'mono', 500, 1, 'middle');
      if (!mobile && !console && !journal) body += line(split - 14, y + 18, split - 14, bottom - 22, t.border);
      body += title.body + desc.body + command.body + result.body;
      if (pipeline && i < block.items.length - 1) body += line(indexX, bottom - 5, indexX, bottom + 16, t.accent) + arrow(indexX, bottom + 16, t.accent, 'down');
      y = bottom + (pipeline ? 21 : 12);
    });
    if (console) body += rect(p, p, inner, y - p, 'none', t.border, 2);
  }
  return svg(w, y + p, body, fullSteps(block), t, false);
}

// A storyboard makes the user's next action and resulting artifact explicit.
export function journey(block, t, w, mobile) {
  const s = typeScale(t, mobile), p = mobile ? 18 : 16, inner = w - p * 2;
  let body = '', y = p;
  if (t.designId === 'journal' && !mobile) {
    const cols = Math.min(3, block.items.length), gap = 26, cw = (inner - gap * (cols - 1)) / cols;
    for (let start = 0; start < block.items.length; start += cols) {
      const cells = block.items.slice(start, start + cols).map((item, j) => {
        const x = p + j * (cw + gap);
        const title = text(item.title, x, y + 48, cw, s.title + 2, t.fg, 'serif');
        const desc = text(item.description, x, title.bottom + 25, cw, s.body, t.muted, s.textFont);
        const result = text(item.result || item.title, x + 16, y + 151, cw - 36, s.body, t.fg, 'serif');
        return {item,x,title,desc,result};
      });
      const resultY = Math.max(...cells.map(c => c.desc.bottom)) + 25;
      const proofs = cells.map(c => outcome(c.item, c.x, resultY, cw, t, s));
      const height = Math.max(...proofs.map(proof => proof.height));
      cells.forEach((c, j) => {
        body += line(c.x, y, c.x + cw, y, t.border) + label(ordinal(start + j), c.x, y + 21, s.note, t.accent, 'mono') + c.title.body + c.desc.body;
        body += proofs[j].body;
      });
      y = resultY + height + 26;
    }
  } else {
    const console = t.designId === 'console', pipeline = t.designId === 'pipeline';
    block.items.forEach((item, i) => {
      const x = p + 45, proofX = mobile ? x : p + inner * 0.63;
      const title = text(item.title, x, y + s.title + 9, mobile ? inner - 46 : inner * 0.55, s.title, t.fg, s.font, 600);
      const desc = text(item.description, x, title.bottom + 24, mobile ? inner - 46 : inner * 0.53, s.body, t.muted, s.textFont);
      const proofY = mobile ? desc.bottom + 26 : y + 14;
      const proofW = w - p - proofX;
      const proof = outcome(item, proofX, proofY, proofW - 7, t, s);
      const proofBottom = proofY + proof.height, bottom = Math.max(desc.bottom + 24, proofBottom + 9);
      if (pipeline) body += rect(p, y, inner, bottom - y, t.surface, 'none', 2) + rect(p, y, 3, bottom - y, t.accent);
      else if (!console) body += line(p, y, w - p, y, t.border);
      if (i < block.items.length - 1) body += line(p + 14, y + 31, p + 14, bottom + 26, t.border, 1.4);
      body += circle(p + 14, y + 22, 12, t.bg, t.accent) + label(ordinal(i), p + 14, y + 26, s.note, t.accent, 'mono', 500, 1, 'middle');
      body += title.body + desc.body;
      if (!mobile) body += line(proofX - 29, proofY + 32, proofX - 3, proofY + 32, t.accent) + arrow(proofX - 3, proofY + 32, t.accent);
      body += proof.body;
      y = bottom + 21;
    });
  }
  return svg(w, y + p, body, fullSteps(block), t, false);
}

export function factTiles(block, t, w, mobile) {
  const s = typeScale(t, mobile), p = mobile ? 18 : 16, inner = w - p * 2;
  const cols = mobile ? 1 : Math.min(3, block.rows.length), gap = 22, cw = (inner - gap * (cols - 1)) / cols;
  let body = '', y = p;
  for (let start = 0; start < block.rows.length; start += cols) {
    const cells = block.rows.slice(start, start + cols).map((row, j) => {
      const x = p + j * (cw + gap), inset = t.designId === 'journal' ? 0 : 16;
      const key = text(row[0], x + inset, y + s.note + 15, cw - inset * 2, s.note, t.muted, 'mono');
      const valueSize = s.title + 5;
      const value = text(row[1] || '', x + inset, key.bottom + valueSize + 13, cw - inset * 2, valueSize, t.fg, t.designId === 'journal' ? 'serif' : s.font, 500);
      const note = text(row.slice(2).join(' · '), x + inset, value.bottom + 23, cw - inset * 2, s.body, t.muted, s.textFont);
      return {row,x,key,value,note};
    });
    const bottom = Math.max(...cells.map(c => c.note.bottom)) + 22;
    cells.forEach(c => {
      if (t.designId === 'canvas') body += rect(c.x, y, cw, bottom - y, t.surface, 'none', 7);
      if (t.designId === 'console') body += rect(c.x, y, cw, bottom - y, 'none', t.border, 0) + rect(c.x, y, 3, bottom - y, t.accent);
      if (t.designId === 'pipeline') body += line(c.x, y, c.x + cw, y, t.accent, 2) + line(c.x, bottom, c.x + cw, bottom, t.border);
      if (t.designId === 'journal') body += line(c.x, y, c.x + cw, y, t.border) + line(c.x, bottom, c.x + cw, bottom, t.border);
      body += c.key.body + c.value.body + c.note.body;
    });
    y = bottom + gap;
  }
  return svg(w, y - gap + p, body, fullTable(block), t, false);
}

// Directory edges express actual shared path prefixes, never service topology.
export function repositoryMap(block, t, w, mobile) {
  const s = typeScale(t, mobile), p = mobile ? 18 : 16, inner = w - 2 * p;
  let body = '', y = p, previous;
  block.rows.forEach((row, i) => {
    const parts = row[0].split('/'), group = parts.length > 1 ? parts[0] : '';
    const child = group ? parts.slice(1).join('/') : row[0];
    if (group && group !== previous && t.designId !== 'journal') {
      body += glyph('folder', p, y + 2, 18, t.accent) + label(group + '/', p + 27, y + s.body + 3, s.body, t.fg, 'mono', 600);
      y += s.body + 25;
    }
    const journal = t.designId === 'journal', pipeline = t.designId === 'pipeline', console = t.designId === 'console';
    const x = journal ? p + 34 : p + 48, descX = mobile ? x : p + inner * (pipeline ? 0.35 : 0.33);
    const name = text(journal || pipeline ? row[0] : child, x, y + s.title + 7, mobile ? inner - 50 : descX - x - 24, s.title, t.fg, journal ? 'serif' : 'mono', journal ? 400 : 500);
    const description = text(row.slice(1).join(' · '), descX, mobile ? name.bottom + 23 : y + s.body + 9, w - p - descX - 16, s.body, t.muted, s.textFont);
    const bottom = Math.max(name.bottom, description.bottom) + 22;
    if (pipeline) body += rect(p + 36, y, inner - 36, bottom - y, t.surface, 'none', 2);
    if (journal) body += line(p, y, w - p, y, t.border) + label(ordinal(i), p, y + 25, s.note, t.accent, 'mono');
    else {
      body += line(p + 10, y - 13, p + 10, y + 22, t.border) + line(p + 10, y + 22, p + 35, y + 22, t.border);
      if (i + 1 < block.rows.length && block.rows[i + 1][0].split('/')[0] === group) body += line(p + 10, y + 22, p + 10, bottom + 10, t.border);
      if (!console) body += glyph('folder', x - 24, y + 9, 17, t.accent);
    }
    body += name.body + description.body;
    y = bottom + 13; previous = group;
  });
  return svg(w, y + p, body, fullTable(block), t, false);
}

export function annotatedCode(block, t, w, mobile) {
  const s = typeScale(t, mobile), p = mobile ? 18 : 16, inner = w - 2 * p;
  let body = '', y = p;
  const console = t.designId === 'console', journal = t.designId === 'journal';
  const sourceW = mobile ? inner - 44 : inner * 0.61 - 42, noteX = mobile ? p + 44 : p + inner * 0.66;
  if (block.filename) { body += label(block.filename, p + 12, y + s.note, s.note, t.muted, 'mono'); y += 34; }
  block.code.split('\n').forEach((source, i) => {
    const annotation = block.annotations?.find(a => a.line === i + 1);
    const code = text((console && source ? '$ ' : '') + source, p + 44, y + s.code + 16, sourceW, s.code, t.fg, 'mono');
    const noteY = mobile ? code.bottom + 22 : y + s.body + 13;
    const name = annotation ? text(annotation.label, noteX, noteY, w - p - noteX - 12, s.body, t.fg, journal ? 'serif' : s.textFont, journal ? 400 : 600) : {body:'',bottom:code.bottom};
    const desc = annotation?.description ? text(annotation.description, noteX, name.bottom + 22, w - p - noteX - 12, s.note, t.muted, s.textFont) : {body:'',bottom:name.bottom};
    const bottom = Math.max(code.bottom, desc.bottom) + 22;
    if (t.designId === 'canvas') body += rect(p, y, mobile ? inner : inner * 0.64, bottom - y - 4, t.surface, 'none', 3);
    if (t.designId === 'pipeline') body += rect(p, y, inner, bottom - y - 4, t.surface, 'none', 2) + rect(p, y, 3, bottom - y - 4, t.accent);
    if (journal) body += line(p, y, w - p, y, t.border);
    if (console) body += line(p, y, p, bottom, t.border, 2);
    body += label(ordinal(i), p + 11, y + s.code + 16, s.note, t.muted, 'mono') + code.body + name.body + desc.body;
    y = bottom + 8;
  });
  return svg(w, y + p, body, block.code + '\n' + (block.annotations || []).map(a => `${a.line}: ${a.label}${a.description ? ' — ' + a.description : ''}`).join('\n'), t, false);
}

// The Markdown wraps each entire resource row in its actual link.
export function resourceLink(block, t, w, mobile) {
  const s = typeScale(t, mobile), p = mobile ? 18 : 16, inner = w - p * 2;
  const journal = t.designId === 'journal', console = t.designId === 'console';
  const titleX = p + (journal ? 30 : 39), descX = mobile ? titleX : p + inner * 0.4;
  const title = text(block.label, titleX, p + s.title + 7, mobile ? inner - 69 : inner * 0.35, s.title, t.fg, journal ? 'serif' : s.font, journal ? 400 : 500);
  const desc = block.description ? text(block.description, descX, mobile ? title.bottom + 23 : p + s.body + 9, w - p - descX - 34, s.body, t.muted, s.textFont) : {body:'',bottom:title.bottom};
  const h = Math.max(title.bottom, desc.bottom) + p + 13;
  let body = '';
  if (t.designId === 'canvas') body += rect(p, 1, inner, h - 2, t.surface, 'none', 5);
  if (t.designId === 'pipeline') body += rect(p, 1, inner, h - 2, 'none', t.border, 2) + rect(p, 1, 3, h - 2, t.accent);
  if (journal || console) body += line(p, h - 1, w - p, h - 1, t.border);
  body += journal ? label(ordinal(block.ordinal || 0), p, p + 25, s.note, t.accent, 'mono') : glyph('file', p + 12, p + 9, 17, t.accent);
  body += title.body + desc.body + label('↗', w - p - 22, p + 25, s.title, t.accent, 'sans');
  return svg(w, h, body, [block.label, block.description].filter(Boolean).join(' — '), t, false);
}
