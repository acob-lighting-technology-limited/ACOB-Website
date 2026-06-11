import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

if (
  process.env.CI ||
  process.env.VERCEL ||
  !existsSync(join(process.cwd(), '.git'))
) {
  process.exit(0);
}

const huskyBin =
  process.platform === 'win32'
    ? join(process.cwd(), 'node_modules', '.bin', 'husky.cmd')
    : join(process.cwd(), 'node_modules', '.bin', 'husky');

if (!existsSync(huskyBin)) {
  process.exit(0);
}

const result = spawnSync(huskyBin, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 0);
