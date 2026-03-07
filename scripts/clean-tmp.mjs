import { existsSync, rmSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();
const targets = [
  '.tmp-web-start-3000-out.log',
  '.tmp-web-start-3000-err.log',
  '.tmp-rust-out.log',
  '.tmp-rust-err.log',
  'tmp_playwright_verify.py',
  'temp_playwright_verify.py',
  'temp_playwright_verify_result.json',
];

for (const relativePath of targets) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    continue;
  }

  rmSync(absolutePath, { force: true });
}

const logsDir = join(repoRoot, 'tmp', 'logs');
if (existsSync(logsDir)) {
  for (const entry of readdirSync(logsDir)) {
    if (entry === '.gitkeep') {
      continue;
    }

    rmSync(join(logsDir, entry), { recursive: true, force: true });
  }
} else {
  mkdirSync(logsDir, { recursive: true });
}

console.log('Da don file tam trong root va tmp/logs');
