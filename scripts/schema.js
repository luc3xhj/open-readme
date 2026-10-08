import { writeFile } from 'node:fs/promises';
import { schema } from '../src/schema.js';
await writeFile(new URL('../schema.json', import.meta.url), JSON.stringify(schema, null, 2) + '\n');
