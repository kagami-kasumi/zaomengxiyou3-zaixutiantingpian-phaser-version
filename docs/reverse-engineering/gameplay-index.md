# 玩法设定索引

本文是第一轮“扒游戏设定”的总览，重点记录玩法结构、流程和后续需要继续深挖的系统。AS3 源码只作为行为参考，不照搬代码结构。

## 已读参考

- `GMain.as`
- `my/MainGame.as`
- `my/KeyBoardControl.as`
- `base/BaseHero.as`
- `export/hero/Role1.as` 至 `Role5.as` 的输入入口
- `export/GameMenu.as`
- `export/SelectRole.as`
- `user/User.as`

## 游戏类型

原版是横版 2D 动作 RPG：

- 支持单人和本地双人。
- 角色有移动、跑步、跳跃、下落、普攻、技能、无双/特殊、法宝。
- 关卡由地图、墙体/平台、传送门、停止点、刷怪点和 `StageListener*` 驱动。
- 战斗核心由角色、怪物、子弹/技能飞行物、碰撞、伤害、受击、死亡组成。
- 长期循环包含装备、背包、掉落、合成、等级、技能、宠物、法宝、存档。

## 主流程

入口链路：

1. `GMain` 初始化加载器、全局 `Config`、`PhysicsWorld` 和显示层。
2. 资源加载完成后进入 `GameMenu`。
3. `GameMenu` 可新游戏、读档、帮助、关于、退出等。
4. 新游戏后选择单人或双人：
   - `simpleGame`：`gc.playNum = 1`。
   - `doubleGame`：`gc.playNum = 2`。
5. 进入 `SelectRole`。
6. 单人选择一个角色；双人依次选择玩家 1 和玩家 2。
7. 选择完成后进入开场动画或地图选择。
8. 地图选择后 `switchSence("startFighting")`。
9. `MainGame.GameStart()` 按 `curStage/curLevel` 加载资源并创建战斗场景。
10. `PhysicsWorld` 和 `StageListener` 驱动关卡和战斗循环。

### 第一世界天庭地图

- `export.SelectPLace` 是第一世界 940×590 天庭地图，运行时叠加 `export.MapMenu`；详细资源、坐标和状态合同见 `heaven-map-index.md`。
- 新档最高进度为 1-1。锁定节点仍可见但不注册事件；当前最高节点停在 frame 2，悬停进入 frame 3，点击从 `s<章>_<关>` 名称解析目标。
- Stage 1 三节点原名为“九重天 / 天宫路 / 南天门”。只在通关当前最高节点时单调推进，依次解锁 1-2、1-3、2-1；失败不推进。
- 胜利保存后、失败返回时均回同一世界地图。现代 Stage 2-1 内容尚未实现，只能显示已解锁边界和明确反馈，不能进入伪关卡。

## 单人/双人规则

来自 `GameMenu.as` 和 `SelectRole.as`：

- 单人模式只创建玩家 1 的角色。
- 双人模式会创建玩家 1 和玩家 2 的角色。
- `User.controlPlayer` 决定控制位，而不完全等同于 `hero1/hero2` 字段名。
- 创建角色时 `Config.createHero()` 根据 `player1.roleid`、`player2.roleid` 实例化 `Role*`。

现代版要求：

- 设计时必须从一开始保留 `PlayerSlot` 概念。
- 即使第一阶段只实现单人，也不能把方向键给玩家 1，因为它属于玩家 2。
- 后续 UI、输入、存档都要能表达玩家 1 和玩家 2。

## 角色选择

已确认：

- 原版至少有 `Role1` 至 `Role5` 五个角色。
- `Role1.roleName = "悟空"`，`userType = "悟空"`。
- 其他角色中文名待继续从构造函数确认。

后续要补：

- 五个角色的中文名。
- 默认技能。
- 普攻连段。
- 特殊机制。
- 资源前缀和动画资源。

## 通用战斗操作

详见 `docs/reverse-engineering/controls-index.md`。

关键行为：

- 左右移动。
- 500ms 内同方向二次按下进入跑步。
- 跳跃支持二段跳，`jumpCount` 记录 0/1/2。
- 下 + 跳跃可从可穿透平台下落。
- 上可触发传送门、关卡监听、通关流程。
- 普攻由每个角色的 `normalHit()` 实现，多数角色有连段。
- 技能键只是槽位输入，实际技能由玩家技能绑定决定。

## 角色输入模式

`BaseHero.executeKeyCode()` 每帧调用 `myKeyDown(keyarray.join(""))`。

`keyarray` 四位含义：

```text
[下, 普攻, 跳跃, 上]
```

多数角色共享这些基础组合：

- `0100` / `1100`：普攻。
- `0010`：跳跃。
- `1010`：下落。
- `0001`：进门/交互/通关。

部分角色扩展：

- `0101`：普攻 + 上。Role1、Role2、Role3、Role5 等存在角色特化逻辑。

现代版建议：

- 不直接用 `"0100"` 这种字符串作为正式状态。
- 可以在逆向笔记中保留原始组合码，但现代代码应转成结构化 input intent。

## 关卡与通关

已确认：

- 地图场景类名形如 `export.gameSence.sl{curStage}{curLevel}`。
- 关卡监听类名形如 `export.level.StageListener{curStage}{curLevel}`。
- `BaseGameSence` 构造时扫描 Flash 子对象标记，交给 `PhysicsWorld.addSubObj()` 建索引。
- `W/↑` 在传送门附近会触发 `keyBoardDownForW(hero)`。
- 若满足通关条件，会派发 `LevelVictor` 并调用 `MainGame.levelClear()`。

后续要补：

- `StageListener*.init()` 如何开始刷怪和调用 `pWorldStart()`。
- 每关通关条件。
- 停止点、刷怪点、传送门、可穿透平台的地图数据来源。

## 战斗对象

核心数组在 `PhysicsWorld`：

- `heroArray`
- `monsterArray`
- `likeMonsterArray`
- `otherHeroArray`
- `wallArray`
- `auraArray`

原版把子弹挂在各实体的 `magicBulletArray` 上。现代版不建议照搬，建议由统一 `ProjectileSystem` 管理。

## 成长与长期系统

本轮只确认存在这些系统，尚未深挖：

- 装备：`my/AllEquipment.as` 和装备表。
- 背包：`User` 中存在装备/道具/技能书等列表。
- 技能：`Config.allSklName`、`needMMP`、`User.returnSkillNameBySkillKey()`。
- 宠物：`BasePet`、`findCurrentPet()` 等。
- 法宝：`export/magicWeapon/`。
- 存档：`save-slots-index.md` 已闭合 `MemoryClass`、`SaveInter`、`User.saveObj`、六槽与启动/地图路由合同。
- 多人：`com.multi4399.Client` 相关逻辑，但现代版早期不迁移。

## 现代实现重排建议

不要继续从“最小战斗切片”直接开始。更稳的路线：

1. 玩法逆向：
   - controls、流程、角色、关卡、战斗、成长、UI、存档。
2. 资源索引：
   - 角色、怪物、地图、UI、音效的可用资源。
3. 现代架构修正：
   - 输入支持双玩家。
   - 场景和运行时按系统拆分。
4. 再做纵向切片：
   - 先用一个角色、一个怪物、一个地图验证。
   - 但保留双人输入和本地双人的结构。

## 待办清单

- 深挖 `KeyBoardControl + BaseHero + Role*.as`，完成每个角色的普通攻击和组合键表。
- 深挖 `User.returnSkillNameBySkillKey()` 和技能绑定 UI。
- 深挖 `StageListener01` 或第一个简单关卡，确认刷怪与通关。
- 深挖 `BaseMonster` 和一个最简单 `Monster*`。
- 深挖 `AllEquipment` 和装备表。
- 存档行为链已转入 `save-slots-index.md`；原版 `.sav` 二进制样本仍只在需要验证加密/压缩兼容时再深挖，现代多槽不复刻该格式。
