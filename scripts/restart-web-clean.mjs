import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execSync, spawn } from 'node:child_process';

const repoRoot = process.cwd();
const webDir = join(repoRoot, 'apps', 'web');
const nextDir = join(webDir, '.next');
const port = 3000;

const log = (message) => {
  process.stdout.write(`${message}\n`);
};

const runPowerShell = (script, options = {}) => {
  execSync(`powershell -NoProfile -Command "${script}"`, {
    cwd: repoRoot,
    stdio: 'inherit',
    ...options,
  });
};

const escapePowerShellPath = (value) => value.replace(/'/g, "''");

try {
  log(`Stopping processes listening on port ${port}...`);
  runPowerShell(`$connections = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue; if ($connections) { $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($processId in $pids) { Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue } }`);

  if (existsSync(nextDir)) {
    log('Removing stale apps/web/.next cache...');
    const escapedNextDir = escapePowerShellPath(nextDir);
    runPowerShell(`if (Test-Path '${escapedNextDir}') { Remove-Item -LiteralPath '${escapedNextDir}' -Recurse -Force }`);
  }

  log('Starting a fresh web dev server...');
  const child = spawn('pnpm', ['--filter', 'web', 'dev'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
    detached: false,
    env: process.env,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
} catch (error) {
  console.error(error);
  process.exit(1);
}
