import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('eslint-summary.mjs', import.meta.url));

test('aggregates reports, escapes Markdown and marks incomplete runs', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'eslint-summary-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const report = path.join(dir, 'report.json');
  const summary = path.join(dir, 'summary.md');
  const diagnostic = {
    message: 'bad | <tag>\n`value`',
    severity: 'ERROR',
    location: { path: path.join(process.cwd(), 'src', 'example.ts'), range: { start: { line: 42, column: 1 } } },
    code: { value: 'test/rule' }
  };
  writeFileSync(report, JSON.stringify({ diagnostics: [diagnostic, { ...diagnostic, severity: 'WARNING' }] }));
  execFileSync(process.execPath, [script, report], {
    env: { ...process.env, RUNNER_TEMP: dir, GITHUB_STEP_SUMMARY: summary, LINT_OUTCOME: 'failure' }
  });
  const markdown = readFileSync(summary, 'utf8');
  assert.match(markdown, /\*\*1 errors\*\* · \*\*1 warnings\*\*/);
  assert.match(markdown, /reports may be incomplete/);
  assert.match(markdown, /src\/example\.ts \| 42/);
  assert.match(markdown, /bad &#124; &lt;tag&gt; &#96;value&#96;/);
  const merged = JSON.parse(readFileSync(path.join(dir, 'eslint-report.rdjson'), 'utf8'));
  assert.equal(merged.diagnostics.length, 2);
  assert.equal(merged.diagnostics[0].location.path, 'src/example.ts');
});

test('limits summary size and preserves all diagnostics in the merged report', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'eslint-summary-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const report = path.join(dir, 'report.json');
  const summary = path.join(dir, 'summary.md');
  const diagnostics = Array.from({ length: 250 }, () => ({
    message: '&'.repeat(1000),
    severity: 'WARNING',
    location: { path: path.join(process.cwd(), 'src', 'example.ts'), range: { start: { line: 1 } } }
  }));
  writeFileSync(report, JSON.stringify({ diagnostics }));
  execFileSync(process.execPath, [script, report], {
    env: { ...process.env, RUNNER_TEMP: dir, GITHUB_STEP_SUMMARY: summary, LINT_OUTCOME: 'success' }
  });
  const markdown = readFileSync(summary, 'utf8');
  assert.ok(Buffer.byteLength(markdown) < 1024 * 1024);
  assert.match(markdown, /Showing 200 of 250 diagnostics/);
  const merged = JSON.parse(readFileSync(path.join(dir, 'eslint-report.rdjson'), 'utf8'));
  assert.equal(merged.diagnostics.length, 250);
});

test('fails visibly when no report exists', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'eslint-summary-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const summary = path.join(dir, 'summary.md');
  const result = spawnSync(process.execPath, [script], {
    env: { ...process.env, RUNNER_TEMP: dir, GITHUB_STEP_SUMMARY: summary },
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  assert.match(readFileSync(summary, 'utf8'), /No lint reports were produced/);
});

test('caps the summary by bytes even when Markdown escaping expands the fields', (t) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'eslint-summary-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const report = path.join(dir, 'report.json');
  const summary = path.join(dir, 'summary.md');
  const diagnostics = Array.from({ length: 200 }, () => ({
    message: '&'.repeat(500),
    severity: 'ERROR',
    code: { value: '&'.repeat(500) },
    location: { path: path.join(process.cwd(), 'src', 'example.ts') }
  }));
  writeFileSync(report, JSON.stringify({ diagnostics }));
  execFileSync(process.execPath, [script, report], {
    env: { ...process.env, RUNNER_TEMP: dir, GITHUB_STEP_SUMMARY: summary, LINT_OUTCOME: 'success' }
  });
  const markdown = readFileSync(summary, 'utf8');
  assert.ok(Buffer.byteLength(markdown) <= 900_200);
  assert.match(markdown, /Showing \d+ of 200 diagnostics/);
});
