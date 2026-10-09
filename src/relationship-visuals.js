import { label, wrap, line, rect, circle, svg } from './drawing.js';
import { typeScale, glyph, arrow } from './design-scale.js';

const ordinal = (i) => String(i + 1).padStart(2, '0');
function copy(value, x, y, width, size, color, font = 'sans', weight = 400) {
  const rows = wrap(value, Math.max(36, width), size, font);
  return { body: label(rows, x, y, size, color, font, weight, 1.35), bottom: y + (rows.length - 1) * size * 1.35 };
}
const titleFont = (t) => t.customFont || (t.designId === 'journal' ? 'serif' : t.designId === 'console' ? 'mono' : 'sans');
export function topologyDescription(block) {
  return block.items.map(item => `${item.title}${item.meta ? ' (' + item.meta + ')' : ''}: ${item.description}\n` + item.outputs.map(output => `${item.title} → ${output.title}${output.via ? ' via ' + output.via : ''}: ${output.description}`).join('\n')).join('\n\n');
}
export function sequenceDescription(block) {
  return block.messages.map((message, i) => `${i + 1}. ${block.actors[message.from].title} → ${block.actors[message.to].title}: ${message.label}${message.description ? ' — ' + message.description : ''}${message.gate ? ' [Requires: ' + message.gate + ']' : ''}`).join('\n');
}

// Each source owns a separate branch. A repeated destination is intentionally
// repeated rather than connected through an invented intermediate processor.
export function topology(block, t, w, mobile) {
  const s = typeScale(t, mobile), p = mobile ? 18 : 16, inner = w - p * 2;
  const journal = t.designId === 'journal', console = t.designId === 'console', pipeline = t.designId === 'pipeline';
  let body = '', y = p;
  block.items.forEach((item, i) => {
    const top = y, sourceW = mobile ? inner - 38 : inner * 0.34;
    const sourceX = mobile ? p + 38 : p + 10;
    const outputX = mobile ? sourceX : p + inner * 0.55;
    const outputW = w - p - outputX;
    const meta = copy(item.meta || 'SOURCE', sourceX, y + s.note + 10, sourceW, s.note, t.accent, 'mono');
    const title = copy(item.title, sourceX, meta.bottom + 28, sourceW, s.title + 2, t.fg, titleFont(t), journal ? 400 : 600);
    const desc = copy(item.description, sourceX, title.bottom + 24, sourceW, s.body, t.muted, s.textFont);
    const sourceBottom = desc.bottom + 20;
    const sourceAnchor = title.bottom + 6;
    const outputs = [];
    let outputY = mobile ? sourceBottom + 14 : top + 3;
    item.outputs.forEach(output => {
      const inset = console || journal ? 0 : 14;
      const header = copy(output.title, outputX + inset + 26, outputY + s.body + 14, outputW - inset * 2 - 26, s.body, t.fg, s.textFont, 600);
      const detail = copy(output.description, outputX + inset + 26, header.bottom + 24, outputW - inset * 2 - 26, s.body, t.muted, s.textFont);
      const via = output.via ? copy('via ' + output.via, outputX + inset + 26, detail.bottom + 21, outputW - inset * 2 - 26, s.note, t.accent, 'mono') : { body: '', bottom: detail.bottom };
      const h = via.bottom - outputY + 17;
      const cy = outputY + Math.min(37, h / 2);
      let content = glyph(output.icon || 'layers', outputX + inset, outputY + 13, 18, t.accent) + header.body + detail.body + via.body;
      if (!journal && !console) content = rect(outputX, outputY, outputW, h, t.surface, t.border, pipeline ? 2 : 6) + content;
      else content = line(outputX, outputY, outputX + outputW, outputY, t.border) + content;
      outputs.push({ body: content, cy });
      outputY += h + 14;
    });
    const bottom = Math.max(sourceBottom, outputY - 14) + 22;
    if (pipeline) body += rect(p, top, 3, bottom - top - 8, t.accent);
    if (mobile) {
      body += line(p + 12, top + 8, p + 12, bottom - 22, t.border, 1.3);
      outputs.forEach(output => body += line(p + 12, output.cy, outputX - 9, output.cy, t.border) + arrow(outputX - 9, output.cy, t.accent));
    } else {
      const bus = p + inner * 0.46, first = Math.min(sourceAnchor, outputs[0].cy), last = Math.max(sourceAnchor, outputs.at(-1).cy);
      body += line(sourceX + sourceW + 14, sourceAnchor, bus, sourceAnchor, t.border, 1.4);
      body += line(bus, first, bus, last, t.border, 1.4);
      body += circle(bus, sourceAnchor, 2.5, t.accent);
      outputs.forEach(output => body += line(bus, output.cy, outputX - 10, output.cy, t.border, 1.4) + arrow(outputX - 10, output.cy, t.accent));
    }
    body += meta.body + title.body + desc.body + outputs.map(output => output.body).join('');
    if (i < block.items.length - 1) body += line(p, bottom, w - p, bottom, t.border);
    y = bottom + 26;
  });
  return svg(w, y - 16, body, topologyDescription(block), t, false);
}

// Actor indices, message order and explicit gates are content. A design change
// only changes their visual treatment, never who sends a message to whom.
export function sequence(block, t, w, mobile) {
  const s = typeScale(t, mobile), p = mobile ? 18 : 16, inner = w - p * 2;
  const journal = t.designId === 'journal', console = t.designId === 'console', pipeline = t.designId === 'pipeline';
  let body = '', y = p;
  if (mobile) {
    block.messages.forEach((message, i) => {
      const x = p + 39, width = inner - 39;
      const participants = copy(block.actors[message.from].title + ' → ' + block.actors[message.to].title, x, y + s.note + 7, width, s.note, t.accent, 'mono');
      const title = copy(message.label, x, participants.bottom + 27, width, s.title, t.fg, titleFont(t), journal ? 400 : 600);
      const desc = message.description ? copy(message.description, x, title.bottom + 24, width, s.body, t.muted, s.textFont) : { body: '', bottom: title.bottom };
      const gate = message.gate ? copy('Requires: ' + message.gate, x + 25, desc.bottom + 27, width - 25, s.note, t.accent, s.textFont) : { body: '', bottom: desc.bottom };
      const bottom = gate.bottom + 23;
      if (pipeline) body += rect(p, y, 3, bottom - y - 4, t.accent);
      else body += line(p, y, w - p, y, t.border);
      body += label(ordinal(i), p + 9, y + 24, s.note, t.accent, 'mono') + participants.body + title.body + desc.body + gate.body;
      if (message.gate) body += glyph('lock', x, desc.bottom + 13, 17, t.accent);
      y = bottom + 14;
    });
  } else {
    const cw = inner / block.actors.length, centers = block.actors.map((_, i) => p + cw * (i + 0.5));
    const actors = block.actors.map((actor, i) => {
      const x = p + i * cw + 12, width = cw - 24;
      const name = copy(actor.title, x, y + s.title + 12, width, s.title, t.fg, titleFont(t), journal ? 400 : 600);
      const role = actor.description ? copy(actor.description, x, name.bottom + 23, width, s.note, t.muted, s.textFont) : { body: '', bottom: name.bottom };
      return {name,role,x,width};
    });
    const headerH = Math.max(...actors.map(actor => actor.role.bottom)) + 20;
    let messages = '', messageY = headerH + 29;
    block.messages.forEach((message, i) => {
      const from = centers[message.from], to = centers[message.to], left = Math.min(from, to), distance = Math.abs(to - from);
      const inset = 15, title = copy(message.label, left + inset, messageY + s.body, distance - inset * 2, s.body, t.fg, s.textFont, 600);
      const arrowY = title.bottom + 17;
      const desc = message.description ? copy(message.description, left + inset, arrowY + 26, distance - inset * 2, s.body, t.muted, s.textFont) : { body: '', bottom: arrowY };
      const gate = message.gate ? copy('Requires: ' + message.gate, left + inset + 23, desc.bottom + 23, distance - inset * 2 - 23, s.note, t.accent, s.textFont) : { body: '', bottom: desc.bottom };
      const bottom = gate.bottom + 24;
      messages += rect(left + 7, messageY - 6, distance - 14, bottom - messageY + 5, t.bg, 'none', 3);
      messages += title.body + desc.body + gate.body;
      if (message.gate) messages += glyph('lock', left + inset, desc.bottom + 10, 15, t.accent);
      const dash = message.kind === 'reply' ? ' stroke-dasharray="4 4"' : '';
      messages += `<path d="M${from} ${arrowY}H${to}" stroke="${t.accent}" stroke-width="1.4" fill="none"${dash}/>`;
      messages += arrow(to, arrowY, t.accent, to > from ? 'right' : 'left', 4);
      messages += circle(from, arrowY, 3, t.bg, t.accent) + label(ordinal(i), left + inset - 24, messageY + s.body, s.note, t.muted, 'mono');
      messageY = bottom + 20;
    });
    y = messageY;
    centers.forEach(x => body += `<path d="M${x} ${headerH + 4}V${y - 18}" stroke="${t.border}" stroke-width="1" stroke-dasharray="3 5" fill="none"/>`);
    actors.forEach(actor => {
      if (!journal) body += rect(actor.x - 4, p, actor.width + 8, headerH - p - 3, console ? 'none' : t.surface, t.border, pipeline || console ? 0 : 5);
      else body += line(actor.x, headerH, actor.x + actor.width, headerH, t.border);
      body += actor.name.body + actor.role.body;
    });
    body += messages;
  }
  return svg(w, y + p, body, sequenceDescription(block), t, false);
}
