# 移动端操作与面板优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化横屏移动端操作、图鉴和信息查看体验。

**Architecture:** 在 `input.js` 中新增可测试的摇杆向量/方向状态工具，并用现有触控区域绑定虚拟摇杆。HTML 新增移动信息按钮、信息 modal 和加载文案，`ui.js` 复用当前视图数据渲染只读信息面板。`mobile-landscape.css` 负责摇杆、图鉴居中、信息面板和弹窗期间隐藏触控控件。

**Tech Stack:** 静态 HTML、CSS media queries、ES Modules、Node.js `node:test`。

---

### Task 1: 摇杆输入工具

**Files:**
- Create: `test/input-joystick.test.js`
- Modify: `src/js/systems/input.js`

- [ ] **Step 1: Write failing tests**

Test `joystickVectorFromPoint` clamps drag distance and `joystickDirections` maps vectors to key states with a deadzone.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/input-joystick.test.js`

Expected: FAIL because the exports do not exist.

- [ ] **Step 3: Implement joystick helpers and bind `.touch-joystick`**

Add named exports in `src/js/systems/input.js` and bind pointer events on `.touch-joystick` to update `keys.left/right/up/down`.

- [ ] **Step 4: Verify**

Run: `node --test test/input-joystick.test.js`

Expected: PASS.

### Task 2: 移动信息面板和加载文案

**Files:**
- Create: `test/mobile-ui-structure.test.js`
- Modify: `index.html`
- Modify: `src/js/ui/ui.js`

- [ ] **Step 1: Write failing structure test**

Check that `infoBtn`, `infoModal`, `infoGrid`, and initial loading text exist in `index.html`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/mobile-ui-structure.test.js`

Expected: FAIL before HTML changes.

- [ ] **Step 3: Add HTML and UI wiring**

Add the info button to `.actions`, add info modal inside `#modalLayer`, and teach `ui.js` to open/close/render `info`.

- [ ] **Step 4: Verify**

Run: `node --test test/mobile-ui-structure.test.js`

Expected: PASS.

### Task 3: 移动端样式修正

**Files:**
- Modify: `test/mobile-landscape-style.test.js`
- Modify: `src/styles/mobile-landscape.css`

- [ ] **Step 1: Extend failing CSS assertions**

Assert joystick classes, controls hidden while modal/brief is visible, `.modal.codex` centered width, and `.modal.info`/`.mobile-info-grid` rules exist.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/mobile-landscape-style.test.js`

Expected: FAIL before CSS updates.

- [ ] **Step 3: Implement CSS**

Style joystick, hide controls during overlays, center codex, and lay out info panel compactly.

- [ ] **Step 4: Verify related tests and full test suite**

Run:

```bash
node --test test/input-joystick.test.js test/mobile-ui-structure.test.js test/mobile-landscape-style.test.js
npm test
```

Expected: related tests pass. `npm test` may still report the existing wave count failure if `src/js/data/acts/act-01/waves/wave-01.js` remains edited.

### Task 4: Manual viewport check and commit

**Files:**
- No additional files expected.

- [ ] **Step 1: Start static server**

Run: `python -m http.server 8011`

- [ ] **Step 2: Inspect landscape viewports**

Check `812x375` and `1024x600`: joystick is lower-left, controls hide under modals, codex is centered, info panel opens, and initial loading text is replaced after boot.

- [ ] **Step 3: Commit**

Commit only files touched for this feature, excluding the existing wave edit.
