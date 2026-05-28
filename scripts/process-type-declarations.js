#!/usr/bin/env node
// Removes "export declare const NAME: { ... };" blocks for namespace-like consts.
// These are replaced by "export namespace NAME { ... }" declarations appended
// from namespace-to-append.txt, which allows TypeScript's
// "import X = cassandra.types.X" syntax to work (TypeScript 6 requires the
// RHS of import-equals to be a namespace, not a const property).

const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '../dist/cassandra-driver-public.d.ts');
let content = fs.readFileSync(filepath, 'utf8');

const targets = [
  'auth', 'concurrent', 'datastax', 'errors', 'geometry',
  'mapping', 'metadata', 'metrics', 'policies', 'token',
  'tracker', 'types',
];

for (const name of targets) {
  const marker = `export declare const ${name}: {`;
  const start = content.indexOf(marker);
  if (start === -1) continue;

  let pos = start + marker.length;
  let depth = 1;
  while (pos < content.length && depth > 0) {
    if (content[pos] === '{') depth++;
    else if (content[pos] === '}') depth--;
    pos++;
  }
  // consume trailing ";" and one newline
  while (pos < content.length && (content[pos] === ';' || content[pos] === '\r')) pos++;
  if (pos < content.length && content[pos] === '\n') pos++;

  content = content.slice(0, start) + content.slice(pos);
}

fs.writeFileSync(filepath, content);
fs.appendFileSync(filepath, '\n\n' + fs.readFileSync(path.join(__dirname, 'namespace-to-append.txt'), 'utf8'));
console.log('Processed the following type declaration file:', filepath);
