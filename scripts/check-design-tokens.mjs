import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const EXCLUDE = new Set([
  'src/lib/designSystem.ts',
  'src/routeTree.gen.ts',
]);

const RULES = [
  {
    name: 'Raw utility color classes',
    pattern:
      /\b(?:text|bg|border)-(?:red|green|amber|blue|slate|gray|zinc|neutral|stone)-(?:50|100|200|300|400|500|600|700|800|900|950)\b/g,
  },
  {
    name: 'Raw hex color literal',
    pattern: /#[0-9A-Fa-f]{3,8}\b/g,
  },
  {
    name: 'Arbitrary pixel text class',
    pattern: /\btext-\[[0-9]+px\]\b/g,
  },
  {
    name: 'Raw white ring utility',
    pattern: /\bring-white\/[0-9]+\b/g,
  },
];

function checkFile(path) {
  if (EXCLUDE.has(path)) {
    return [];
  }

  const source = readFileSync(path, 'utf8');
  const violations = [];

  for (const rule of RULES) {
    const matches = source.matchAll(rule.pattern);
    for (const match of matches) {
      const idx = match.index ?? 0;
      const before = source.slice(0, idx);
      const line = before.split('\n').length;
      violations.push({
        path,
        line,
        rule: rule.name,
        value: match[0],
      });
    }
  }

  return violations;
}

function collectFiles(rootDir) {
  const out = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(abs));
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!/\.(ts|tsx|css)$/.test(entry.name)) {
      continue;
    }
    const rel = abs.replace(/\\/g, '/');
    out.push(rel.startsWith('src/') ? rel : rel.replace(/^.*\/src\//, 'src/'));
  }
  return out;
}

const files = collectFiles('src');
const violations = files.flatMap((path) => checkFile(path));

if (violations.length > 0) {
  console.error('Design token violations found:\n');
  for (const violation of violations) {
    console.error(
      `- ${violation.path}:${violation.line} | ${violation.rule} | ${violation.value}`,
    );
  }
  process.exit(1);
}

console.log('Design token checks passed.');
