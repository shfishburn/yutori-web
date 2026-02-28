#!/usr/bin/env node

import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_REF = 'qxxgzstpnjytositftvm';
const SCHEMA = 'public';
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/types/supabase.generated.ts');

const args = new Set(process.argv.slice(2));
const mode = args.has('--check') ? 'check' : 'write';

const generateTypes = () => {
  const cmd = `supabase gen types typescript --project-id ${PROJECT_REF} --schema ${SCHEMA}`;
  return execSync(cmd, {encoding: 'utf8'});
};

const ensureDir = () => {
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
};

const normalize = (content) => content.replace(/\r\n/g, '\n').trimEnd() + '\n';

const run = () => {
  const generated = normalize(generateTypes());

  if (mode === 'check') {
    if (!fs.existsSync(OUTPUT_FILE)) {
      console.error(`Supabase types missing: ${OUTPUT_FILE}`);
      console.error('Run: npm run supabase:types:gen');
      process.exit(1);
    }

    const existing = normalize(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    if (existing !== generated) {
      console.error('Supabase types are out of sync.');
      console.error('Run: npm run supabase:types:gen');
      process.exit(1);
    }

    console.log('Supabase types are in sync.');
    return;
  }

  ensureDir();
  fs.writeFileSync(OUTPUT_FILE, generated);
  console.log(`Updated ${OUTPUT_FILE}`);
};

try {
  run();
} catch (error) {
  console.error('Failed to generate Supabase types.');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
  process.exit(1);
}
