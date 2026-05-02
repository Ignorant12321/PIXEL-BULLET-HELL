import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const shopJs = readFileSync(new URL('../src/js/ui/shop.js', import.meta.url), 'utf8');

test('mobile controls expose joystick markup instead of four direction buttons', function () {
  assert.match(html, /class="touch-joystick"/);
  assert.match(html, /class="touch-joystick-knob"/);
  assert.doesNotMatch(html, /data-input="up"/);
  assert.doesNotMatch(html, /data-input="left"/);
});

test('mobile info modal and button exist for the compact landscape layout', function () {
  assert.match(html, /id="infoBtn"/);
  assert.match(html, /id="infoModal"/);
  assert.match(html, /id="infoGrid"/);
  assert.match(html, /id="infoBack"/);
});

test('armory tree exposes zoom controls', function () {
  assert.match(shopJs, /data-armory-zoom/);
});

test('ship selection has an initial loading message before modules finish booting', function () {
  assert.match(html, /正在装载舰桥数据/);
});
