# 开发流程建议

这份文档说明修改项目时的推荐工作流。它不是强制规则，但按这个顺序做，比较不容易把数据、逻辑和 UI 改散。

## 每次修改前

先确定这次改动属于哪一类：

| 类型 | 优先修改 |
| --- | --- |
| 数值调整 | `src/js/data/` |
| 新增内容 | `src/js/data/` 加对应注册文件 |
| 战斗规则 | `src/js/game/` |
| 画面表现 | `src/js/render/renderer.js` |
| 界面交互 | `index.html`、`src/js/ui/`、`src/styles/` |
| 波次节奏 | `src/js/data/acts/` 和 `docs/wave-system.md` |
| 星舰特殊能力 | `src/js/data/starships/` 和 `src/js/game/ship-abilities.js` |

如果一个改动能通过数据完成，就先不要改规则代码。

## 推荐开发循环

1. 阅读相关文档和附近代码
2. 找到最小修改点
3. 修改数据或代码
4. 浏览器试玩
5. 在控制台查看 `window.pixelStarship.game.view()`
6. 运行测试
7. 整理文档或 README 中需要同步的说明

测试命令：

```bash
npm test
```

启动命令：

```bash
npm run serve
```

## 调数据的流程

适合：星舰、敌人、掉落、升级、军械库、难度倍率。

推荐顺序：

1. 只改一小组字段
2. 试玩相关波次
3. 看金币、血量、击杀速度是否符合预期
4. 再决定是否继续提高或降低数值
5. 运行测试

不要一次同时改生命、速度、奖励、波次数量和伤害。这样很难判断是哪一个变量造成了体验变化。

星舰特殊能力优先写成 `abilities` 数据，再由 `src/js/game/ship-abilities.js` 解释。这样新增星舰时不需要把能力判断散落到主循环里。

## 调波次的流程

先读：

```text
docs/wave-system.md
```

推荐顺序：

1. 先改 `interval` 或 `delay`
2. 再改敌人 `count`
3. 再改危险敌人的 `weight`
4. 最后才改敌人基础属性或难度倍率

波次修改后重点跑：

```bash
npm test
```

相关测试：

```text
test/wave-spawn.test.js
test/wave-data.test.js
```

## 改规则的流程

适合：伤害公式、武器行为、敌人能力、目标选择、掉落选择。

推荐顺序：

1. 先找现有测试是否覆盖这个模块
2. 如果改的是可独立计算的逻辑，优先补测试
3. 修改规则代码
4. 确认 UI 和渲染是否需要同步
5. 试玩至少一个普通波、一个精英波、一个 Boss 波
6. 运行完整测试

常见入口：

```text
src/js/game/combat.js
src/js/game/enemy-abilities.js
src/js/game/targets.js
src/js/game/pickups.js
src/js/entities/factory.js
```

## 改 UI 的流程

适合：HUD、商店、军械库、图鉴、星舰选择、按钮。

推荐顺序：

1. 在 `index.html` 找到对应结构
2. 在 `src/js/ui/ui.js` 找 DOM 引用和更新入口
3. 如果是独立面板，优先改对应 view 文件
4. 修改 `src/styles/app.css` 或 `src/styles/armory.css`
5. 用浏览器检查桌面和窄屏尺寸
6. 运行相关测试和完整测试

相关测试示例：

```text
test/shop-render.test.js
test/armory-ui.test.js
test/hud-view.test.js
test/ship-select-view.test.js
```

## 使用浏览器控制台调试

游戏运行后可以在控制台使用：

```js
window.pixelStarship.game.view()
```

它适合检查：

- 当前阶段
- 当前波次
- 玩家生命和基地生命
- 金币、分数、击杀数
- 已解锁内容
- 当前武器
- Buff 和道具状态

也可以临时保存引用：

```js
const ps = window.pixelStarship;
ps.game.view();
```

调试结束后，不要把临时代码写进正式文件。

## 测试策略

完整测试：

```bash
npm test
```

如果只想先跑某一个测试文件，可以用：

```bash
node --test test/wave-data.test.js
```

项目测试使用 Node.js 内置 test runner，不需要额外测试框架。

## 常见坑

### 新文件写了但游戏没读到

通常是忘了在对应 `index.js` 里注册。

### 新 ID 在波次里无效

检查 `src/js/data/enemies/index.js` 中的对象 key。波次里使用的是这个 key，不一定等于文件名。

### 军械库效果买了但没变化

检查 `armory-routes.js` 的 `effects` 字段是否被 `src/js/game/combat.js` 或其他逻辑读取。

### 改了 UI 但按钮没反应

检查三处：

```text
index.html
src/js/ui/ui.js
src/js/systems/input.js
```

### 改了 CSS 但布局错位

先确认是否还有另一个样式文件影响它：

```text
src/styles/app.css
src/styles/armory.css
```

## 提交前检查清单

- 新增数据已经注册到对应 `index.js`
- 浏览器能正常启动
- 关键玩法路径试玩过
- `npm test` 通过
- 文档里的路径仍然正确
- README 或 `docs/` 中的说明已同步
