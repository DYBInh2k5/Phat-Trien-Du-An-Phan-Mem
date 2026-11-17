// Chạy test theo nhóm, chạy được trên Node >= 22.8 khi bật coverage (>= 20.6 khi không bật).
//   node scripts/run-tests.js [unit|integration|all] [--coverage] [--no-threshold]
//   --coverage      bật coverage CÓ SẴN của Node, in bảng + ghi coverage/lcov.info + dựng coverage/index.html
//   --no-threshold  không kiểm ngưỡng (dùng khi chỉ chạy unit test)
// Test chạy TUẦN TỰ vì các file tích hợp dùng chung một database.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { generate } from './coverage-html.js';

/** Ngưỡng tối thiểu (%). Dưới ngưỡng thì lệnh thất bại (mã thoát khác 0). */
const THRESHOLDS = Object.freeze({ lines: 98, functions: 95, branches: 95 });

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const kind = args.find((arg) => !arg.startsWith('--')) ?? 'all';
const withCoverage = flags.has('--coverage');
const groups = kind === 'all' ? ['unit', 'integration'] : [kind];

function collect(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      return collect(full);
    }
    return full.endsWith('.test.js') ? [full] : [];
  });
}

const files = groups.flatMap((group) => collect(join('tests', group))).sort();
if (files.length === 0) {
  console.error(`Không tìm thấy file test cho nhóm "${kind}"`);
  process.exit(1);
}

const nodeArgs = ['--test', '--test-concurrency=1'];
if (withCoverage) {
  mkdirSync('coverage', { recursive: true });
  nodeArgs.push(
    '--experimental-test-coverage',
    '--test-coverage-include=src/**/*.js',
    '--test-coverage-exclude=src/server.js',
    '--test-reporter=spec',
    '--test-reporter-destination=stdout',
    '--test-reporter=lcov',
    '--test-reporter-destination=coverage/lcov.info',
  );
  if (!flags.has('--no-threshold')) {
    nodeArgs.push(
      `--test-coverage-lines=${THRESHOLDS.lines}`,
      `--test-coverage-functions=${THRESHOLDS.functions}`,
      `--test-coverage-branches=${THRESHOLDS.branches}`,
    );
  }
}

const result = spawnSync(process.execPath, [...nodeArgs, ...files], { stdio: 'inherit' });

if (withCoverage) {
  try {
    const { totals } = generate();
    console.log(`\nBáo cáo HTML: coverage/index.html  (${totals.line[0]}/${totals.line[1]} dòng)`);
  } catch (error) {
    console.error(`Không dựng được báo cáo HTML: ${error.message}`);
  }
}
process.exit(result.status ?? 1);
