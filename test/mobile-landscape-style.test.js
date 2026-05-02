import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/mobile-landscape.css', import.meta.url), 'utf8');

test('mobile landscape stylesheet is loaded after the base app stylesheet', function () {
  const appIndex = html.indexOf('href="./src/styles/app.css"');
  const mobileIndex = html.indexOf('href="./src/styles/mobile-landscape.css"');

  assert.notEqual(appIndex, -1);
  assert.notEqual(mobileIndex, -1);
  assert.ok(mobileIndex > appIndex);
});

test('mobile landscape overrides are scoped to touch landscape devices', function () {
  assert.match(css, /@media\s*\(hover:\s*none\)\s*and\s*\(pointer:\s*coarse\)\s*and\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*680px\)/);
  assert.match(css, /\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*680px\)\s*and\s*\(max-width:\s*1180px\)/);
});

test('mobile landscape layout prioritizes the battlefield', function () {
  assert.match(css, /\.app\s*\{[\s\S]*grid-template-rows:\s*44px minmax\(0,\s*1fr\)/);
  assert.match(css, /\.layout\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.dock\s*\{[\s\S]*display:\s*none/);
  assert.match(css, /\.arena\s*\{[\s\S]*min-height:\s*0/);
});

test('mobile landscape controls stay in lower combat corners', function () {
  assert.match(css, /\.touch-controls\s*\{[\s\S]*display:\s*flex/);
  assert.match(css, /\.touch-dpad\s*\{[\s\S]*left:\s*10px/);
  assert.match(css, /\.touch-actions\s*\{[\s\S]*right:\s*10px/);
  assert.match(css, /\.actions\s*\{[\s\S]*left:\s*8px/);
});

test('mobile landscape dialogs fit low-height screens', function () {
  assert.match(css, /\.brief\s*\{[\s\S]*max-height:\s*calc\(100% - 18px\)/);
  assert.match(css, /\.modal-layer\s*\{[\s\S]*padding:\s*8px/);
  assert.match(css, /\.modal\s*\{[\s\S]*height:\s*calc\(100vh - 16px\)/);
  assert.match(css, /#shopModal\s*\{[\s\S]*grid-template-columns:\s*112px minmax\(0,\s*1fr\)/);
  assert.match(css, /\.armory-tree\s*\{[\s\S]*min-width:\s*680px/);
});
