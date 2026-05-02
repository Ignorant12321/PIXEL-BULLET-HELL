# 移动端横屏适配 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为横屏触屏设备新增战斗优先的移动端布局。

**Architecture:** 新增 `src/styles/mobile-landscape.css` 作为唯一移动端横屏覆盖层，并在 `index.html` 中于 `app.css` 之后加载。新增一个 Node 测试锁定样式文件接入、媒体查询边界和关键选择器，避免未来误删。

**Tech Stack:** 静态 HTML、CSS media queries、Node.js `node:test`。

---

### Task 1: 接入移动端横屏样式文件

**Files:**
- Create: `test/mobile-landscape-style.test.js`
- Modify: `index.html`
- Create: `src/styles/mobile-landscape.css`

- [ ] **Step 1: 写失败测试**

```js
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
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test test/mobile-landscape-style.test.js`

Expected: FAIL because `src/styles/mobile-landscape.css` does not exist yet.

- [ ] **Step 3: 加载专用 CSS 文件并创建空文件**

Add this line after the existing `app.css` link in `index.html`:

```html
  <link rel="stylesheet" href="./src/styles/mobile-landscape.css" />
```

Create `src/styles/mobile-landscape.css` with the scoped media query.

- [ ] **Step 4: 运行测试确认通过**

Run: `node --test test/mobile-landscape-style.test.js`

Expected: PASS.

### Task 2: 实现战斗优先布局覆盖

**Files:**
- Modify: `test/mobile-landscape-style.test.js`
- Modify: `src/styles/mobile-landscape.css`

- [ ] **Step 1: 扩展测试覆盖关键布局规则**

Add assertions that the CSS contains `.dock { display: none; }`, `.layout { grid-template-columns: minmax(0, 1fr); }`, `.touch-controls { display: flex; }`, `.brief`, `.modal`, and `.armory-tree` overrides inside the mobile-landscape stylesheet.

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test test/mobile-landscape-style.test.js`

Expected: FAIL because the layout rules are not implemented yet.

- [ ] **Step 3: 编写移动端横屏 CSS**

Implement:

- compact app top row and full arena
- hidden dock
- compact stats and action buttons
- fixed lower-corner touch controls
- low-height brief/modal/shop/codex/armory rules

- [ ] **Step 4: 运行样式测试和全量测试**

Run: `node --test test/mobile-landscape-style.test.js`

Expected: PASS.

Run: `npm test`

Expected: all tests pass.

### Task 3: 手动运行检查

**Files:**
- No source changes expected.

- [ ] **Step 1: 启动静态服务**

Run: `npm run serve`

Expected: server listens on `http://localhost:8000/`.

- [ ] **Step 2: 检查横屏尺寸**

Manually inspect `812x375` and `1024x600` landscape viewports. Verify canvas dominates the screen, dock is hidden, HUD remains readable, touch controls sit in lower corners, and dialogs fit within the viewport.

- [ ] **Step 3: 最终提交**

Run:

```bash
git add index.html src/styles/mobile-landscape.css test/mobile-landscape-style.test.js docs/superpowers/plans/2026-05-02-mobile-landscape.md
git commit -m "feat: adapt landscape mobile layout"
```
