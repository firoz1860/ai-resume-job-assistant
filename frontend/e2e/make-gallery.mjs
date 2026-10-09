// Builds qa-evidence/index.html — an openable gallery of the QA screenshots,
// tour videos, and a pass/fail table from results.json. Run after the suite:
//   node e2e/make-gallery.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), '../qa-evidence');
const screensDir = path.join(ROOT, 'screens');
const videoDir = path.join(ROOT, 'video');

const screens = fs.existsSync(screensDir) ? fs.readdirSync(screensDir).filter((f) => f.endsWith('.png')).sort() : [];
const videos = fs.existsSync(videoDir) ? fs.readdirSync(videoDir).filter((f) => f.endsWith('.webm')).sort() : [];

let results = null;
try { results = JSON.parse(fs.readFileSync(path.join(ROOT, 'results.json'), 'utf8')); } catch { /* optional */ }

function rows(suite, acc = []) {
  for (const s of suite.suites || []) rows(s, acc);
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const r = t.results?.[t.results.length - 1];
      acc.push({ title: spec.title, project: t.projectName || '', status: r?.status || 'unknown' });
    }
  }
  return acc;
}
const testRows = results ? (results.suites || []).flatMap((s) => rows(s)) : [];
const pass = testRows.filter((r) => r.status === 'passed').length;
const total = testRows.length;

const card = (f) => `
  <figure>
    <a href="screens/${f}" target="_blank"><img loading="lazy" src="screens/${f}" alt="${f}"></a>
    <figcaption>${f.replace(/\.png$/, '')}</figcaption>
  </figure>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CareerOS QA evidence</title>
<style>
  :root{--fg:#17251E;--muted:#56635A;--line:#DDE2D8;--forest:#153D2B;--ivory:#F5F4EE;--lime:#D4ED8A}
  body{margin:0;font:15px/1.5 system-ui,sans-serif;color:var(--fg);background:var(--ivory)}
  header{padding:28px 24px;border-bottom:1px solid var(--line);background:#fff}
  h1{margin:0 0 6px;font-size:22px}
  .note{color:var(--muted);max-width:70ch}
  main{padding:24px;max-width:1200px;margin:0 auto}
  h2{margin:32px 0 12px;font-size:17px;border-bottom:1px solid var(--line);padding-bottom:6px}
  .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
  figure{margin:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
  figure img{display:block;width:100%;height:auto;background:#fff}
  figcaption{padding:8px 10px;font-size:12px;color:var(--muted);border-top:1px solid var(--line);word-break:break-all}
  video{width:100%;max-width:640px;border:1px solid var(--line);border-radius:12px;background:#000}
  table{border-collapse:collapse;width:100%;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}
  td,th{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;font-size:13px}
  .pass{color:var(--forest);font-weight:600}.fail{color:#b91c1c;font-weight:600}
  .pill{display:inline-block;background:var(--lime);color:var(--forest);border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600}
</style></head><body>
<header>
  <h1>CareerOS AI — QA evidence</h1>
  <p class="note"><strong>Fixture notice:</strong> authenticated screens (labelled <em>[fixture]</em>) are rendered with a mocked API and an injected session. They verify <strong>layout / UI states only</strong> — not real authentication, MongoDB persistence, or live AI. Public pages are tested against the real production build with no mocks.</p>
  ${results ? `<p class="note"><span class="pill">${pass}/${total} tests passed</span></p>` : ''}
</header>
<main>
  ${videos.length ? `<h2>Tour videos</h2>${videos.map((v) => `<p><strong>${v}</strong><br><video controls src="video/${v}"></video></p>`).join('')}` : ''}

  <h2>Screens — public (real build, no mocks)</h2>
  <div class="grid">${screens.filter((f) => /^(home|login|signup|about|matcher|notfound)__/.test(f)).map(card).join('')}</div>

  <h2>Screens — workspace &amp; states (fixture-backed)</h2>
  <div class="grid">${screens.filter((f) => !/^(home|login|signup|about|matcher|notfound)__/.test(f)).map(card).join('')}</div>

  ${testRows.length ? `<h2>Test results</h2><table><thead><tr><th>Test</th><th>Project</th><th>Status</th></tr></thead><tbody>
    ${testRows.map((r) => `<tr><td>${r.title}</td><td>${r.project}</td><td class="${r.status === 'passed' ? 'pass' : 'fail'}">${r.status}</td></tr>`).join('')}
  </tbody></table>` : ''}
</main></body></html>`;

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`gallery written: ${path.join(ROOT, 'index.html')}  (${screens.length} screens, ${videos.length} videos, ${total} tests)`);
