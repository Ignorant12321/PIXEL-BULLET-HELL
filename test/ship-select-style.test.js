import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('ship select keeps arrow rails around the three-card page', function () {
  const css = readFileSync(new URL('../src/styles/app.css', import.meta.url), 'utf8');

  assert.match(css, /\.ship-select-page\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(css, /\.ship-select\s*\{[\s\S]{0,80}grid-template-columns:\s*1fr/);
});
