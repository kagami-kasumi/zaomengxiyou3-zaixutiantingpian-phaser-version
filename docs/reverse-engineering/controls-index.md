# 操作设定索引

本文记录原版键盘控制的第一轮逆向结果。结论来自：

- `extracted_flash/scripts/172845/scripts/my/KeyBoardControl.as`
- `extracted_flash/scripts/172845/scripts/base/BaseHero.as`
- `extracted_flash/scripts/172845/scripts/export/hero/Role1.as` 至 `Role5.as`

## 总结论

原版支持单人和本地双人。方向键属于玩家 2，不应给玩家 1 使用。

现代版输入系统必须从一开始支持两个控制位：

- 玩家 1：键盘左侧和字母区。
- 玩家 2：方向键和小键盘区。

当前 `src/systems/InputSystem.ts` 只是阶段 1 的技术验证，不代表正式键位设计。后续实现双人前必须改为双玩家输入。

## 玩家控制位

`User.init(controlPlayer)` 设置控制位：

- `controlPlayer == 0`：玩家 1。
- `controlPlayer == 1`：玩家 2。

角色选择逻辑见 `SelectRole.as`：

- 单人模式：只设置 `player1.roleid`，`player2.roleid = 0`。
- 双人模式：先选玩家 1，再选玩家 2。

## 基础移动键

来自 `KeyBoardControl.as`：

| 行为 | 玩家 1 | keyCode | 玩家 2 | keyCode |
| --- | --- | ---: | --- | ---: |
| 左移 | A | 65 | ← | 37 |
| 右移 | D | 68 | → | 39 |
| 下/落下 | S | 83 | ↓ | 40 |
| 普攻 | J | 74 | 小键盘 1 | 97 |
| 跳跃 | K | 75 | 小键盘 2 | 98 |
| 上/进门/交互 | W | 87 | ↑ | 38 |

`BaseHero` 将这四个动作写入 `keyarray`：

```text
keyarray[0] = 下/落下
keyarray[1] = 普攻
keyarray[2] = 跳跃
keyarray[3] = 上/进门/交互
```

角色类里常见组合：

- `0100`：普攻。
- `1100`：下 + 普攻，仍会触发普攻或角色特化攻击。
- `0010`：跳跃。
- `1010`：下 + 跳跃，从可穿透平台下落。
- `0001`：上/进门/交互，常用于传送门、通关触发、关卡监听。
- `0101`：普攻 + 上，部分角色会触发特化技能。

## 跑步

`BaseHero.addDoubleCount()` 判断同方向键 500ms 内二次按下：

- 双击左或右进入跑步。
- `doubleCount == 1` 时 `isRunning()` 为真。
- 松开方向键会清空 `doubleCount`。

现代版建议：

- 输入层只记录方向键按下、抬起和时间。
- 移动状态机决定 walk/run。
- 不要把跑步判断散落在实体类和输入类之间。

## 技能键

技能键由 `KeyBoardControl.sendSkill(index)` 转给角色，实际技能由角色的 `showSkill()` 根据玩家技能绑定解析。

| 技能槽 | 玩家 1 | keyCode | 玩家 2 | keyCode |
| --- | --- | ---: | --- | ---: |
| 技能 0 | Y | 89 | 小键盘 8 | 104 |
| 技能 1 | L | 76 | 小键盘 3 | 99 |
| 技能 2 | U | 85 | 小键盘 4 | 100 |
| 技能 3 | I | 73 | 小键盘 5 | 101 |
| 技能 4 | O | 79 | 小键盘 6 | 102 |
| 无双/特殊 | Space | 32 | 小键盘 0 | 96 |
| 法宝 | H | 72 | 小键盘 7 | 103 |

`BaseHero.sendSkill(index)` 的显示键名映射：

- 玩家 1：`Y/L/U/I/O`。
- 玩家 2：`8/3/4/5/6`。
- index 5：`showSkillKongGe()`，玩家 1 是 Space，玩家 2 是小键盘 0。
- index 6：`showSkillFaBao()`，玩家 1 是 H，玩家 2 是小键盘 7。

## UI 快捷键

玩家 1：

| 功能 | 键 |
| --- | --- |
| 背包 | C |
| 技能/学习 | V |
| 宠物 | B |
| 副本/相关界面 | N |
| 设置 | Esc |

玩家 2：

| 功能 | 键 |
| --- | --- |
| 背包 | 小键盘 / |
| 技能/学习 | 小键盘 * |
| 宠物 | 小键盘 - |

额外：

- `Q`：玩家 1 可在特定 `StageListener01` 中触发 `checkRwOrPk()`。

## 输入焦点规则

`KeyBoardControl` 有两个重要过滤：

- 如果焦点在 `TextField`，忽略按键。
- 如果 `gc.stage.focus != gc.stage`，忽略战斗输入。

现代版要保留这个行为含义：

- 输入框聚焦时不控制角色。
- UI 打开时可以按系统暂停或屏蔽对应玩家输入。

## 现代实现建议

不要把玩家 1 和玩家 2 混成一套输入。建议建模为：

```ts
type PlayerSlot = 'p1' | 'p2';

type PlayerInputState = {
  slot: PlayerSlot;
  moveX: -1 | 0 | 1;
  down: boolean;
  up: boolean;
  attack: boolean;
  jump: boolean;
  skillSlots: boolean[];
  special: boolean;
  magicWeapon: boolean;
};
```

正式输入系统建议拆成：

- `InputBindings`：原版键位表。
- `InputSystem`：从 Phaser 键盘读取两个玩家的 input state。
- `HeroController`：把 input state 转成移动、跳跃、普攻、技能意图。
- `HeroStateMachine`：根据当前动作、受击、硬直、落地等决定能否执行。

## 待继续确认

- 每个角色 `0101` 等组合键的具体特化逻辑。
- 每个角色五个技能槽默认绑定哪些技能。
- `GameInfo` 上按钮和快捷键的 UI 映射细节。
- 小键盘在浏览器中 NumLock、不同键盘布局下的兼容策略。
