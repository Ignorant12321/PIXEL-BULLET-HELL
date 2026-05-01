import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function cssBlock(css, selector) {
  const start = css.indexOf(selector + ' {');
  assert.notEqual(start, -1, selector + ' block exists');
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

test('armory tree can scroll when nodes extend below the visible area', function () {
  const css = readFileSync(new URL('../src/styles/armory.css', import.meta.url), 'utf8');
  const tree = cssBlock(css, '.armory-tree');
  const canvas = cssBlock(css, '.armory-tree-canvas');

  assert.doesNotMatch(tree, /overflow:\s*hidden/);
  assert.match(tree, /overflow-y:\s*auto/);
  assert.match(canvas, /min-width:\s*720px/);
  assert.match(canvas, /min-height:\s*760px/);
  assert.match(canvas, /margin:\s*0\s+96px\s+120px/);
});

test('armory tree exposes positioning controls for fast navigation', function () {
  const css = readFileSync(new URL('../src/styles/armory.css', import.meta.url), 'utf8');
  const nav = cssBlock(css, '.armory-tree-nav');
  const button = cssBlock(css, '.armory-tree-nav button');

  assert.match(nav, /position:\s*sticky/);
  assert.match(nav, /bottom:\s*10px/);
  assert.match(button, /width:\s*28px/);
});

test('armory route tabs use the same compact pixel command style as the game UI', function () {
  const css = readFileSync(new URL('../src/styles/armory.css', import.meta.url), 'utf8');
  const tab = cssBlock(css, '.armory-route-tab');
  const active = cssBlock(css, '.armory-route-tab.active');

  assert.match(tab, /height:\s*32px/);
  assert.match(tab, /box-shadow:\s*inset 0 -2px 0/);
  assert.match(active, /background:\s*var\(--cyan\)/);
});

test('armory node action reads as an inset chip instead of a large footer', function () {
  const css = readFileSync(new URL('../src/styles/armory.css', import.meta.url), 'utf8');
  const action = cssBlock(css, '.armory-node-action');
  const price = cssBlock(css, '.armory-node-price');

  assert.match(action, /background:\s*rgba\(3,\s*8,\s*20,\s*0\.72\)/);
  assert.match(action, /border:\s*1px solid rgba\(86,\s*246,\s*255,\s*0\.16\)/);
  assert.match(price, /color:\s*var\(--yellow\)/);
});
