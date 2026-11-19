// Biến coverage/lcov.info (do `node --test --experimental-test-coverage` sinh ra) thành báo cáo HTML tĩnh,
// KHÔNG cần thư viện ngoài:   node scripts/coverage-html.js   ->   coverage/index.html
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LCOV = 'coverage/lcov.info';
const OUT = 'coverage';

const esc = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const pct = (hit, total) => (total === 0 ? 100 : (hit / total) * 100);
const fmt = (value) => `${value.toFixed(2)}%`;
const level = (value) => (value >= 90 ? 'good' : value >= 75 ? 'mid' : 'bad');

export function parseLcov(text) {
  const files = [];
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('SF:')) {
      current = {
        path: line.slice(3),
        lines: new Map(),
        branches: new Map(),
        fnFound: 0,
        fnHit: 0,
        brFound: 0,
        brHit: 0,
      };
    } else if (!current) {
      continue;
    } else if (line.startsWith('DA:')) {
      const [n, hits] = line.slice(3).split(',');
      current.lines.set(Number(n), Number(hits));
    } else if (line.startsWith('BRDA:')) {
      const [n, , , taken] = line.slice(5).split(',');
      const list = current.branches.get(Number(n)) ?? [];
      list.push(taken === '-' ? 0 : Number(taken));
      current.branches.set(Number(n), list);
    } else if (line.startsWith('FNF:')) {
      current.fnFound = Number(line.slice(4));
    } else if (line.startsWith('FNH:')) {
      current.fnHit = Number(line.slice(4));
    } else if (line.startsWith('BRF:')) {
      current.brFound = Number(line.slice(4));
    } else if (line.startsWith('BRH:')) {
      current.brHit = Number(line.slice(4));
    } else if (line === 'end_of_record') {
      current.lineFound = current.lines.size;
      current.lineHit = [...current.lines.values()].filter((hits) => hits > 0).length;
      files.push(current);
      current = null;
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

const CSS = `
:root{--bg:#fff;--fg:#1c2128;--muted:#656d76;--line:#d0d7de;--good:#1a7f37;--mid:#9a6700;--bad:#cf222e;--goodbg:#dafbe1;--midbg:#fff8c5;--badbg:#ffebe9;--code:#f6f8fa}
@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--fg:#e6edf3;--muted:#8b949e;--line:#30363d;--good:#3fb950;--mid:#d29922;--bad:#f85149;--goodbg:#12261e;--midbg:#2d2a12;--badbg:#3c1618;--code:#161b22}}
*{box-sizing:border-box}body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:1000px;margin:0 auto}h1{font-size:22px;margin:0 0 4px}p.sub{color:var(--muted);margin:0 0 20px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px}
.card{border:1px solid var(--line);border-radius:8px;padding:12px 14px}.card b{display:block;font-size:24px}.card span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.good{color:var(--good)}.mid{color:var(--mid)}.bad{color:var(--bad)}
table{width:100%;border-collapse:collapse}th,td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
th:first-child,td:first-child{text-align:left;white-space:normal;word-break:break-all}th{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
a{color:inherit}td a{text-decoration:underline;text-decoration-color:var(--line)}
.bar{display:inline-block;width:70px;height:8px;border-radius:4px;background:var(--badbg);vertical-align:middle;margin-left:8px;overflow:hidden}.bar i{display:block;height:100%;background:var(--good)}
.bar.mid i{background:var(--mid)}.bar.bad i{background:var(--bad)}
.scroll{overflow-x:auto}pre{margin:0}
.src{border:1px solid var(--line);border-radius:8px;overflow-x:auto;background:var(--code);font:12.5px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.row{display:flex;min-width:max-content}.row .n,.row .h{flex:none;text-align:right;color:var(--muted);padding:0 8px;user-select:none}.row .n{width:52px}.row .h{width:64px;border-right:1px solid var(--line)}
.row .c{padding:0 12px;white-space:pre;flex:1}
.row.miss{background:var(--badbg)}.row.miss .h{color:var(--bad);font-weight:600}.row.part{background:var(--midbg)}.row.part .h{color:var(--mid);font-weight:600}
.legend{display:flex;gap:16px;flex-wrap:wrap;margin:0 0 16px;color:var(--muted);font-size:12px}.legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-2px}
`;

const page = (title, body) =>
  `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${CSS}</style></head><body><main>${body}</main></body></html>`;

const cell = (hit, total) => {
  const value = pct(hit, total);
  return `<td><span class="${level(value)}">${fmt(value)}</span> <span style="color:var(--muted)">${hit}/${total}</span><span class="bar ${level(value)}"><i style="width:${value}%"></i></span></td>`;
};

const slug = (path) => `${path.replace(/[\\/]/g, '__')}.html`;

function filePage(file) {
  let source;
  try {
    source = readFileSync(file.path, 'utf8').split('\n');
  } catch {
    source = [];
  }
  const rows = source.map((code, index) => {
    const number = index + 1;
    const hits = file.lines.get(number);
    const branches = file.branches.get(number) ?? [];
    const partial = hits > 0 && branches.some((taken) => taken === 0);
    const kind = hits === 0 ? 'miss' : partial ? 'part' : '';
    const label = hits === undefined ? '' : hits === 0 ? '0×' : partial ? `${hits}× ◐` : `${hits}×`;
    return `<div class="row ${kind}"><span class="n">${number}</span><span class="h">${label}</span><pre class="c">${esc(code)}</pre></div>`;
  });
  const lineValue = pct(file.lineHit, file.lineFound);
  return page(
    `Coverage – ${file.path}`,
    `<p><a href="../index.html">← Tất cả file</a></p><h1>${esc(file.path)}</h1>
<p class="sub">Dòng ${fmt(lineValue)} (${file.lineHit}/${file.lineFound}) · Nhánh ${file.brHit}/${file.brFound} · Hàm ${file.fnHit}/${file.fnFound}</p>
<div class="legend"><span><i style="background:var(--badbg);border:1px solid var(--bad)"></i>Dòng chưa chạy (0×)</span><span><i style="background:var(--midbg);border:1px solid var(--mid)"></i>◐ Có nhánh chưa đi qua</span><span>Số ở cột trái là số lần dòng được chạy</span></div>
<div class="src">${rows.join('')}</div>`,
  );
}

export function generate({ lcovPath = LCOV, outDir = OUT } = {}) {
  const files = parseLcov(readFileSync(lcovPath, 'utf8'));
  rmSync(join(outDir, 'files'), { recursive: true, force: true });
  mkdirSync(join(outDir, 'files'), { recursive: true });

  const sum = (key) => files.reduce((total, file) => total + file[key], 0);
  const totals = {
    line: [sum('lineHit'), sum('lineFound')],
    branch: [sum('brHit'), sum('brFound')],
    fn: [sum('fnHit'), sum('fnFound')],
  };
  const card = (label, [hit, total]) => {
    const value = pct(hit, total);
    return `<div class="card"><span>${label}</span><b class="${level(value)}">${fmt(value)}</b><span>${hit}/${total}</span></div>`;
  };
  const rows = files
    .map(
      (file) =>
        `<tr><td><a href="files/${esc(slug(file.path))}">${esc(file.path)}</a></td>${cell(file.lineHit, file.lineFound)}${cell(file.brHit, file.brFound)}${cell(file.fnHit, file.fnFound)}</tr>`,
    )
    .join('');
  const html = page(
    'Báo cáo coverage',
    `<h1>Báo cáo coverage</h1><p class="sub">${files.length} file · tạo lúc ${new Date().toLocaleString('vi-VN')} · nguồn: ${esc(lcovPath)}</p>
<div class="cards">${card('Dòng', totals.line)}${card('Nhánh', totals.branch)}${card('Hàm', totals.fn)}</div>
<div class="scroll"><table><thead><tr><th>File</th><th>Dòng</th><th>Nhánh</th><th>Hàm</th></tr></thead><tbody>${rows}</tbody></table></div>`,
  );
  writeFileSync(join(outDir, 'index.html'), html);
  for (const file of files) {
    writeFileSync(join(outDir, 'files', slug(file.path)), filePage(file));
  }
  return { files: files.length, totals };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { files, totals } = generate();
    const [hit, total] = totals.line;
    console.log(
      `Báo cáo HTML: ${join(OUT, 'index.html')} (${files} file, dòng ${fmt(pct(hit, total))})`,
    );
  } catch (error) {
    console.error(
      `Không đọc được ${LCOV}. Hãy chạy "npm run test:coverage" trước.\n${error.message}`,
    );
    process.exit(1);
  }
}
