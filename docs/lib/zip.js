// Portable, uncompressed ZIP export. Shared by the browser playground and API.
const encoder = new TextEncoder();
const table = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
function join(chunks) {
  const out = new Uint8Array(chunks.reduce((n, b) => n + b.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}
export function createZip(files) {
  if (files.size > 65535) throw new Error('Too many ZIP entries.');
  const local = [],
    central = [];
  let offset = 0;
  for (const [path, content] of files) {
    if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').includes('..'))
      throw new Error('ZIP paths must be relative without parent traversal.');
    const name = encoder.encode(path),
      data = typeof content === 'string' ? encoder.encode(content) : content;
    if (name.length > 65535) throw new Error('ZIP filename is too long.');
    const crc = crc32(data),
      header = new Uint8Array(30),
      h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x800, true);
    h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true);
    local.push(header, name, data);
    const entry = new Uint8Array(46),
      c = new DataView(entry.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x800, true);
    c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    central.push(entry, name);
    offset += header.length + name.length + data.length;
  }
  const centralBytes = join(central),
    end = new Uint8Array(22),
    e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.size, true);
  e.setUint16(10, files.size, true);
  e.setUint32(12, centralBytes.length, true);
  e.setUint32(16, offset, true);
  return join([...local, centralBytes, end]);
}
