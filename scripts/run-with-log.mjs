import { mkdirSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const [, , logName, ...commandParts] = process.argv;

if (!logName || commandParts.length === 0) {
  console.error('Usage: node scripts/run-with-log.mjs <log-name> <command> [args...]');
  process.exit(1);
}

const logsDir = join(process.cwd(), 'tmp', 'logs');
mkdirSync(logsDir, { recursive: true });

const stdoutPath = join(logsDir, `${logName}.out.log`);
const stderrPath = join(logsDir, `${logName}.err.log`);

const stdoutStream = createWriteStream(stdoutPath, { flags: 'a' });
const stderrStream = createWriteStream(stderrPath, { flags: 'a' });

const [command, ...args] = commandParts;
const child = spawn(command, args, {
  cwd: process.cwd(),
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
  env: process.env,
});

child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  stdoutStream.write(chunk);
});

child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
  stderrStream.write(chunk);
});

child.on('close', (code) => {
  stdoutStream.end();
  stderrStream.end();
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error);
  stdoutStream.end();
  stderrStream.end();
  process.exit(1);
});
