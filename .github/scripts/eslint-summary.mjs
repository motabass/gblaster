import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const maxRows = 200;
const maxCellLength = 500;
const maxSummaryBytes = 900_000;

function cell(value = '') {
  const text = String(value === null ? '' : value)
    .replaceAll(/\s+/g, ' ')
    .slice(0, maxCellLength);
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('|', '&#124;')
    .replaceAll('`', '&#96;');
}

function relativePath(filePath) {
  return path.relative(process.cwd(), path.resolve(filePath)).split(path.sep).join('/');
}

function main() {
  const reports = process.argv.slice(2);
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  const tempDir = process.env.RUNNER_TEMP;
  if (!summaryPath || !tempDir) {
    throw new Error('GITHUB_STEP_SUMMARY and RUNNER_TEMP are required');
  }
  if (reports.length === 0) {
    appendFileSync(summaryPath, '## ESLint\n\nNo lint reports were produced. See the lint step logs.\n');
    throw new Error('No ESLint RDJSON reports were produced');
  }

  const diagnostics = reports.flatMap((reportPath) => {
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    if (!Array.isArray(report.diagnostics)) {
      throw new TypeError(`Invalid RDJSON report: ${reportPath}`);
    }
    return report.diagnostics.map((diagnostic) => ({
      ...diagnostic,
      location: {
        ...diagnostic.location,
        path: relativePath(diagnostic.location.path)
      }
    }));
  });

  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'ERROR').length;
  const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === 'WARNING').length;
  const lines = ['## ESLint', '', `**${errors} errors** · **${warnings} warnings**`, ''];
  if (process.env.LINT_OUTCOME !== 'success') {
    lines.push('The lint step did not succeed; reports may be incomplete. See the lint step logs.', '');
  }
  if (diagnostics.length > 0) {
    lines.push('| File | Line | Severity | Rule | Message |', '| --- | ---: | --- | --- | --- |');
    let displayed = 0;
    let size = Buffer.byteLength(lines.join('\n'));
    for (const diagnostic of diagnostics.slice(0, maxRows)) {
      const row = `| ${cell(diagnostic.location.path)} | ${cell(diagnostic.location.range?.start?.line ?? '-')} | ${cell(diagnostic.severity)} | ${cell(diagnostic.code?.value ?? '-')} | ${cell(diagnostic.message)} |`;
      size += Buffer.byteLength(row) + 1;
      if (size > maxSummaryBytes) break;
      lines.push(row);
      displayed++;
    }
    if (displayed < diagnostics.length) {
      lines.push(
        '',
        `Showing ${displayed} of ${diagnostics.length} diagnostics. Download the lint-reports artifact for the full reports.`
      );
    }
  }
  appendFileSync(summaryPath, `${lines.join('\n')}\n`);
  writeFileSync(
    path.join(tempDir, 'eslint-report.rdjson'),
    JSON.stringify({
      source: { name: 'eslint', url: 'https://eslint.org/' },
      diagnostics
    })
  );
}

main();
