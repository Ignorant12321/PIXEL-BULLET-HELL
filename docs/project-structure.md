# 项目结构说明

这份文档说明项目的主要目录、启动链路和模块职责。修改功能前，建议先用它定位应该改哪一层。

## 根目录

```text
Star War/
├─ index.html
├─ package.json
├─ README.md
├─ docs/
├─ src/
└─ test/
```

| 路径 | 作用 |
| --- | --- |
| `index.html` | 页面入口，包含 Canvas、HUD、弹窗和按钮结构 |
| `package.json` | 项目信息、启动命令和测试命令 |
| `README.md` | 项目概览 |
| `docs/` | 使用、开发和系统说明文档 |
| `src/` | 游戏源码 |
| `test/` | Node.js 测试 |

## 启动链路

浏览器加载顺序是：

```text
index.html
  -> src/js/main.js
    -> src/js/data/index.js
    -> src/js/game/game.js
    -> src/js/ui/ui.js
```

`src/js/main.js` 做三件事：

1. 找到页面里的 `canvas#game`
2. 创建游戏实例和 UI 实例
3. 启动游戏，并暴露 `window.pixelStarship`

```js
const game = createGame(canvas, data, { utils });
const ui = createUI(game, data, utils);
window.pixelStarship = { game, ui };
```

## 源码目录

```text
src/
├─ styles/
│  ├─ app.css
│  └─ armory.css
└─ js/
   ├─ core/
   ├─ data/
   ├─ entities/
   ├─ game/
   ├─ render/
   ├─ systems/
   └─ ui/
```

## `src/js/data/`

数据层，负责描述“有什么”。

| 路径 | 作用 |
| --- | --- |
| `data/index.js` | 数据总入口，聚合星舰、敌人、掉落、升级、幕和图鉴 |
| `data/starships/` | 星舰配置 |
| `data/enemies/` | 敌人配置 |
| `data/pickups/` | 掉落物配置 |
| `data/upgrades/` | 商店服务和基础升级配置 |
| `data/armory-routes.js` | 军械库路线、分支、前置和效果 |
| `data/acts/` | 幕、波次和每波难度倍率 |
| `data/icons.js` | 像素图标数据 |
| `data/tabs.js` | 商店和图鉴 tab 配置 |
| `data/storage.js` | 本地存储 key |

大多数新增内容都要在对应目录的 `index.js` 中注册，否则游戏不会读取到它。

## `src/js/game/`

规则层，负责描述“怎么玩、如何结算”。

| 文件 | 作用 |
| --- | --- |
| `game.js` | 游戏主循环、状态编排、开始/暂停/重置/购买等对外接口 |
| `state.js` | 视图状态、阶段文案、Buff 列表 |
| `waves.js` | 根据波次配置生成刷怪队列 |
| `combat.js` | 伤害、射速、射程、武器属性等战斗计算 |
| `targets.js` | 目标搜索和射程判断 |
| `enemy-abilities.js` | 敌人特殊能力 |
| `ship-abilities.js` | 星舰特殊能力解释和事件触发 |
| `economy.js` | 升级价格和服务是否已满 |
| `pickups.js` | 掉落选择 |
| `armory.js` | 军械库状态、解锁、分支互斥和效果汇总 |
| `collections.js` | 活跃对象数组清理 |
| `selectors.js` | 战斗选择器聚合 |

如果只是改数值，优先改 `data/`。如果要改变规则，比如伤害公式、目标选择、军械库互斥逻辑，再改 `game/`。

## `src/js/entities/`

实体工厂层，负责创建游戏对象：

```text
src/js/entities/factory.js
```

这里创建玩家、敌人、子弹、导弹、掉落物和粒子。数据配置会在这里变成运行时对象。

## `src/js/render/`

渲染层：

```text
src/js/render/renderer.js
```

这里负责 Canvas 绘制，包括背景、玩家、敌人、子弹、掉落、基地、特效等。想调整战斗画面表现，优先看这里。

## `src/js/ui/`

DOM UI 层，负责页面上的 HUD、按钮、弹窗、商店、图鉴和星舰选择。

| 文件 | 作用 |
| --- | --- |
| `ui.js` | UI 总入口，绑定 DOM、事件和整体刷新 |
| `hud-view.js` | HUD 读数 |
| `shop.js` | 商店购买和渲染编排 |
| `shop-view.js` | 商店视图辅助函数 |
| `armory-view.js` | 军械库 UI |
| `codex.js` | 图鉴 UI |
| `ship-select-view.js` | 星舰选择 UI |
| `dom.js` | DOM 查询和安全比例工具 |

UI 结构主要在 `index.html`，样式在 `src/styles/app.css` 和 `src/styles/armory.css`。

## `src/js/systems/`

系统层：

| 文件 | 作用 |
| --- | --- |
| `input.js` | 键盘、触屏、按钮输入 |
| `audio.js` | 音频反馈 |

如果要改键位或触屏按钮行为，优先看 `input.js`。

## `test/`

测试按功能拆分：

| 测试 | 覆盖内容 |
| --- | --- |
| `wave-*.test.js` | 波次生成和波次数据约束 |
| `starships.test.js` | 星舰数据 |
| `enemy-*.test.js` | 敌人平衡和特殊能力 |
| `armory-*.test.js` | 军械库数据、逻辑和 UI |
| `shop-*.test.js` | 商店渲染和购买相关逻辑 |
| `hud-view.test.js` | HUD 展示 |
| `runtime-utils.test.js` | 通用工具 |

修改后运行：

```bash
npm test
```

## 推荐定位方式

| 想做的事 | 先看 |
| --- | --- |
| 新增或修改星舰 | `src/js/data/starships/` |
| 新增或修改敌人 | `src/js/data/enemies/` |
| 调整波次 | `docs/wave-system.md` |
| 调整难度倍率 | `src/js/data/acts/<act>/difficulty.js` |
| 修改商店或军械库 | `src/js/data/upgrades/`、`src/js/data/armory-routes.js`、`src/js/game/armory.js` |
| 修改星舰特殊能力 | `src/js/data/starships/`、`src/js/game/ship-abilities.js` |
| 修改战斗公式 | `src/js/game/combat.js` |
| 修改敌人能力 | `src/js/game/enemy-abilities.js` |
| 修改画面绘制 | `src/js/render/renderer.js` |
| 修改界面布局 | `index.html`、`src/styles/`、`src/js/ui/` |
