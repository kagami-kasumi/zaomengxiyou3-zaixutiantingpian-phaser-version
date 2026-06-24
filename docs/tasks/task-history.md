# 游戏任务历史

本文记录已完成的游戏复现任务和执行记录。新对话默认不读取本文。

只有以下情况需要读取：

- 用户要求回看历史任务。
- 当前任务要修改以前完成的内容。
- 需要确认某个任务为什么完成或当时做了什么。
- 当前任务的依赖或冲突需要追溯历史决策。

## 已完成任务

| Task | 类型 | 目标 | 目标机制/切片 | 产物 |
| --- | --- | --- | --- | --- |
| TASK-SLICE-103 | 切片 | Role4 `qlj/tkj/dzj` 双形态位移攻击 | VS-040、M-021、M-025、M-034 | `Role4MobilitySkillSystem.ts`、九类占位 projectile、位移/重力接线、独立测试 |
| TASK-SLICE-102 | 切片 | Role4 `mbyj` 八跳毒链控制 | VS-040、M-021、M-025、M-034 | `Role4PoisonChainSystem.ts`、Role4 眩晕/毒层接线、状态 projectile、独立测试 |
| TASK-SLICE-101 | 切片 | Role4 `wdww` 巫毒娃娃伤害转移 | VS-040、M-021、M-025 | `Role4VoodooDollSystem.ts`、娃娃伤害桥接、占位 projectile、独立测试 |
| TASK-SLICE-100 | 切片 | Role4 `zq/jdz/mds` 毒系基础闭环 | VS-040、M-021、M-025、M-034 | `Role4PoisonSkillSystem.ts`、Role4 场景桥接、占位 projectile、独立测试 |
| TASK-SETTINGS-039 | 逆向 | Role4 沙僧完整战斗逆向 | M-021、M-024、M-025、M-034 | `role4-combat-index.md`、角色/输入/projectile/机制索引 |
| TASK-SLICE-089 | 切片 | Role2 `shy` 分身协同与召回 | M-019、M-025、M-034、VS-037 | `Role2ShadowSkillSystem.ts`、Role2 运行时/场景桥接、四技能协同、双玩家隔离测试、状态文档 |
| TASK-SLICE-088 | 切片 | Role2 `jhsj -> hit9` 双窗口多段 | M-019、M-025、M-034、VS-037 | `Role2JhsjSkillSystem.ts`、两类占位 projectile、移动/重力锁、系统测试、状态文档 |
| TASK-SLICE-087 | 切片 | Role2 `jgz -> hit7` 拉拽与增伤 | M-019、M-025、M-034、VS-037 | `Role2ControlSkillSystem.ts`、拉拽/浮空/恢复、一次性增伤、系统测试、状态文档 |
| TASK-SLICE-086 | 切片 | Role2 `myhc/tjgl` 治疗与护盾 | M-019、M-025、M-034、VS-037 | `Role2SupportSkillSystem.ts`、玩家/宠物治疗、GXP、护盾、系统测试、状态文档 |
| TASK-SLICE-085 | 切片 | Role2 `blb/sjt` 蓄力与被动 | M-019、M-024、M-025、VS-037 | `Role2PassiveSkillSystem.ts`、普攻蓄力接线、全伤害倍率、系统测试、状态文档 |
| TASK-SLICE-084 | 切片 | Role2 `xbz -> hit3` 固定范围魔法 | M-019、M-025、VS-037 | `Role2XbzSkillSystem.ts`、技能槽/MP/伤害接线、占位 projectile、`role2-xbz-tests.ts`、状态文档 |
| TASK-SLICE-083 | 切片 | 双玩家宠物存档 V2 与 V1 迁移 | M-042、M-044、VS-011、VS-012 | `SaveSystem.ts` V2、V1 迁移、双 roster 恢复、`dual-player-pet-save-tests.ts`、状态文档 |
| TASK-SLICE-082 | 切片 | P2 宠物道具与宣花葫芦捕捉所有权 | M-016、M-037、M-042、M-043、VS-012 | `PlayerInventoryOwnershipSystem.ts`、owner 背包/捕捉桥接、双捕捉特效、`pet-item-ownership-tests.ts`、状态文档 |
| TASK-SLICE-081 | 切片 | P2 宠物战斗与普通击杀经验归属 | M-032、M-040、M-042、VS-012 | `PetBattleOwnershipSystem.ts`、共享 owner 调度、战斗/世界桥接、`pet-battle-ownership-tests.ts`、状态文档 |
| TASK-SLICE-080 | 切片 | P2 独立宠物 roster、面板与跟随实体 | M-016、M-042、VS-012 | `PetOwnershipSystem.ts`、`TestScenePetPanelBridge.ts`、`TestSceneP2PetBridge.ts`、`pet-ownership-tests.ts`、状态文档 |
| TASK-SETTINGS-035 | 逆向 | P2 宠物完整链路逆向 | M-016、M-042、M-044 | `pets-index.md`、`mechanics-index.md`、`task-board.md` |
| TASK-SLICE-079 | 切片 | 宠物成长洗练道具闭环 | M-042、VS-012 | `PetGrowthSystem.ts`、`PetConsumableSystem.ts`、`PetTypes.ts`、`PetPanelSystem.ts`、`InventorySystem.ts`、`EquipmentSystem.ts`、`TestSceneUIHandlers.ts`、`pet-growth-tests.ts`、状态文档 |
| TASK-SETTINGS-034 | 逆向 | 宠物剩余成长洗练机制逆向 | M-042 | `pets-index.md`、`mechanics-index.md`、`task-board.md` |
| TASK-SLICE-077 | 切片 | 存档最小闭环 | M-044、VS-011 | `SaveSystem.ts`、`TestSceneSaveBridge.ts`、`TestSceneUpdatePipeline.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`pets-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-078 | 切片 | 宠物专属技能链完成度整改 | M-042、M-032、VS-036 | `PetSkillPrioritySystem.ts`、`PetTigerSkillSystem.ts`、`PetPhoenixSkillSystem.ts`、`PetRabbitSkillSystem.ts`、`PetMouseSkillSystem.ts`、`Monster30System.ts`、`ProjectileSystem.ts`、`TestSceneAdvancedPetSkillBridge.ts`、`TestScenePetMagicBridge.ts`、`system-tests.ts` |
| TASK-SLICE-076 | 切片 | 宠物 tigress/bhaoyi+phoenix/rabbit/mouse 全部技能链 | M-042、M-032、VS-036 | `PetTigerSkillSystem.ts`、`PetPhoenixSkillSystem.ts`、`PetRabbitSkillSystem.ts`、`PetMouseSkillSystem.ts`、`PetSystem.ts`、`PetRosterSystem.ts`、`PetSkillStateSystem.ts`、`PetSkillTickSystem.ts`、`PetTypes.ts`、`PetTuning.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScenePetMagicBridge.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-075 | 切片 | 宠物 tigress1-3/hy+sxhz+hsqj 虎系前三段 | M-042、M-032、VS-036 | `PetTigerSkillSystem.ts`、`PetSystem.ts`、`PetRosterSystem.ts`、`PetSkillStateSystem.ts`、`PetSkillTickSystem.ts`、`PetTypes.ts`、`PetTuning.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScenePetMagicBridge.ts`、`system-tests.ts` |
| TASK-SLICE-072 | 切片 | 宠物 `ufo3/kmsk` 狂魔闪空技能最小闭环 | M-042、M-032、VS-036 | `PetUfoSkillSystem.ts`、`PetUfoProjectileSystem.ts`、`PetSystem.ts`、`PetRosterSystem.ts`、`PetSkillStateSystem.ts`、`PetSkillTickSystem.ts`、`PetTypes.ts`、`PetTuning.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScenePetMagicBridge.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-071 | 切片 | 宠物 `ufo2/ss` 瞬闪技能最小闭环 | M-042、M-032、VS-036 | `PetUfoSkillSystem.ts`、`PetSystem.ts`、`PetRosterSystem.ts`、`PetSkillStateSystem.ts`、`PetSkillTickSystem.ts`、`PetTypes.ts`、`PetTuning.ts`、`TestScenePetMagicBridge.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-070 | 切片 | 宠物 `ufo1/pms` 魔破杀技能最小闭环 | M-042、M-032、VS-036 | `PetUfoSkillSystem.ts`、`PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScenePetMagicBridge.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-033 | 逆向 | 剩余宠物物种（虎/凤凰/兔/鼠）专属技能链逆向 | M-042、VS-036 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-001 | 逆向 | AS3 入口和运行时索引 | 主流程、世界主循环、BaseObject | `runtime-index.md` |
| TASK-002 | 工程 | Phaser + TypeScript 技术脚手架 | VS-000 | `package.json`、`src/`、`modern-architecture.md` |
| TASK-SETTINGS-001 | 逆向 | 操作和玩法总览 | 双人、键位、keyarray、主流程 | `controls-index.md`、`gameplay-index.md` |
| TASK-ARCH-001 | 架构 | 双玩家输入系统修正 | VS-001、M-008、M-009 | `InputSystem.ts`、`TestScene.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-002 | 逆向 | 五个角色动作和技能索引 | VS-002、M-017、M-023、M-024、M-025 | `roles-index.md` |
| TASK-SETTINGS-002A | 逆向 | 五个角色基础身份和输入入口索引 | VS-002、M-017、M-024 | `roles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-002B | 逆向 | 五个角色普攻连段索引 | VS-002、M-023 | `roles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-002C | 逆向 | 五个角色技能槽和技能效果索引 | VS-002、M-015、M-025 | `roles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-003 | 逆向 | 第一个关卡和刷怪流程索引 | VS-007、M-014、M-026、M-027、M-028 | `levels-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-004A | 逆向 | `BaseMonster` 基础索引 | VS-005、M-030 | `monsters-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-004B | 逆向 | 扫描怪物候选并选简单怪物 | VS-005、M-030、M-031 | `monsters-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-004C | 逆向 | `Monster30` 详细索引 | VS-005、M-031、M-032 | `monsters-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-004 | 逆向 | 怪物基础索引 | VS-005、M-030、M-031 | `monsters-index.md` |
| TASK-SLICE-002 | 切片 | 第一只怪物受击死亡切片 | VS-005、M-030、M-031、M-032 | `Monster30System.ts`、`TestScene.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-005 | 逆向 | 五角色普攻特效资源索引 | VS-004、M-023、M-035、M-047 | `attack-effects-index.md`、`roles-index.md`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-ARCH-002 | 架构 | 资源索引和加载策略 | M-035 | `assets-index.md`、`AssetManifest.ts`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-ARCH-003 | 架构 | TestScene 视图工厂拆分 | M-004、VS-000 | `TestScene.ts`、`TestSceneViews.ts`、`vertical-slices.md`、`task-board.md` |
| TASK-ARCH-004 | 架构 | TestScene update 调度层拆分 | M-004、M-029、VS-000 | `TestScene.ts`、`TestSceneUpdatePipeline.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-ARCH-005 | 架构 | 薄 GameContext 与首批运行时查询接口 | M-004、M-029、M-030、VS-000 | `GameContext.ts`、`TestScene.ts`、`glossary.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-ARCH-006 | 架构 | TestScene 首批碰撞/命中桥接拆分 | M-029、M-030、M-032、M-033、VS-006 | `TestScene.ts`、`TestSceneCombatBridge.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-ARCH-007 | 架构 | TestScene 调试键桥接拆分 | M-016、M-029、VS-000 | `TestScene.ts`、`TestSceneDebugKeys.ts`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-006 | 逆向 | 首个角色移动细节索引 | VS-003、M-011、M-012、M-013 | `movement-index.md`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-SLICE-003 | 切片 | 第一个角色移动切片 | VS-003、M-011、M-012、M-013 | `HeroMovementSystem.ts`、`TestScene.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SLICE-001 | 切片 | 五角色普攻与特效切片 | VS-004、M-023、M-047 | `HeroNormalAttackSystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-007 | 逆向 | 基础互伤规则索引 | VS-006、M-032、M-033 | `combat-rules-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-004 | 切片 | 基础伤害闭环实现 | VS-006、M-032、M-033 | `CombatSystem.ts`、`HeroCombatSystem.ts`、`Monster30System.ts`、`TestScene.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-008 | 逆向 | 子弹/技能飞行物规则索引 | VS-008、M-034 | `projectiles-index.md`、`combat-rules-index.md`、`roles-index.md`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-SLICE-005 | 切片 | 第一个技能/子弹切片 | VS-008、M-025、M-034 | `ProjectileSystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-009 | 逆向 | 技能资源/弹体素材定位 | M-034、M-035、VS-008 | `projectiles-index.md`、`assets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-006 | 切片 | 第二个技能/移动 projectile 切片 | M-025、M-034、M-035、VS-008 | `ProjectileSystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SLICE-007 | 切片 | Role2 `smb` 二段 projectile 切片 | M-025、M-034、M-035、VS-008 | `ProjectileSystem.ts`、`TestScene.ts`、`AssetManifest.ts`、`vertical-slices.md`、`mechanics-index.md` |
| TASK-SETTINGS-010 | 逆向 | 正式技能输入、MP 与重入边界索引 | M-015、M-016、M-025、M-041、VS-008 | `skills-input-index.md`、`roles-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-008 | 切片 | 正式技能槽驱动 Role2 首批技能 | M-015、M-025、M-041、VS-008 | `HeroSkillSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-011 | 逆向 | 完整技能 UI、学习绑定和存档字段索引 | M-016、M-041、M-044、VS-008 | `skills-input-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-009 | 切片 | 最小正式技能 UI/技能槽显示与可配置 loadout | M-016、M-041、VS-008 | `SkillUISystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-012 | 逆向 | 补 VS-007 前置资源/地图索引 | M-026、M-027、M-028、VS-007 | `levels-index.md`、`assets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-011 | 切片 | VS-007 boss 区 + Monster3 + 传送门通关闭环 | M-014、M-028、M-030、VS-007 | `Monster3System.ts`、`LevelSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-010 | 切片 | 扩展完整技能学习/升级 UI（心法树、升级、拖拽绑定、被动技能） | M-041、M-016、VS-008 | `SkillUISystem.ts`、`HeroSkillSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-SLICE-012 | 切片 | 扩展 VS-007 完整纵向爬升关（云层、周期刷 Monster30、停点系统、多波次） | M-027、M-028、VS-007 | `LevelSystem.ts`（扩展）、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md` |
| TASK-SETTINGS-013 | 逆向 | 装备/背包系统索引 | M-036、M-037、VS-010 | `equipment-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-013 | 切片 | 背包最小 UI 与装备穿脱数据切片 | VS-010、M-036、M-037 | `InventorySystem.ts`、`EquipmentSystem.ts`、`EquipmentUISystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-014 | 逆向 | 掉落/拾取系统索引 | M-038、VS-009 | `drops-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-014 | 切片 | VS-009 掉落和拾取最小切片 | M-038、VS-009 | `DropSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-015 | 逆向 | 药品、aura、强化石和首批完整怪物掉落表边界 | M-038、VS-009 | `drops-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-015 | 切片 | 药品掉落和拾取/即时恢复最小切片 | M-038、VS-009 | `DropSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-016 | 切片 | aura 掉落和收集反馈最小切片 | M-038、VS-009 | `DropSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-017 | 切片 | 强化石掉落/入包最小切片 | M-038、VS-009 | `DropSystem.ts`、`EquipmentSystem.ts`、`TestScene.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-018 | 切片 | 首批怪物掉落表配置雏形 | M-038、VS-009 | `DropSystem.ts`、`EquipmentSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-016 | 逆向 | 全怪物掉落表逆向扫描 | M-038、VS-009 | `drops-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-019 | 切片 | 全怪物掉落表现代配置扩展 | M-038、VS-009 | `DropSystem.ts`、`EquipmentSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-017 | 逆向 | `cwzb` 掉落类型入包路径逆向 | M-038、M-042 | `drops-index.md`、`mechanics-index.md`、`task-board.md` |
| TASK-SETTINGS-018 | 逆向 | 宠物系统基础逆向 | M-042、M-016、M-044 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-020 | 切片 | 宠物出战与跟随最小切片 | VS-012、M-042、M-016 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`glossary.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-019 | 逆向 | 宠物捕捉与法宝葫芦入口逆向 | M-042、M-043、M-030 | `pets-index.md`、`magic-weapons-index.md`、`mechanics-index.md`、`task-board.md` |
| TASK-SLICE-021 | 切片 | 宣花葫芦捕捉宠物最小切片 | M-042、M-043、M-030、VS-012 | `PetSystem.ts`、`EquipmentSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-022 | 切片 | 宠物道具消耗最小切片 | M-042、M-037、VS-012 | `PetSystem.ts`、`InventorySystem.ts`、`EquipmentSystem.ts`、`TestScene.ts`、`system-tests.ts`、`glossary.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-020 | 逆向 | 完整法宝系统基础逆向 | M-043、M-036、M-015 | `magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-023 | 切片 | 枯叶灵/神叶灵治疗法宝最小切片 | M-043、M-036、M-015、M-033、VS-013 | `MagicWeaponSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`glossary.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-024 | 切片 | 戮仙剑/MagicSword2 伤害法宝最小切片 | M-043、M-036、M-015、M-032、VS-013 | `MagicWeaponSystem.ts`、`ProjectileSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-025 | 切片 | 青萍剑/MagicQPJ 多剑与自动飞剑最小切片 | M-043、M-036、M-015、M-032、VS-013 | `MagicWeaponSystem.ts`、`ProjectileSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-026 | 切片 | 混元珍珠伞/混元无极伞护盾法宝最小切片 | M-043、M-036、M-015、M-033、VS-013 | `MagicWeaponSystem.ts`、`HeroCombatSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-027 | 切片 | 紫金铃铛/MagicRing 无敌与回复法宝最小切片 | M-043、M-036、M-015、M-033、VS-013 | `MagicWeaponSystem.ts`、`HeroCombatSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-028 | 切片 | 烁时金轮/MagicTimer 时间回溯法宝最小切片 | M-043、M-036、M-015、M-033、VS-013 | `MagicWeaponSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-029 | 切片 | 流邪/沙邪/渊邪入魔 buff 法宝最小切片 | M-043、M-036、M-015、M-033、VS-013 | `MagicWeaponSystem.ts`、`HeroCombatSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-030 | 切片 | 九佑魂莲/MagicFlower 全体增减益法宝最小切片 | M-043、M-036、M-015、M-032、M-033、M-042、VS-013 | `MagicWeaponSystem.ts`、`HeroCombatSystem.ts`、`Monster30System.ts`、`PetSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-021 | 逆向 | MagicFlag/MagicPearl 全屏法宝逆向索引 | M-043、M-032、M-033、VS-013 | `magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-031 | 切片 | 摩多魂幡/MagicFlag 反制 debuff 法宝最小切片 | M-043、M-032、M-033、VS-013 | `MagicWeaponSystem.ts`、`HeroCombatSystem.ts`、`Monster30System.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`TestSceneCombatBridge.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-032 | 切片 | 血海魔童/MagicPearl 多段随机打击法宝最小切片 | M-043、M-032、M-033、VS-013 | `MagicWeaponSystem.ts`、`ProjectileSystem.ts`、`Monster30System.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-033 | 切片 | 太极八卦/MagicBagua 全屏眩晕法宝最小切片 | M-043、M-033、VS-013 | `MagicWeaponSystem.ts`、`Monster30System.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`TestScene.ts`、`system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-034 | 切片 | 震雷天锤/MagicZLHummer 前方雷锤法宝最小切片 | M-043、M-032、M-033、M-034、VS-013 | `MagicWeaponSystem.ts`、`ProjectileSystem.ts`、`Monster30System.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-035 | 切片 | 奢天化雪令/Ling 随机落雪法宝最小切片 | M-043、M-032、M-033、M-034、VS-013 | `MagicWeaponSystem.ts`、`ProjectileSystem.ts`、`Monster30System.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`TestSceneViews.ts`、`system-tests.ts`、`magic-weapons-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-023 | 逆向 | `qljfb/MagicBigBottle` 青龙剑/墙船法宝逆向索引 | M-043、M-034、VS-013 | `magic-weapons-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-036 | 切片 | `qljfb/MagicBigBottle` 临时跟随平台法宝最小切片 | M-043、VS-013 | `MagicWeaponSystem.ts`、`EquipmentSystem.ts`、`InventorySystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`magic-weapons-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-024 | 逆向 | 等级/经验基础逆向 | M-040、VS-014 | `progression-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-038 | 切片 | 等级/经验最小闭环 | VS-014、M-040 | `ProgressionSystem.ts`、`Monster30System.ts`、`HeroSkillSystem.ts`、`TestScene.ts`、`TestSceneCombatBridge.ts`、`system-tests.ts`、`glossary.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-025 | 逆向 | 宠物经验/升级逆向 | M-042、VS-015 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-039 | 切片 | 宠物经验/升级最小闭环 | M-042、VS-015 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-040 | 切片 | 宠物升级形态变化最小闭环 | M-042、VS-015 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-026 | 逆向 | 宠物技能基础逆向 | M-042、VS-016 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-047 | 切片 | `monkey4/jgaoyi` 宠物技能最小闭环 | M-042、VS-022 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SETTINGS-027 | 逆向 | 宠物技能存档/面板边界逆向 | M-042、M-044、VS-023 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md` |
| TASK-SLICE-048 | 切片 | 宠物技能存档/面板最小闭环 | M-042、M-044、VS-023 | `PetSystem.ts`、`InventorySystem.ts`、`EquipmentSystem.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SETTINGS-028 | 逆向 | 宠物被动/自动 buff 边界逆向 | M-042、VS-024 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-049 | 切片 | 宠物基础自动 buff 最小闭环 | M-042、VS-024 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-050 | 切片 | 宠物 `qlfj` 强力反击最小闭环 | M-042、M-032、VS-025 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-051 | 切片 | 宠物 `smjc` 生命加成自动 buff 最小闭环 | M-042、VS-026 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-052 | 切片 | 宠物 `mfjc` 魔法加成自动 buff 最小闭环 | M-042、VS-027 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-053 | 切片 | 宠物 `fyjc` 防御加成自动 buff 最小闭环 | M-042、VS-028 | `PetSystem.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-054 | 切片 | 宠物 `sxkb` 嗜血狂暴自动 buff 最小闭环 | M-042、VS-029 | `PetSystem.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-055 | 切片 | 宠物 `fsnl` 法术能量自动 buff 最小闭环 | M-042、VS-030 | `PetSystem.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-056 | 切片 | 宠物 `fsnl` 技能伤害加值接入最小闭环 | M-042、M-032、VS-031 | `PetSystem.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-057 | 切片 | 宠物 `sxkb` 暴击率接入主动技能最小闭环 | M-042、M-032、VS-032 | `PetSystem.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SETTINGS-029 | 逆向 | 宠物马系专属技能链边界逆向 | M-042、VS-033 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-058 | 切片 | 宠物 `horse1/sp` 水泡技能最小闭环 | M-042、M-032、VS-033 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-059 | 切片 | 宠物 `horse2/bd` 受击触发冰冻反击最小闭环 | M-042、M-032、VS-033 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-060 | 切片 | 宠物 `horse3/bz` 大范围冰锥技能最小闭环 | M-042、M-032、VS-033 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-061 | 切片 | 宠物 `horse4/tmaoyi` 奥义反馈最小闭环 | M-042、M-032、VS-033 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SETTINGS-030 | 逆向 | 宠物青龙专属技能链边界逆向 | M-042、M-032、VS-034 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-062 | 切片 | 宠物 `dragon1/fs` 分身反馈最小闭环 | M-042、M-032、VS-034 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`pets-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-063 | 切片 | 宠物 `dragon2/sdcc` 神龙冲刺最小闭环 | M-042、M-032、VS-034 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`pets-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-064 | 切片 | 宠物 `dragon3/ltwj` 龙腾万钧最小闭环 | M-042、M-032、VS-034 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`pets-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-065 | 切片 | 宠物 `dragon4/qlaoyi` 青龙奥义反馈最小闭环 | M-042、M-032、VS-034 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`pets-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SETTINGS-031 | 逆向 | 宠物玄龟专属技能链边界逆向 | M-042、M-032、VS-035 | `pets-index.md`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-066 | 切片 | 宠物 `turtle1/sld` 水疗盾技能最小闭环 | M-042、M-032、VS-035 | `PetSystem.ts`、`ProjectileSystem.ts`、`AssetManifest.ts`、`TestScene.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |
| TASK-SLICE-067 | 切片 | 宠物 `turtle2/txlj` 同心链接最小闭环 | M-042、M-032、M-033、VS-035 | `PetSystem.ts`、`TestScene.ts`、`TestSceneCombatBridge.ts`、`system-tests.ts`、`mechanics-index.md`、`vertical-slices.md`、`task-board.md`、`task-history.md` |

## 已完成任务定义

### TASK-SLICE-067

完成时间：

- 2026-06-08

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `turtle2/txlj` 技能状态、20 MP 消耗、约 20 秒 CD、按 `4 * warpower` 秒记录的链接持续时间，以及最近承伤/治疗反馈字段。
- 新增 `requestPetTurtle2TxljSkill()`：按已学习、MP、CD 和目标门禁释放；成功扣 20 MP，添加等价 `PETTURTKE_BUFF` 链接状态，不生成伤害 projectile。
- 新增 `applyPetTurtleTxljOwnerDamage()` 和 `applyPetTurtleTxljOwnerHeal()`：链接期间主人受伤时宠物承受 `ceil(damage * 0.05)`，主人承受 `ceil(damage * 0.95)`；主人治疗时主人和宠物按 `ceil(heal * 1.05)` 回复并遵守 HP 上限。
- 扩展 `requestPetTurtle1SldSkill()`，允许已学 `sld` 的玄龟形态复用水疗盾；链接状态有效且传入 owner stats 时，会把本次宠物自疗同步给主人最小治疗反馈。
- 扩展 `src/scenes/TestScene.ts` 和 `src/scenes/test-scene/TestSceneCombatBridge.ts`，出战 `turtle2` 时自动尝试 `txlj`，P1 受到 Monster30/Boss 伤害时接入同心链接承伤转嫁；宠物面板展示 `T2 TXLJ` CD、链接剩余时间和最近承伤/治疗反馈。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、无目标、CD、扣 MP、链接持续/过期、主人承伤转嫁、主人治疗放大、宠物治疗、`sld` 联动给主人回血，以及 `turtle1/sld` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-035` 标记为已完成第二段，并新增 Ready 后续任务 `TASK-SLICE-068`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneCombatBridge.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

#### TASK-SETTINGS-038

完成时间：
- 2026-06-22

完成内容：
- 完整逆向 Role3 八戒九项主动技能、`rj` 被动、普攻+上组合入口、MP 公式、动作/重入门禁、三档盾、拉拽强化和 `tmc` 二段追踪阵列。
- 证实 `rj` 通过 `BaseRoleProperies` 自动增加防御，并在 `BaseHero` 命中链中提供概率回血；不是废弃技能。
- 补齐 `Role3Bullet4..12_2` 的类型、时序、位置、生命周期、伤害段数和控制/支援边界。
- 将后续实现拆为 `TASK-SLICE-090..094`，对应 `VS-038`。

更新文件：
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run check:workflow` 通过。

边界：
- 未修改 `extracted_flash/`；真实 Role3 视觉/音频资源仍按资源缺口处理。

推荐任务：
- `TASK-SLICE-090`：Role3 `dj/sd/rj` 基础攻防闭环。

### TASK-SLICE-084

完成时间：
- 2026-06-21

完成内容：
- 新增 `Role2XbzSkillSystem.ts`，按 `Role2.getRealPower("hit3")` 的固定伤害数组、等级倍率、`6201/6550` 角色修正和最终 `1.178` 系数计算本体 `xbz` 伤害。
- 将测试 Role2 第三普通技能槽绑定为 `xbz`；释放使用 `consumeMP[level-1] * 0.65 * 35173 / 25958`，保留受击、普攻/技能进行中、MP 和 active projectile 门禁。
- 新增 `Role2Bullet3` 固定范围占位 projectile：角色位置 `y + 50`、`magic`、命中间隔 250、击退 `[4,-4]`、最大命中 999；对应原版 `setHurtCanCutDownEffect(false)`，来源受击时效果不销毁。
- `AssetManifest.ts` 登记稳定 key `skill-projectile.role2.xbz.hit3` 及 `Role2Bullet3/Role2_hit3` 真资源缺口；测试场景复用现有 projectile 可视化和命中链。
- 新增独立 `role2-xbz-tests.ts`，覆盖槽位/MP、受击与重入门禁、生成位置、攻击参数、等级伤害、Monster30 扣血、受击不中断和生命周期。
- 将超长 `ProjectileSystem.ts` 的 tuning 参数联合类型收口为结构化 `ProjectileTuning`，新技能规则保持在独立模块；总测试文件仅注册独立测试入口。

更新文件：
- `src/systems/Role2XbzSkillSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests/role2-xbz-tests.ts`
- `tools/system-tests.ts`
- Role2 逆向索引和四份正式任务状态文档

验证：
- `npm run check:structure` 通过（仅既有超长文件 warning；本任务功能已独立拆分）。
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

#### TASK-SETTINGS-037

完成时间：
- 2026-06-22

完成内容：
- 完整逆向 Role1 悟空技能树，确认十项技能为九主动、一被动；`sx` 由 `BaseRoleProperies.role1_sx` 自动提供吸血与暴击，不是废弃/缺失主动技。
- 补齐 `slz/zz/qsez/hmz/lys/hytj/lyfb/jdy/hyjj` 的正式输入、MP 与等级、动作窗口、伤害口径、击退、重入和恢复边界。
- 补齐 `Role1Bullet6..14`、`Role1Shadow`、移动/跟随/特效 projectile、`jdy` 二段、`qsez -> shadow -> lyfb/zz` 协同及 `hyjj` 延迟爆破链。
- 证据化记录 `hmz` 边界：本地可达链为 `hit10_2 -> hit10_4`；`hit10_3` 仅见网络回放 helper，`hmzCharge` 增量路径受前置保护判断阻断，不把不可靠分支写成现代需求。
- 新增 `VS-039`，拆出 `TASK-SLICE-095..099`；首个 Ready 项为 `TASK-SLICE-095`。

更新文件：
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run check:workflow` 通过。

推荐任务：
- `TASK-SLICE-095`。

### TASK-SLICE-066

完成时间：

- 2026-06-08

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `turtle1/sld` 技能状态、20 MP 消耗、约 6 秒 CD、距离 `50..200` 门禁、`sld` 技能说明和 `turtle1` 测试种子宠物。
- 新增 `requestPetTurtle1SldSkill()`：按已学习、MP、CD、目标和距离门禁释放；成功扣 20 MP、重置 CD，按 `pet.atk + skillDamageBonus` 接入既有 `sxkb` 暴击伤害 helper，并按本次实际伤害治疗宠物自身，HP 不超过 `maxHp`。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-turtle1-sld` projectile、`PetTurtle1Bullet2` 占位资源 key 和 `PetTurtleBmd1` / `PetTurtle1Bullet2` 资源缺口登记。
- 扩展 `src/scenes/TestScene.ts`，出战 `turtle1` 时自动尝试 `sld`，宠物面板展示 `T1 SLD` CD 与最近治疗反馈。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、无目标、距离过近、距离过远、CD、扣 MP、projectile 生成、伤害、治疗、治疗上限、`fsnl/sxkb` 兼容，以及既有马系和青龙技能兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-035` 标记为已完成首段，并新增 Ready 后续任务 `TASK-SLICE-067`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-031

完成时间：

- 2026-06-08

完成内容：

- 从当前未完成宠物专属链中选择玄龟 `turtle1..4` 作为下一组；UFO 存在技能池但常规 `export/pet` 类证据不如玄龟完整，玄龟具备 4 形态、4 技能和专属 `PETTURTKE_BUFF` 行为，适合拆成后续 3-4 个小切片。
- 细读 `PetInfo.as`、`BaseHero.as`、`BasePet.as`、`BaseAddEffect.as`、`PetTurtle1.as` 至 `PetTurtle4.as` 小范围片段，确认 `sld -> txlj -> sybh -> xwaoyi` 的学习/替换关系、MP 消耗、CD、目标与距离门禁、伤害/治疗/状态公式、资源 key 和最小实现边界。
- 更新 `docs/reverse-engineering/pets-index.md`，新增玄龟首批链路：`sld` 为 20 MP、距离 `50..200`、约 6 秒 CD 的 `PetTurtle1Bullet2` 伤害+宠物自疗；`txlj` 为主人/宠物 `PETTURTKE_BUFF` 链接，提供 5% 承伤转嫁、治疗放大和同步回血；`sybh` 为 `PetTurtle3Bullet3` 范围伤害；`xwaoyi` 为 5 秒组合奥义，免蓝触发多次 `sld`、刷新 `txlj` 并生成持续 `sybh` 范围反馈。
- 更新 `docs/reverse-engineering/mechanics-index.md` 的 M-042 补充说明，标记玄龟链事实已足够进入实现。
- 更新 `docs/tasks/vertical-slices.md`，新增 `VS-035 宠物玄龟专属技能链最小闭环`，并将首个实现目标固定为 `TASK-SLICE-066 turtle1/sld`。
- 更新 `docs/tasks/task-board.md`，移除已完成的 `TASK-SETTINGS-031`，新增 Ready 后续任务 `TASK-SLICE-066`，完成定义覆盖 `turtle1` 种子、已学 `sld`、MP/CD/目标/距离门禁、`PetTurtle1Bullet2` 占位 projectile、伤害、宠物自疗、资源 key、系统测试和禁止范围。

更新文件：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-065

完成时间：

- 2026-06-08

完成内容：

- 扩展 `src/systems/PetSystem.ts`，P1 种子新增可切换出战 `dragon4`，默认持有 `fs/sdcc/ltwj/qlaoyi`；新增 `qlaoyi` 技能信息、30 MP 消耗、约 24 秒 CD、距离 `<= 200` 门禁、直接伤害 0 和最近组合状态。
- 新增 `requestPetDragon4QlaoyiSkill()`：按已学习、MP、CD、目标和距离门禁释放；成功扣 30 MP、重置 CD，生成 `PetDragonBullet4` / `hit4` 奥义占位 projectile，并按已学 `fs/sdcc/ltwj` 记录 `fs-clone`、`sdcc-charge`、`ltwj-multi` 组合反馈。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-dragon4-qlaoyi` projectile、`PetDragonBullet4` 占位资源 key 和 `PetDragonBmd4` / `PetDragonBullet4` 资源缺口登记。
- 扩展 `src/scenes/TestScene.ts`，出战 `dragon4` 时自动尝试 `qlaoyi`，宠物面板展示 `D4 QLAOYI` CD 与组合反馈。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、无目标、距离过远、CD、扣 MP、直接伤害 0、组合记录，以及 `dragon1/fs`、`dragon2/sdcc`、`dragon3/ltwj` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/reverse-engineering/pets-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-034` 青龙链标记为完整闭环，并新增 Ready 后续任务 `TASK-SETTINGS-031`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/pets-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-064

完成时间：

- 2026-06-08

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `dragon3/ltwj` 最小模型：P1 种子宠物列表加入可切换出战的 `dragon3`，持有已学 `fs/sdcc/ltwj`，技能状态包含约 5 秒 CD 和最近命中治疗记录。
- 新增 `requestPetDragon3LtwjSkill()`，覆盖已学习、MP `>= 20`、目标存在、目标距离 `<= 500` 和 CD 就绪门禁；释放成功扣 20 MP 并重置 CD。
- `ltwj` 生成 4 段 `PetDragon3Bullet3` / `hit3` 占位 projectile，伤害使用 `((0.024 * pet.maxHp) + 3.6 * 2 * pet.atk) * 1.05 + skillDamageBonus`，并复用既有 `sxkb` 暴击 helper；projectile 记录 `int(maxHp * 0.028 + atk * 0.09 + level * 2)` 命中治疗值。
- 扩展 `src/systems/ProjectileSystem.ts`，新增 `pet-dragon3-ltwj` projectile variant 和 `PetDragon3LtwjProjectileTuning`，多段 projectile 共用伤害和治疗记录。
- 扩展 `src/assets/AssetManifest.ts`，登记 `PetDragonBmd3`、`PetDragon3Bullet1`、`PetDragon3Bullet3` 真资源缺口，并新增 `pet-skill.dragon3.ltwj` 稳定 key。
- 扩展 `src/scenes/TestScene.ts`，当前出战 `dragon3` 满足门禁时自动释放 `ltwj`；宠物面板/状态文本展示 `D3 LTWJ` CD 和最近治疗反馈。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、无目标、距离过远、CD、扣 MP、4 段 projectile、伤害、命中治疗记录、`fsnl/sxkb` 兼容和 `dragon1/fs`、`dragon2/sdcc` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/reverse-engineering/pets-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `dragon3/ltwj` 纳入 `VS-034`，并新增 Ready 后续任务 `TASK-SLICE-065`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/pets-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SLICE-063

完成时间：

- 2026-06-08

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `dragon2/sdcc` 最小模型：P1 种子宠物列表加入可切换出战的 `dragon2`，持有已学 `fs/sdcc`，技能状态包含约 3.6 秒 CD 和最近命中治疗记录。
- 新增 `requestPetDragon2SdccSkill()`，覆盖已学习、MP `>= 20`、目标存在、目标距离 `<= 300` 和 CD 就绪门禁；释放成功扣 20 MP 并重置 CD。
- `sdcc` 生成 `PetDragon2Bullet2` / `hit2` 占位 projectile，伤害使用 `((0.03 * pet.maxHp) + 3 * pet.atk) * 1.05 + skillDamageBonus`，并复用既有 `sxkb` 暴击 helper；projectile 记录 `int(maxHp * 0.018 + atk * 0.18 + level * 2)` 命中治疗值。
- 扩展 `src/systems/ProjectileSystem.ts`，新增 `pet-dragon2-sdcc` projectile variant、`PetDragon2SdccProjectileTuning` 和 `petHealOnHit` 记录字段。
- 扩展 `src/assets/AssetManifest.ts`，登记 `PetDragonBmd2`、`PetDragon2Bullet1`、`PetDragon2Bullet2` 真资源缺口，并新增 `pet-skill.dragon2.sdcc` 稳定 key。
- 扩展 `src/scenes/TestScene.ts`，当前出战 `dragon2` 满足门禁时自动释放 `sdcc`；宠物面板/状态文本展示 `D2 SDCC` CD 和最近治疗反馈。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、无目标、距离过远、CD、扣 MP、伤害、命中治疗记录、`fsnl/sxkb` 兼容和 `dragon1/fs` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/reverse-engineering/pets-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `dragon2/sdcc` 纳入 `VS-034`，并新增 Ready 后续任务 `TASK-SLICE-064`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/pets-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SLICE-062

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `dragon1/fs` 最小模型：P1 种子宠物列表加入可切换出战的 `dragon1`，持有已学 `fs`，技能状态包含约 10 秒 CD 和分身剩余时间。
- 新增 `requestPetDragon1FsSkill()`，覆盖已学习、MP `>= 20` 和 CD 就绪门禁；一阶 AS3 未写显式目标门禁，现代切片允许无目标释放。
- 释放成功扣 20 MP，重置约 10 秒 CD，记录 10 秒 `cloneRemainingMs`，并生成 `PetDragon1Clone` / `hit2` 占位 projectile；`fs` 本体直接伤害固定为 0，`fsnl/sxkb` 不放大 0 伤害。
- 扩展 `src/systems/ProjectileSystem.ts`，新增 `pet-dragon1-fs` projectile variant 和 `PetDragon1FsProjectileTuning`，占位表现使用 10 秒 lifetime、0 伤害、`hit2` 动作。
- 扩展 `src/assets/AssetManifest.ts`，登记 `PetDragonBmd1`、`PetDragon1Bullet1` 真资源缺口，并新增 `pet-skill.dragon1.fs` 稳定 key。
- 扩展 `src/scenes/TestScene.ts`，当前出战 `dragon1` 满足门禁时自动释放 `fs`；宠物面板/状态文本展示 `D1 FS` CD 和分身剩余时间。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、CD、扣 MP、无目标释放、分身持续/到期、直接伤害 0、`fsnl/sxkb` 不影响 0 伤害，以及 `horse4/tmaoyi` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/reverse-engineering/pets-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-034` 标记已完成首段，并新增 Ready 后续任务 `TASK-SLICE-063`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/pets-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-030

完成时间：

- 2026-06-06

完成内容：

- 选择青龙 `dragon1..4` 作为马系之后的下一组宠物专属技能链；AS3 证据来自 `PetDragon1.as`、`PetDragon2.as`、`PetDragon3.as`、`PetDragon4.as` 和 `PetInfo.as`。
- 在 `docs/reverse-engineering/pets-index.md` 记录青龙 `fs -> sdcc -> ltwj -> qlaoyi` 的技能候选池、形态学习入口、MP 消耗、CD、目标/距离门禁、动作、伤害公式、命中治疗、分身边界、奥义组合边界和资源 key。
- 明确 `dragon1/fs` 是最适合先做的现代最小切片：已学、MP、约 10 秒 CD，释放 10 秒分身反馈，直接伤害为 0；`sdcc/ltwj/qlaoyi` 后置为单独切片。
- 新增 `VS-034 宠物青龙专属技能链最小闭环`，并将当前 Ready 任务切换为 `TASK-SLICE-062 宠物 dragon1/fs 分身反馈最小闭环`。
- 更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042` 下一步，从“继续逆向下一组宠物链”推进为实现 `dragon1/fs`。

更新文件：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-061

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `horse4/tmaoyi` 最小奥义模型：P1 种子宠物列表加入可切换出战的 `horse4`，持有已学 `sp/bd/bz/tmaoyi`，技能状态包含奥义冷却。
- 新增 `requestPetHorse4TmaoyiSkill()`，覆盖已学习、MP `>= 30`、目标存在和 CD 就绪门禁；释放成功扣 30 MP，重置奥义冷却。
- `tmaoyi` 本体直接伤害保持 0；已学 `sp` 时首段 `PetHorse4Bullet5` 占位 projectile 记录追踪目标，未学 `sp` 时保持非追踪下落反馈。
- 已学 `bd` 时首段携带 2.4 秒 `magicIceMs` 并记录 1 秒爆炸延迟；已学 `bz` 时生成 `PetHorse4Bullet5Explode` 爆炸段，爆炸伤害使用 `6.6 * pet.atk + skillDamageBonus` 并复用既有宠物主动技能暴击 helper 接入 `sxkb`。
- 扩展 `src/systems/ProjectileSystem.ts`，新增 `pet-horse4-tmaoyi` 和 `pet-horse4-tmaoyi-explode` 两种占位 projectile，并为 projectile 模型补充追踪目标、爆炸延迟和二段伤害记录字段。
- 扩展 `src/assets/AssetManifest.ts`，登记 `PetHorseBmd4`、`PetHorse4Bullet5`、`PetHorse4Bullet5Explode` 真资源缺口，并将马系占位资源说明扩展到 `horse4/tmaoyi`。
- 扩展 `src/scenes/TestScene.ts`，当前出战 `horse4` 满足门禁时自动释放 `tmaoyi`；状态栏展示 `h4tmCd`。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、无目标、冷却、扣 MP、直接伤害 0、`sp/bd/bz` 组合反馈、`fsnl/sxkb` 兼容，以及 `horse1/sp`、`horse2/bd`、`horse3/bz` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `horse4/tmaoyi` 纳入 `VS-033` 已完成链路，并新增 Ready 后续任务 `TASK-SETTINGS-030`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-060

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `horse3/bz` 最小技能模型：P1 种子宠物列表加入可切换出战的 `horse3`，持有已学 `sp/bd/bz`，技能状态包含 `bz` 约 6 秒 CD。
- 新增 `requestPetHorse3BzSkill()`，覆盖已学习、MP `>= 20`、目标存在、目标距离 `<= 250` 和 CD 就绪门禁；释放成功扣 20 MP，重置 CD。
- `bz` 伤害使用 `6.6 * pet.atk + skillDamageBonus`，并复用既有宠物主动技能暴击 helper，让 `fsnl` 技能加值和 `sxkb` 暴击率自然接入。
- 扩展 `src/systems/ProjectileSystem.ts`，新增 `pet-horse3-bz` / `PetHorse3Bullet4` / `hit4` 占位 projectile，保留 magic、击退 `[5,0]`、`attackInterval = 24`、单次命中和 2 秒 `magicIceMs`。
- 扩展 `src/assets/AssetManifest.ts`，登记 `PetHorseBmd3`、`PetHorse3Bullet1`、`PetHorse3Bullet2`、`PetHorse3Bullet3`、`PetHorse3Bullet4` 真资源缺口，并将马系占位资源说明扩展到 `horse3/bz`。
- 扩展 `src/scenes/TestScene.ts`，当前出战 `horse3` 满足门禁时自动释放 `bz`；projectile 命中 Monster30 后复用已有 `applyMonster30MagicSnowIce()`，形成 2 秒冰冻/定身最小状态；状态栏展示 `h3bzCd`。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、无目标、距离过远、冷却、伤害、扣 MP、projectile 生成、冰冻状态、`fsnl/sxkb` 兼容，以及 `horse1/sp` 与 `horse2/bd` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `horse3/bz` 纳入 `VS-033` 已完成链路，并新增 Ready 后续任务 `TASK-SLICE-061`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-059

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `horse2/bd` 最小技能模型：P1 种子宠物列表加入可切换出战的 `horse2`，持有已学 `sp/bd`，技能状态包含 `bd` 触发 ready 和 2 秒 CD。
- `markActivePetSkillTriggered()` 在当前出战 `horse2` 时设置 `horse2Bd.releaseReady`，复用 P1 受击等价触发入口；`requestPetHorse2BdSkill()` 覆盖已学习、MP `>= 20`、触发 ready、目标存在和 CD 就绪门禁。
- `bd` 释放成功扣 20 MP、清除触发 ready、重置 2 秒 CD，伤害使用 `3.6 * pet.atk + skillDamageBonus`，并复用既有宠物主动技能暴击 helper 接入 `sxkb`。
- 扩展 `src/systems/ProjectileSystem.ts`，新增 `pet-horse2-bd` / `PetHorse2Bullet2` / `hit2` 占位 projectile，保留 magic、击退 `[5,0]`、`attackInterval = 24`、单次命中和 2 秒 `magicIceMs`。
- 扩展 `src/assets/AssetManifest.ts`，登记 `PetHorseBmd2`、`PetHorse2Bullet1`、`PetHorse2Bullet2` 真资源缺口，并将马系占位资源说明扩展到 `horse2/bd`。
- 扩展 `src/scenes/TestScene.ts`，当前出战 `horse2` 且受击触发 ready/CD 就绪时自动释放 `bd`；projectile 命中 Monster30 后复用已有 `applyMonster30MagicSnowIce()`，形成 2 秒冰冻/定身最小状态；状态栏展示 `h2bd` ready 和 CD。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、触发未就绪、无目标、冷却、伤害、扣 MP、触发清除、projectile 生成、冰冻状态，以及 `fsnl/sxkb` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `horse2/bd` 纳入 `VS-033` 已完成链路，并新增 Ready 后续任务 `TASK-SLICE-060`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-058

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `horse1/sp` 最小技能模型：P1 种子宠物列表加入可切换出战的 `horse1`，持有已学 `sp`，技能状态包含 2 秒 CD。
- 新增 `requestPetHorse1SpSkill()`，覆盖已学习、MP `>= 20`、目标存在、距离 `50..100`、CD 就绪门禁；释放成功扣 20 MP，重置 CD。
- `sp` 伤害使用 `3.6 * pet.atk + skillDamageBonus`，并复用既有宠物主动技能暴击 helper，让 `fsnl` 技能加值和 `sxkb` 暴击率自然接入。
- 扩展 `src/systems/ProjectileSystem.ts`，新增 `pet-horse1-sp` / `PetHorse1Bullet2` 占位 projectile，保留 magic、击退 `[5,0]`、`attackInterval = 24`、单次命中和 2 秒 `magicIceMs`。
- 扩展 `src/assets/AssetManifest.ts`，登记 `PetHorseBmd1`、`PetHorse1Bullet1`、`PetHorse1Bullet2`、`PetHorseIceEffect` 真资源缺口。
- 扩展 `src/scenes/TestScene.ts`，当前出战 `horse1` 满足门禁时自动释放 `sp`；projectile 命中 Monster30 后复用已有 `applyMonster30MagicSnowIce()`，形成 2 秒冰冻/定身最小状态；状态栏展示 `h1spCd` 和最近释放结果。
- 扩展 `tools/system-tests.ts`，覆盖未学习、MP 不足、无目标、距离过近/过远、冷却、伤害、扣 MP、projectile 生成、冰冻状态，以及 `fsnl/sxkb` 兼容。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-033` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-059`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-029

完成时间：

- 2026-06-06

完成内容：

- 细读 `PetHorse1.as`、`PetHorse2.as`、`PetHorse3.as`、`PetHorse4.as`、`PetInfo.as`、`BaseHero.as`、`BaseAddEffect.as`、`PetInterface.as` 和 `PackThings.as` 中与 `horse1..4`、`sp/bd/bz/tmaoyi` 相关的入口。
- 确认马系宠物实例入口：`BaseHero.addPetByPi()` 按 `horse1..4` 创建 `PetHorse1..4`；`PetInfo.rePetSkill()` 按形态把 `sp/bd/bz/tmaoyi` 放入候选池。
- 确认学习/形态边界：`addSpecialSkill()` 在低阶形态推进时追加 `bd/bz`，四阶 `tmaoyi` 由 `PetInterface.revolution()` 或 `nianjhd` 道具触发 `theFourShape()`，再通过 `studyEsoteric()` 直接加入已学技能；普通角色技能书 `jns` 不参与。
- 确认 MP 与伤害公式：`sp/bd/bz` 都消耗 20 MP，`tmaoyi` 消耗 30 MP；`sp/bd = 3.6 * atk * 1.05`，`bz = 6.6 * atk * 1.05`，奥义直接公式为 0，实际通过 `hit5_1` 复用 `sp`、`hit5_2` 复用 `bz`。
- 确认释放门禁：`sp` 需要目标距离 `50..100`；`bd` 由 `reduceHp()` 设置 `skill1Release` 后释放；`bz` 需要目标距离 `<= 250`；`tmaoyi` 需要存在 `curAttackTarget`。
- 确认弹体/特效资源键：`PetHorseBmd1..4`、`PetHorse1Bullet1/2`、`PetHorse2Bullet1/2`、`PetHorse3Bullet1/2/3/4`、`PetHorse4Bullet5`、`PetHorse4Bullet5Explode` 和 `PetHorseIceEffect`；当前 `resources/` 文件名检索未直接命中，现代侧仍按占位资源处理。
- 更新 `docs/reverse-engineering/pets-index.md`，新增马系首批链路、奥义组合门槛、资源缺口和现代最小切片建议。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-033` 标记为可开始，并新增 Ready 后续任务 `TASK-SLICE-058`。

更新文件：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-057

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `PetTuning.petSkillCritDamageMultiplier = 2`，将 `pet.critBonusRate` 接入已复现宠物主动技能伤害 helper。
- `monkey1/xj`、`monkey2/lj/xj`、`monkey3/lyq/xj/lj` 的请求均支持可注入 `random`，伤害先结算 `pet.atk * multiplier + skillDamageBonus`，再按钳制后的 `critBonusRate` 判定暴击。
- 暴击未命中或无暴击率时保持旧伤害；暴击命中时对包含 `fsnl` 加值后的技能伤害应用 2 倍最小可测倍率。
- `qlfj` 普通反击继续只造成 `pet.atk` 等价物理伤害；`monkey4/jgaoyi` 的 `hit5` 仍保持 0 直接伤害，不接入 `sxkb`。
- 扩展 `tools/system-tests.ts`，覆盖旧伤害不变、暴击未命中、暴击命中、`fsnl` 加值与暴击组合、`qlfj/jgaoyi` 边界不变。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-032` 标记完成，并新增 Ready 后续任务 `TASK-SETTINGS-029`。

更新文件：

- `src/systems/PetSystem.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-056

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `calculatePetSkillDamage()`，将 `pet.skillDamageBonus` 接入已复现宠物主动技能伤害。
- `monkey1/xj`、`monkey2/lj/xj`、`monkey3/lyq/xj/lj` 的伤害从 `倍率 * pet.atk` 扩展为 `倍率 * pet.atk + skillDamageBonus`。
- `qlfj` 普通反击继续只造成 `pet.atk` 等价物理伤害；`monkey4/jgaoyi` 的 `hit5` 仍保持 0 直接伤害。
- 扩展 `tools/system-tests.ts`，覆盖无 `fsnl` 时旧伤害不变、有 `skillDamageBonus` 时主动技能伤害和 projectile 伤害增加、`qlfj` 与 `jgaoyi` 边界不变。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-031` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-057`。

更新文件：

- `src/systems/PetSystem.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-055

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts` 的基础自动 buff 模型，新增 `fsnl` 状态、触发、持续和到期恢复逻辑，并保留既有 `sxkb/smjc/mfjc/gjjc/fyjc` 行为。
- `fsnl` 在当前出战宠物已学、MP `>= 20`、计数器归零时自动触发；触发后扣宠物 20 MP，按 `form * 30 * technique * 1.05` 增加宠物自身 `skillDamageBonus`。
- `fsnl` 触发后设置 5400 帧等价重触发计数；到期后移除技能伤害加值。
- 扩展宠物面板，显示当前 `SKILL` 加值和 `FSNL` 等待/剩余时间、最近自动 buff 结果。
- 扩展 `tools/system-tests.ts`，覆盖 `fsnl` 未学习、计数未归零、MP 不足、宠物 MP 消耗、技能伤害加值增加、到期恢复和重触发门禁。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-030` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-056`。

更新文件：

- `src/systems/PetSystem.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-054

完成时间：

- 2026-06-06

完成内容：

- 扩展 `src/systems/PetSystem.ts` 的基础自动 buff 模型，新增 `sxkb` 状态、触发、持续和到期恢复逻辑，并保留既有 `smjc/mfjc/gjjc/fyjc` 行为。
- `sxkb` 在当前出战宠物已学、MP `>= 20`、计数器归零时自动触发；触发后扣宠物 20 MP，按 `form * 0.07 * technique * 0.27 * 1.05` 增加宠物自身 `critBonusRate`。
- `sxkb` 触发后设置原版 4320 帧等价重触发计数；到期后移除暴击加成。
- 扩展宠物面板，显示当前 `CRIT` 加成和 `SXKB` 等待/剩余时间、最近自动 buff 结果。
- 扩展 `tools/system-tests.ts`，覆盖 `sxkb` 未学习、计数未归零、MP 不足、宠物 MP 消耗、暴击加成增加、到期恢复和 4320 帧重触发门禁。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-029` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-055`。

更新文件：

- `src/systems/PetSystem.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-053

完成时间：

- 2026-06-05

完成内容：

- 扩展 `src/systems/PetSystem.ts` 的基础自动 buff 模型，新增 `fyjc` 状态、触发、持续和到期恢复逻辑，并保留既有 `smjc/mfjc/gjjc` 行为。
- `fyjc` 在当前出战宠物已学、MP `>= 20`、计数器归零时自动触发；触发后扣宠物 20 MP，按 `form * 5 * technique * 1.05` 增加 P1 主人防御。
- 到期后移除防御加成；触发后设置 5400 帧等价重触发计数。
- 扩展 `src/scenes/TestScene.ts`，把宠物自动 buff owner stats 写回 `owner.baseStats.defense`，让测试场景状态栏的有效防御链路可观察。
- 扩展宠物面板，显示 `FYJC` 等待/剩余时间和最近自动 buff 结果。
- 扩展 `tools/system-tests.ts`，覆盖 `fyjc` 未学习、计数未归零、MP 不足、宠物 MP 消耗、防御加成增加、到期恢复和重触发门禁。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-028` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-054`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-052

完成时间：

- 2026-06-05

完成内容：

- 扩展 `src/systems/PetSystem.ts` 的基础自动 buff 模型，新增 `mfjc` 状态、触发、持续和到期恢复逻辑，并保留既有 `smjc/gjjc` 行为。
- `mfjc` 在当前出战宠物已学、MP `>= 20`、计数器归零时自动触发；触发后扣宠物 20 MP，按 `form * 70 * technique * 1.05` 增加 P1 主人 MP 上限。
- 触发和到期均按当前 MP / MP 上限比例同步当前 MP，避免 buff 添加或移除时改变法力比例。
- 扩展 `src/scenes/TestScene.ts`，把宠物自动 buff owner stats 写回 `owner.skill.mp/maxMp`，并继续写回 HP 与攻击字段。
- 扩展宠物面板，显示 `MFJC` 等待/剩余时间和最近自动 buff 结果。
- 扩展 `tools/system-tests.ts`，覆盖 `mfjc` 未学习、计数未归零、MP 不足、宠物 MP 消耗、MP 上限增加、当前 MP 比例同步、到期恢复和重触发门禁。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-027` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-053`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-051

完成时间：

- 2026-06-05

完成内容：

- 扩展 `src/systems/PetSystem.ts` 的基础自动 buff 模型，新增 `smjc` 状态、触发、持续和到期恢复逻辑，并保留既有 `gjjc` 行为。
- `smjc` 在当前出战宠物已学、MP `>= 20`、计数器归零时自动触发；触发后扣宠物 20 MP，按 `form * 70 * technique * 1.05` 增加 P1 主人 HP 上限。
- 触发和到期均按当前 HP / HP 上限比例同步当前 HP，避免 buff 添加或移除时改变血量比例。
- 扩展 `src/scenes/TestScene.ts`，把宠物自动 buff owner stats 写回 `owner.combat.hp/maxHp` 与 `owner.baseStats.power`。
- 扩展宠物面板，显示 `SMJC` 等待/剩余时间和最近自动 buff 结果。
- 扩展 `tools/system-tests.ts`，覆盖 `smjc` 门禁、宠物 MP 消耗、HP 上限增加、当前 HP 比例同步、到期恢复和重触发门禁。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-026` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-052`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-050

完成时间：

- 2026-06-05

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增 `requestPetQlfjCounterAttack()`：当前出战宠物已学 `qlfj`、宠物存活且概率命中时触发普通反击；概率公式为 `(0.05 + form / 100) * warpower * 1.05`，随机源可注入。
- `qlfj` 反击不消耗 MP，不走主动技能 `skillCD1..4`，也不走基础自动 buff 计数器；未学、死亡、概率未命中时只写安全反馈。
- 反击命中返回 `PetSkillCastResult`，伤害为 `pet.atk`，目标取最近存活 `PetSkillTarget`，用于现代最小可见反馈和系统测试。
- 扩展 `src/scenes/TestScene.ts`，在 P1 被 `Monster30` 攻击命中时，保留已有宠物受击技能触发，并额外尝试 `qlfj`；命中后对该 `Monster30` 施加一次物理反击伤害并显示金色命中闪框。
- 扩展 `tools/system-tests.ts`，覆盖未学不触发、死亡不触发、随机未命中不触发、随机命中触发、MP 不变和一次反击伤害。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-025` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-051`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-049

完成时间：

- 2026-06-05

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增宠物基础自动 buff 最小模型：`PetState.autoBuffState`、`gjjc` 触发计数、持续状态、最近结果和 owner stats 更新结果。
- 首个实现目标固定为 `gjjc` 攻击加成：当前出战宠物已学 `gjjc`、MP `>= 20`、计数器归零时自动触发；触发扣 20 MP，按 `form * 6 * technique * 1.05` 增加 P1 主人攻击，持续时间按 AS3 `second` 公式换算，到期恢复原攻击。
- 自动 buff 不走主动技能 `skillCD1..4`；触发后记录 5400 帧等价重触发计数，初次计数默认 300 帧等价延迟。
- 扩展宠物面板，显示 `GJJC` 等待/剩余时间和最近自动 buff 结果。
- 扩展 `src/scenes/TestScene.ts`，在宠物系统更新中调用 `updatePetAutoBuffs()`，把效果应用到 P1 当前 owner 的 `baseStats.power`，使状态栏 effective power 可观察。
- 扩展 `tools/system-tests.ts`，覆盖未学不触发、MP 不足不触发、计数未归零不触发、触发扣 MP、攻击数值增加、到期恢复和重触发门禁。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-024` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-050`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-028

完成时间：

- 2026-06-05

完成内容：

- 复查 `PetInfo.as` 基础候选池、`getIntroByName()`、`getPetHarmObj()`、`findPetUsedMagic()`、`deletePassiveWhenUpdata()` 和 `addPassiveAfterUpdata()`，补清基础属性被动 `tsml/zrsh/smzf/mfby` 的入口、公式和升级前后移除/重加边界。
- 复查 `BasePet.as` 的 `checkBuffSkill()`，确认 `sxkb/fsnl/smjc/mfjc/gjjc/fyjc` 是每帧自动检查的宠物基础自动 buff：初始计数 300，触发消耗 20 MP，`sxkb` 重触发计数 4320，其余为 5400，持续时间来自 `getPetHarmObj().second * gc.frameClips`。
- 复查 `BasePet.as` 的 `reduceHp()`，确认 `qlfj` 是受击路径中的概率反击：不消耗 MP，不走主动技能冷却或自动 buff 计数，命中概率来自 `(0.05 + curPetState / 100) * warpower * 1.05`。
- 复查 `BasePet.getCriteValue()` / `getMagicAddValue()` 和 `BaseRoleProperies.addBuff()` / `removeBuff()`，确认 `sxkb/fsnl` 作用于宠物自身暴击/技能伤害，`smjc/mfjc/gjjc/fyjc` 作用于主人 HP/MP 上限、基础攻击和防御。
- 复查 `PetInfo.addSpecialSkill()`，列出猴子以外宠物形态专属技能链，明确它们多数仍属于宠物 AI 自动释放的专属技能，未进入当前最小实现范围。
- 更新 `docs/reverse-engineering/pets-index.md`，新增“被动和自动 buff”证据、公式表、触发门禁、现代实现建议和禁止范围。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-024` 标记为可开始，并新增 Ready 后续任务 `TASK-SLICE-049`。

更新文件：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-048

完成时间：

- 2026-06-05

完成内容：

- 扩展 `src/systems/PetSystem.ts`，新增宠物技能字段级编解码：`PetState.skills` 可写为原版 `sname~sname`，空技能保存为空字符串，读取未知 key 时保留在已学列表但不会进入已实现释放链路。
- 新增 8 槽宠物技能展示模型；宠物面板现在按当前选中宠物输出 8 个槽位，已学技能显示 key/中文名或未知 fallback，空槽保持空位语义，不接点学、遗忘或拖拽绑定。
- 接入 `cwjnxld` 宠物技能洗练丹：装备注册表和背包种子新增该道具；使用时要求当前出战宠物存在，成功后按宠物种类/形态/等级重算技能并返回消耗信号，无出战宠物时不消耗。
- 洗练重算使用可注入随机源，复用原版等级窗口、悟性上限、约 40% 学习概率和候选池随机抽取边界；已实现猴子形态技能候选与基础技能候选。
- 扩展 `tools/system-tests.ts`，覆盖空技能编码、未知 key 保留、8 槽展示、无出战宠物不消耗 `cwjnxld`、成功洗练消耗 1 个和固定随机学习结果。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-023` 标记完成，并新增 Ready 后续任务 `TASK-SETTINGS-028`。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/systems/EquipmentSystem.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-027

完成时间：

- 2026-06-05

完成内容：

- 复查 `PetInfo.as` 的 `getSkillSaveString()`、`setSkillSaveString()`、`getSaveString()`、`setSaveString()`，确认宠物已学技能以 `sname~sname` 写入单只宠物存档字段索引 `25`；空技能保存为空字符串，读取空串时 `skill` 保持为空但仍重建当前形态候选池。
- 复查 `User.as` 的 `getPetSaveString()` / `savePetSaveString()`，确认多只宠物用 `}` 分隔，读取时对每段非空字符串 new `PetInfo()` 并调用 `setSaveString()`。
- 复查 `PetInterface.as`，确认 `skill1` 到 `skill8` 是 8 个技能展示槽；`setPetAllSkill()` 先清空 8 槽，再按 `pif.skill` 顺序写入 `{sname,cname,sinfo}`；没有发现宠物技能槽点击学习、遗忘或拖拽绑定逻辑。
- 复查 `PackThings.as` 和 `AllEquipment.as` 的 `cwjnxld`，确认宠物技能洗练丹会对当前出战宠物调用 `refreshPetAllSkillByLevel()` 并消耗 1 个；面板按钮 `czjnbtn` 也可对当前面板宠物执行同类重算。
- 补清升级随机学习边界：学习来自 `studySkillSuddenly(level)` 的等级窗口、悟性上限、约 40% 概率和候选池随机抽取；形态变化只调整候选池和技能说明，不无条件学会新技能。
- 更新 `docs/reverse-engineering/pets-index.md`，新增/扩展“宠物技能存档/面板边界”内容，记录空串、未知 key、8 槽展示、洗练丹和现代实现建议。
- 更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042/M-044` 下一步，新增 `docs/tasks/vertical-slices.md` 的 `VS-023`，并在 `docs/tasks/task-board.md` 创建 Ready 后续任务 `TASK-SLICE-048`。

更新文件：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-047

完成时间：

- 2026-06-03

完成内容：

- 复查 `PetMonkey4.as` 的 `beforeSkill4Start()`、`releSkill4()`、`hit5` 连段段落和 `PetInfo.findPetUsedMagic("jgaoyi")`：`jgaoyi` 要求目标存在、已学习且 MP 足够，释放扣 30 MP；`hit5` 本身 `getRealPower("hit5")` 返回 0，后续伤害来自奥义连起的其他技能/普攻。
- 扩展 `src/systems/PetSystem.ts`，在 P1 种子宠物列表中新增可切换出战的 `monkey4`，并让其持有已学 `xj/lj/lyq/jgaoyi`。
- 为 `monkey4/jgaoyi` 增加最小主动技能状态：已学习、MP `>= 30`、冷却就绪且存在存活 `Monster30` 目标时释放；释放成功扣 30 MP、进入 500ms 冷却并记录最近释放反馈。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-monkey4-jgaoyi` / `PetMonkey4Hit5` 占位 projectile 和资源缺口登记；该 projectile 固定无直接伤害，用于表现 `hit5` 最小可观察反馈。
- 扩展 `src/scenes/TestScene.ts`，当前出战宠物为 `monkey4` 且门禁满足时自动尝试 `jgaoyi`，状态栏和宠物面板展示 `m4jgCd`、已学技能和最近释放结果。
- 扩展 `tools/system-tests.ts`，覆盖 `jgaoyi` 未学习、MP 不足、无目标、冷却门禁、扣 MP、`hit5` projectile 生成，以及 `Monster30` 不掉血的 AS3 无直接伤害边界。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-022` 标记完成，并清空当前 Ready 游戏任务。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-025

完成时间：

- 2026-06-03

完成内容：

- 更新 `docs/reverse-engineering/pets-index.md`，新增“经验、升级和成长”章节，记录 `PetInfo` 的 `level/curExper` 字段、`setCurExper()` 立即触发 `petUpdate()` 的升级入口、`getPetNextExper()` 曲线、升级扣经验和溢出递归、形态变化回调、属性成长和 UI 展示。
- 补清宠物下级经验公式：`level <= 10` 时 `level * 50`；`level > 10` 时 `(level + 1)^2 * (5 + (level - 10) * 2)`。
- 补清升级后属性处理：`SHp = hpArr[level - 1]` 且 HP 回满，`SMp += mpQuality * 0.08` 且 MP 回满，`Atk += atkQuality * 0.015`，`Def = int(defArr[level - 1] * 0.9)`；60 级后还有少量随机暴击/闪避/魔防成长。
- 补清经验来源边界：普通 `BaseMonster.reduceHp()` 有宠物时玩家和宠物各得 `exp * 0.6`，无宠物时玩家得完整经验，击杀目标是 `BasePet` 时宠物得完整经验；`Monster111` 和任务奖励 `"exp"` 是特殊/异常旁路。
- 确认 `djyys` 宠物经验道具调用当前宠物 `setCurExper(curExper + 30000)`，与自然战斗经验共用升级入口。
- 更新 `mechanics-index.md` 的 `M-042` 下一步，新增/更新 `vertical-slices.md` 的 `VS-015`，并将当前 Ready 任务切到 `TASK-SLICE-039`。

更新文件：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-038

完成时间：

- 2026-06-03

完成内容：

- 新增 `src/systems/ProgressionSystem.ts`，实现 `HeroProgressionModel`、五角色经验曲线、五角色基础属性成长公式、经验增加、自动升级、溢出经验保留和满级边界。
- 更新 `docs/domain/glossary.md`，补充 `HeroProgressionModel` 和 `ProgressionSystem` 统一语言。
- 扩展 `src/systems/Monster30System.ts`，为 `Monster30` 增加 `experience = 4` 和经验已授予标记。
- 扩展 `src/scenes/test-scene/TestSceneCombatBridge.ts`，玩家普攻击杀 `Monster30` 时产生经验奖励事件。
- 扩展 `src/scenes/TestScene.ts`，为 P1/P2 建立独立成长模型；玩家普通攻击或 projectile 击杀 `Monster30` 后获得经验，升级时按当前英雄公式刷新基础 HP/MP/攻击/防御并回满 HP/MP；P1 装备栏只影响 P1，P2 使用空装备栏避免属性串线；状态栏显示等级、当前经验、下级经验和关键属性。
- 调整 `src/systems/HeroSkillSystem.ts` 的 `createHeroSkillModel()` 参数类型，使升级后可传入动态 MP 上限。
- 扩展 `tools/system-tests.ts`，覆盖 Monster30 经验奖励、P1/P2 经验隔离、单次升级、溢出多级升级、Role5 属性公式和近满级边界。
- 更新 `mechanics-index.md`、`vertical-slices.md` 和 `task-board.md`，将 `M-040/VS-014` 标为已复现/已完成，并新增下一步 Ready 任务 `TASK-SETTINGS-025`。

更新文件：

- `src/systems/ProgressionSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneCombatBridge.ts`
- `tools/system-tests.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-024

完成时间：

- 2026-06-02

完成内容：

- 新增 `docs/reverse-engineering/progression-index.md`，记录玩家等级上限、`User.curLevel/curExp`、`BaseRoleProperies.level/exper/exp`、初始化同步、升级触发、升级扣经验和存档字段。
- 确认五角色共用经验曲线：1-6 级 `135 + 10 * (L - 1)`，7-12 级 `625 + 50 * (L - 7)`，13-18 级 `1950 + 100 * (L - 13)`，19-88 级 `5000 + 5000 * (L - 19)`，89 级后使用 `999999999`，等级上限 90。
- 整理五角色基础属性成长公式：HP、MP、基础攻击、防御均在各 `Role*.upGrade()` 中重算，升级后 HP/MP 回满并重新 `initAll()`。
- 确认普通怪物死亡经验入口在 `BaseMonster.reduceHp()`，无宠物时玩家获得完整 `protectedParamsObject.exp`，有当前宠物时玩家和宠物各获得 `60%`；`Monster111` 和任务奖励经验存在特殊旁路，首个现代切片后置。
- 更新 `mechanics-index.md`，将 `M-040` 标为已扒但未复现。
- 更新 `vertical-slices.md`，新增 `VS-014 等级/经验最小闭环`，状态为可开始。
- 更新 `task-board.md`，归档当前逆向任务并新增 Ready 任务 `TASK-SLICE-038`。

更新文件：

- `docs/reverse-engineering/progression-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-036

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `qljfb` 青龙剑/MagicBigBottle 触发分支；装备对应 `zbfb` 后按 `H` 主动释放，无显式 MP、灵魂或等级门禁，使用中重复 H 拒绝重入。
- 释放后进入 `hit`，创建 `MagicBigSwordBmd` 等价反馈，并生成一个 `StageBoat` 等价 `MagicWeaponPlatform`；平台初始在角色 `y - 100`，按 AS3 dead-zone 和纵向 `+70` 偏移持续跟随来源角色。
- 临时平台接入现代测试场景的 `MovementPlatform` 站立/托举闭环；角色下落可落在平台上，平台移动和剩余时间可在场景占位视图与状态栏观察。
- 保留 AS3 动作窗口边界：普通五行约 `60` 帧回 `wait`，木五行约 `40` 帧回 `wait`；平台生命周期独立于法宝动作，约 `20s` 后或来源消失时清理。
- `AssetManifest` 登记 `MagicBigSwordBmd`、`MagicBigBottleData` 真资源缺口，并使用稳定占位 key。
- 系统测试覆盖触发、重入拒绝、普通/木五行动作窗口、平台生成位置/跟随、站立托举、20 秒到期清理和来源消失清理。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-023

完成定义：

- 补清 `qljfb` 在 `BaseHero.showSkillFaBao()` 中的创建入口、门禁、动作重入边界和五行动作窗口：`BaseHero.initMagicWeapon()` 由 `fillName == "qljfb"` 创建 `MagicBigBottle`，`showSkillFaBao()` 在单机且存在法宝时调用 `useSkill()`；`MagicBigBottle` 自身无额外 MP、灵魂或等级门禁，沿用 `BaseMagicWeapon.useSkill()` 的 `hit` 重入拒绝。
- 补清 `MagicBigBottle.showSkill()` 的核心效果：先销毁旧 `bingWall`，再创建 `StageBoat(sourceRole, gc.frameClips * 20)`，初始位置 `x = sourceRole.x`、`y = sourceRole.y - 100`，加入 `gc.pWorld.getWallArray()` 和 `gc.gameSence`，普通五行 60 帧回 `wait`，木五行 40 帧回 `wait`。
- 补清 `StageBoat` 与 `ThroughWall`/世界墙数组的关系：`StageBoat extends ThroughWall -> Wall`，不是 `BaseBullet`；它用宽 `130`、高 `20` 的隐藏墙体承载 `MagicBigBottleData` 视觉对象，跟随来源角色，约 20 秒后由 `Wall.destroy()` 从显示树和 `pWorld.getWallArray()` 清理。
- 明确资源状态：`ThroughWall` 有 `symbol120`，当前资源文件名和 SymbolClass 检索未命中 `MagicBigSwordBmd`、`MagicBigBottleData` 或 `StageBoat` 专属素材；现代侧建议稳定占位 key 为 `magic-weapon.qljfb.magic-big-sword`、`magic-weapon.qljfb.magic-big-bottle-data`。
- 给出下一步现代最小可玩切片边界：`qljfb` 应作为临时跟随平台/穿透墙实现，不进入 projectile 伤害命中链；首版只覆盖 P1/TestScene 的触发、站立/托举、跟随、20 秒清理、重入拒绝和动作窗口。

已完成产物：

- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-035

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `stlp` 奢天化雪令/Ling 触发分支；装备对应 `zbfb` 后按 `H` 主动释放，无显式 MP、灵魂或等级门禁，使用中重复 H 拒绝重入。
- 释放后进入 `hit`，创建 `LingPaiEffect` 等价起手反馈，并一次性生成 120 个 `ef_snow` 等价 `magic-weapon-snow` projectile；雪花从当前镜头上方随机区域斜向下移动，行进距离约 `1500` 后销毁。
- `fabao-snow` 命中参数接入现有伤害闭环：`attackKind = magic`、击退 `[2,-2]`、`attackInterval = 999`、`hitMaxCount = 999`。
- 命中 `Monster30` 后附加 3 秒 `magicSnowIce` 冰冻最小状态，到期或死亡清理；首版只覆盖 `Monster30`，不做全怪物通用 AddEffect 泛化。
- 保留 AS3 动作窗口边界：普通五行约 `25` 帧回 `wait`，木五行约 `20` 帧回 `wait`；法宝自身到期回 `wait`，雪花 projectile 继续按自身生命周期清理。
- `AssetManifest` 登记 `LingBmd`、`LingPaiEffect`、`ef_snow` 真资源缺口，并使用稳定占位 key。
- 系统测试覆盖触发、重入拒绝、雪花数量/生成范围、木五行动作窗口、命中伤害、冰冻状态和到期清理。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneViews.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-034

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `zltc` 震雷天锤触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 法宝等级至少 `1` 才能释放；等级不足时不进入 `hit`，并给出可观察反馈。
- 释放后在角色前方生成 `zltcskill` 等价雷锤占位 projectile；命中当前存活 `Monster30` 时通过现有伤害/projectile 桥接产生扣血、受击和 `zltc-stun` 可观测状态。
- 保留 AS3 动作窗口边界：普通五行约 `25` 帧回 `wait`，木五行约 `20` 帧回 `wait`；使用中重复按 H 拒绝重入。
- 系统测试覆盖触发、等级门禁、木五行动作边界、前方目标命中、无目标边界、到期清理、重入拒绝。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-033

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `tjbg` 太极八卦触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 法宝等级至少 `1` 才能释放；等级不足时不进入 `hit`，并给出可观察反馈。
- 释放后对当前存活 `Monster30` 添加太极八卦等价眩晕状态：普通五行持续 `6s`，木五行持续 `8s`。
- 动作窗口按 AS3 约 `24` 帧回 `wait`；使用中重复按 H 拒绝重入。
- 测试场景能装备/切换 `tjbg`，并能观察 Monster30 眩晕剩余时间、行动停止和到期恢复。
- 系统测试覆盖触发、等级门禁、木五行持续时间、全体 Monster30 眩晕、到期清理和重入拒绝。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：
- `MagicWeaponSystem.ts` 新增 `tjbg/MagicBagua` active effect：等级低于 1 时拒绝释放并保持 `wait`；等级满足时进入 `hit`，动作窗口按 `400ms` 等价约 24 帧回待机。
- `tjbg` 释放时扫描当前 enemy targets，仅对存活目标调用 `applyMagicBaguaStun`；普通五行眩晕 `6000ms`，木五行眩晕 `8000ms`。
- `Monster30System.ts` 新增 `magicBaguaStun` 最小状态，眩晕期间清空正在进行的 `hit1`，保持 `wait`，到期自动清理；死亡时同步清理。
- `EquipmentSystem.ts` 与 `InventorySystem.ts` 新增 `tjbg` 种子法宝，测试场景可通过背包装备/切换。
- `TestScene.ts` 的法宝目标适配器接入 `applyMagicBaguaStun/clearMagicBaguaStun`，状态栏显示 `bagua-stun` 剩余时间，便于观察行动停止与恢复。
- `tools/system-tests.ts` 新增太极八卦覆盖：等级门禁、普通 6 秒、木 8 秒、全体存活 Monster30 生效、死亡目标跳过、动作回待机、重入拒绝和到期恢复。
- 更新 `mechanics-index.md`、`magic-weapons-index.md`、`vertical-slices.md`，并创建后续 `TASK-SLICE-034` 作为当前推荐任务。

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过，Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-032

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `xhmt` 血海魔童触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 触发后按 `MagicPearlBegin` 等价起手进入攻击链；法宝自身约 `30` 帧回 `wait`，但攻击链继续执行；链中重入边界必须可测试。
- 攻击次数按 `3 + floor(level / 3)` 计算，木五行额外 `+2` 次。
- 每轮重新选择离玩家最近且未死亡的 `Monster30`；无目标时提前进入结束随机效果。
- 用现代占位表现 `MagicPearlRun/Back/Effect/Bullet1-3`，并在每轮目标点按第 3/12/28 帧等价顺序生成三段 `fabao-pearl` 命中。
- 三段命中使用 `magic`、击退 `[2,-2]`、`attackInterval = 2` 的等价参数；首版用当前玩家 `power` 和法宝等级推导占位伤害，并记录 MagicPearl 三 bullet 不走怪物防御修正的差异。
- 攻击链结束后随机三选一：回蓝、给当前 Monster30 全体眩晕、给当前 Monster30 全体中毒；无怪物时眩晕/中毒分支回退为回蓝。木五行把结束效果等级系数乘 `1.5`。
- 测试场景能装备/切换 `xhmt`，并能观察链式目标、段数、命中、结束随机结果和 Monster30 状态。
- 补系统测试覆盖：触发、攻击次数公式、木五行次数加成、最近目标选择、无目标结束、三段 bullet/伤害、回蓝分支、眩晕分支、中毒 tick、重入边界。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `xhmt/MagicPearl` active effect，H 触发后建立起手、飞行、三段 effect 和结束随机效果的最小状态机；动作窗口约 500ms 后回 `wait`，攻击链继续执行，链中再次 H 会被拒绝并反馈攻击链进行中。
- 攻击次数按 `3 + floor(level / 3)` 计算，木五行额外 `+2`；每轮重新基于玩家位置选择最近存活目标，目标死亡后下一轮会重新选择。
- `ProjectileSystem.ts` 新增 `MagicPearlBullet1/2/3` 占位 projectile，统一使用 `fabao-pearl`、`magic`、击退 `[2,-2]`、`attackInterval = 2`；首版伤害按当前玩家 `power * level * 0.0315` 派生，无 power 时使用可测占位值。
- `Monster30System.ts` 新增 `magicPearlStun` 和 `magicPearlPoison` 状态；眩晕会中止 Monster30 行动，中毒每秒按结束效果派生值扣血并可致死清理。
- `EquipmentSystem.ts` 和 `InventorySystem.ts` 新增 `xhmt` 种子法宝；测试场景可通过背包装备/切换。
- `TestScene.ts` 状态栏补充 Monster30 的 MagicPearl 眩晕/中毒剩余时间和 tick 反馈，现有 projectile 视图可显示 `MagicPearlBullet1/2/3`。
- `AssetManifest.ts` 登记 `MagicPearlBegin/Run/Back/Effect/Bullet1-3` 真资源缺口，继续使用现代占位表现。
- 更新 `mechanics-index.md`、`magic-weapons-index.md`、`vertical-slices.md`，并创建后续 `TASK-SLICE-033` 作为当前推荐任务。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-031

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `mdhf` 摩多魂幡触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 触发后进入 `MagicFlagEffect` 等价护体状态：持续 `10s`；使用中拒绝重入；木五行只把法宝动作回待机窗口从约 `60` 帧缩短到约 `50` 帧，不改变护体持续时间。
- 玩家在护体期间被 `Monster30 hit1` 命中时，给攻击者添加 `MAGIC_FLAG_DEBUFF` 等价状态，持续 `5s`。
- debuff 期间每秒按怪物最大 HP 的 `2%` 扣血并显示/记录状态；Monster30 死亡或 debuff 到期后清理。
- 先把原版 `Hit` 降低事实记录为状态/调试展示或数据字段，不要求接入完整命中/闪避判定。
- 测试场景能装备/切换 `mdhf`，并能观察护体剩余时间、Monster30 debuff 剩余时间和每秒扣血反馈。
- 补系统测试覆盖：触发、重入拒绝、木五行动作边界、受击挂 debuff、每秒扣血、到期清理、死亡清理、无 `zbfb` 时 H 不触发且不影响普通技能。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/Monster30System.ts`
- `src/scenes/test-scene/TestSceneCombatBridge.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `mdhf/MagicFlag` active effect，H 触发后建立 10 秒护体；木五行只把动作边界缩短到约 833ms，不改变护体持续。
- `HeroCombatSystem.ts` 新增 `magicFlagGuard`，记录护体来源、剩余时间和反制 debuff 时长。
- `TestSceneCombatBridge.ts` 在 `Monster30 hit1` 命中玩家且 `applyHeroDamage()` 成立后触发反制，给攻击者挂 MagicFlag debuff。
- `Monster30System.ts` 新增 `magicFlagDebuff`，记录原版 Hit 降低倍率，期间每秒按最大 HP 2% 扣血，到期或死亡清理。
- `EquipmentSystem.ts` 和 `InventorySystem.ts` 新增 `mdhf` 种子装备，测试场景可通过背包装备/切换。
- `TestScene.ts` 状态栏和角色标签补充 MagicFlag 护体、Monster30 debuff 剩余时间、命中倍率记录和 tick 伤害反馈。
- `tools/system-tests.ts` 覆盖触发、重入拒绝、木五行动作边界、受击反制、每秒扣血、到期清理和死亡清理。
- 更新 `mechanics-index.md`、`vertical-slices.md`，并把下一推荐任务切到 `TASK-SLICE-032`。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-021

完成定义：

- 梳理 `MagicFlag`（`mdhf` 摩多魂幡）的释放入口、动作回待机时间、跟随效果物、持续时间、命中/环绕目标、伤害/控制参数和销毁边界。
- 梳理 `MagicPearl`（`xhmt` 血海魔童）的起手、攻击次数公式、木五行次数加成、最近目标选择、多段 bullet 链、结束随机效果和 MP 记录字段边界。
- 更新 `magic-weapons-index.md`，给出足够支撑一个或两个后续 `TASK-SLICE` 的现代实现建议，明确哪些行为可先做占位，哪些必须后置。
- 同步更新 `mechanics-index.md` 中 `M-043` 的下一步；如果 `M-032`/`M-033` 的伤害、控制或 debuff 事实有新增，也同步补充。
- 更新 `vertical-slices.md` 的 `VS-013` 后续说明和任务队列推荐。
- 不修改现代游戏代码；本任务只做逆向索引和任务交接。

已完成产物：

- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicFlag.as` 已确认 `mdhf` 释放时创建 `MagicFlagStart` 起手表现和 `MagicFlagEffect` 跟随护体；护体持续 `gc.frameClips * 10`，受击不打断，不等动画末帧销毁；木五行只把动作回待机从 60 帧缩短到 50 帧。
- `BaseHero.beMagicAttack()` 已确认玩家护体期间被打时，会给攻击者挂 `MAGIC_FLAG_DEBUFF` 5 秒；`BaseAddEffect` 每秒对怪物扣最大 HP 2%，`BaseMonster.Hit` 在 debuff 期间降低。
- `MagicPearl.as` 已确认 `xhmt` 起手记录 `mp = 100 + 最大MP * 0.02` 但不扣 MP；攻击次数为 `3 + level / 3`，木五行 +2，每轮重新选择离英雄最近的怪物。
- `MagicPearl` 链路已确认 `MagicPearlRun/Back` 飞向目标，`MagicPearlEffect` 在第 3/12/28 帧分别生成 `MagicPearlBullet1/2/3`；三段 bullet 使用 `fabao-pearl` 参数 `[2,-2]`、`magic`、`attackInterval = 2`。
- `BaseMonster.beMagicAttack()` 已确认 `MagicPearlBullet1/2/3` 直接取原始 hurt，不走怪物防御修正；五角色 `getRealPower("fabao-pearl")` 中木五行伤害分支在反编译代码里被默认分支覆盖，现代侧先不擅自加木倍率。
- `MagicPearl` 结束随机效果已记录：回蓝、全怪眩晕或全怪中毒；木五行把等级系数乘 1.5，影响回蓝量、眩晕时长、毒时长和毒伤。
- 更新 `mechanics-index.md` 的 `M-032/M-033/M-043`，并把下一推荐任务切到 `TASK-SLICE-031`。
- 更新 `vertical-slices.md` 的 `VS-013` 后续队列，推荐先做更窄的 MagicFlag，MagicPearl 单独拆后续切片。

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-030

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `jyhl` 九佑魂莲触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 触发后生成等价 `MagicFlower` 的持续效果：基础持续按 `5 + level / 2` 秒计算；木五行仅按 AS3 行为缩短动作边界，不擅自改变持续时间。
- 对当前最小切片内友方目标接入可测试增益：覆盖当前玩家，若宠物已出战则同步记录宠物增益状态；增益作为派生攻击加值/倍率和状态展示，不要求改完整原版全角色伤害公式。
- 对当前最小切片内怪物目标接入可测试减益：覆盖 `Monster30` 的攻击减益，`hit1` 伤害按 `0.925` 派生倍率降低。
- 使用中重复按 H 拒绝重入；效果到期后回 `wait` 并清理友方增益、宠物增益和怪物减益。
- 测试场景能装备/切换 `jyhl`，并能观察友方增益、怪物减益、剩余时间和到期清理反馈。
- 补系统测试覆盖：持续时间公式、木五行动作边界、友方增益、宠物增益、怪物减益、到期清理、重入拒绝、无 `zbfb` 时 H 不触发且不影响普通技能。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/PetSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `jyhl/MagicFlower` active effect，H 触发后按 `5 + level / 2` 秒建立全体增减益，木五行只把动作边界缩短到 450ms。
- `HeroCombatSystem.ts` 新增 `magicFlowerBuff`，记录当前玩家的派生攻击加值和攻击倍率展示。
- `PetSystem.ts` 新增出战宠物 `magicFlowerBuff`，由法宝系统触发和清理。
- `Monster30System.ts` 新增 `magicFlowerDebuff`，使 `Monster30 hit1` 在减益期间按 `0.925` 倍派生伤害。
- `EquipmentSystem.ts` 和 `InventorySystem.ts` 新增 `jyhl` 种子装备，测试场景可通过背包穿戴/切换。
- `TestScene.ts` 状态栏和角色标签补充玩家、宠物、Monster30 的 MagicFlower 状态反馈。
- `tools/system-tests.ts` 覆盖玩家/宠物/怪物状态、持续时间公式、木五行动作边界、重入拒绝、到期清理和 Monster30 攻击减益伤害。
- 更新 `mechanics-index.md`、`vertical-slices.md`，并把当时的下一轮法宝逆向任务写入看板。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-029

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `lxfb` 流邪、`sxfb` 沙邪和 `yxfb` 渊邪触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- `lxfb` 生成等价 `XLFB_BUFF`：基础持续 `7s`，木五行 `10s`，提供小幅攻击/暴击增益并持续扣血。
- `sxfb` 生成等价 `SXFB_BUFF`：基础持续 `7s`，木五行 `11s`，提供中幅攻击/暴击增益并持续扣血。
- `yxfb` 释放时先扣当前生命一半，再生成等价 `YXFB_BUFF2`：基础持续 `8s`，木五行持续翻倍，提供大幅攻击/暴击增益；本切片按 AS3 可确认入口只保留半血消耗，不额外增加持续扣血。
- 增益作为可测试的玩家战斗 buff/派生属性展示接入；不要求本切片把所有普攻/技能伤害公式改成完整原版。
- 使用中重复按 H 拒绝重入；buff 到期后回 `wait` 并清理增益。
- 测试场景能装备/切换 `lxfb/sxfb/yxfb`，并能观察 buff 名称、剩余时间、攻击/暴击增益和扣血反馈。
- 补系统测试覆盖：三种持续时间、木五行加成、渊邪半血消耗、持续扣血、到期清理、重入拒绝、无 `zbfb` 时 H 不触发且不影响普通技能。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `lxfb/sxfb/yxfb` 支持：按 H 进入 `hit` 并创建 `magicDemonBuff` 主动效果；流邪木五行持续 10 秒，沙邪基础持续 7 秒，渊邪木五行持续 16 秒。
- `HeroCombatSystem.ts` 新增法宝入魔 buff 状态，记录 buff 名称、攻击/暴击派生增益和剩余时间；`resetHeroCombat()` 会清理入魔状态。
- `MagicWeaponSystem.ts` 为流邪/沙邪接入持续扣血：流邪每秒扣最大生命 5%，沙邪每秒扣最大生命 5.4%，并保留至少 1 点生命；渊邪释放时先扣当前生命一半。
- `EquipmentSystem.ts`/`InventorySystem.ts` 增补 `lxfb/sxfb/yxfb` 最小法宝定义和测试背包入口。
- `TestScene.ts` 在玩家标签和状态栏展示入魔 buff、剩余时间、攻击/暴击增益和扣血反馈。
- `tools/system-tests.ts` 增加流邪木五行持续和扣血、沙邪持续和扣血、渊邪半血与到期清理测试。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-028

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `zsTimer` 烁时金轮触发分支；装备 `zsTimer` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 第一次按 H 记录当前玩家坐标、HP、MP 和等待剩余时间，并进入等价 `MagicTimer` 的等待状态。
- 等待状态中再次按 H 触发特殊重入例外：销毁等待记录并把玩家坐标、HP、MP 回溯到记录值，然后回到 `wait`。
- 未手动二次触发时，等待记录在基础 `30s` 后失效；木五行等待时间为 `27s`。
- 回溯只处理当前最小切片可验证的玩家坐标、HP、MP 和法宝状态；不实现 tween 动画、真实特效或联机同步。
- 测试场景能装备/切换 `zsTimer`，并能观察记录点、剩余等待时间和回溯反馈。
- 补系统测试覆盖：首次记录、二次 H 回溯、等待过期失效、木五行 27s、普通重入规则不影响其他法宝、无 `zbfb` 时 H 不触发且不影响普通技能。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `zsTimer` 支持：第一次 H 创建 `magicTimer` 记录，保存 HP/MP/坐标和等待时长；等待期间第二次 H 触发特殊重入例外，恢复记录值并回到 `wait`。
- `MagicWeaponSystem.ts` 保留 `zsTimer` 过期逻辑：基础等待 `30s`，木五行 `27s`；等待结束后记录失效并回 `wait`。
- `EquipmentSystem.ts`/`InventorySystem.ts` 增补 `zsTimer` 烁时金轮最小法宝定义和测试背包入口；正式种子装备定义优先于同名掉落占位定义，避免法宝五行被占位覆盖。
- `TestScene.ts` 将当前玩家 movement 传给法宝系统，回溯时直接恢复当前测试场景内坐标。
- `tools/system-tests.ts` 增加首次记录、第二次 H 回溯、木五行 27 秒等待和过期后新记录测试。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-027

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `zjld` 紫金铃铛触发分支；装备 `zjld` 后按 `H` 主动释放，不占普通技能槽或 Space。
- `zjld` 生成等价 `MAGIC_RING_INVINCIBLE` 保护：基础无敌 `2s`，木五行无敌持续 `1.5` 倍。
- 触发时按 `最大生命 * 法宝等级 * 0.00904` 回复 HP，MP 按同倍率的一半回复；木五行回复翻倍。
- 无敌期间 `applyHeroDamage` 或等价玩家受击入口不扣 HP、不进入受击硬直；无敌过期后恢复正常受击。
- 使用中重复按 H 拒绝重入；无敌持续期间动作回 `wait` 后允许再次释放并刷新无敌，这是当前最小切片的明确边界。
- 测试场景能装备/切换 `zjld`，并能观察无敌剩余时间、回复和受击免伤反馈。
- 补系统测试覆盖：HP/MP 回复公式、木五行加成、无敌免伤、过期后正常受击、重入拒绝、无 `zbfb` 时 H 不触发且不影响普通技能。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `zjld` 支持：按 H 进入 `hit`，生成 `magicRing` 主动效果，约 500ms 后回 `wait`；基础无敌 2s，木五行 3s；回复比例按 `level * 0.00904`，木五行翻倍，MP 为同倍率的一半。
- `HeroCombatSystem.ts` 新增法宝无敌状态，`applyHeroDamage()` 在无敌期间直接拒绝扣血和受击硬直；`updateHeroCombat()` 推进无敌剩余时间并过期清理。
- `EquipmentSystem.ts`/`InventorySystem.ts` 增补 `zjld` 紫金铃铛最小法宝定义和测试背包入口。
- `TestScene.ts` 在玩家标签/状态栏显示 `INV` 与 `inv` 剩余时间，方便观察免伤状态。
- `tools/system-tests.ts` 增加普通/木五行回复公式、无敌免伤、无敌过期后正常受击和重入拒绝测试。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-026

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `hyzzs` 混元珍珠伞和 `hywjs` 混元无极伞触发分支；装备对应 `zbfb` 后按 `H` 主动释放，不占普通技能槽或 Space。
- `hyzzs` 生成等价 `MAGIC_UMBRELLA_DEFEND` 护盾：基础盾量 `物防 * 法宝等级`，持续 `10s`，木五行盾量 `1.5` 倍。
- `hywjs` 生成等价 `MAGIC_UMBRELLA_DEFEND2` 护盾：基础盾量 `物防 * 法宝等级 + 魔防 * 法宝等级 * 20`，持续 `10s`，木五行盾量 `2` 倍。
- 护盾在玩家扣 HP 前吸收伤害；伤害超过剩余盾量时只把溢出部分扣到 HP，盾量耗尽或持续时间结束后失效。
- 使用中重复按 H 拒绝重入；护盾动作回到 `wait` 后允许再次释放并刷新护盾，这是当前最小切片的明确边界。
- 测试场景能装备/切换 `hyzzs`/`hywjs`，并能观察护盾剩余量、过期和受击吸收反馈。
- 补系统测试覆盖：盾量公式、木五行加成、受击吸收/溢出扣血、耗尽/过期、重入拒绝、无 `zbfb` 时 H 不触发且不影响普通技能。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `hyzzs/hywjs` 支持：按 H 进入 `hit`，生成 `magicUmbrella` 主动效果，约 500ms 后回 `wait`；`hyzzs` 按防御和等级生成护盾，木五行 1.5 倍；`hywjs` 按防御、魔防、等级生成护盾，木五行 2 倍。
- `HeroCombatSystem.ts` 新增法宝护盾状态，`applyHeroDamage()` 在扣 HP 和进入受击硬直前先吸收伤害；全额吸收时不进入 `hurt`，溢出时只扣溢出伤害。
- `EquipmentSystem.ts`/`InventorySystem.ts` 增补 `hyzzs/hywjs` 最小法宝定义和测试背包入口。
- `TestScene.ts` 将当前装备属性传给法宝系统，并在玩家标签/状态栏显示护盾剩余量和剩余时间。
- `tools/system-tests.ts` 增加珍珠伞木五行盾量、无极伞公式、伤害吸收、溢出扣血、盾量耗尽、10 秒过期和重入拒绝测试。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-025

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `fbqpj` 青萍剑触发分支；装备 `fbqpj` 后按 `H` 主动释放，不占普通技能槽或 Space。
- 主动释放生成 6 个等价 `qpjeffect` 占位 projectile，均按当前最近未死亡怪物锁定目标；释放中重复按 H 拒绝重入。
- 空闲状态每约 `11.225s` 自动生成 1 个等价飞剑 projectile；木五行主动回待机时间按 `MagicQPJ` 记录缩短。
- projectile 命中复用现有 `DamageEvent` 链路，能命中 `Monster30` 或 boss 等价目标。
- 测试场景能装备/切换 `fbqpj`，并能观察主动 6 剑、自动 1 剑和命中反馈。
- 补系统测试覆盖：主动 6 剑、自动 1 剑、最近目标锁定、重入拒绝、无目标边界和 H 法宝入口不影响普通技能。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `fbqpj` 支持：主动 H 进入 `hit` 后生成 6 个 `magicQpj` projectile；空闲约 `11.225s` 时自动生成 1 个 `fabao-qpj1` projectile；两者都复用最近未死亡目标选择。
- `ProjectileSystem.ts` 新增 `magic-weapon-qpj-active` 和 `magic-weapon-qpj-auto` 变体，使用 `qpjeffect`/`magic-weapon.fbqpj.qpjeffect` 占位资源 key，并接入现有 magic 伤害链路。
- `EquipmentSystem.ts`/`InventorySystem.ts` 增补 `fbqpj` 青萍剑最小法宝定义和测试背包入口；`AssetManifest.ts` 记录 `QPJBmd/qpjeffect/qpjeffect_box` 缺失资源映射。
- `TestScene.ts` 继续通过法宝入口和 projectile 视图/命中管线展示 `fbqpj` 主动 6 剑、空闲自动 1 剑及命中反馈。
- `tools/system-tests.ts` 增加主动 6 剑、自动 1 剑、最近目标锁定、重入拒绝和无目标边界测试。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-024

完成定义：

- 在当前 `MagicWeaponSystem` 中扩展 `lxj` 戮仙剑触发分支；装备 `lxj` 后按 `H` 释放，不占普通技能槽或 Space。
- 释放时先产生起手/剑击占位反馈，并锁定最近未死亡怪物，等价 `MagicSword2.releasesword()` 的最近目标选择。
- 对目标产生一次可测试伤害事件或法宝 projectile 命中；命中应复用现有 `DamageEvent`/projectile 或保持同等可测试边界。
- 使用中重复按 H 继续拒绝重入；释放结束后回到 `wait`。
- 测试场景能装备/切换 `lxj`，并能观察法宝剑击命中 `Monster30` 或 boss 等价目标。
- 补系统测试覆盖：最近目标选择、伤害命中、重入拒绝、无目标时正常结束、H 法宝入口不影响普通技能。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- `MagicWeaponSystem.ts` 新增 `lxj` 支持：按 H 进入 `hit`，记录 `MagicSword2_1` 起手，约 1 秒后选择最近未死亡目标并生成剑击。
- `ProjectileSystem.ts` 新增 `magic-weapon-sword2` projectile 变体，使用 `MagicSword2_2`/`magicsword2` 命名、单次命中、magic 伤害和占位资源 key。
- `EquipmentSystem.ts`/`InventorySystem.ts` 增补 `lxj` 戮仙剑最小法宝定义和测试背包入口。
- `TestScene.ts` 将法宝 projectile 接入现有 projectile 视图与命中链路，可命中 `Monster30` 或 boss 等价目标。
- `tools/system-tests.ts` 增加最近目标选择、projectile 生成、重入拒绝、无目标回待机和 projectile 生命周期测试。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-023

完成定义：

- 建立现代 `MagicWeaponSystem` 或等价边界，读取当前 `zbfb` 法宝并暴露 `trigger/update`。
- `H` 触发法宝，不占用 0..4 普通技能槽，也不影响 Space 特殊技；若当前法宝正在 `hit`/使用中，重复触发按原版拒绝重入。
- 支持 `kyl` 枯叶灵：触发后给玩家等价治疗持续效果，基础持续时间按 `MagicLeaf` 的 `8s`，木五行延长 1.5 倍。
- 支持 `syl` 神叶灵：区分为生命+魔法恢复或至少在数据模型中保留 `MAGIC_LEAF_CURE2` 能力边界。
- 测试场景能切换/装备 `kyl` 或 `syl`，显示法宝状态和治疗反馈。
- 补系统测试覆盖：触发成功、重入被拒、木五行持续时间加成、非 `zbfb` 时不触发。

已完成产物：

- `src/systems/MagicWeaponSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneUpdatePipeline.ts`
- `tools/system-tests.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- 新增统一语言 `MagicWeapon` / `MagicWeaponSystem`。
- 新增 `MagicWeaponSystem.ts`，覆盖当前法宝读取、H 键边沿触发、`wait/hit`、治疗持续效果、木五行 1.5 倍持续时间和使用中拒绝重入。
- `EquipmentSystem.ts` 增补 `kyl/xhhl/syl` 的最小法宝定义和 `level/element` 字段；`InventorySystem.ts` 把 `kyl/syl` 加入测试背包，`TestScene` 默认仍装备 `xhhl` 保留宣花葫芦捕捉链路。
- `TestScene.ts` 接入当前装备栏 `zbfb`：`xhhl` 走捕捉，`kyl` 走 HP 恢复，`syl` 走 HP/MP 恢复；状态栏显示当前法宝和剩余时间。
- `tools/system-tests.ts` 新增未装备不触发、`kyl` 治疗与重入拒绝、`syl` MP 恢复和木五行持续时间测试。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-020

完成定义：

- 扫描并记录 `export/magicWeapon/` 中首批法宝类的触发方式、动作生命周期、资源名、消耗、伤害/效果目标和结束条件。
- 梳理 `SutraInterface.as` 中法宝强化/升级入口、消耗资源和与装备 `zbfb` 的关系。
- 明确 `BaseHero.showSkillFaBao()`、`BaseMagicWeapon.useSkill()` 与普通技能槽/Space 特殊技的边界。
- 在 `magic-weapons-index.md` 中给出后续现代实现建议，并拆出可执行后续任务。
- 不写现代 `src/` 实现代码。

已完成产物：

- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

执行记录：

- 已确认 `AllEquipment.initSutraEquipment()` 中 20 个 `zbfb` 法宝定义，以及 `BaseHero.initMagicWeapon()` 中 21 个法宝类映射；`hxyb -> MagicYuban` 是当前装备表外的保留分支。
- 已记录 `H`/小键盘 7 的独立法宝触发位、单机限制、`wait/hit` 生命周期、`MagicTimer` 二次触发回溯例外，以及背包在使用中阻止穿脱 `zbfb`。
- 已记录 `SutraInterface` 的灵魂、龙女的眼泪、昆仑玉、烛时星魄、青萍精元和传承法器五行重置规则。
- 已新增 `TASK-SLICE-023` 作为下一步推荐：枯叶灵/神叶灵治疗法宝最小切片。

### TASK-001

完成定义：

- 找到 AS3 主入口、核心运行时对象和世界更新链路。
- 记录 `BaseObject` 级别的生命周期、更新入口和现代重写建议。
- 标注原代码中不应照搬的低质量结构。

已完成产物：

- `docs/reverse-engineering/runtime-index.md`

### TASK-002

完成定义：

- 建立 Phaser + TypeScript 工程骨架。
- 建立基础 scene、资源 manifest、测试输入显示。
- 文档说明当前脚手架只是技术验证，不代表正式玩法。
- 不执行复杂依赖安装；需要用户手工安装时说明。

已完成产物：

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `src/`
- `docs/reverse-engineering/modern-architecture.md`

### TASK-SETTINGS-001

完成定义：

- 确认原版支持单人和本地双人。
- 确认方向键属于玩家 2。
- 确认 P1/P2 基础键位、技能键和 UI 快捷键。
- 确认 `keyarray = [下, 普攻, 跳跃, 上]`。
- 更新机制表和纵向切片表。

已完成产物：

- `docs/reverse-engineering/controls-index.md`
- `docs/reverse-engineering/gameplay-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`

### TASK-ARCH-001

完成定义：

- 将现代输入系统改成显式双玩家结构。
- P1 默认使用原版 P1 键位，不占用方向键。
- P2 默认使用方向键和数字键区/原版 P2 键位。
- `TestScene` 能同时显示 P1/P2 输入状态，且方向键只影响 P2。

已完成产物：

- `src/systems/InputSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-002A

完成定义：

- 建立 `docs/reverse-engineering/roles-index.md` 初版。
- 列出五个角色的 AS3 类名、显示名或可识别身份。
- 记录每个角色的构造入口、资源/动画前缀线索、`myKeyDown()` 或等价输入入口。
- 汇总每个角色支持的组合键骨架，只记录入口和触发条件，不展开完整技能效果。
- 标注不确定项和需要后续细读的类/方法。

已完成产物：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-002

完成定义：

- 该任务拆为 `TASK-SETTINGS-002A`、`TASK-SETTINGS-002B`、`TASK-SETTINGS-002C` 分阶段执行。
- 子任务覆盖五个角色身份、输入入口、组合键、普攻连段和技能分发。
- `roles-index.md` 能推荐第一个实现角色、第一个普攻动作和第一个技能候选。

已完成产物：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-002B

完成定义：

- 基于 `roles-index.md` 初版继续细读五个角色的 `normalHit()` 或等价普攻入口。
- 记录每个角色普攻连段、触发键、状态切换、冷却/间隔、可作为第一切片的攻击动作。
- 将 `TASK-SETTINGS-002C` 标为可执行或说明仍阻塞的原因。

已完成产物：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-002C

完成定义：

- 基于 `roles-index.md` 继续细读 `showSkill()`、技能槽、技能名、消耗和角色技能入口。
- 记录每个角色至少一个可作为最小战斗切片候选的技能。
- 给后续 `TASK-SLICE` 推荐第一个角色和第一个攻击动作。

已完成产物：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-003

完成定义：

- 读取关卡、地图、`StageListener` 或等价流程入口。
- 建立 `docs/reverse-engineering/levels-index.md` 初版。
- 找到第一个适合现代最小战斗切片的地图或场景。
- 记录进入战斗、刷怪、通关/失败的关键入口。

已完成产物：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-004A

完成定义：

- 建立 `docs/reverse-engineering/monsters-index.md` 初版。
- 记录怪物基础字段、生命周期、AI 更新、受击、死亡、掉落触发入口。
- 记录与 `BaseObject`、碰撞、主循环的关系。

已完成产物：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-004B

完成定义：

- 扫描主参考源码中的怪物候选。
- 选出 3-5 个依赖少、适合作为第一个现代切片怪物的候选。
- 在 `monsters-index.md` 记录候选类名、依赖复杂度、攻击方式、推荐排序。
- 更新本看板，把 `TASK-SETTINGS-004C` 指向最推荐的第一个怪物。

已完成产物：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-004C

完成定义：

- 细读 `Monster30.as`。
- 记录移动、索敌、攻击、碰撞、受击、死亡、掉落或清理入口。
- 给后续最小战斗切片提供怪物侧验收依据。

已完成产物：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-004

完成定义：

- 通过 `TASK-SETTINGS-004A`、`TASK-SETTINGS-004B`、`TASK-SETTINGS-004C` 分阶段完成怪物基础索引。
- 子任务覆盖怪物基类、候选选择和首选怪物 `Monster30` 详细索引。

已完成产物：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-002

完成定义：

- 在现代测试场景中生成一只可见的 `Monster30` 等价怪物，初始 HP 为 150。
- 怪物具备最小 AI：选择玩家目标、向玩家靠近、接近后进入攻击/暂停攻击状态。
- 玩家调试攻击能命中怪物，命中后扣 HP 并显示受击反馈。
- HP 归零后进入死亡状态，死亡延时结束后从显示和更新列表中移除。
- `npm run build` 通过，并同步更新切片表与机制表。

已完成产物：

- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-005

完成定义：

- 逐个确认五个角色普攻动作 `hit*` 是否生成普攻特效、残影、弹体或额外显示对象。
- 建立五角色普攻动作到特效资源、类名和 `BitmapDataPool` 名称的映射。
- 检查现有 `extracted_flash/resources` 是否已有可用 CG/位图资源；若缺失，列出明确缺口和需要用户手工补提取的资源名或符号名。
- 明确 `TASK-SLICE-001` 实现时角色普攻特效的临时占位策略。

已完成产物：

- `docs/reverse-engineering/attack-effects-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-ARCH-002

完成定义：

- 建立 `docs/reverse-engineering/assets-index.md`。
- 记录资源命名、角色/怪物/场景资源线索和现代加载策略。
- 明确现有导出的 CG/位图资源是否足够支持五角色普攻特效；不足时列出需用户手工补提取的资源类型。
- 更新现代 asset manifest 的结构建议；若实现代码，只做加载策略骨架。

已完成产物：

- `docs/reverse-engineering/assets-index.md`
- `src/assets/AssetManifest.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-006

完成定义：

- 细读双击跑步、跳跃、`S+K` 下落和平台穿透判定入口。
- 记录首个移动切片需要的时间窗、速度/状态切换、角色差异、平台类型与不确定项。
- 明确 `VS-003` 是否已经可以进入实现；若仍不够，列出具体缺口而不是笼统写“继续研究”。

已完成产物：

- `docs/reverse-engineering/movement-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`

### TASK-SLICE-003

完成定义：

- 在现代测试场景中生成一个可控的 Role2 等价角色。
- 使用原版 P1 键位实现行走、同向双击跑步、双跳和 `S+K` 下落平台。
- 至少提供一个可验证的普通地面和一个 `ThroughWall` 等价测试平台。
- 输入结构继续保留 P1/P2；本切片可以只生成 P1。
- `npm run build` 通过，并同步更新切片表与机制表。

已完成产物：

- `src/systems/HeroMovementSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`

### TASK-SLICE-001

完成定义：

- 五个角色的普攻作为同一个实现子任务完成，不拆成五个角色任务。
- 每个角色 J 普攻能触发与 `roles-index.md` 一致的普攻动作、连段、冷却和状态切换。
- 每个角色普攻都有可见特效；缺原始资源时使用文档认可的临时占位，并保留缺资源清单。
- 攻击窗口可调试显示，后续可接入怪物受击。
- `npm run build` 通过，并同步更新切片表与机制表。

已完成产物：

- `src/systems/HeroNormalAttackSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`

### TASK-SETTINGS-007

完成定义：

- 建立 `combat-rules-index.md`，记录玩家攻击怪物、怪物攻击玩家的 AS3 调用链和关键字段。
- 明确 `BaseBullet.checkAttack()`、`beMagicAttack()`、`beAttackIdArray`、`setAttackBack()`、`beAttackDoing()` 等入口在首个互伤切片中的取舍。
- 给出 `VS-006` 所需的最小现代实现边界：伤害事件、命中去重、受击反馈、死亡/保护或硬直的首批规则。
- 如果某个细节仍需后续任务，必须写成明确缺口，不能只写“继续研究”。
- `npm run check:workflow` 通过，并同步更新切片表与机制表。

已完成产物：

- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-004

完成定义：

- 在现代测试场景中为玩家加入可观察 HP、受击状态、短保护或等价命中去重。
- 玩家普攻命中 `Monster30` 时走统一伤害事件或等价结算路径，不再只是临时直接扣血。
- `Monster30 hit1` 生成占位攻击窗口，命中玩家时造成 `power = 15` 的物理伤害、触发受击反馈和可观察 HP 变化。
- 玩家和怪物死亡状态都可观察；首批不接复活/失败 UI。
- 命中去重避免同一攻击实例同一帧或短时间内重复扣同一目标。
- `npm run build` 通过，并同步更新切片表、机制表和任务历史。

已完成产物：

- `src/systems/CombatSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/HeroNormalAttackSystem.ts`
- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-008

完成定义：

- 建立 `projectiles-index.md`，记录 `BaseBullet` 生命周期、来源绑定、目标选择、命中检测、命中去重和 `attackInterval` 重复命中规则。
- 细扒 `Role2.sgq -> hit5` 的技能入口、动作、`SpecialEffectBullet("Role2Bullet5")` 创建点和攻击参数。
- 明确 `VS-008` 首个技能/子弹切片的现代实现边界：固定位置 projectile、`DamageEvent` 复用、16 帧命中周期和真实资源缺口。
- 同步更新 `mechanics-index.md`、`vertical-slices.md` 和 `task-board.md`，把下一步推荐切到首个实现切片。
- `npm run check:workflow` 通过。

已完成产物：

- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-005

完成定义：

- 用现代系统实现一个 `Role2.sgq -> hit5` 等价调试释放入口，不接正式技能 UI。
- 创建 `skill-projectile.role2.sgq.hit5` 占位特效，生成点约为角色前方 175、上方 110。
- projectile 生命周期独立于一帧 hitbox，并在结束、来源受击/死亡或场景清理时释放。
- projectile 命中 `Monster30` 时通过 `DamageEvent` 结算，标记 `attackKind = magic`、击退 `[5,-2]`。
- 支持 `hitIntervalFrames = 16` 的重复命中去重：同一命中周期同一目标只结算一次，下一周期可再次结算。
- `npm run build` 与 `npm run check:workflow` 通过，并同步更新切片表、机制表和任务历史。

已完成产物：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-009

完成定义：

- 定位并记录 `Role2Bullet5` 与 `Role2_hit5` 在当前导出资源中的状态；若不存在，写明已查证范围和缺口原因。
- 从 `export/bullet/` 与已导出资源中补一批下一步有价值的弹体/技能飞行物映射，至少包含类名、资源名、运动类型、来源动作或使用方、首批是否适合实现。
- 更新 `assets-index.md` 中技能 projectile 资源族的真实资源/缺失状态，使后续资源接入任务不用重新翻查同一批目录。
- 更新 `mechanics-index.md` 的 `M-034`、`M-035` 逆向/复现状态和下一步建议。
- 归档本任务并推荐下一个可执行任务。

已完成产物：

- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-006

完成定义：

- 在现代测试场景中为 Role2 等价角色增加一个可调试释放的第二技能入口，对应原版 `skill_smb()` 的第一段 `hit4_1`。
- 实现 `EnemyMoveBullet("Role2Bullet4_1")` 的首批等价行为：按角色朝向以水平速度约 `10` 移动，距离上限按原版 `9999` 处理为足够长的生命周期，使用 `hit4` 攻击参数。
- 生成 projectile 时保留原版关键差异：素材来源名是 `Role2Bullet4_1`，但实例名/兼容标记为 `Role1Bullet4_1`，以便后续二段 `hit4_2` 查找。
- projectile 命中 `Monster30` 时通过现有 `DamageEvent` 结算，标记 `attackKind = magic`，击退 `[0,-3]`，并按现有命中去重规则避免同一攻击周期重复扣血。
- 在 `AssetManifest.ts` 登记稳定占位 key `skill-projectile.role2.smb.hit4_1`，状态标为缺真资源或占位。
- 更新 `vertical-slices.md` 与 `mechanics-index.md` 的复现状态和下一步建议。

已完成产物：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-007

完成定义：

- 在现代测试场景中支持 `Role2.smb` 二段调试释放：第一段 `hit4_1` projectile 存在时，再按对应技能键可触发 `hit4_2`，而不是重新生成第一段。
- `ProjectileSystem` 为 `hit4_1` 保留可供二段读取的位置，等价于 AS3 中查找运行时名 `Role1Bullet4_1` 并写入 `hit4_2Point`。
- 二段生成 `SpecialEffectBullet("Role2Bullet4_2")` 的占位 projectile，位置以第一段记录点为基准，纵向上移约 `320`，横向按朝向偏移约 `50`，使用 `hit4` 攻击参数和当前 `DamageEvent`/命中去重模型。
- 在 `AssetManifest.ts` 登记稳定占位 key `skill-projectile.role2.smb.hit4_2`。
- 更新 `vertical-slices.md` 与 `mechanics-index.md` 的复现状态和下一步建议。

已完成产物：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-010

完成定义：

- 建立正式技能输入索引，说明 `KeyBoardControl` 如何把 P1/P2 技能键映射到 `BaseHero.sendSkill(index)` 与 `showSkill(key)`。
- 记录 `User.skillbykey`、`returnSkillNameBySkillKey()`、技能学习/绑定 UI 的最小字段和边界，明确调试释放如何过渡到正式技能槽。
- 记录 MP 消耗、技能重入门禁、冷却或可再次触发的依据；若原版没有统一冷却模型，要按角色/技能写明证据。
- 明确 `Role2.sgq` 与 `Role2.smb` 在正式输入中的技能槽、MP、重入规则，以及现代实现下一步最小改造范围。
- 更新 `M-015`、`M-016`、`M-025`、`M-041` 和 `VS-008` 的状态或下一步。

已完成产物：

- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-008

完成定义：

- 为测试场景中的 Role2 等价角色建立最小正式技能 loadout：槽 0 绑定 `sgq`，槽 1 绑定 `smb`，槽 2..4 为空。
- 技能释放必须从双玩家输入的普通技能槽 `0..4` 进入；Space/小键盘 0 与 H/小键盘 7 不接普通技能。
- `sgq` 只有在绑定、MP 足够、未攻击且未受击时释放；成功释放扣 MP 并复用现有 `hit5` projectile。
- `smb` 第一段只有在绑定、MP 足够、站立/落地条件满足、未受击且不处于其他攻击时释放；成功释放扣 MP 并复用现有 `hit4_1` projectile。
- `smb` 在 `hit4_1` 内再次按同一绑定槽时，如第一段 projectile 仍活跃且未触发二段，应释放 `hit4_2` 且不再次扣 MP。
- 空槽、MP 不足、受击、死亡或不允许的攻击状态下按技能键无效果。
- 更新 `M-015`、`M-025`、`M-041` 与 `VS-008` 的复现状态或下一步。

已完成产物：

- `src/systems/HeroSkillSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

### TASK-SETTINGS-011

完成定义：

- 确认技能学习 UI 如何写入 `User.isstudyskill`、`User.skillbykey`、技能等级和绑定键。
- 确认拖拽绑定 UI 如何替换五个普通技能槽，并记录 P1/P2 显示键与实际键值转换。
- 确认 `GameInfo` 技能相关快捷键、按钮派发和战斗输入屏蔽边界。
- 从存档相关源码中定位技能学习、技能槽绑定、MP 或角色属性的持久化字段；若字段仍不够，列出明确缺口。
- 给后续实现任务写清楚最小现代数据模型建议，但不实现 UI 或存档代码。

已完成产物：

- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

### TASK-SLICE-009

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-016` UI 快捷键
- `M-041` 技能学习/绑定
- `VS-008` 一个技能/子弹（扩展 UI 侧）

完成定义：

- 实现五槽技能 UI 可视化（显示绑定技能和键位标签）。
- 实现可配置 loadout：按键轮换切换槽位绑定。
- 保留 V 键打开技能面板的快捷键（占住键位，不实现完整 SkillControl UI）。
- 技能 UI 刷新与 `HeroSkillSystem` 的 loadout 保持同步。

已完成产物：

- `src/systems/SkillUISystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SETTINGS-012

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-026` 关卡类命名
- `M-027` 地图标记
- `M-028` 第一个关卡
- `VS-007` 第一个关卡闭环

完成定义：

- 确认 `1-1` boss 区（Monster3）的 SWF 时间轴对象位置、传送门显示条件和碰撞区域。
- 确认地图背景资源在 `extracted_flash/` 中的实际路径或标记为缺口。
- 标记 `1-1` 实现的最小数据需求（出生点、平台标记、刷怪触发、通关条件）。

已完成产物：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-011

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-014` 上/交互/通关
- `M-028` 第一个关卡
- `M-030` 怪物系统
- `VS-007` 第一个关卡闭环

完成定义：

- 实现 Monster3 boss 行为：追踪最近玩家、hit1 普攻（power=40 physics）、hit2 技能（power=18 magic，CD 2s/4s，距离 < 200 触发）。
- 实现 boss 区触发：玩家到达触发区 → boss 激活。
- 实现传送门通关：boss HP 归零 → 传送门可见 → 玩家碰撞 + 按上 → 显示通关。
- 使用手工作标和占位图形，不等待真实 SWF 场景资源。

已完成产物：

- `src/systems/Monster3System.ts`
- `src/systems/LevelSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

### TASK-SLICE-010

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-041` 技能学习/绑定
- `M-016` UI 快捷键
- `VS-008` 一个技能/子弹

完成定义：

- 实现心法树 UI 面板（5 角色 × 2 心法树 × 5 技能，共 50 技能完整配置）。
- 实现技能学习流程（心法树解锁机制、技能上限 10、自动分配空槽绑定）。
- 实现技能升级流程（双消耗公式：特殊技能上限 9 级/普通 18 级、角色等级门禁、灵魂消耗）。
- 实现键盘驱动绑定交互（五槽分配、面板选技绑定，等价于拖拽操作）。
- 实现被动技能五槽 UI（等级上限 floor(heroLevel/5)、消耗公式）。

已完成产物：

- `src/systems/SkillUISystem.ts` — 完整数据模型和逻辑：50 技能联合类型、5 角色心法树配置、技能学习/升级/绑定/被动技能状态管理与函数、面板 UI 状态类型。
- `src/systems/HeroSkillSystem.ts` — `SkillName` 类型扩展为全 50 技能联合类型；未实现技能返回 "not implemented" 结果。
- `src/scenes/TestScene.ts` — 心法树面板 overlay（460×470）、键盘驱动交互（Tab 切树/1-5 选技/B 绑定/U 升级/L 学习/G 升树/P 被动）、双玩家独立技能学习状态。
- `docs/reverse-engineering/mechanics-index.md` — 更新 M-041、M-016 复现状态。
- `docs/tasks/vertical-slices.md` — 更新 VS-008 实现记录。

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SLICE-012

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-027` 地图标记（停点、刷怪点）
- `M-028` 第一个关卡
- `VS-007` 第一个关卡闭环

完成定义：

- 实现纵向爬升（镜头跟随玩家上移、云层/背景视差）。
- 实现周期刷怪（单人每 6s 刷 2 只 Monster30、双人 4 只）。
- 实现停点系统（到达停点暂停刷怪、清完当前波次后解锁继续上移）。
- 保留 boss 区触发和通关闭环（VS-007 现有功能）。

已完成产物：

- `src/systems/LevelSystem.ts`（扩展）
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-013

完成时间：

- 2026-05-23

完成内容：

- 细读 `AllEquipment.as`、`MyEquipObj.as`、`User.as`、`BackPack.as`、`BackPackElement.as`、`PackThings.as`、`Config.as` 和 `BaseRoleProperies.as`，建立 `docs/reverse-engineering/equipment-index.md`。
- 确认装备/物品统一由 `MyEquipObj` 表示，核心 id 是 `fillName`，类型包括 `zbwq/zbfj/zbsp/zbfb/zbsz/zbcb/zbtx/zbwp/wpqhs`。
- 确认背包四分类：`zblist` 装备、`djlist` 道具、`szlist` 时装、`jnslist` 技能书；已穿戴装备单独存入 `curarray`。
- 确认背包 UI 每类 5 页、每页 25 格；代码未发现超过 125 格后的硬性阻止，只是 UI 不显示超出部分。
- 确认穿戴/卸下链路：从背包列表移除，替换旧槽位，更新 `curarray`，通过 `BaseRoleProperies.addEquip/removeEquip` 增减属性，并刷新外观和面板。
- 确认堆叠物品由 `Config.putQhsInBackPack()` / `putQHsInArray()` 按 `fillName` 合并数量；技能书按 `fillName` 包含 `jns` 进入 `jnslist`。
- 确认装备/背包存档字段：`bagSaveString`、`curSaveString`、`bagdjSaveString`、`bagszSaveString`、`bagjnsSaveString`、`isshowfashion`。
- 标记任务定义中的 xlsx 资料表当前不在项目根目录，本轮未使用表格资料。
- 将 `M-036/M-037` 推进到已扒，`VS-010` 推进到可开始，并新增后续 Ready 任务 `TASK-SLICE-013`。

更新文件：

- `docs/reverse-engineering/equipment-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-ARCH-003

完成时间：

- 2026-05-30

完成内容：

- 新增 `src/scenes/test-scene/TestSceneViews.ts`，把 `TestScene.ts` 中的纯 Phaser 显示对象工厂拆出到独立 helper。
- 已抽出 `Monster30` 视图、`Monster3` boss 视图、传送门视图、宠物视图、掉落物视图、普攻特效、projectile 特效、命中闪框和 boss 区静态装饰。
- `TestScene.ts` 继续保留玩法状态、系统调用、碰撞判定和调试输入；本轮不改变任何玩法规则、数值、键位或系统数据模型。
- `TestScene.ts` 从巨型场景类中移出第一批视图创建细节，为后续拆系统调度层和薄 `GameContext` 留出边界。
- 在 `task-board.md` 新增后续 `TASK-ARCH-004`，下一步聚焦 update 调度层，不直接做完整 EntityManager。

更新文件：

- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneViews.ts`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。

### TASK-ARCH-004

完成时间：

- 2026-05-30

完成内容：

- 新增 `src/scenes/test-scene/TestSceneUpdatePipeline.ts`，把 `TestScene.update()` 的每帧调度顺序移出场景类。
- `TestScene.ts` 新增惰性 `updatePipeline`，只负责读取当前输入、记录上一帧相机位置，并调用 pipeline。
- 将原本内联在 `update()` 中的技能面板刷新整理为 `updateSkillPanels()`，由 pipeline 统一调度。
- 调度顺序保持原样：输入/角色/宠物/法宝捕捉/projectile/怪物/掉落/爬升/视图/UI/status/lastInput 的先后关系未改变。
- 本轮不引入完整 `EntityManager`，不改变玩法规则、键位、数值、系统数据模型或 Phaser 显示对象归属。
- 在 `task-board.md` 新增后续 `TASK-ARCH-005`，下一步聚焦薄 `GameContext` 与首批实体查询接口。

更新文件：

- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneUpdatePipeline.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。

### TASK-ARCH-005

完成时间：

- 2026-05-30

完成内容：

- 新增 `src/core/GameContext.ts`，建立薄运行时上下文和 `findPlayerBySlot()` 查询函数。
- `GameContext` 采用 getter 形式引用当前运行时集合，避免数组替换后引用陈旧；首批覆盖玩家、`Monster30`、boss arena、projectile system、drop system、pet roster 和可捕捉目标集合。
- `TestScene.ts` 新增 `gameContext`、`getPlayer()`、`getPlayers()`、`getMonster30s()`、`getBossArena()`、`getProjectileSystem()`、`getDropSystem()`、`getPetRoster()`、`getCapturablePetTargets()` 等查询入口。
- 将技能栏/技能面板/status 文本、部分 boss 命中与可视化读取改为通过上下文查询，减少直接散数组访问。
- 更新统一语言表，新增 `GameContext` 作为 Runtime 上下文中的查询外壳，明确不承载玩法规则或完整 ECS 生命周期。
- 本轮不改变玩法规则、键位、数值、系统数据模型、Phaser 显示对象归属或怪物/掉落/宠物生命周期。
- 在 `task-board.md` 新增后续 `TASK-ARCH-006`，下一步拆 TestScene 碰撞/命中桥接 helper。

更新文件：

- `src/core/GameContext.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。

### TASK-ARCH-006

完成时间：

- 2026-05-30

完成内容：

- 新增 `src/scenes/test-scene/TestSceneCombatBridge.ts`，把首批 Phaser Rectangle 碰撞判定和 `DamageEvent` 桥接从 `TestScene.ts` 中移出。
- 已抽出玩家普攻命中 `Monster30` 的桥接：读取普攻 hitbox、判定 `Monster30` 受击框、按 `HitRegistry` 去重、创建伤害事件、调用 `applyMonster30Hit()`，并返回 aura 归属目标。
- 已抽出 `Monster30` 命中玩家的桥接：读取怪物攻击 hitbox、判定玩家受击框、记录攻击可视化 flash 边界、按 `HitRegistry` 去重、创建伤害事件、调用 `applyHeroDamage()`。
- `TestScene.ts` 保留场景职责：接收桥接结果，更新 `lastDamageEvent`、显示命中闪框、记录 `monster30AuraTargets`。
- 暂不迁移 boss/projectile 命中路径，避免一次牵动过多战斗路径；后续可在同一 helper 中继续扩展。
- 本轮不改变伤害数值、命中去重、击退、死亡、调试可视化、系统数据模型或 Phaser 显示对象归属。
- 在 `task-board.md` 新增后续 `TASK-ARCH-007`，下一步拆调试输入与 UI 面板桥接 helper。

更新文件：

- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneCombatBridge.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。

### TASK-ARCH-007

完成时间：

- 2026-05-30

完成内容：

- 新增 `src/scenes/test-scene/TestSceneDebugKeys.ts`，把 `TestScene.ts` 中第一批调试键创建与 `JustDown` 判定移出场景类。
- 已覆盖药品调试键 `6/7/8`、aura 调试键 `R/F`、强化石调试键 `C`、配置化掉落调试键 `N/M/,/F9/F10/F11/F12`。
- `TestScene.ts` 只保留具体调试行为：在 P1 附近生成药品、aura、强化石或配置化掉落，并继续使用原有掉落/背包反馈。
- 本轮不改变键位、调试入口语义、面板行为、UI 系统数据模型、掉落系统数据模型或 Phaser 显示对象归属。
- 第一阶段 `TestScene` 重构收束：已完成视图工厂、update 调度层、薄 `GameContext`、首批命中桥接和首批调试键桥接拆分。后续推荐回到 `TASK-SETTINGS-020` 法宝系统基础逆向。

更新文件：

- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneDebugKeys.ts`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。

### TASK-SLICE-021

完成时间：

- 2026-05-30

完成内容：

- 在 `src/systems/PetSystem.ts` 扩展宣花葫芦捕捉最小模型：`MagicBottleCaptureModel`、`CapturablePetTarget`、`Monster70-78` 到宠物名/概率映射、`catchNewPet()`、H 键触发、捕捉特效生命周期和命中结算。
- 捕捉逻辑按 `pets-index.md`/`magic-weapons-index.md` 边界实现：灵魂 `< 5000` 拒绝；命中可捕捉怪后扣除 `5000` 灵魂；成功入 `PetSystem` 宠物列表并移除怪物；失败或满栏保留怪物；不生成 `cwzb` 掉落，不进入背包。
- `src/scenes/TestScene.ts` 新增 P1 默认 `xhhl` 等价入口、`MagicBottleEffect3` 占位捕捉范围、一只 `Monster72 -> monkey1` 等价可捕捉目标，以及状态栏中的灵魂/捕捉反馈。
- `src/systems/EquipmentSystem.ts` 增补 `xhhl` 宣花葫芦最小装备定义，保留 `zbfb`/法宝语义；完整法宝 UI、强化和其他法宝后置。
- `tools/system-tests.ts` 补充灵魂不足、成功入列表、失败保留怪物、满栏不入列表和 H 法宝入口不影响普通技能槽的自动化测试。
- 更新 `mechanics-index.md`：`M-042` 记录宠物捕捉最小链路已复现，`M-043` 推进为宣花葫芦入口部分复现。
- 更新 `vertical-slices.md`：`VS-012` 从宠物面板/跟随扩展为宠物面板、出战跟随和宣花葫芦捕捉切片。
- 从 `task-board.md` 移除已完成任务；新增并推荐 `TASK-SLICE-022` 作为下一步，用于实现宠物道具消耗最小切片。

更新文件：

- `src/systems/PetSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-022

完成时间：

- 2026-05-30

完成内容：

- 在 `docs/domain/glossary.md` 新增统一语言 `PetConsumable`，用于描述道具背包中对当前出战宠物生效的普通道具效果。
- 在 `src/systems/PetSystem.ts` 新增宠物道具效果入口：`wpcsd` 使当前出战宠物寿命 `+20` 且夹到 `100`，`wphhd` 恢复当前出战宠物 HP/MP 并保证寿命至少为 `1`，`djyys` 为当前出战宠物增加 `30000` 经验。
- 在 `src/systems/InventorySystem.ts` 新增堆叠道具消耗函数，并在测试背包中加入 `wpcsd/wphhd/djyys`。
- 在 `src/systems/EquipmentSystem.ts` 增补三种宠物道具的最小 `EquipmentDefinition`，保留 `zbwp/fillName` 边界。
- 在 `src/scenes/TestScene.ts` 接入背包道具页使用流程：选中宠物道具后按 `Enter` 生效并扣减数量；没有当前出战宠物时不消耗并反馈。
- `tools/system-tests.ts` 补充成功消耗、无出战宠物不消耗、寿命上限、还魂丹状态恢复和经验石反馈测试。
- 更新 `mechanics-index.md` 和 `vertical-slices.md`：`M-042/VS-012` 记录宠物道具消耗最小切片已复现。
- 从 `task-board.md` 移除已完成任务；新增并推荐 `TASK-SETTINGS-020` 作为下一步，用于完整法宝系统基础逆向。

更新文件：

- `docs/domain/glossary.md`
- `src/systems/PetSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-013

完成时间：

- 2026-05-24

完成内容：

- 新增 `src/systems/EquipmentSystem.ts`，建立 `EquipmentDefinition`、`EquipmentInstance`、`EquipmentLoadout`、装备类型到槽位映射、角色限制、穿戴/卸下和属性汇总/预览。
- 新增 `src/systems/InventorySystem.ts`，建立四分类 `InventoryStore`，支持装备实例、可堆叠物品、分类容量、旧装备退回背包和按 `fillName` 堆叠。
- 新增 `src/systems/EquipmentUISystem.ts`，管理背包面板状态、分类切换、物品/槽位焦点、穿脱命令和属性预览文本。
- 更新 `src/scenes/TestScene.ts`，为 P1 接入最小背包面板：`B` 开关，`Tab` 切分类，方向键选择/切焦点，`Enter` 穿戴或卸下，`Backspace/Delete` 卸下当前槽位。
- 种子物品覆盖装备、道具、时装和技能书四类：`ptdcz`、`ptdjs`、`mysz`、`xhz`、`ptnmwsz`、`sms1`、`smbjns2`。
- 穿戴/卸下后同步 P1 HP/MP 上限，并在面板显示当前属性和选中装备的预览变化。
- 严格排除掉落、拾取、合成、强化、仓库、赠送、商城、完整法宝效果、真实资源替换和存档。
- 将 `M-036/M-037` 推进到已复现，`VS-010` 推进到已完成，并把下一任务推荐为 `TASK-SETTINGS-014`。

更新文件：

- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/systems/EquipmentUISystem.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-014

完成时间：

- 2026-05-24

完成内容：

- 细读 `BaseMonster.dropAura()/fallEquip()/fallStone()/addMedicine()`、`FallEquipObj.as`、`Config.putQhsInBackPack()`、`User` 背包查询/时装掉率加成，以及 `Monster3/Monster7/Monster30` 的首批掉落表形状。
- 新建 `docs/reverse-engineering/drops-index.md`，记录怪物死亡后的掉落入口、掉率修正、动态权重选择、地面掉落物创建位置、拾取入包路径、容量限制和首个 `VS-009` 边界。
- 确认 `FallEquipObj` 与背包分类关系：`zb -> zblist`，`dj -> Config.putQhsInBackPack()` 后进入 `djlist/jnslist`，`sz -> szlist`。
- 记录拾取判定疑点：药品 `SmallHP` 有明确碰撞判定，但 `FallEquipObj.colwho()` 未看到显式 `hitTestObject()`；现代 `VS-009` 应采用明确可验收的拾取判定。
- 将 `M-038` 逆向状态推进为已扒，`VS-009` 推进为可开始，并新增后续 Ready 任务 `TASK-SLICE-014`。

更新文件：

- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-014

完成时间：

- 2026-05-24

完成内容：

- 新增 `src/systems/DropSystem.ts`，建立最小 `WorldDrop`、`DropSystemModel`、`Monster30DropEntries` 和拾取结果模型。
- `Monster30` 死亡生命周期走到 `removed` 时，在怪物 `y - 100` 附近生成两个可见地面物：装备 `ptdcz`（`bigType = "zb"`）和道具 `sms1`（`bigType = "dj"`）。
- 掉落会向下落到当前平台表面；P1 进入明确拾取范围后自动拾取。
- 装备拾取后作为独立实例进入装备背包；`sms1` 拾取后与现有同名道具堆叠。
- 背包分类容量不足时拾取失败，地面物保留，并在状态栏/背包 UI 消息中显示失败原因。
- 成功拾取后地面物向上淡出并显示拾取反馈；状态栏显示当前地面掉落和最近拾取消息。
- 修正 `InventorySystem.ts` 中 `addEquipmentByFillName()` 与 `addStackByFillName()` 的容量失败返回值，避免满包时误判为拾取成功。
- 将 `M-038` 复现状态推进到已复现，`VS-009` 推进到已完成；新增后续 Ready 任务 `TASK-SETTINGS-015`，只逆向药品、aura、强化石和完整怪物掉落表边界。

更新文件：

- `src/systems/DropSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-015

完成时间：

- 2026-05-24

完成内容：

- 细读 `BaseMonster.addMedicine()/dropAura()/fallStone()`、`SmallHP.as`、`BigHP.as`、`SmallMP.as`、`BaseAura.as`、`auraRed.as`、`auraWhile.as`，补齐药品、aura 和强化石的生成、拾取/收集、效果和后续实现边界。
- 在 `drops-index.md` 中确认药品是独立即时恢复对象，不入背包：`SmallHP` 恢复最大 HP 25%，`BigHP` 恢复最大 HP 50%，`SmallMP` 恢复最大 MP 25%；当前主包未发现 `BigMP`。
- 确认 aura 在 `curStage == 98` 仍会生成：红色 aura 按 `gxp * 2` 派发收益，白色 aura 固定 `power = 5`，两者都吸附到击杀者并触发 `AuraEvent`。
- 确认 `fallStone()` 生成 `wpqhs1` 的 `FallEquipObj` 并走 `dj` 入包路径，但主源码扫描未发现调用点，后续不能默认挂到所有怪物死亡。
- 扫描并落表 `Monster3`、`Monster7` 至 `Monster30` 的 `probability/fallList`，明确哪些字段足够支撑现代掉落配置，哪些仍需 xlsx 或原版实测。
- 将看板下一推荐任务切到 `TASK-SLICE-015`：只实现药品掉落和即时恢复最小切片，不混入 aura、强化石或完整怪物掉落表。

更新文件：

- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-015

完成时间：

- 2026-05-24

完成内容：

- 扩展 `src/systems/DropSystem.ts`，把 `WorldDrop` 拆成装备/道具 `item` 与药品 `medicine` 两条类型化路径，避免药品误走背包入包逻辑。
- 新增 `SmallHP`、`BigHP`、`SmallMP` 三类药品定义：分别恢复最大 HP 25%、最大 HP 50%、最大 MP 25%。
- 实现 `BaseMonster.addMedicine()` 等价概率函数：怪物死亡时会尝试生成三类药品之一。
- 药品使用明确拾取范围；P1 碰撞拾取后即时修改 `HeroCombatModel.hp` 或 `HeroSkillModel.mp`，并显示最近拾取反馈。
- 药品拾取成功后向上淡出并移除；未拾取药品按约 60 秒有效期清理。
- `src/scenes/TestScene.ts` 保留已完成的装备/道具掉落，同时接入药品死亡掉落；数字键 `6/7/8` 可直接生成 `SmallHP/BigHP/SmallMP` 作为测试入口，便于验证三类恢复效果。
- 更新 `M-038` 与 `VS-009` 说明，并把下一推荐任务切到 `TASK-SLICE-016`：只做 aura 收集反馈最小切片。

更新文件：

- `src/systems/DropSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-016

完成时间：

- 2026-05-27

完成内容：

- 扩展 `src/systems/DropSystem.ts`，把 `WorldDrop` 增加为装备/道具 `item`、药品 `medicine`、aura `aura` 三条类型化路径。
- 实现 `BaseMonster.dropAura()` 等价红/白 aura 生成：红色 aura 生成 2 至 4 个，`power = gxp * 2`；白色 aura 按 `< 0.04 / < 0.08 / < 0.12` 生成 3/2/1 个，固定 `power = 5`。
- 实现 `BaseAura.step()` 等价节奏：短暂停留、上浮约 30 至 50 像素、加速吸附目标，收集距离约 10 像素，未收集约 15 秒清理。
- `src/scenes/TestScene.ts` 在 `Monster30` 死亡移除时生成 aura，目标优先使用最后命中者，缺省回退 P1 等价目标。
- 测试场景状态栏显示当前 aura、累计红色 `gxp` 收益、累计白色 `power` 收益和最近收集反馈；`R/F` 可直接生成红/白 aura 作为调试入口。
- 保留边界：不实现经验/成长完整系统，不实现强化石、完整怪物掉落表、合成、商城或存档。
- 将看板下一推荐任务切到 `TASK-SLICE-017`：只实现强化石掉落/入包最小切片，不做强化 UI 或强化数值。

更新文件：

- `src/systems/DropSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-017

完成时间：

- 2026-05-27

完成内容：

- 在 `src/systems/EquipmentSystem.ts` 中新增 `wpqhs1` 最小道具定义：`1级强化石`，类型为 `zbwp`，按道具背包可堆叠物处理；强化效果后置。
- 在 `src/systems/DropSystem.ts` 中新增 `StrengthStoneDropEntry` 和 `spawnStrengthStoneDrop()`，固定生成 `wpqhs1` / `dj` / `quantity = 1` 的地面掉落。
- `src/scenes/TestScene.ts` 新增明确测试入口：按 `C` 在 P1 附近生成强化石地面物；拾取后复用现有 `pickupWorldDrop()` 和 `addStackByFillName()` 进入道具背包或堆叠。
- 强化石使用独立紫色占位显示；拾取成功、背包容量不足和缺定义均沿用现有掉落反馈。
- 保留原版边界：`fallStone()` 是独立入口，主源码未发现调用点，因此现代侧不默认挂到所有怪物死亡流程。
- 将看板下一推荐任务切到 `TASK-SLICE-018`：首批怪物掉落表配置雏形。

更新文件：

- `src/systems/DropSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-018

完成时间：

- 2026-05-27

完成内容：

- 在 `src/systems/DropSystem.ts` 中新增 `MonsterDropTables`、`MonsterDropId`、`MonsterDropContext`、分支条件、掉率解析和 `spawnConfiguredMonsterDrop()`。
- 首批配置覆盖 `Monster3`、`Monster7` 至 `Monster30` 已在 `drops-index.md` 落表的 `probability/fallList`；`Monster3` 支持 1-1 boss/普通分支，`Monster9/10/17/18/19` 支持 `curStage == 9` 条件分支。
- `probability <= 0` 或空 `fallList` 的配置不会生成装备/道具掉落；`Monster30` 死亡流程改为走配置入口，因此只保留药品/aura，不再用旧固定装备/道具表。
- `src/scenes/TestScene.ts` 新增明确测试入口：`N` 生成 `Monster3` boss 分支候选，`M` 生成 `Monster7` 普通分支候选，`,` 生成 `Monster29` 的 `wpqhs1` 分支；地面物复用现有拾取、入包和背包满反馈。
- `src/systems/EquipmentSystem.ts` 补首批掉落表所需的最小占位定义，只保证拾取入包可验证；完整中文名、属性、合成和强化关系后置。
- `tools/system-tests.ts` 新增掉落表分支和负掉率/空表不掉落的系统测试。
- 看板移除 `TASK-SLICE-018`，并新增后续 Ready 任务 `TASK-SETTINGS-016`：全怪物掉落表逆向扫描。

更新文件：

- `src/systems/DropSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-016

完成时间：

- 2026-05-27

完成内容：

- 系统扫描 `extracted_flash/scripts/172845/scripts/export/monster/Monster*.as`，范围共 146 个文件。
- 在 `docs/reverse-engineering/drops-index.md` 中新增“全 `Monster*.as` 掉落表扫描”章节；除已覆盖的 `Monster3..30` 外，补齐 118 条怪物/辅助对象扫描结果。
- 记录每个新增怪物构造函数中的 `protectedParamsObject.probability`、`fallList`、`isBoss` 和明显条件分支；同时标注继承 `BaseMonster` 默认 `probability = 0.15` 的情况。
- 明确 `fallList` 空、无有效候选、`probability = 0/-1` 时不产生装备/道具掉落；死亡仍可能走药品和 aura 逻辑。
- 发现全表中 `bigtype` 只有 `dj/zb/cwzb` 三类；`cwzb` 只在 `Monster2001` 的 `p_cykljl` 中出现，`FallEquipObj.colwho()` 未处理该类型，入包路径需后续逆向。
- 记录特殊边界：`Monster128` 平均等级分支、`Monster172` `curStage != 4` / `curStage == 4` 分支、`Monster136` 多次赋值最终覆盖、`Monster11111` 的 `fallList = [{}]` 空对象、`MonsterRole4Hit5` 非标准构造函数文件。
- 将看板下一推荐任务切到 `TASK-SLICE-019`：全怪物掉落表现代配置扩展。

更新文件：

- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-019

完成时间：

- 2026-05-28

完成内容：

- 将 `drops-index.md` 全 `Monster*.as` 扫描中已确认的 `dj/zb` 候选扩展到 `src/systems/DropSystem.ts` 的 `MonsterDropTables`，覆盖全表现代掉落配置。
- 扩展掉落上下文与分支条件，支持 `averageLevelMin` 和 `curStageNot`，覆盖 `Monster128` 与 `Monster172`。
- 保留零掉率、空 `fallList`、多次赋值最终分支和 `Monster2001` unsupported 边界。
- 更新测试场景配置化掉落入口和系统测试。

更新文件：

- `src/systems/DropSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-017

完成时间：

- 2026-05-28

完成内容：

- 追踪 `cwzb/p_cykljl/cykljl` 在主参考包与备用包中的全文命中，确认 `p_cykljl` 只出现在 `Monster2001`，未在 `AllEquipment`、背包、`PetInfo` 或 `PetInterface` 中发现定义或入包分支。
- 确认 `Monster2001` 写入的是 `protectedParamsObject.fallProbability = 0.1` 与 `protectedParamsObject.fallList`，而可见 `BaseMonster.fallEquip()` 读取 `protectedParamsObject.probability` 与 `this.fallList`，主参考源码未发现桥接复制。
- 确认即便有隐藏桥接创建 `FallEquipObj({ bigtype:"cwzb" })`，`FallEquipObj.colwho()` 也只处理 `zb/dj/sz`；未匹配分支不会写入 `petsAry` 或任何背包列表。
- 初步梳理宠物系统边界：宠物主数据在 `User.petsAry/PetInfo`，UI 入口为 `RoleInfo.btn_cw -> PetInterface`，宠物消耗品是普通 `zbwp` 道具并走道具背包。
- 将看板下一推荐任务切到 `TASK-SETTINGS-018`，用于宠物系统基础逆向。

更新文件：

- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-018

完成时间：

- 2026-05-30

完成内容：

- 细读 `User.as`、`PetInfo.as`、`BaseHero.as`、`BasePet.as`、`PetInterface.as`、`PackThings.as`、`RoleInfo.as`、`KeyBoardControl.as`、`MagicBottle.as` 以及活动/任务/商城宠物获得入口。
- 新建 `docs/reverse-engineering/pets-index.md`，记录宠物主数据 `User.petsAry`、`PetInfo` 初始化、10 格容量、`petSave` 存档格式、`isFight` 出战切换、`BaseHero.initPet()/addPetByPi()` 战斗实体创建链路和 `BasePet` 最小行为边界。
- 确认宠物 UI 入口为 `RoleInfo.btn_cw -> PetInterface`，快捷键为 P1 `B`（keyCode 66）和 P2 小键盘 `-`（keyCode 109）；面板展示列表、出战标记、属性、寿命、资质和最多 8 个技能槽。
- 梳理宠物获得入口：`MagicBottle` 捕捉调用 `User.catchNewPet()`，商城/活动/任务/地图入口直接创建 `PetInfo` 并 push 到 `petsAry`。
- 梳理宠物消耗品边界：`wphhd/wpcsd/djyys/cwzzxld/cwjnxld/wphtd/nianqld/nianjhd` 都是普通道具背包使用分支，不走 `cwzb`。
- 明确掉落边界：`Monster2001/cwzb/p_cykljl` 不作为宠物获得实现依据；宠物本体应走独立宠物数据入口，宠物消耗品可走普通 `dj` 道具。
- 更新 `mechanics-index.md`：`M-042` 推进为已扒，`M-016` 补充宠物快捷键，`M-044` 补充 `petSave` 存档字段说明。
- 更新 `vertical-slices.md`：新增 `VS-012` 宠物最小可玩切片并标为可开始。
- 将看板下一个推荐任务切到 `TASK-SLICE-020`，用于实现 P1 预置宠物、B 键面板、单只出战/休息和跟随实体的最小切片。

更新文件：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-020

完成时间：

- 2026-05-30

完成内容：

- 新增 `src/systems/PetSystem.ts`，建立首批现代宠物模型：`PetState`、`PetRoster`、`PetRuntimeModel`、10 格容量、单只出战、休息、选择、面板文本，以及跟随/远距传送逻辑。
- 更新 `src/scenes/TestScene.ts`：P1 默认拥有一只 `monkey1` 等价宠物；出战时生成绿色占位宠物实体，跟随 P1，距离过远时传送回玩家附近。
- 新增 B 键宠物面板：显示宠物列表、出战/休息标记、核心属性、资质和技能；方向键选择，`Enter` 切换出战/休息。
- 为原版宠物 B 键入口让位，将测试场景背包入口从 B 调整为 C；心法面板打开时 B 仍用于技能绑定，不触发宠物面板。
- `tools/system-tests.ts` 新增宠物单只出战、休息、跟随和远距传送测试。
- 更新 `docs/domain/glossary.md`，登记 `Pet`、`PetState`、`PetSystem` 统一语言。
- 更新 `VS-012` 为已完成，`M-042` 推进为部分复现，`M-016` 补充现代快捷键说明。
- 将看板下一推荐任务切到 `TASK-SETTINGS-019`，用于细化宠物捕捉与法宝葫芦入口逆向。

更新文件：

- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-019

完成时间：

- 2026-05-30

完成内容：

- 细读 `MagicBottle.as`、`BaseMagicWeapon.as`、`BaseHero.as`、`KeyBoardControl.as`、`User.as`、`AllEquipment.as`、`BackPack.as`、`PackThings.as`、`RoleInfo.as` 以及 `Monster70.as` 至 `Monster78.as`。
- 补充 `pets-index.md`：记录宣花葫芦 `xhhl/zbfb` 装备入口、`H`/小键盘 `7` 法宝键、灵魂 `< 5000` 门禁、命中扣除 `5000`、单机限定、复杂碰撞检测、捕捉概率、成功/失败/满栏反馈和 `catchNewPet(petName, bm.getLevel())` 入库链路。
- 列出 `Monster70-78` 到宠物名的映射：`horse1/horse2/monkey1/monkey2/tigress1/turtle1/phoenix1/dragon1/rabbit1`，以及各自概率、资源名和等级来源。
- 新增 `magic-weapons-index.md`，记录法宝基础生命周期、`BaseHero.initMagicWeapon()` 创建入口、`BaseMagicWeapon.useSkill()/step()`、`showSkillFaBao()` 和宣花葫芦捕捉边界。
- 更新 `mechanics-index.md`：`M-043` 从未扒推进到部分已扒，`M-042` 补充捕捉链路已扒清但现代侧仍未复现。
- 保持 `cwzb` 边界：捕捉成功直接进入宠物列表，不走掉落背包。
- 将看板下一推荐任务切到 `TASK-SLICE-021`，用于实现宣花葫芦捕捉宠物最小切片。

更新文件：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。



### TASK-SLICE-039

完成时间：
- 2026-06-03

完成内容：
- 扩展 `src/systems/PetSystem.ts`，新增宠物下级经验曲线、`hpArr/defArr` 首批属性表、宠物族 MP/攻击基数、统一 `addPetExperience()` 升级入口和 `awardMonsterExperienceWithCurrentPet()` 普通击杀分成入口。
- `djyys` 宠物经验石改为走统一宠物升级函数，支持连续升级、只扣本级经验、保留溢出经验，升级后按首批公式刷新 HP/MP/攻击/防御并回满 HP/MP。
- `src/scenes/TestScene.ts` 的 `Monster30` 击杀经验结算接入 P1 当前出战宠物：有出战宠物时玩家和宠物各获得怪物经验的 60%，无出战宠物时玩家获得完整经验；状态栏和宠物面板显示等级、当前经验、下级经验和关键属性。
- 扩展 `tools/system-tests.ts`，覆盖宠物自然经验增加、`Monster30` 60/60 分成、无出战宠物玩家完整经验、单次升级、溢出经验、`djyys` 共用入口和至少一个宠物族的属性刷新。
- 更新 `docs/reverse-engineering/mechanics-index.md` 和 `docs/tasks/vertical-slices.md`，将 `VS-015` 标记为已完成；`M-042` 仍保持部分复现，宠物存档、技能、P2、任务奖励经验、形态变化实体重建和 60 级后随机成长后置。
- 更新 `docs/tasks/task-board.md`，移除已完成的 `TASK-SLICE-039`，并新增 Ready 后续任务 `TASK-SLICE-040`：宠物升级形态变化最小闭环。

更新文件：
- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。

### TASK-SLICE-040

完成时间：
- 2026-06-03

完成内容：
- 扩展 `src/systems/PetSystem.ts`，在统一 `addPetExperience()` 升级循环中加入宠物形态阈值处理：形态 1 在 `16 <= level < 30` 时变为 2，形态 2 在 `level > 30` 时变为 3；形态变化记录写入 `PetExperienceResult.formChanges`。
- 扩展 `PetRuntimeModel`，新增 `runtimeKey = petId:species:form`；`syncPetRuntimeWithRoster()` 在出战宠物形态变化后重建 runtime，保持普通升级不重建。
- 扩展 `src/scenes/TestScene.ts`，宠物标签、状态栏和宠物面板展示当前形态；形态变化后测试场景可观察 runtime key 更新和实体重建。
- 扩展 `tools/system-tests.ts`，覆盖自然经验触发形态 1→2、`djyys` 触发形态 2→3、非阈值等级不变化、形态 3 不重复变化，以及形态变化后 runtime 重建。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，归档 `TASK-SLICE-040`，并新增 Ready 后续任务 `TASK-SETTINGS-026`：宠物技能基础逆向。

更新文件：
- `src/systems/PetSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。

### TASK-SETTINGS-026

完成时间：
- 2026-06-03

完成内容：
- 更新 `docs/reverse-engineering/pets-index.md`，新增宠物技能章节，记录 `PetInfo.skill` 已学技能数组、`allSkill` 候选池、`PetInterface` 八个技能 UI 槽、`getSkillSaveString()/setSkillSaveString()` 的 `sname~sname` 等价存档字段，以及单只宠物存档第 26 字段保存技能串。
- 补清自动学习规则：`studySkillSuddenly(level)` 只在 2、5、8、11……等 `3n - 1` 等级尝试，受 `getperception()` 上限约束，命中窗口时约 40% 概率从 `allSkill` 随机学习并移除候选。
- 补清形态与技能候选关系：升级形态变化通过 `addSpecialSkill()` 调整候选池和刷新技能说明，不会无条件学会新技能；`monkey1/2/3/4` 依次补 `xj/lj/lyq/jgaoyi` 候选。
- 补清被动和自动 buff 入口：升级前后用 `deletePassiveWhenUpdata()` / `addPassiveAfterUpdata()` 移除和重加 `tsml/zrsh/smzf/mfby`；`BasePet.checkBuffSkill()` 自动处理 `sxkb/fsnl/smjc/mfjc/gjjc/fyjc`，这些不走主动技能 CD。
- 补清出战宠物主动技能链路：`BasePet.myIntelligence()` 按 `skill1 -> skill4` 顺序检查 `beforeSkillNStart()` 和 `skillCDN`，由具体宠物类覆写释放；首个现代候选固定为 `PetMonkey1` 的 `xj`，条件是已学、MP 足够、宠物曾受击触发标记、CD 就绪，释放 `hit2` 并按 `2.6 * atk` 取伤害。
- 更新 `docs/reverse-engineering/mechanics-index.md` 的 `M-042` 下一步，新增 `docs/tasks/vertical-slices.md` 的 `VS-016 宠物技能最小闭环`，并将当前 Ready 任务切到 `TASK-SLICE-041`。

更新文件：
- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run check:workflow` 通过。

### TASK-SLICE-070

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `M-032` 伤害/受击
- `VS-036` UFO/卡布专属技能链最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/architecture/src-boundaries.md`
- `src/systems/PetUfoSkillSystem.ts`
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetUfoSkillSystem.ts`
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

完成定义：

- P1 测试宠物种子新增可切换出战的 `ufo1`，并持有已学 `pms`。
- `ufo1/pms` 按已学习、宠物 MP `>= 20`、约 2 秒 CD 就绪、存在 `Monster30` 目标门禁释放。
- 释放成功扣 20 MP，重置约 2 秒 CD；选择最近存活目标，生成 `PetKabu1Bullet2` / `hit2` 占位 projectile 并造成 `3.6 * pet.atk + skillDamageBonus` 接入 `sxkb` 暴击伤害。
- `TestScene` 状态栏/宠物面板能观察 `ufo1/pms` MP、CD、最近释放反馈和伤害。
- 系统测试覆盖未学习、MP 不足、无目标、CD、扣 MP、projectile 生成、伤害公式与 `fsnl/sxkb` 接入，以及既有宠物技能兼容。

验收标准：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- `VS-036` 记录 `ufo1/pms` 已完成首段。

### TASK-SLICE-071

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `M-032` 伤害/受击
- `VS-036` UFO/卡布专属技能链最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/architecture/src-boundaries.md`
- `src/systems/PetUfoSkillSystem.ts`
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetTypes.ts`、`PetTuning.ts`、`PetSkillStateSystem.ts`、`PetSkillTickSystem.ts`
- `src/systems/PetUfoSkillSystem.ts`、`PetRosterSystem.ts`、`PetSystem.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`、`docs/tasks/task-board.md`、`docs/tasks/task-history.md`

完成定义：

- P1 测试宠物种子新增可切换出战的 `ufo2`，并持有已学 `pms/ss`；已有猴、马、青龙、玄龟和 `ufo1/pms` 行为保持不变。
- `ufo2/ss` 按已学习、宠物 MP `>= 20`、约 4 秒 CD 就绪、存在 `Monster30` 目标门禁释放。
- 释放成功扣 20 MP，重置约 4 秒 CD；从当前目标集合中随机选择存活目标，记录/应用传送到目标背后约 40 像素、`y - 40` 的现代最小位移反馈。
- `ss` 直接技能伤害保持 0；释放后记录一次普攻等价反馈。
- `TestScene` 状态栏/宠物面板能观察 `ufo2/ss` MP、CD、最近释放反馈和瞬移位置。
- 系统测试覆盖未学习、MP 不足、无目标、CD、扣 MP、随机目标选择/瞬移反馈、直接伤害为 0，以及既有宠物技能兼容。

验收标准：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- `VS-036` 记录 `ufo2/ss` 已完成第二段。

### TASK-SLICE-072

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `M-032` 伤害/受击
- `VS-036` UFO/卡布专属技能链最小闭环

输入资料：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `src/systems/PetUfoSkillSystem.ts`
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`
- `tools/system-tests.ts`

输出产物：

- `src/systems/PetTypes.ts`、`PetTuning.ts`、`PetSkillStateSystem.ts`、`PetSkillTickSystem.ts`
- `src/systems/PetUfoSkillSystem.ts`、`PetUfoProjectileSystem.ts`、`PetRosterSystem.ts`、`PetSystem.ts`
- `src/systems/ProjectileSystem.ts`、`src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`、`docs/tasks/task-board.md`、`docs/tasks/task-history.md`

完成定义：

- P1 测试宠物种子新增可切换出战的 `ufo3`（冲霄），并持有已学 `pms/ss/kmsk`；已有猴、马、青龙、玄龟、`ufo1/pms` 和 `ufo2/ss` 行为保持不变。
- `ufo3/kmsk` 两阶段释放：`hit4_1` 上升约 600ms → `hit4_2` 在宠物下方 `y + 30` 生成 `PetKabu3Bullet4` / `hit4` 占位 projectile。
- 按 `6 * pet.atk + skillDamageBonus` 接入 `sxkb` 暴击造成下方/范围伤害。
- ProjectileSystem.ts 拆分 `PetUfoProjectileSystem.ts` 解决 1500 行天花板。

验收标准：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。
- `npm run check:structure` 无 error（ProjectileSystem.ts 降至 1461 行）。
- UFO/卡布三条技能链（`pms/ss/kmsk`）全部完成。

### TASK-SETTINGS-033

任务类型：

- `TASK-SETTINGS`

目标机制/切片：

- `M-042` 宠物
- `VS-036` UFO/卡布专属技能链最小闭环（已完成，参考模式）

输出产物：

- `docs/reverse-engineering/pets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`

完成定义：

- ✅ 虎 `tigress1..4`：`hy/sxhz/hsqj/bhaoyi`（含 AS3 证据、CD 表、伤害公式 `2×/4×/6×atk`、MP 20/20/20/30）
- ✅ 凤凰 `phoenix1..4`：`np/bshn/dhly/zqaoyi`（特殊触发涅槃、主动伤害、奥义组合）
- ✅ 兔 `rabbit1..4`：`yg/jf/bs/ysaoyi`（被动月光、buff、冰冻狙击、奥义领域）
- ✅ 鼠 `mouse1..4`：`sc/hxfb/zsaoyi`（鼠窜冲撞、回旋飞镖、奥义步进 combo）

验收标准：

- `npm run check:workflow` 通过。
- `pets-index.md` 已登记四物种完整技能链（AS3 证据、CD、伤害公式、MP、资源键）。

### TASK-SLICE-075

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物
- `M-032` 伤害/受击
- `VS-036` 全宠物专属技能链

输出产物：

- `src/systems/PetTigerSkillSystem.ts`（虎系四段：`hy/sxhz/hsqj/bhaoyi`）
- `src/systems/PetSystem.ts`、`PetRosterSystem.ts`、`PetSkillStateSystem.ts`、`PetSkillTickSystem.ts`、`PetTypes.ts`、`PetTuning.ts`
- `src/systems/ProjectileSystem.ts`、`src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`
- `tools/system-tests.ts`

完成定义：

- 虎系链全部四段（虎跃 2×atk/嗜血虎爪 4×atk+吸血/虎声咆哮 6×atk/白虎奥义 combo）均已实现并通过系统测试。

### TASK-SLICE-076

任务类型：

- `TASK-SLICE`

目标机制/切片：

- `M-042` 宠物、`M-032` 伤害/受击、`VS-036`

输出产物：

- `src/systems/PetPhoenixSkillSystem.ts`（凤凰四段：`np/bshn/dhly/zqaoyi`）
- `src/systems/PetRabbitSkillSystem.ts`（兔四段：`yg/jf/bs/ysaoyi`）
- `src/systems/PetMouseSkillSystem.ts`（鼠三段：`sc/hxfb/zsaoyi`）
- `src/systems/PetSystem.ts`、`PetRosterSystem.ts`、`PetSkillStateSystem.ts`、`PetSkillTickSystem.ts`、`PetTypes.ts`、`PetTuning.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`、`tools/system-tests.ts`

完成定义：

- 凤凰（涅槃 HP≤20% 满血复活/不死火鸟 3.6×atk/地火燎原 7.4×atk/朱雀奥义）、兔（月光被动 3.6×atk/疾风 buff/冰霜狙击 8×atk/月神奥义）、鼠（鼠窜 2.86×atk 15MP/回旋飞镖 3.45×atk/紫鼠奥义 combo）全部 11 个技能均已实现并通过系统测试。
- 全部 9 物种宠物专属技能链复现完成。

### TASK-SLICE-078

完成时间：

- 2026-06-20

完成内容：

- 修正虎、凤凰、兔和鼠系技能调度，新增 `PetSkillPrioritySystem.ts`，由场景桥接按原版 `skill1 -> skill4` 顺序尝试；低血凤凰优先进入涅槃，不再先被高阶技能消耗 MP。
- 涅槃改为约 4 秒持续形态：期间伤害降为三分之一、拒绝受击动作，结束时存活宠物回满 HP；朱雀奥义为后续凤凰攻击附加 5 秒、每秒 `pet.atk` 的灼烧，并接入 `Monster30` 持续伤害。
- 兔系补齐月光 30% 命中触发/月神奥义期间 50% 触发、疾风 10 秒攻击频率和形态闪避加成、冰霜冻结，以及月神奥义 10 秒内每秒恢复宠物和主人各 10% 最大 HP。
- 鼠系回旋飞镖改为三枚 projectile 且总伤害保持已确认倍率；紫鼠奥义按步骤执行免蓝 `sc/hxfb` 连招。
- 白虎奥义执行目标两侧瞬移、免蓝 `hy/sxhz/hsqj` 三段组合和末段 1.3 倍加成，不再只记录组合布尔值。
- 新增 `TestSceneAdvancedPetSkillBridge.ts`，把高级宠物技能调度从宠物/法宝综合桥接拆出，消除该桥接的结构 warning。
- 系统测试从“提示文字存在”提升为验证持续状态、到期恢复、概率入口、治疗、三枚飞镖、奥义实际 projectile、灼烧伤害和技能优先顺序。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；保留既有 Vite 大 chunk warning。
- `npm run check:structure` 无 error；`TestScenePetMagicBridge.ts` 已低于 warning 阈值，其他既有/相关 warning 继续按后续任务拆分。

### TASK-SLICE-077

完成时间：

- 2026-06-20

完成内容：

- 新增 `SaveSystem.ts`，使用带 `version: 1` 的 JSON schema 保存 P1 角色 ID、等级/经验、五槽技能配置、两棵心法树、被动技能、已穿戴装备和完整宠物列表。
- 宠物存档覆盖稳定 ID、物种/形态、等级/经验、HP/MP、攻击/防御、四类资质、寿命、悟性/技巧/战力、出战标记和已学技能；读取时恢复单只出战约束并重建技能运行时状态。
- 冷却、奥义步骤、自动 Buff 和花篮临时 Buff 等瞬时状态不会写入存档，避免刷新后保留过期战斗状态。
- 新增 `TestSceneSaveBridge.ts`：场景创建时从 localStorage 读取，之后每 2 秒自动保存；左上角显示新游戏、已读取、自动保存或存储失败反馈。
- 装备按 `fillName` 和实例 ID 存储，读取时通过现代装备 registry 恢复；未知装备安全忽略，损坏 JSON 和未知版本安全拒绝。
- 系统测试覆盖内存存储往返、角色/技能/装备/宠物恢复、瞬时宠物状态排除和损坏存档拒绝。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；保留既有 Vite 大 chunk warning。
- `npm run check:workflow` 通过。

### TASK-SLICE-083

完成时间：
- 2026-06-20

完成内容：
- `SaveSystem.ts` 升级为 V2，在保留原存储 key 的前提下分别保存 P1 完整状态和 P2 宠物 roster。
- V1 读取自动迁移为 V2：P1 数据完整保留，P2 建立空 roster；V2 两位玩家的宠物对象、ID、选择位置和单只出战状态独立恢复。
- 宠物冷却、自动 Buff、MagicFlower 临时状态和场景运行时继续不持久化；P2 非前缀 ID 在恢复时规范为 `p2-`，防止跨 owner 冲突。
- `TestSceneSaveBridge.ts` 在加载后同时替换两位玩家 roster、销毁旧视图并清空双宠 runtime，保存时写入 P2 roster。
- 新增 `dual-player-pet-save-tests.ts`，覆盖 V2 往返、V1 迁移、瞬态清理、对象/ID 隔离和损坏 P2 数据拒绝；既有 P1 存档测试保持通过。

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:all` 通过。

### TASK-SLICE-082

完成时间：
- 2026-06-20

完成内容：
- 新增 `PlayerInventoryOwnershipSystem.ts`，建立 P1/P2 独立背包、装备 loadout、法宝模型、强化灵魂、宣花葫芦灵魂与 UI 状态；P1 `C`、P2 小键盘 `/` 复用同一 owner 面板。
- 八类宠物道具经共享 owner 入口使用，只修改对应 roster/堆叠；拒绝不扣除，需重建时只清对应宠物运行时。
- 新增 `TestSceneMagicOwnershipBridge.ts`，P1 `H` 与 P2 小键盘 `7` 经同一捕捉适配器路由到各自宣花葫芦、灵魂和 roster。
- 新增 `TestSceneMagicBottleViewBridge.ts`，为两位玩家独立显示捕捉范围；同时拆出既有过长桥接文件中的相关职责。
- P1 存档恢复继续写入 P1 owner loadout；P1 既有背包、法宝和宠物行为保持兼容。
- 新增 `pet-item-ownership-tests.ts`，覆盖全部宠物道具成功/拒绝隔离、键位、独立状态和 P2 捕捉成功/失败/灵魂不足/满栏。

更新文件：
- `src/systems/PlayerInventoryOwnershipSystem.ts`
- `src/systems/PetOwnershipSystem.ts`
- `src/scenes/TestScene.ts`
- `src/scenes/test-scene/TestSceneUIHandlers.ts`
- `src/scenes/test-scene/TestSceneMagicOwnershipBridge.ts`
- `src/scenes/test-scene/TestSceneMagicBottleViewBridge.ts`
- `src/scenes/test-scene/TestScenePetMagicBridge.ts`
- `src/scenes/test-scene/TestSceneWorldBridge.ts`
- `src/scenes/test-scene/TestSceneSaveBridge.ts`
- `tools/system-tests/pet-item-ownership-tests.ts`
- 状态文档

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:all` 通过。

### TASK-SLICE-081

完成时间：

- 2026-06-20

完成内容：

- 在 `TestScenePetMagicBridge.ts` 建立显式接收 `ownerSlot/owner/roster/runtime/targets/projectiles` 的共享 `updateOwnedPetSystem()`；P1/P2 均调用同一份完整宠物自动 Buff、主动技能和高级连段调度，不复制 P2 分支。
- `TestSceneP2PetBridge.ts` 从只跟随升级为完整战斗桥接；P2 主人属性、宠物冷却、治疗和 projectile 均来自 P2 roster/runtime，带 owner 前缀的宠物 ID 保证 source 唯一。
- 新增 `PetBattleOwnershipSystem.ts`，统一按 owner 路由玄龟承伤转嫁、宠物受击触发和经验；普通 Monster30 的英雄普攻、projectile、强力反击和持续伤害死亡均按当前 `targetSlot` 只领取一次经验。
- `TestSceneCombatBridge.ts` 和 Boss 桥接不再硬编码只有 P1 可享受玄龟链接；Monster30 击中 P2 时会触发 P2 宠物的受击技能状态和强力反击。
- P1/P2 英雄目标均按有宠物 60%/60%、无宠物 100%/0 分配普通怪经验；另提供直接宠物目标获得 100% 的显式接口，不复制任务奖励误查 P1 的原版 bug。
- 新增 `pet-battle-ownership-tests.ts`，覆盖 P2 Buff/触发/承伤隔离、P2 技能 projectile source、目标 owner 优先、经验一次性领取、60/60、100/0 和宠物目标 100%。
- 新增 `TestScenePetViewBridge.ts` 承接宠物视图同步和目标快照，使共享调度改造后的 `TestScenePetMagicBridge.ts` 保持在结构 warning 阈值内；其他 warning 文件仅做 owner 参数化和薄路由替换。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；保留既有 Vite 大 chunk warning。
- `npm run check:all` 通过；结构检查无新增 warning 或 error。

### TASK-SLICE-080

完成时间：

- 2026-06-20

完成内容：

- 新增 `PetOwnershipSystem.ts`，一次创建完全独立的 P1/P2 roster；P2 宠物 ID 增加 owner 前缀，选择、出战和休息只作用于明确 owner。
- 新增唯一 `PetPanelSession.owner`；P1 `B` 与 P2 小键盘 `-` 可打开、切换或关闭同一个宠物面板，P2 心法键从错误的小键盘 `-` 修正为 `*`。
- 把宠物面板视图和键位从已超结构 warning 的 `TestSceneSetup.ts` 拆到 `TestScenePetPanelBridge.ts`，新增指针按钮执行上一只、下一只、出战/休息，不再用方向键控制宠物面板。
- 新增 `TestSceneP2PetBridge.ts`，P2 出战宠物绑定 P2 英雄位置与朝向，独立跟随、远距传送和销毁；P1/P2 宠物可同时存在，P1 既有战斗技能链未改写。
- 新增 `pet-ownership-tests.ts`，覆盖双 roster 对象/ID 隔离、面板 owner、跨玩家不串改、双宠同时跟随和 P1 `B` / P2 小键盘 `-` / P2 心法小键盘 `*` 映射。
- `TestSceneSetup.ts` 已从 613 行降到结构 warning 阈值以下；对仍超阈值的 `TestScene.ts` 和测试 runner 仅增加薄字段/调度与测试注册，新领域逻辑均位于独立文件。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；保留既有 Vite 大 chunk warning。
- `npm run check:all` 通过；`TestSceneSetup.ts` 已退出结构 warning，其他既有大文件 warning 无新增 error。
- 浏览器可视化验收因当前 in-app browser 不可用未执行，系统级交互与键位测试已通过。

### TASK-SETTINGS-035

完成时间：

- 2026-06-20

完成内容：

- 确认原版 P1/P2 各自持有独立 `User.petsAry`，英雄只查询自己的当前宠物，双宠实体可以同时存在；面板的选择、出战、休息和刷新也按 owner 隔离。
- 确认 P1 `B`、P2 小键盘 `-` 分别打开各自宠物面板，小键盘 `*` 是 P2 心法面板；原版宠物列表和操作按钮由鼠标驱动，现代方向键选择会抢占 P2 移动键。
- 确认普通击杀经验沿怪物当前攻击目标分配；任务奖励第二玩家分支误查 P1 当前宠物，是独立于普通路径的原版 bug，现代接入时应按玩家修正。
- 确认 `PackThings.who` 让 P2 宠物消耗品作用于 player2，P2 使用宣花葫芦也会把捕获宠物写入 player2 roster；本地双人仍满足捕捉的单机门禁。
- 确认原版分别保存 `player1_obj` / `player2_obj` 及各自 `petSave`，读取先恢复 User 再创建英雄/宠物；记录原版读取反转宠物列表的顺序 bug，并明确现代存档不复刻。
- 生成 `TASK-SLICE-080`，先实现 P2 独立 roster、面板 owner、正确快捷键和跟随实体；战斗经验、道具/捕捉与版本化存档继续拆分，避免一次改动过大。

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-079

完成时间：

- 2026-06-20

完成内容：

- 新增 `PetGrowthSystem.ts`，独立实现 `cwzzxld` 悟性/技巧/战力洗练；保留原版条件链内多次独立随机取样顺序，并支持注入随机源。
- 实现 `wphtd` 全已知物种还童：等级/经验/形态/品质、四类资质和基础属性按原表重置，技能、寿命和出战标记保留，战斗瞬时状态重建；未知物种因无公式拒绝且不消耗。
- 实现 `nianjhd`：四阶拒绝不消耗，三阶进四阶并按槽位尝试学习奥义，形态 1/2 保留原版空耗；进化按形态差重算 `tsml/zrsh/smzf/mfby` 被动并触发宠物运行时重建。
- `nianqld` 明确提示当前原版构建缺少潜力字段和公式，不消耗道具，不猜造换算。
- 四种道具加入现代 registry 和测试背包；背包使用桥接按结果扣除并清理旧宠物 runtime；宠物面板新增四类资质显示。
- 新增独立 `tools/system-tests/pet-growth-tests.ts`，主测试文件只增加导入和调用，覆盖随机分支、字段保持/重置、还童数值、被动重算、技能满槽、空耗/拒绝、真实背包数量和 runtime key 重建。
- `EquipmentSystem.ts` 已有结构 warning，本次仅增加任务要求的四条静态道具定义；成长规则未继续写入该文件或已超 warning 的 `PetSystem.ts`。

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过；保留既有 Vite 大 chunk warning。
- `npm run check:all` 通过；结构检查无 error，既有 warning 已记录。

### TASK-SETTINGS-034

完成时间：

- 2026-06-20

完成内容：

- 补清 `cwzzxld` 对悟性/技巧/战力逐项洗练的全部随机分支，确认三个字段使用同构逻辑、条件链内多次独立取样，且不改四类资质或基础战斗属性。
- 补清 `wphtd` 还童顺序、全物种一阶品质 1 资质表、基础属性、随机成长字段和出战实体重建链；确认技能、寿命和出战标记不会被清除。
- 补清 `nianjhd` 道具与宠物面板进化入口的差异：道具无 50 级门禁，不给悟性 +1；仅三阶真正进化，形态 1/2 会空耗，四阶拒绝且不消耗，技能满槽不阻止形态变化；进化会按新旧形态差重算 `tsml/zrsh/smzf/mfby` 四个基础属性被动。
- 确认 `nianqld` 只有 `potential + 100` 调用点，而当前 `PetInfo`、备用源码调用链和 26 字段宠物存档均无潜力定义或数值公式；将其登记为悬空入口，不用猜测补齐。
- 生成 `TASK-SLICE-079`，把有充分证据的三种成长洗练行为拆成现代实现切片，并要求 `nianqld` 采用明确、不消耗的证据不足反馈。

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-085

完成时间：2026-06-21。完成 `blb/sjt` 的蓄力、动态 MP、48/12 阈值、全伤害倍率、学习同步与边界测试。

### TASK-SLICE-086

完成时间：2026-06-21。完成 `myhc/tjgl` 的玩家/宠物治疗、GXP、7 秒护盾、分身协同与边界测试。

### TASK-SLICE-087

完成时间：2026-06-21。完成 `jgz` 的目标过滤、拉拽/浮空/恢复和下一次伤害一次性增幅测试。

### TASK-SLICE-088

完成时间：2026-06-21。完成 `jhsj` 第 45/55 帧双段、两类 projectile、移动/重力锁与分身变体测试。

### TASK-SLICE-089

完成时间：2026-06-21。完成 `shy` 8 秒分身、召回传送、四技能协同、双玩家隔离和生命周期测试。

### TASK-SETTINGS-039

任务类型：
- `TASK-SETTINGS`

目标机制/切片：
- `M-021`、`M-024`、`M-025`、`M-034`。

输入资料：
- `Role4.as`、`MonsterRole4Hit5.as`、`BaseAddEffect.as` 及现有角色/输入/projectile 索引。

输出产物：
- `role4-combat-index.md` 及角色、输入、projectile、机制状态更新。

完成定义：
- 补清铲/弓形态、普攻、全部十项技能、MP、动作、projectile、状态联动、恢复与资源缺口。

验收标准：
- 可独立回答每项技能如何触发、生效、结算和清理；关键拒绝边界有 AS3 证据；工作流检查通过。

禁止范围：
- 不修改提取结果，不写现代游戏代码，不猜补不可达分支或缺失素材。

推荐后续任务：
- 当前仍执行 `TASK-SLICE-096`；Role1 队列完成后生成 Role4 武器形态与普攻切片。

### TASK-SLICE-103

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `VS-040`、`M-021`、`M-025`、`M-034`。

输入资料：
- `role4-combat-index.md`、`Role4` 的 `hit8..10` 证据。

输出产物：
- `qlj/tkj/dzj` 双形态技能、位移/重力、projectile 和独立测试。

完成定义：
- 保留 `qlj` 动态 MP 加固定 15 双扣，以及三技能铲/弓不同 projectile、段数、击退、跃进/上跳/突进和恢复。

验收标准：
- 两形态、MP、伤害/段数、位移/重力、清理和 P1/P2 隔离有自动测试；完整检查通过。

禁止范围：
- 不修正原版双扣，不实现标记/终结技。

推荐后续任务：
- `TASK-SLICE-104`。

### TASK-SLICE-102

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `VS-040`、`M-021`、`M-025`、`M-034`。

输入资料：
- `role4-combat-index.md`、`Role4.doHit6/reHit6()`。

输出产物：
- `mbyj` 链式目标、状态 projectile、眩晕/毒层接线和独立测试。

完成定义：
- 完成面向侧 500 范围首目标、最多 8 跳、每跳重新找 500 范围其他目标、78% 眩晕、7 秒毒层和无直接伤害。

验收标准：
- 顺序、距离、次数、重复目标拒绝、概率边界、无目标淡出与 P1/P2 隔离有自动测试；完整检查通过。

禁止范围：
- 不实现其他 Role4 技能，不把 `runAttack()` 死代码做成入口。

推荐后续任务：
- `TASK-SLICE-103`。

### TASK-SLICE-101

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `VS-040`、`M-021`、`M-025`。

输入资料：
- `role4-combat-index.md`、`Role4.doHit5_*()`、`MonsterRole4Hit5.as`、现有伤害桥接。

输出产物：
- 巫毒娃娃运行时、目标选择/替换/10 秒生命周期、伤害转移、独立测试。

完成定义：
- 复现 `wdww` 正式 MP、面向侧最近目标、等级生命倍率、继承防御、攻击娃娃向绑定目标转伤和死亡/到期清理。

验收标准：
- 无目标、替换、等级边界、转伤倍率、目标死亡、P1/P2 隔离有自动测试；完整检查通过。

禁止范围：
- 不实现其他 Role4 技能，不泛化完整召唤物 ECS。

推荐后续任务：
- `TASK-SLICE-102`。

### TASK-SLICE-100

任务类型：
- `TASK-SLICE`

目标机制/切片：
- `VS-040`、`M-021`、`M-025`、`M-034`。

输入资料：
- `role4-combat-index.md`、`Role4.as` 的 `zq/jdz` 与 `BaseAddEffect.as` 的 `mds` 证据。

输出产物：
- Role4 毒系运行时、projectile、场景桥接、占位资源与独立测试。

完成定义：
- 完成 `zq` 铲弓差异、`jdz` 三 projectile、正式 MP/等级/地面门禁，以及毒层超过 2 后的 `mds` 毒爆、自疗、护盾和 3 秒视觉状态。

验收标准：
- 铲/弓、MP、伤害、门禁、毒层、毒爆、治疗/护盾/视觉状态和 P1/P2 隔离有自动测试；全部检查通过。

禁止范围：
- 不修改提取结果，不实现其他 Role4 技能，不伪造真素材。

推荐后续任务：
- `TASK-SLICE-101`。

## 执行记录

### TASK-SLICE-009

完成时间：

- 2026-05-23

完成内容：

- 新增 `src/systems/SkillUISystem.ts`，提供 `SkillUIState`（`skillPanelOpen`、`selectedSlotIndex`）、`cycleSlotBinding()` 轮换绑定函数和 `SkillSlotKeyLabels`（P1 Y/L/U/I/O、P2 8/3/4/5/6）。
- 更新 `src/scenes/TestScene.ts`，接入五槽技能栏 `SkillBarView`：每槽显示键位标签和绑定技能名（含等级），高亮选中槽位；P1 技能栏位于左下 (x=44, y=540)，P2 技能栏位于右下 (x=488, y=540)。
- Z 键（P1）/ 小键盘 +（P2）轮换当前选中槽位的绑定（null → sgq → smb → null），然后自动移到下一槽。
- V 键（P1）/ 小键盘 -（P2）切换技能面板占位开关，显示 `[V] panel open` 指示器。
- 技能栏每帧与 `HeroSkillModel.loadout` 同步刷新；切角色时重置 loadout 后自动反映在技能栏上。
- `npm run build` 和 `npm run check:workflow` 均通过。

更新文件：

- `src/systems/SkillUISystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-012

完成时间：

- 2026-05-23

完成内容：

- 细读 `Monster3.as` 全源码，记录完整 boss 数据：HP 926/400（boss/非boss）、horizenSpeed 4、attackRange 150、def 5、mDef 0.2。
- 记录 Monster3 攻击数据：hit1（power=40 physics，子弹 Monster3Bullet1，x±105, y-60，帧3/count1）、hit2（power=18 magic，子弹 Monster3Bullet2，x±155, y-30，帧3/count26）、skillCD1 [48,96] 帧（2s/4s）。
- 记录 Monster3 动画行：wait(0)/walk(1)/hurt(2)/dead(3)/hit1(4)/hit2(5)，帧大小 180x180，偏移 (20,-5)。
- 确认 `destroy()` override：如果 `isBoss == true`，遍历 `gc.pWorld.getTransferDoorArray()` 全部设为 `visible = true`。
- 细读 `StageListener11.as` 全源码，记录 boss 区触发条件：任一玩家 `y <= -1900` → 其他玩家/宠物传送 `y = -1950` → 镜头 tween 到 `y = 2370`（2s）→ `callBoss()` 生成 Monster3 在 `(750, -2050)`。
- 确认传送门机制：`PhysicsWorld.addSubObj()` 读取 SWF 场景中 `isTransferDoor` 子节点，非 `curStage == 0` 时初始隐藏，boss 死亡后显示。
- 检索 `extracted_flash/resources` 全部 76 个 SWF 导出目录：`sl11`/`bg11`/`floorBg1`/`Monster3` 位图和子弹资源均不在当前导出中；`assets-index.md` 新增 VS-007 资源缺口确认表。
- `levels-index.md` 新增「Monster3 详细数据」和「VS-007 实现数据汇总」两个完整章节，标记资源缺口和最小实现策略（手工坐标 + 占位图形）。
- 更新 `M-026`（关卡类命名）、`M-027`（地图标记）、`M-028`（第一个关卡）的下一步为已确认状态；VS-007 从「待机制」更新为「可开始」。

更新文件：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-011

完成时间：

- 2026-05-23

完成内容：

- 新增 `src/systems/Monster3System.ts`，实现 Monster3 boss 完整数据模型：HP 926、地面追踪 AI、hit1（physics 40 dmg，hitbox x±105 y-60，120×90，500ms）和 hit2（magic 18 dmg，hitbox x±155 y-30，140×100，800ms）、skill CD（CD1=2s、interval=4s）、hit1 决策率 42%/1s、受击（250ms 硬直）、死亡（1s → removed）。
- Monster3 攻击通过 `Monster3ActiveAttack` 携带 `attackId`、`damage`、`attackKind`、`knockbackX/Y`，hitbox 通过 `getMonster3AttackHitbox()` 按攻击帧窗口暴露给 `CombatSystem`。
- 新增 `src/systems/LevelSystem.ts`，实现 boss 区状态机：`inactive → active → cleared`。`checkBossArenaTrigger()` 检测玩家到达触发区 Y，`activateBossArena()` 生成 Monster3，`tryClearArena()` 检查传送门碰撞 + 按上判定通关，`revealTransferDoor()` 在 boss 死亡后显示传送门。
- `src/scenes/TestScene.ts` 新增完整 boss 区切片：arena 平台（step1 y=280 solid、floor y=200 solid）、触发区（y=180 line）、boss 激活后追踪玩家并执行 hit1/hit2、boss 受击/死亡/removed、传送门（黄色矩形 120×140）、按上通关显示 `[CLEAR!]` 覆盖层。
- `applyBossAttack()` 在 Monster3 hit1/hit2 的攻击窗口内对范围内玩家生成 `DamageEvent`，走 `CombatSystem` 统一命中去重；`applyPlayerHitOnBoss()` 让玩家普攻和技能 projectile 也可命中 boss。
- `applyProjectileHits()` 扩展为同时检测 Monster30 和 boss 命中（修复了 boss 命中检测错误嵌套在 Monster30 if 块内的 bug）。
- 所有坐标和图形均使用手工作标和占位矩形/文本，不依赖真实 SWF 场景资源。
- 未实现：完整纵向爬升、云层、周期刷 Monster30、停点系统、掉落、难度修正、暴击、闪避、存档。

更新文件：

- `src/systems/Monster3System.ts`
- `src/systems/LevelSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-001

完成内容：

- 确认原版支持单人和本地双人。
- 确认方向键属于玩家 2。
- 确认 P1/P2 基础键位、技能键和 UI 快捷键。
- 确认 `keyarray = [下, 普攻, 跳跃, 上]`。

更新文件：

- `docs/reverse-engineering/controls-index.md`
- `docs/reverse-engineering/gameplay-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`

### TASK-ARCH-001

完成时间：

- 2026-05-13

完成内容：

- 新增 `PlayerSlot`、`PlayerInputState`、`InputState` 和 `InputBindings`，输入系统每帧返回 `p1`/`p2` 两套状态。
- P1 绑定 A/D/S/W/J/K、Y/L/U/I/O、Space、H；P2 绑定方向键、小键盘 1/2/8/3/4/5/6/0/7。
- `TestScene` 改为双玩家输入状态显示场景，不再用方向键驱动 P1 占位角色。
- `VS-001` 标为已完成，`M-008`、`M-009` 标为已复现。

更新文件：

- `src/systems/InputSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/tasks/task-board.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`

验证：

- `npm run build` 通过。

### TASK-SETTINGS-002A

完成时间：

- 2026-05-13

完成内容：

- 建立五个角色索引：`Role1` 孙悟空/悟空、`Role2` 唐僧、`Role3` 八戒、`Role4` 沙僧、`Role5` 白龙。
- 确认角色选择从 `SelectRole` 的 `btn1` 至 `btn5` 写入 `player1/player2.roleid`。
- 确认角色创建入口在 `Config.createHero()`，并记录 `keyboardControl.setRole1/2()` 接入输入控制。
- 记录 `BaseHero.executeKeyCode()` 使用 `keyarray.join("")` 调用各角色 `myKeyDown()`。
- 汇总 `0100`、`1100`、`0010`、`1010`、`0110`、`0001`、`0101` 的组合键骨架。
- 将 `TASK-SETTINGS-002B` 改为 `Ready`，作为下一推荐任务。

更新文件：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-008

完成时间：

- 2026-05-19

完成内容：

- 新增 `src/systems/HeroSkillSystem.ts`，把 Role2 首批技能从场景调试入口收敛为固定五槽技能模型：槽 0 绑定 `sgq`，槽 1 绑定 `smb`，槽 2..4 为空。
- 按 `skills-input-index.md` 记录的 1 级公式实现 MP 门禁：`sgq` 消耗 49 MP，`smb` 消耗 107 MP；测试角色初始 MP 160，成功释放才扣 MP。
- `src/scenes/TestScene.ts` 改为扫描 `InputSystem` 的普通技能槽 `0..4`，Space/小键盘 0 与 H/小键盘 7 不触发普通技能。
- `sgq` 只有在已绑定、MP 足够、未死亡/受击、未普攻且没有技能动作/projectile 活跃时释放，继续复用 `Role2Bullet5` 等价 projectile。
- `smb` 第一段要求绑定、MP 足够、站立落地、未死亡/受击、未普攻且没有其他技能动作；成功后扣 MP 并生成 `hit4_1`。
- `smb` 第二段只允许在同一绑定槽、`hit4_1` 动作中、第一段 projectile 仍活跃且未触发二段时重入，生成 `hit4_2` 且不重复扣 MP、不重建第一段。
- 测试场景状态文本显示 MP、五槽 loadout、当前技能动作、最近技能释放和拦截原因，便于观察空槽、MP 不足、受击/死亡或攻击状态下无效果。
- 更新 `M-015` 为已复现，`M-041` 为部分复现；`VS-008` 记录正式技能槽、MP 门禁和二段重入已完成。
- 新增下一推荐任务 `TASK-SETTINGS-011`，用于继续逆向完整技能 UI、学习/拖拽绑定和存档字段。

更新文件：

- `src/systems/HeroSkillSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-006

完成时间：

- 2026-05-19

完成内容：

- 扩展 `src/systems/ProjectileSystem.ts`，把 projectile 模型从固定位置特效推进到可水平移动：新增速度、剩余距离、运行时兼容名等字段，并新增 `spawnRole2SmbProjectile()`。
- 实现 `Role2.smb -> hit4_1` 的首批等价行为：生成点按角色前方约 200、下方约 10，朝面向以每帧约 10 像素移动，攻击参数为 `magic`、击退 `[0,-3]`、`hitMaxCount = 100`、`attackInterval = 999`。
- 保留 AS3 关键差异：资源来源名为 `Role2Bullet4_1`，运行时兼容名为 `Role1Bullet4_1`，为后续 `hit4_2` 查找第一段 projectile 位置留钩子。
- 扩展 `src/scenes/TestScene.ts`，Role2 等价角色按第二技能键可在地面释放 `smb hit4_1` 占位移动 projectile；命中 `Monster30` 时继续走 `DamageEvent` 和现有命中去重。
- 扩展 `src/assets/AssetManifest.ts`，登记 `skill-projectile.role2.smb.hit4_1`，并把 Role2 技能 projectile 缺口族扩到 `Role2Bullet4_1/Role1Bullet4_1/Role2Bullet4_2/Role2_hit4`。
- 更新 `VS-008`、`M-025/M-034/M-035` 状态说明，并新增后续 Ready 任务 `TASK-SLICE-007`。

更新文件：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 提示 chunk 超过 500 kB，为现有打包体积提示。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-004B

完成时间：

- 2026-05-13

完成内容：

- 静态扫描 `export/monster/Monster*.as`，按文件长度、boss 分支、技能入口、召唤、飞行、销毁覆写和弹体复杂度筛选候选。
- 重点阅读 `Monster7`、`Monster8`、`Monster30`、`Monster55`、`Monster56`、`Monster57`、`Monster61`、`Monster76`、`Monster77`、`Monster78`、`Monster113` 等短文件或早期关卡相关怪物。
- 在 `monsters-index.md` 记录候选推荐排序：首选 `Monster30`，地面备选 `Monster7`，其后为 `Monster8`、`Monster78`、`Monster77`。
- 说明不推荐 `Monster2/4/5/55/56/57/35/36/37/38` 作为首个现代怪物的原因。
- 将 `M-031` 标为部分已扒，并把 `TASK-SETTINGS-004C` 指向 `Monster30.as`。

更新文件：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-002B

完成时间：

- 2026-05-13

完成内容：

- 细读 `Role1.as` 至 `Role5.as` 的 `normalHit()`、`isNormalHit()` 和相关跑动/空中普攻入口。
- 记录五个角色的普攻触发键、地面连段、空中普攻、跑动普攻、连段窗口和冷却。
- 将 `Role2 hit1` 标为最小输入到攻击状态候选，将 `Role3` 地面第一段 `hit2` 标为近战候选。
- 将 `M-023` 标为已扒，并将 `TASK-SETTINGS-002C` 改为 `Ready`。

更新文件：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-002C

完成时间：

- 2026-05-13

完成内容：

- 细读 `BaseHero.sendSkill()`、`KeyBoardControl` 技能键数组、`User.returnSkillNameBySkillKey()`、`Config.allSklName/findLhValueBySkillName()`。
- 细读 `Role1.as` 至 `Role5.as` 的 `showSkill()` 和对应 `skill_*()` 入口。
- 记录五个角色的技能代号、MP 消耗公式、入口动作/效果摘要，以及未实现或疑似被动/废弃的技能代号。
- 推荐 `Role2 唐僧` 作为第一个实现角色，`Role2 hit1` 作为第一个普攻动作，`Role2 sgq -> hit5` 作为第一个技能候选。
- 将 `VS-002` 标为已完成，`M-025` 标为部分已扒，并将 `TASK-SETTINGS-003` 改为当前推荐 Ready 任务。
- `TASK-SETTINGS-002` 的三个子任务已全部完成，同步归档父任务。

更新文件：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-002

完成时间：

- 2026-05-13

完成内容：

- 通过 `TASK-SETTINGS-002A/002B/002C` 完成五个角色动作和技能索引拆分任务。
- 角色索引已覆盖身份、创建入口、资源线索、输入入口、组合键骨架、普攻连段、技能分发和第一切片候选。

更新文件：

- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-003

完成时间：

- 2026-05-13

完成内容：

- 确认默认新档第一主线关是 `curStage = 1`、`curLevel = 1`，对应 `StageListener11/sl11/bg11`。
- 记录场景加载链路：`MainGame.GameStart()`、`MainGame.newGame()`、`BaseGameSence`、`PhysicsWorld.pWorldInit()`、`BaseLevelListenering.start()`。
- 记录 `PhysicsWorld.addSubObj()` 的墙体、传送门、停点、怪物出现点等地图标记识别方式。
- 确认 `1-1` 的刷怪和 boss 流程：周期性按玩家位置刷 `Monster30`，到顶部后 `callBoss()` 生成 `Monster3`。
- 确认 `Monster3` 在 `1-1` 中死亡后显示传送门，角色按上/交互通过 `LevelVictor` 和 `MainGame.levelClear()` 通关。
- 推荐后续第一个现代关卡切片先做 `1-1` boss 区窄切片，完整纵向爬升和随机飞行怪后续扩展。
- 将 `M-014`、`M-026`、`M-027`、`M-028` 标为已扒，并将下一推荐任务改为 `TASK-SETTINGS-004A`。

更新文件：

- `docs/reverse-engineering/levels-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-004A

完成时间：

- 2026-05-13

完成内容：

- 建立 `docs/reverse-engineering/monsters-index.md` 初版，记录 `BaseMonster` 字段、初始化、AI、受击、死亡、销毁和掉落入口。
- 确认怪物创建入口是 `MainGame.createMonster(kind, x, y)`，运行时由 `PhysicsWorld.step()` 更新 `monsterArray` 和怪物自己的 `magicBulletArray`。
- 确认 `BaseMonster.step()` 在 `BaseObject.step()` 基础上追加目标选择、追踪、普攻/技能触发、回血、技能冷却和 boss 受击条。
- 确认怪物受击入口是 `BaseMonster.beMagicAttack()`，由 `BaseBullet.checkAttack()` 命中后调用，并用 `beAttackIdArray` 避免同一攻击重复命中。
- 确认 HP 归零时先进入 `dead` 动作，具体怪物通常在死亡动画结束后调用 `dropAura()` 和 `destroy()`。
- 将 `M-030` 标为已扒，并把下一推荐任务改为 `TASK-SETTINGS-004B`。

更新文件：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-004C

完成时间：

- 2026-05-13

完成内容：

- 细读 `Monster30.as`、`StageListener11.as`、`BaseMonster.as`、`BaseObject.as`、`BaseBullet.as` 和 `SpecialEffectBullet.as`。
- 确认 `Monster30` 是第一主线关过程飞行怪：HP 150、水平速度 7、攻击范围 250、警戒范围 1000、普通攻击率 0.5。
- 记录 `StageListener11` 的刷怪规则：单人每轮 2 只、双人每轮 4 只，约每 6 秒在玩家上方生成。
- 记录 `Monster30` 动作映射：`wait/walk` 共用动画行，`hurt` 结束回 `wait`，`hit1` 在停顿计数 10 创建 `Monster30Bullet1`，`dead` 结束后 `dropAura()` 和 `destroy()`。
- 记录 `Monster30` 使用基类索敌、飞行追踪、受击、扣血、死亡和清理链路。
- 将 `M-031` 标为已扒，将 `VS-005` 标为可开始。
- 新增 `TASK-SLICE-002`，作为下一推荐任务。
- `TASK-SETTINGS-004A/004B/004C` 已覆盖父任务 `TASK-SETTINGS-004`，同步归档父任务。

更新文件：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-004

完成时间：

- 2026-05-13

完成内容：

- 通过三个子任务完成怪物基础索引：`004A` 确认基类和运行链路，`004B` 筛选首个怪物候选，`004C` 细扒 `Monster30`。
- `monsters-index.md` 已能支撑第一个怪物受击死亡切片的怪物侧验收。

更新文件：

- `docs/reverse-engineering/monsters-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-002

完成时间：

- 2026-05-15

完成内容：

- 新增 `src/systems/Monster30System.ts`，把 `Monster30.as` 的首切片事实整理成独立模型：HP 150、飞行追踪、攻击范围 250、受击、死亡和移除。
- 将 `src/scenes/TestScene.ts` 从纯输入验证扩展成怪物切片调试场景：保留 P1/P2 输入显示，生成一只占位 `Monster30`，显示目标、状态和 HP。
- 接入玩家临时攻击窗口；攻击命中时怪物进入 `hurt`，HP 归零后进入 `dead`，死亡延时后切到 `removed` 并从显示中移除。
- 保留本任务边界：怪物 `hit1` 只表现为状态，不提前实现对玩家造成伤害；掉落、经验、药品和 aura 继续后置。
- 将 `M-030` 标为部分复现，`M-031` 标为已复现，`M-032` 标为部分复现，`VS-005` 标为已完成。
- 将下一推荐任务切换为 `TASK-SETTINGS-005`。

更新文件：

- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SLICE-007

完成时间：

- 2026-05-19

完成内容：

- 扩展 `src/systems/ProjectileSystem.ts`，新增 `Role2.smb -> hit4_2` 等价二段 projectile：使用 `skill-projectile.role2.smb.hit4_2` 占位 key、来源符号和运行时名 `Role2Bullet4_2`，攻击参数沿用 `hit4` 的 `magic` 与 `[0,-3]` 击退。
- 为 `hit4_1` projectile 保留二段触发状态；第一段运行时名 `Role1Bullet4_1` 仍活跃且尚未触发二段时，第二技能键会读取第一段当前位置作为记录点。
- 扩展 `src/scenes/TestScene.ts` 的 Role2 技能门禁：第二技能键第一次生成 `hit4_1`，第一段存在时再次按键生成 `hit4_2`，不重建第一段。
- 在 `src/assets/AssetManifest.ts` 登记 `skill-projectile.role2.smb.hit4_2` 稳定 key；真资源仍按 `assets-index.md` 记录为缺失，需要后续补 `TangSeng` / `SpecialUI/TangSeng` 角色包。
- 更新 `projectiles-index.md`、`assets-index.md`、`VS-008` 与 `M-025/M-034/M-035` 状态说明，并把下一推荐任务切到 `TASK-SETTINGS-010`。

更新文件：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过；Vite 仍提示现有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-009

完成时间：

- 2026-05-19

完成内容：

- 查证主包 `[172845].swf` 与备用包 `[25034429].swf` 的 `symbols.csv`、图片导出和全 `resources/` 路径/文本，确认 `Role2Bullet5` 与 `Role2_hit5` 当前没有可直接接入的真资源。
- 结合 `AssetsLoader.getRoleNameByID(2)`，确认 Role2 技能素材更可能来自运行时角色包 `TangSeng` 或 `SpecialUI/TangSeng`，不是当前主包导出的遗漏命名。
- 在 `projectiles-index.md` 补充 `Role2` 技能 projectile 映射：`sgq/hit5`、`xbz/hit3`、`smb/hit4_1/hit4_2`、`myhc/hit6`、`jgz/hit7`、`tjgl/shy/hit8`、`jhsj/hit9_*` 等，并标注运动类型和首批实现价值。
- 补充 Role1、Role3、Role4、Role5 的高价值 projectile 线索，记录 `EnemyMoveBullet`、`SpecialEffectBullet`、`StabBullet` 等可作为后续实现参考的资源名。
- 更新 `assets-index.md` 的技能 projectile 资源族状态，新增 `skill-projectiles-role2` 方向和稳定 key 建议。
- 将下一推荐任务切到 `TASK-SLICE-006`，目标是实现 `Role2.smb -> hit4_1` 的 `EnemyMoveBullet("Role2Bullet4_1")` 等价移动 projectile 占位切片。

更新文件：

- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/assets-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-005

完成时间：

- 2026-05-15

完成内容：

- 细读 `Role1.as` 至 `Role5.as` 的普攻 `enterFrameFunc()`、`doHit*()`、`normalHit()` 路径，并对照 `BaseBullet`、`BaseBitmapDataPool`、`SpecialEffectBullet`、`FollowBaseObjectBullet`、`EnemyMoveBullet`。
- 新建 `attack-effects-index.md`，落表前四名角色的普攻附属对象、沙僧两种武器形态差异，以及白龙枪/剑两套普攻本体动作资源与附属对象。
- 确认 `[172845].swf` 当前导出的 `symbols.csv` 和 `images/` 不含这些普攻关键素材；把需要补提取的资源名整理成显式缺口清单。
- 识别白龙枪形态 `doSingleHit(...)` 为当前 AS3 反编译缺口：调用存在，但 helper 定义未恢复，因此 `M-047` 暂时只能从“未扒”推进到“部分已扒”。
- 为 `TASK-SLICE-001` 明确占位策略：保持稳定 key、区分角色/武器形态、先替换素材后替换代码。
- 将下一推荐任务切换为 `TASK-ARCH-002`，因为接下来最该做的是把已知缺口变成真实资源索引和加载方案。

更新文件：

- `docs/reverse-engineering/attack-effects-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-ARCH-002

完成时间：

- 2026-05-15

完成内容：

- 梳理 `AssetsLoader`、`BaseBitmapDataPool`、`BaseGameSence`、`PhysicsWorld` 和当前导出目录，确认原版按关卡、角色、特效分散加载，当前主包导出不足以直接承接首批战斗美术。
- 新建 `assets-index.md`，记录角色、首怪、首关的运行时命名族，明确五角色普攻资源、`Monster30` 和 `sl11/bg11/floorBg1` 仍缺真实素材。
- 将 `AssetManifest.ts` 扩展为状态化骨架：区分 `placeholder` 与 `missing-original`，登记首批缺失资源族，并保留当前唯一可执行的 `scaffold` bundle。
- 将 `M-035` 推进到“已扒/部分复现”，并把 `VS-004` 的资源前置从“还没策略”收束为“可先按稳定 key 占位，真素材后补”。
- 新增后续 Ready 任务 `TASK-SETTINGS-006`，转向补齐 `VS-003` 所需的移动细节。

更新文件：

- `docs/reverse-engineering/assets-index.md`
- `src/assets/AssetManifest.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-006

完成时间：

- 2026-05-15

完成内容：

- 细读 `BaseHero.__keyBoardDown()`、`addDoubleCount()`、`jump()`、`BaseObject.getFallDown()`、`nearToWall()` 以及五角色移动入口。
- 新建 `movement-index.md`，明确原版跑步是 `< 500 ms` 同向双击、第二次按住期间维持；普通移动使用 `walk/run`，Role2 首切片速度可取 `6/10`。
- 记录双跳闭环：`jumpPower = -20`，`jump1 -> jump2 -> jump3`，落地后把 `jumpCount` 重置为 `0`。
- 确认 `S+K` 只会在 `ThroughWall` 上触发主动下穿；`ThroughUpButDownWall` 和 `FallDownWhenStandingWall` 不应在首切片里被一股脑当成同类平台。
- 将 `M-011/M-012/M-013` 都推进到“已扒”，把 `VS-003` 推进到“可开始”。
- 新增后续 Ready 任务 `TASK-SLICE-003`，让首个角色移动切片可以直接进入实现。

更新文件：

- `docs/reverse-engineering/movement-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-003

完成时间：

- 2026-05-15

完成内容：

- 新增 `src/systems/HeroMovementSystem.ts`，把首个角色移动切片整理成独立模型：Role2 等价速度、`wait/walk/run/jump1/jump2/jump3`、同向双击跑步、双跳、落地和 `ThroughWall` 下穿。
- 在 `src/scenes/TestScene.ts` 中生成可控 P1/P2 角色，加入普通地面和一个 `ThroughWall` 等价测试平台，并继续保留既有 `Monster30` 调试切片。
- 为角色移动加入测试场景横向边界，避免玩家离开画面后无法返回。
- 按原版事实处理关键手感：跑步只在 `< 500 ms` 同向双击后的第二次按住期间维持，`S+K` 下穿时把 `jumpCount` 置为 `1`。
- 将 `M-011/M-012/M-013` 标为已复现，`VS-003` 标为已完成，并把下一推荐任务切换为 `TASK-SLICE-001`。

更新文件：

- `src/systems/HeroMovementSystem.ts`
- `src/scenes/TestScene.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SLICE-001

完成时间：

- 2026-05-19

完成内容：

- 新增 `src/systems/HeroNormalAttackSystem.ts`，实现五角色普攻状态：悟空五段、唐僧固定 `hit1`、八戒三段、沙僧铲/弓形态三段、白龙枪/剑形态四段，并覆盖跑动/空中普攻入口。
- 在 `src/assets/AssetManifest.ts` 登记五角色普攻占位特效稳定 key，保持与 `attack-effects-index.md` 的资源缺口清单可追踪。
- 扩展 `src/scenes/TestScene.ts`，P1/P2 可切换 Role1 至 Role5，普攻显示动作名、可见占位特效和攻击窗口，并能继续命中当前 `Monster30` 调试怪。
- 保留白龙枪形态 `doSingleHit(...)` 反编译缺口，不伪造原始资源名；现代侧使用 `normal-attack-effect.hero5.spear.unresolved` 占位。
- 将 `VS-004` 标为已完成，`M-023` 标为已复现，`M-047` 标为部分复现。
- 新增下一推荐任务 `TASK-SETTINGS-007`，用于逆向基础互伤规则并支撑后续 `VS-006`。

更新文件：

- `src/systems/HeroNormalAttackSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/tasks/task-board.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-007

完成时间：

- 2026-05-19

完成内容：

- 细读 `BaseBullet.checkAttack()`、`BaseObject.setAttackBack()/setYourFather()`、`BaseHero.beMagicAttack()/reduceHp()/beAttackDoing()`、`BaseMonster.beMagicAttack()/getRealHurt()/reduceHp()` 和 `Monster30` 攻击帧。
- 新建 `docs/reverse-engineering/combat-rules-index.md`，记录原版互伤链路：攻击 id、目标选择、命中去重、`attackBackInfoDict`、玩家/怪物受击、扣血、击退和保护。
- 明确首个 `VS-006` 实现边界：保留 `DamageEvent` 或等价结构、命中去重、玩家 HP/受击/短保护、`Monster30 hit1` 对玩家造成 `power = 15` 物理伤害；后置完整子弹系统、暴击、闪避、装备、boss 受击条、复活和联网/PK。
- 将 `M-032` 逆向状态标为已扒，`M-033` 逆向状态标为已扒。
- 将 `VS-006` 从待机制推进到可开始，并新增下一推荐 `TASK-SLICE-004`。

更新文件：

- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-004

完成时间：

- 2026-05-19

完成内容：

- 新增 `src/systems/CombatSystem.ts`，提供首批统一伤害事件 `DamageEvent`、`AttackKind`、`HitRegistry` 和按 `attackId -> targetId` 的命中去重函数。
- 新增 `src/systems/HeroCombatSystem.ts`，为玩家建立 HP、`ready/hurt/dead`、短保护、最近伤害事件和占位击退模型。
- 扩展 `src/systems/HeroNormalAttackSystem.ts`，让普攻实例携带 `attackKind`，玩家普攻命中 `Monster30` 时不再走临时直接扣血，而是先生成伤害事件。
- 扩展 `src/systems/Monster30System.ts`，让 `Monster30 hit1` 生成占位攻击窗口，命中玩家时造成 `power = 15`、`attackKind = physics`、击退 `[6, -5]` 的首批等价伤害。
- 扩展 `src/scenes/TestScene.ts`，显示玩家 HP/受击/死亡、怪物 HP/状态和最近伤害事件；死亡玩家不再移动、攻击或参与怪物目标选择。
- 将 `VS-006` 标为已完成，`M-032` 标为已复现，`M-033` 标为部分复现，并把下一推荐任务切换为 `TASK-SETTINGS-008`。

更新文件：

- `src/systems/CombatSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/HeroNormalAttackSystem.ts`
- `src/systems/Monster30System.ts`
- `src/scenes/TestScene.ts`
- `docs/domain/glossary.md`
- `docs/tasks/task-board.md`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-008

完成时间：

- 2026-05-19

完成内容：

- 细读 `BaseBullet.as`、`export/bullet/`、`World/PhysicsWorld.as` 和 `Role2.as` 中 `sgq -> hit5` 的创建链。
- 新建 `docs/reverse-engineering/projectiles-index.md`，记录原版 projectile 生命周期、目标选择、命中检测、`attackInterval` 重复命中、命中去重和主要 `BaseBullet` 派生类。
- 确认首个技能切片依据：`Role2.showSkill()` 解析 `sgq` 后进入 `skill_sgq()`，动作 `hit5` 在角色前方约 175、上方约 110 创建 `SpecialEffectBullet("Role2Bullet5")`。
- 记录 `Role2 hit5` 攻击参数：`attackKind = magic`、`attackInterval = 16`、`hitMaxCount = 999`、击退 `[5,-2]`；现代侧应复用 `DamageEvent`，但需要 projectile 生命周期和按命中周期刷新的去重 key。
- 将 `M-034` 逆向状态推进为部分已扒，`VS-008` 推进为可开始。
- 把下一推荐任务切换为 `TASK-SLICE-005`，用于实现第一个技能/子弹切片。

更新文件：

- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/combat-rules-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SLICE-005

完成时间：

- 2026-05-19

完成内容：

- 新增 `src/systems/ProjectileSystem.ts`，实现 `Role2.sgq -> hit5` 等价的首个固定位置 projectile：生成点约为角色前方 175、上方 110，生命周期独立推进，并在来源受击/死亡或持续时间结束时清理。
- 在 `src/assets/AssetManifest.ts` 登记 `skill-projectile.role2.sgq.hit5` 占位 key 和 `Role2Bullet5`/`Role2_hit5` 真实资源缺口。
- 扩展 `src/scenes/TestScene.ts`，让 Role2 等价角色可通过第一技能键释放占位 `sgq hit5`，命中 `Monster30` 时通过 `DamageEvent` 造成 `attackKind = magic`、击退 `[5,-2]` 的伤害。
- 支持 `hitIntervalFrames = 16` 的重复命中周期：同一 projectile 在同一命中周期内不会对同一目标重复扣血，下一周期可再次结算。
- 更新 `VS-008` 为已完成，推进 `M-025/M-034/M-035` 的现代复现状态，并新增后续 Ready 任务 `TASK-SETTINGS-009` 用于继续定位真资源和更多弹体映射。

更新文件：

- `src/systems/ProjectileSystem.ts`
- `src/scenes/TestScene.ts`
- `src/assets/AssetManifest.ts`
- `docs/domain/glossary.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-010

完成时间：

- 2026-05-19

完成内容：

- 细读 `KeyBoardControl.as`、`BaseHero.as`、`User.as`、`Config.as`、`SkillControl.as`、`SkillSetControl.as` 和 `Role2.as`，建立 `docs/reverse-engineering/skills-input-index.md`。
- 确认正式普通技能槽只有 5 个：P1 为 `Y/L/U/I/O`，P2 为小键盘 `8/3/4/5/6`；`sendSkill(5)` 是 Space/小键盘 0 的角色特殊，`sendSkill(6)` 是 H/小键盘 7 的法宝，不走 `User.skillbykey`。
- 记录 `User.skillbykey` 最小字段 `{ skillName, keys, needLh, slev }`，以及 `SkillControl` 学习后自动绑定空槽、`SkillSetControl` 拖拽替换绑定的边界。
- 确认原版没有统一技能释放 CD；技能释放主要靠绑定解析、MP 门禁、`isAttacking()`/`isBeAttacking()` 和动作持续时间限制，`attackInterval` 是 projectile 持续命中间隔，不是释放冷却。
- 细化 `Role2.sgq`：正式槽解析到 `sgq` 后，按 `consumeMP[level] * 0.55 * 35173 / 25958` 扣 MP，未攻击/未受击时进入 `hit5` 并生成现有 `Role2Bullet5` 等价 projectile。
- 细化 `Role2.smb`：第一段按 `consumeMP[level] * 1.2 * 35173 / 25958` 扣 MP 并进入 `hit4_1`；`hit4_1` 中再次按同一绑定槽且第一段 projectile 仍活跃时可进入 `hit4_2`，第二段不再扣 MP。
- 更新 `roles-index.md`、`projectiles-index.md`、`mechanics-index.md`、`vertical-slices.md`，并把下一推荐任务切到 `TASK-SLICE-008`。

更新文件：

- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。

### TASK-SETTINGS-011

完成时间：

- 2026-05-22

完成内容：

- 细读 `BuySkill.as`、`SkillControl.as`、`SkillSetControl.as`、`PassiveSkillControl.as`、`User.as`、`MemoryClass.as`、`SaveInter.as`、`RoleInfo.as`、`GameInfo.as`、`KeyBoardControl.as` 和 `Config.as` 中与技能学习、升级、绑定和存档相关的所有代码。
- 大幅更新 `skills-input-index.md`，新增 6 个章节：技能学习（心法树、buy、空槽顺序、isstudyskill 格式）、技能升级（双公式、等级限制、灵魂消耗曲线）、拖拽绑定 UI（五框 hitTest、P1/P2 键值映射、unshift 置顶）、被动技能（五槽、curLevel/5 上限）、存档持久化（User.getSaveObj 全字段、MemoryClass 顶层结构、文件格式）和现代数据模型建议（TypeScript 类型、核心数据流、关键边界）。
- 确认技能学习上限恒为 10（加载时强制 setSkillLimit(10)），心法升级消耗为 100/200/500/1000/2000 灵魂，空槽顺序 P1 为 Y→U→I→O→L、P2 为 8→4→5→6→3。
- 确认绑定排序规则：新绑定 unshift 到数组最前，旧绑定移到末尾；只有前 5 个参与 returnSkillNameBySkillKey 解析。
- 确认 UI 快捷键 C/V/B/N/Esc（P1）和 小键盘 / * -（P2）在 GameInfo 存在时才生效，打开技能面板时会暂停游戏并屏蔽战斗输入。
- 在 `skills-input-index.md` 第 11 节给出了含具体类型和公式的最小现代数据模型。
- 更新 `M-016`（UI 快捷键）逆向状态、`M-041`（技能学习/绑定）逆向状态、`M-044`（存档）逆向状态。
- 更新 `VS-008` 后续边界说明，明确下一实现任务 `TASK-SLICE-009` 可直接按现代数据模型搭建完整技能 UI。

更新文件：

- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。
### TASK-SLICE-019

完成时间：

- 2026-05-28

完成内容：

- 将 `drops-index.md` 全 `Monster*.as` 扫描中已确认的 `dj/zb` 候选扩展到 `src/systems/DropSystem.ts` 的 `MonsterDropTables`，覆盖 `Monster1/2/31+`、`Monster100+`、`Monster600+`、`Monster1000+`、`Monster6000+` 等现代掉落配置。
- 扩展掉落上下文与分支条件，支持 `averageLevelMin` 和 `curStageNot`，覆盖 `Monster128` 平均等级分支与 `Monster172` 关卡/平均等级分支。
- 保留零掉率、空 `fallList` 和多次赋值边界：`Monster601` 等零概率不生成掉落，`Monster136` 采用最终 `xhb` 分支，默认概率怪如 `Monster207` 保持 `probability = 0.15`。
- `Monster2001` 的 `cwzb:p_cykljl` 只登记为 `unsupported` 空分支，没有伪装成 `dj/zb` 入包。
- `EquipmentSystem.ts` 增补本批 `dj/zb` 掉落所需的最小占位定义，完整中文名、属性、合成和强化关系后置。
- `TestScene.ts` 新增配置化掉落调试入口：`F9` 为新增普通怪 `Monster1`，`F10` 为新增 boss `Monster31`，`F11` 为默认掉率 `Monster207`，`F12` 为零掉率 `Monster601`。
- `tools/system-tests.ts` 补充默认概率、零概率、最终赋值、`Monster128/172` 条件分支和 `Monster2001` unsupported 边界测试。
- 更新 `VS-009` 与 `M-038` 说明，并从 `task-board.md` 移除已完成任务。

更新文件：

- `src/systems/DropSystem.ts`
- `src/systems/EquipmentSystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/tasks/vertical-slices.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run test:systems` 通过。
- `npm run build` 通过。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-017

完成时间：

- 2026-05-28

完成内容：

- 追踪 `cwzb/p_cykljl/cykljl` 在主参考包与备用包中的全文命中，确认 `p_cykljl` 只出现在 `Monster2001`，未在 `AllEquipment`、背包、`PetInfo` 或 `PetInterface` 中发现定义或入包分支。
- 确认 `Monster2001` 写入的是 `protectedParamsObject.fallProbability = 0.1` 与 `protectedParamsObject.fallList`，而可见 `BaseMonster.fallEquip()` 读取 `protectedParamsObject.probability` 与 `this.fallList`，主参考源码未发现桥接复制。
- 确认即便有隐藏桥接创建 `FallEquipObj({ bigtype:"cwzb" })`，`FallEquipObj.colwho()` 也只处理 `zb/dj/sz`；未匹配分支不会写入 `petsAry` 或任何背包列表，随后仍会淡出移除。
- 初步梳理宠物系统边界：宠物主数据在 `User.petsAry/PetInfo`，UI 入口为 `RoleInfo.btn_cw -> PetInterface`，宠物消耗品如 `cwzzxld/cwjnxld/djyys/wpcsd/wphhd/wphtd` 是普通 `zbwp` 道具并走道具背包。
- 更新 `drops-index.md`，将 `Monster2001/cwzb` 结论改为未接通/unsupported，不再作为待实现掉落类型。
- 更新 `mechanics-index.md`：`M-038` 明确 `cwzb` 不作为现代掉落类型；`M-042` 推进为部分已扒。
- 将看板下一推荐任务切到 `TASK-SETTINGS-018`，用于宠物系统基础逆向。

更新文件：

- `docs/reverse-engineering/drops-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：

- `npm run check:workflow` 通过。
### TASK-SLICE-034

完成时间：
- 2026-06-02

完成内容：
- 扩展 `src/systems/MagicWeaponSystem.ts`，新增 `zltc` 震雷天锤 H 触发分支：法宝等级低于 1 时拒绝释放并保持 `wait`；普通五行动作窗口约 25 帧（417ms），木五行动作窗口约 20 帧（333ms）；使用中重复 H 拒绝重入。
- 扩展 `src/systems/ProjectileSystem.ts`，新增 `magic-weapon-zltc` / `zltcskill` 占位 projectile：按 AS3 `MagicZLHummer` 在角色前方 160、上方 42 生成，动作名 `fabao-zltc`，命中参数保留 `magic`、击退 `[2,-2]`、`attackInterval = 6`，并携带 4.5 秒 stun 数据。
- 扩展 `src/systems/Monster30System.ts` 与 `src/scenes/TestScene.ts`，新增 Monster30 `magicZlHummerStun` 最小状态；雷锤 projectile 命中时走现有 `DamageEvent`/`applyMonster30Hit()` 扣血受击，并挂 `zltc-stun` 可观测状态，到期清理并恢复行为。
- 扩展 `src/systems/EquipmentSystem.ts`、`src/systems/InventorySystem.ts` 与 `src/assets/AssetManifest.ts`，加入 `zltc` 种子 `zbfb` 法宝、测试背包装备入口，以及 `ZLHummerBmd/zltcskill/zltcbox` 资源缺口登记。
- 扩展 `tools/system-tests.ts`，覆盖 `zltc` 等级门禁、前方 projectile 生成、普通/木五行动作边界、无目标边界、命中伤害和 4.5 秒 stun、到期清理、重入拒绝。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/reverse-engineering/magic-weapons-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将下一步推荐切到 `TASK-SETTINGS-022`。

更新文件：
- `src/systems/MagicWeaponSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/EquipmentSystem.ts`
- `src/systems/InventorySystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-046

完成时间：
- 2026-06-03

完成内容：
- 扩展 `src/systems/PetSystem.ts`，让种子 `monkey3` 持有已学 `lj`，新增 `monkey3Lj` 受击触发/冷却状态、20 MP 门禁、500ms 冷却、触发重置和 `4.2 * pet.atk` 伤害结算。
- `markActivePetSkillTriggered()` 现在会按当前出战宠物形态把等价受击触发写入 `monkey1Xj`、`monkey2Xj` 或 `monkey3Lj`，保持已有 `monkey1/xj`、`monkey2/xj` 行为不回退。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-monkey3-lj` / `PetMonkey3Bullet3_2` / `hit4` 占位 projectile，并登记 `PetMonkey3Bullet3_1/_2` 资源缺口，不补提取、不修改 `extracted_flash/`。
- 扩展 `src/scenes/TestScene.ts`，当前出战宠物为 `monkey3` 时保持 `lyq -> xj -> lj` 的技能尝试顺序；`lj` 只在受击触发标记为 ready 且前置技能未成功释放时尝试。
- 扩展 `tools/system-tests.ts`，覆盖 `monkey3/lj` 未学习、触发未就绪、MP 不足、无目标、冷却、扣 MP、触发重置、projectile 生成和 `Monster30` 伤害。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-021` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-047`。

更新文件：
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-045

完成时间：
- 2026-06-03

完成内容：
- 扩展 `src/systems/PetSystem.ts`，让种子 `monkey3` 持有已学 `xj`，新增 `monkey3Xj` 冷却状态、20 MP 门禁、500ms 冷却和 `2.6 * pet.atk` 伤害结算。
- `monkey3/xj` 不要求受击触发或距离门禁；满足已学习、MP、冷却和目标存在时释放，并记录最近释放反馈。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-monkey3-xj` 占位 projectile；按 AS3 `PetMonkey3.doHit3()` 事实复用 `PetMonkey1Bullet2` / `hit3` 映射，不补提取、不修改 `extracted_flash/`。
- 扩展 `src/scenes/TestScene.ts`，当前出战宠物为 `monkey3` 时保持 `lyq -> xj` 的技能尝试顺序；`lyq` 成功释放则本帧不再释放 `xj`，`lyq` 未成功时可尝试 `xj`。
- 扩展 `tools/system-tests.ts`，覆盖 `monkey3/xj` 未学习、MP 不足、无目标、冷却、扣 MP、projectile 生成和 `Monster30` 伤害。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-020` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-046`。

更新文件：
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-044

完成时间：
- 2026-06-03

完成内容：
- 扩展 `src/systems/PetSystem.ts`，在测试种子宠物列表中新增可切换出战的 `monkey3`，并让其持有已学 `lyq`。
- 为 `monkey3/lyq` 增加最小主动技能状态：已学习、MP `>= 20`、500ms 冷却、存在存活 `Monster30` 目标且宠物到目标距离 `<= 400` 时释放。
- 释放 `lyq` 时扣 20 MP、进入冷却、记录最近释放反馈，并按 `6.8 * pet.atk` 派生伤害。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-monkey3-lyq` / `PetMonkey3Bullet2` / `hit2` 占位 projectile 和资源缺口登记，不补提取、不修改 `extracted_flash/`。
- 扩展 `src/scenes/TestScene.ts`，当前出战宠物为 `monkey3` 且冷却就绪时自动尝试 `lyq` 目标选择；状态栏和宠物面板显示 `lyq` 冷却和最近释放结果。
- 扩展 `tools/system-tests.ts`，覆盖 `monkey3/lyq` 未学习、MP 不足、无目标、距离门禁、冷却、扣 MP、projectile 生成和 `Monster30` 伤害。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-019` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-045`。

更新文件：
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-043

完成时间：
- 2026-06-03

完成内容：
- 扩展 `src/systems/PetSystem.ts`，让种子 `monkey2` 持有已学 `xj`，新增 `monkey2Xj` 受击触发/冷却状态、20 MP 门禁、500ms 冷却、触发重置和 `2.6 * pet.atk` 伤害结算。
- `markActivePetSkillTriggered()` 现在会按当前出战宠物形态把等价受击触发写入 `monkey1Xj` 或 `monkey2Xj`，保持 `monkey1/xj` 行为不回退。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-monkey2-xj` / `PetMonkey2Bullet3` / `hit3` 占位 projectile 和资源缺口登记，不补提取、不修改 `extracted_flash/`。
- 扩展 `src/scenes/TestScene.ts`，P1 被 `Monster30` 命中时可触发二阶猴 `xj`；二阶猴自动技能顺序保持 `lj` 优先，`lj` 未成功释放时再尝试受击触发的 `xj`。状态栏和宠物面板显示 `monkey2/xj` 触发、冷却和最近释放结果。
- 扩展 `tools/system-tests.ts`，覆盖 `monkey2/xj` 未学习、触发未就绪、MP 不足、无目标、冷却、扣 MP、触发重置、projectile 生成和 `Monster30` 伤害。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-018` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-044`。

更新文件：
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-042

完成时间：
- 2026-06-03

完成内容：
- 扩展 `src/systems/PetSystem.ts`，在测试种子宠物列表中新增可切换出战的 `monkey2`，并让其持有已学 `lj`；宠物面板可通过选择/出战切换到 `monkey2`。
- 为 `monkey2/lj` 增加最小主动技能状态：已学习、MP `>= 20`、冷却就绪且存在存活 `Monster30` 目标时释放；`lj` 不要求受击触发标记。
- 释放 `lj` 时扣 20 MP、进入 500ms 冷却、记录最近释放反馈，并按 `4.2 * pet.atk` 派生伤害。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-monkey2-lj` / `PetMonkey2Bullet2` 占位 projectile 和资源缺口登记，不补提取、不修改 `extracted_flash/`。
- 扩展 `src/scenes/TestScene.ts`，当当前出战宠物为 `monkey2` 且冷却就绪时，自动尝试 `lj` 目标选择并生成可见 projectile；状态栏和宠物面板展示 `lj` 冷却与最近释放结果。
- 扩展 `tools/system-tests.ts`，覆盖 `monkey2/lj` 未学习、MP 不足、冷却门禁、无目标、扣 MP、projectile 生成和 `Monster30` 伤害；同步调整种子宠物列表的单只出战测试。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-017` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-043`。

更新文件：
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SLICE-041

完成时间：
- 2026-06-03

完成内容：
- 扩展 `src/systems/PetSystem.ts`，为 P1 出战 `monkey1` 增加最小宠物技能状态：测试种子已学 `xj`，包含受击等价触发标记、500ms 冷却、最近释放反馈和 `2.6 * pet.atk` 伤害派生。
- `xj` 释放门禁覆盖已学习、MP `>= 20`、触发标记、冷却就绪和存在存活 `Monster30` 目标；释放成功扣 20 MP，重置触发标记并进入冷却。
- 扩展 `src/systems/ProjectileSystem.ts` 与 `src/assets/AssetManifest.ts`，新增 `pet-monkey1-xj` / `PetMonkey1Bullet2` 占位 projectile 和资源缺口登记，不补提取、不修改 `extracted_flash/`。
- 扩展 `src/scenes/TestScene.ts`，在 P1 被 `Monster30` 命中时给出战宠物设置等价触发标记；宠物系统更新时满足门禁会生成可见 projectile，并复用现有 projectile 命中链路对 `Monster30` 造成伤害。状态栏和宠物面板显示已学技能、MP、触发/冷却和最近释放结果。
- 扩展 `tools/system-tests.ts`，覆盖未学习、触发未就绪、MP 不足、无目标、冷却门禁、扣 MP、触发重置、projectile 生成和 `Monster30` 伤害。
- 更新 `docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将 `VS-016` 标记完成，并新增 Ready 后续任务 `TASK-SLICE-042`。

更新文件：
- `src/systems/PetSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

### TASK-SETTINGS-022

完成时间：
- 2026-06-02

完成内容：
- 细读 `Ling.as`、`BaseMagicWeapon.as`、`BaseHero.as`、`BaseBullet.as`、`EnemyMoveBullet.as`、五个 `Role*.as` 的 `getRealPower("fabao-snow")` 分支，以及 `AllEquipment.as` / `MyEquipObj.as` 中 `stlp` 装备定义。
- 确认 `stlp` 装备入口：`BaseHero.initMagicWeapon()` 通过 `fillName == "stlp"` 创建 `Ling`；H / 小键盘 7 走通用 `BaseMagicWeapon.useSkill()`，无显式 MP、灵魂或等级门禁，使用中重入直接返回。
- 确认 `Ling.showSkill()` 释放链路：创建禁用的 `LingPaiEffect` 起手表现，然后一次性生成 `totalNum = 120` 个 `EnemyMoveBullet("ef_snow")`；普通五行动作窗口 25 帧，木五行 20 帧。
- 确认 `ef_snow` 不是目标锁定 projectile：起点在当前镜头上方随机范围，角度 50 至 60 度，速度约 10 至 15，行进距离 1500 后销毁，未调用 `setMoveTarget()`。
- 确认 `fabao-snow` 命中参数：`hitMaxCount = 999`、击退 `[2,-2]`、`attackInterval = 999`、`attackKind = magic`、`addEffect = PETHORSE_ICE` 且持续 3 秒。
- 确认五角色伤害公式核心为当前 `zbfb` 等级派生的 `0.09 * Hurt * level`，并保留 Role2/Role3/Role4/Role5 的角色修正系数作为后续校准依据。
- 确认当前 `resources/` 文件名和 SymbolClass 检索未命中 `LingBmd`、`LingPaiEffect`、`ef_snow` 或 `stlp` 真资源；后续实现使用占位 key，不重新生成 `extracted_flash/`。
- 更新 `magic-weapons-index.md`，新增 `奢天化雪令 / Ling` 章节，写明装备入口、释放窗口、120 个随机落雪、命中参数、伤害公式、资源缺口和现代最小实现边界。
- 更新 `projectiles-index.md`，补充 `ef_snow` 的 `EnemyMoveBullet` 映射、随机生成范围、非目标锁定结论、`fabao-snow` 参数和建议占位 key。
- 更新 `mechanics-index.md` 的 `M-034/M-043` 下一步，明确逆向已足够支撑 `TASK-SLICE-035`。
- 更新 `vertical-slices.md`，把当前推荐切到 `TASK-SLICE-035`，并在 `VS-013` 中记录 `stlp/Ling` 已扒清。
- 更新 `task-board.md`，移除已完成的 `TASK-SETTINGS-022`，新增 Ready 任务 `TASK-SLICE-035`。

更新文件：
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run check:workflow` 通过。

### TASK-SLICE-037

完成时间：
- 2026-06-02

完成内容：
- 扩展 `src/systems/EquipmentSystem.ts`，新增法宝强化最小模型：面板状态构建、下一级灵魂消耗 `level * level * 1000`、`MyEquipObj.getGrowthByName(fillName)` 等价现代成长表、成长率字段和 `upgradeEquippedMagicWeapon()` 纯函数。
- 强化成功会消耗测试灵魂、把当前 `zbfb` 从 1 级升到 2 级，并按成长表刷新 `magicWeapon.level` 与可观察装备属性；灵魂不足、未装备法宝和 10 级后材料阶段会拒绝并返回状态反馈。
- 扩展 `src/systems/EquipmentUISystem.ts`，在背包面板中追加 `Sutra` 区块，显示当前法宝名、等级、五行、成长率、主要属性、灵魂进度和可升级/不可升级状态。
- 扩展 `src/scenes/TestScene.ts`，提供测试灵魂池；C 打开背包面板后按 U 可触发一次法宝升级，升级后同步玩家属性、状态栏和 `MagicWeaponSystem` 当前等级。
- 扩展 `tools/system-tests.ts`，覆盖面板状态构建、灵魂消耗、升级成功、灵魂不足拒绝、未装备边界，以及 `zltc` 升级后雷锤伤害读取新等级。
- 更新 `docs/reverse-engineering/magic-weapons-index.md`、`docs/reverse-engineering/mechanics-index.md`、`docs/tasks/vertical-slices.md` 和 `docs/tasks/task-board.md`，将当前 Ready 任务归档；下一步推荐 `TASK-SETTINGS-024` 等级/经验基础逆向。

更新文件：
- `src/systems/EquipmentSystem.ts`
- `src/systems/EquipmentUISystem.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests.ts`
- `docs/reverse-engineering/magic-weapons-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。
### TASK-SETTINGS-036

完成时间：
- 2026-06-21

完成内容：
- 细读 `Role2.as`、`Role2Shadow.as`、`BaseHero.as`、`KeyBoardControl.as` 和既有角色/输入/projectile 索引，补齐唐僧两棵心法树 10 项技能的主动、被动和输入分类。
- 确认普通五槽主动技为 `sgq/myhc/jgz/tjgl/jhsj/xbz/shy/smb`；`blb` 的槽位函数为空，真实入口是 `hit1` 内持续按普攻的蓄力分支；`sjt` 是缩短蓄力阈值并提升全伤害的被动，不进入 `showSkill()`。
- 记录 `xbz` 固定范围魔法、`myhc` 群体持续回血、`jgz` 拉拽/浮空、`tjgl` 群疗/宠物治疗/护盾、`jhsj` 双窗口多段、`shy` 8 秒分身/召回传送及四技能协同的动作帧、距离、公式和状态门禁。
- 确认 Role2 除 `smb` 二段和 `shy` 创建/召回外没有统一 CD 或额外方向组合主动技，其他技能均靠 MP、攻击/受击状态和动作时长门禁。
- 当前资源路径未命中剩余 `Role2Bullet*`、`ROLE2_SHALLDOW` 或对应音效；行为事实足够使用占位 key 实现，真视觉/音频保持为资源缺口。
- 新增 `VS-037`，拆出 `TASK-SLICE-084..089`；首个 Ready 项为依赖最少、单对话可验收的 `xbz -> hit3`。

更新文件：
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/vertical-slices.md`
- `docs/tasks/task-board.md`
- `docs/tasks/task-history.md`

验证：
- `npm run check:workflow` 通过。

#### TASK-SLICE-085

完成时间：
- 2026-06-21

完成内容：
- 新增 `Role2PassiveSkillSystem.ts`，复现 `blb` 动态 MP、默认 48 帧蓄力阈值、学习 `sjt` 后 12 帧阈值，以及提前松键、未学习、MP 不足和攻击重入边界。
- 把 `hit1` 长按转换 `hit2` 接入普通攻击系统；`sjt` 等级倍率 `1.1 + 0.005 * (level - 1)` 接入 Role2 普攻和主动技能伤害。
- 从双玩家技能学习状态同步 `blb/sjt` 等级；若被动被错误绑定到主动槽，释放入口会明确返回被动提示而不扣 MP。
- 新增独立系统测试覆盖阈值切换、动态消耗、提前释放、学习门禁、MP 门禁和重入。

更新文件：
- `src/systems/Role2PassiveSkillSystem.ts`
- `src/systems/HeroNormalAttackSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/scenes/test-scene/TestSceneRole2SkillBridge.ts`
- `tools/system-tests/role2-passive-tests.ts`

验证：
- `npm run check:structure` 通过。
- `npm run test:systems` 通过。
- `npm run build` 通过。

#### TASK-SLICE-094

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role3UltimateSkillSystem.ts`，实现 `tmc` 首段 `Role3Bullet12_1` 护体、原版 MP 公式、盾等级减伤和免击退。
- 同槽位窗口内第二次释放不重复扣 MP，生成 10 枚半径 100 环形 `Role3Bullet12_2`，0.3 秒等价飞向随机存活目标；无目标时使用原版下方回退点。
- 实现每枚独立伤害、目标记录、三次重入拒绝、动作/护体清理，以及 `zznh` 待消费强化与每枚 `hurtAdd 0.3` 协同。
- 完成 Role3 总验收：九项主动、`rj` 被动和普攻+上组合入口全部具备正式输入、MP/动作门禁、数值、生命周期、双玩家隔离与系统测试。

更新文件：
- `src/systems/Role3UltimateSkillSystem.ts`
- `src/systems/Role3DefenseSkillSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole3SkillBridge.ts`
- `tools/system-tests/role3-defense-skill-tests.ts`
- Role3 逆向索引、机制表、切片表、任务看板和任务历史。

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:structure` 通过（仅既有大文件 warning）。
- `npm run check:workflow` 通过。

边界：
- 真实 Role3 视觉/音频资源仍缺；现代版使用已登记的稳定占位 key。

推荐任务：
- `TASK-SLICE-095`：Role1 `slz/sx` 与组合输入基础。

#### TASK-SLICE-093

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role3MobilitySkillSystem.ts`，实现 `dgq` 的每帧 15 等价水平突进、五段魔法伤害和动作结束静止。
- 实现 `xgq` 起手占位、角色隐藏、300ms 后 `Role3Bullet11` 四段伤害和 900ms 后恢复显示。
- 两项技能接入原版 MP/等级伤害公式、一次性强化、正式输入、双玩家隔离和资源缺口登记。

更新文件：
- `src/systems/Role3MobilitySkillSystem.ts`
- `src/systems/Role3DefenseSkillSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole3SkillBridge.ts`
- `src/scenes/test-scene/TestSceneWorldBridge.ts`
- `tools/system-tests/role3-defense-skill-tests.ts`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。

推荐任务：
- `TASK-SLICE-094`。

#### TASK-SLICE-092

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role3ImpactSkillSystem.ts`，实现 `ssp` 的 `hit8_1` 无伤起手与 `hit8_2` 四段魔法伤害，槽位释放要求落地。
- 实现已学习 `ssp` 后的普攻+上组合入口，固定扣 20 MP、共享 `hit8` 表现且不吞普通槽位动态 MP。
- 实现 `jsp` 三段物理伤害和每次释放 10% 概率附加 2 秒眩晕，可注入随机源测试。
- 两项技能均接入一次性强化、正式输入、双玩家隔离、占位资源和场景反馈。

更新文件：
- `src/systems/Role3ImpactSkillSystem.ts`
- `src/systems/Role3DefenseSkillSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole3SkillBridge.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests/role3-defense-skill-tests.ts`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。

推荐任务：
- `TASK-SLICE-093`。

#### TASK-SLICE-091

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role3ControlSkillSystem.ts`，实现 `zznh` 全目标过滤、1.8 秒拉拽/失重恢复和 `1.1 + 0.005 * (level - 1)` 下一击一次性强化。
- 实现 `syzq` 的 `Role3Bullet7_1` 无伤起手和 `Role3Bullet7_2` 水平 `±12`、距离 999、2.5 秒生命周期、11 段口径物理 projectile。
- 一次性强化已接入 Role3 普攻、`dj` 和 `syzq`，消费后恢复 1；双玩家运行时隔离。
- 扩展 Role3 场景桥接、占位资源登记和系统测试。

更新文件：
- `src/systems/Role3ControlSkillSystem.ts`
- `src/systems/Role3DefenseSkillSystem.ts`
- `src/systems/HeroNormalAttackSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole3SkillBridge.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests/role3-defense-skill-tests.ts`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。

推荐任务：
- `TASK-SLICE-092`。

#### TASK-SLICE-090

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role3DefenseSkillSystem.ts`，实现 `dj` 原版 MP/等级伤害公式与 `Role3Bullet4` 占位 projectile。
- 实现 `sd` 三档循环盾态、每档 10 秒、等级上限 8% 减伤和盾态免击退；`Role3Bullet5` 作为无伤害占位效果。
- 实现 `rj` 等级防御表和每次有效命中按 `0.1 + level * 0.005` 概率回复 `power * 0.2` HP。
- 接入正式技能输入、Role3 默认测试槽位、P1/P2 隔离、状态栏反馈、怪物/首领/普攻命中回血和资源缺口登记。

更新文件：
- `src/systems/Role3DefenseSkillSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole3SkillBridge.ts`
- `src/scenes/test-scene/TestSceneWorldBridge.ts`
- `src/scenes/test-scene/TestSceneFormatters.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests/role3-defense-skill-tests.ts`
- `tools/system-tests.ts`

验证：
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。

边界：
- 真 Role3 技能视觉/音频未在当前导出资源中确认，继续使用稳定占位 key。

推荐任务：
- `TASK-SLICE-091`。

#### TASK-SLICE-086

完成时间：
- 2026-06-21

完成内容：
- 新增 `Role2SupportSkillSystem.ts`，实现 `myhc` 半径 100、持续 4 秒的周期治疗，并覆盖无目标边界。
- 实现 `tjgl` 半径 150 的玩家/宠物治疗、GXP 1.5 倍治疗、7 秒 `role2Tjgl` 护盾，以及护盾吸收和到期清理。
- 将支援技能接入正式技能槽、MP 门禁、动作锁和双玩家/宠物目标收集；分身存在时同步 `myhc/tjgl` 支援段，其中分身 `tjgl` 使用 0.55 系数。
- 新增系统测试覆盖治疗范围、周期、宠物目标、GXP、护盾吸收/过期、无目标和分身协同。

更新文件：
- `src/systems/Role2SupportSkillSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/scenes/test-scene/TestSceneRole2SkillBridge.ts`
- `tools/system-tests/role2-complete-skill-tests.ts`

验证：
- `npm run check:structure` 通过。
- `npm run test:systems` 通过。
- `npm run build` 通过。

#### TASK-SLICE-087

完成时间：
- 2026-06-21

完成内容：
- 新增 `Role2ControlSkillSystem.ts`，实现 `jgz` 前方效果中心、240 半径选敌、0.625 秒拉拽浮空和 0.625 秒恢复阶段。
- 明确过滤范围外、死亡和免疫目标；控制期间锁定目标重力，结束后恢复。
- 实现等级倍率 `1.006 + 0.02 * (level - 1)` 的下一次伤害一次性增幅，并接入普通攻击及 Role2 主动技能的实际伤害链。
- 新增系统测试覆盖目标过滤、拉拽/恢复、实际 `xbz` 增伤和只消费一次。

更新文件：
- `src/systems/Role2ControlSkillSystem.ts`
- `src/systems/HeroNormalAttackSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/HeroMovementSystem.ts`
- `src/scenes/test-scene/TestSceneRole2SkillBridge.ts`
- `tools/system-tests/role2-complete-skill-tests.ts`

验证：
- `npm run check:structure` 通过。
- `npm run test:systems` 通过。
- `npm run build` 通过。

#### TASK-SLICE-088

完成时间：
- 2026-06-21

完成内容：
- 新增 `Role2JhsjSkillSystem.ts`，按 60 FPS 等价时间在第 45 帧生成 `hit9_2`、第 55 帧生成 `hit9_1`，保留两类攻击间隔、位置和伤害公式。
- 通过 Role2 运行时调度两段占位 projectile，并在施法窗口锁定水平移动、暂停重力，动作结束后自动恢复。
- 分身存在时同步两段 0.35 倍变体，并保持本体、分身来源和生命周期可区分。
- 新增系统测试覆盖双窗口时序、位置、攻击间隔、伤害、移动/重力锁及恢复。

更新文件：
- `src/systems/Role2JhsjSkillSystem.ts`
- `src/systems/Role2SkillRuntimeSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/HeroMovementSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/scenes/test-scene/TestSceneRole2SkillBridge.ts`
- `tools/system-tests/role2-complete-skill-tests.ts`

验证：
- `npm run check:structure` 通过。
- `npm run test:systems` 通过。
- `npm run build` 通过。

#### TASK-SLICE-089

完成时间：
- 2026-06-21

完成内容：
- 新增 `Role2ShadowSkillSystem.ts`，实现首次释放扣 MP 并创建 8 秒分身、再次释放传送到分身并销毁且不重复扣 MP、自然到期清理。
- 新增 `Role2SkillRuntimeSystem.ts` 和 `TestSceneRole2SkillBridge.ts`，集中管理分身、支援效果、控制效果和延迟 projectile，并按玩家模型隔离 P1/P2 状态。
- 为分身使用稳定独立 source id，接入 projectile 来源快照，完成 `xbz/myhc/tjgl/jhsj` 四项协同；分身源销毁后对应效果按生命周期收束。
- 新增系统测试覆盖创建、召回、MP、传送、到期、四技能协同和双玩家所有权隔离。

更新文件：
- `src/systems/Role2ShadowSkillSystem.ts`
- `src/systems/Role2SkillRuntimeSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/scenes/test-scene/TestSceneRole2SkillBridge.ts`
- `src/scenes/test-scene/TestSceneUpdatePipeline.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests/role2-complete-skill-tests.ts`

验证：
- `npm run check:structure` 通过。
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

#### TASK-SLICE-095

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role1BasicSkillSystem.ts`，复现 `slz` 正式槽位与普攻+上组合入口、原版 MP/等级伤害公式、`hit6` 动作锁、`Role1Bullet6` 占位 projectile、物理伤害和 `[5,-20]` 击退。
- 复现 `sx` 1..9 级被动：学习/卸下时同步 `0.8 + (level-1)/10` 吸血率与 `3 + round(level)` 暴击加成；物理命中按目标实际有效伤害回血，魔法伤害不触发。
- 新增 Role1 场景桥接、Role1 调试 loadout、组合键对普攻的优先级处理、P1/P2 隔离及稳定占位资源登记。
- 新增独立 `role1-basic-skill-tests.ts`，覆盖槽位、组合、MP、动作锁、伤害、击退、被动增减、物理吸血、魔法拒绝和双玩家隔离。

更新文件：
- `src/systems/Role1BasicSkillSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole1SkillBridge.ts`
- `src/scenes/test-scene/TestSceneWorldBridge.ts`
- `src/scenes/test-scene/TestSceneCombatBridge.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests/role1-basic-skill-tests.ts`
- `tools/system-tests.ts`
- Role1 机制表、切片表、任务看板和任务历史。

验证：
- `npm run check:structure` 通过（仅既有大文件 warning）。
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

推荐任务：
- `TASK-SLICE-096`。
#### TASK-SETTINGS-039

完成时间：
- 2026-06-22

完成内容：
- 完整逆向 Role4 沙僧的铲/弓双形态、两套普攻表现、九主动与 `mds` 被动毒爆。
- 补齐正式槽位、MP 公式、形态差异、动作/位移、projectile、毒层、巫毒娃娃、链式控制、标记传送、终结技和恢复/清理边界。
- 证实私有 `runAttack()` 没有调用点，拒绝把不可达的 20 MP `hit6` 写成跑动普攻；证实 `qlj` 动态 MP 外还固定多扣 15。
- 新增独立 `role4-combat-index.md`，并同步角色、输入、projectile 与机制索引。

更新文件：
- `docs/reverse-engineering/role4-combat-index.md`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/skills-input-index.md`
- `docs/reverse-engineering/projectiles-index.md`
- `docs/reverse-engineering/mechanics-index.md`
- `docs/tasks/task-history.md`

验证：
- `npm run check:workflow` 通过。

推荐任务：
- 当前仍按看板执行 `TASK-SLICE-096`；Role1 队列完成后，按 `role4-combat-index.md` 生成 Role4 武器形态与普攻切片。

#### TASK-SLICE-100

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role4PoisonSkillSystem.ts`，完成 `zq` 铲/弓两形态 MP、等级伤害、段数和 projectile，以及 `jdz` 地面门禁、前置视觉和三枚各 20 段口径 projectile。
- 完成 5 秒毒层刷新与 tick、`mds` 学习门禁、毒层超过 2 后的毒爆伤害、自疗、6.6 秒护盾和 3 秒 `SPEEDUP` 视觉状态；明确不伪造移动加速数值。
- 新增 Role4 运行时、测试 loadout、场景技能桥接和 projectile 命中接线；P1/P2 各自维护毒层来源状态。
- 为满足结构硬门禁，抽出 `TestSceneHeroWeaponBridge.ts` 和 `TestSceneHeroSkillPipeline.ts`，使 `TestScene.ts` 回到硬上限以下。
- 新增 `role4-poison-skill-tests.ts`，覆盖双形态、MP/等级、地面门禁、三 projectile、毒层刷新/到期、毒爆、治疗/护盾/视觉状态和双玩家隔离。

更新文件：
- `src/systems/Role4PoisonSkillSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole4SkillBridge.ts`
- `src/scenes/test-scene/TestSceneHeroSkillPipeline.ts`
- `src/scenes/test-scene/TestSceneHeroWeaponBridge.ts`
- `src/scenes/test-scene/TestSceneWorldBridge.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests/role4-poison-skill-tests.ts`
- `tools/system-tests.ts`
- Role4 机制表、切片表、任务看板和任务历史。

验证：
- `npm run check:structure` 通过（仅既有大文件 warning）。
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

推荐任务：
- `TASK-SLICE-101`。

#### TASK-SLICE-101

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role4VoodooDollSystem.ts`，完成 `wdww` 正式 MP、面向侧最近目标、等级生命倍率、继承物防/魔防、替换旧娃娃和 10 秒生命周期。
- 新增娃娃专属战斗桥接，使另一名玩家与怪物可以攻击娃娃，并按源码等级倍率将伤害转移给绑定目标；目标死亡、娃娃死亡或到期均会清理运行时。
- 增加施法前置视觉与娃娃占位 projectile，并通过 `visualOnly` 元数据阻止视觉体误伤怪物；Role4 场景桥接同时补齐一次技能生成多个 projectile 的视图创建。
- 为满足结构硬门禁，将 projectile 类型抽到 `ProjectileTypes.ts`，使 `ProjectileSystem.ts` 回到硬上限以下。
- 新增 `role4-voodoo-doll-tests.ts`，覆盖面向选敌、无目标门禁、正式 MP、属性继承、替换/跟随/到期、转伤倍率、死亡清理、动作门禁与 P1/P2 隔离。

更新文件：
- `src/systems/Role4VoodooDollSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/ProjectileSystem.ts`
- `src/systems/ProjectileTypes.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole4SkillBridge.ts`
- `src/scenes/test-scene/TestSceneRole4DollCombatBridge.ts`
- `src/scenes/test-scene/TestSceneUpdatePipeline.ts`
- `src/scenes/test-scene/TestSceneWorldBridge.ts`
- `src/scenes/TestScene.ts`
- `tools/system-tests/role4-voodoo-doll-tests.ts`
- `tools/system-tests.ts`
- Role4 机制表、切片表、任务看板和任务历史。

验证：
- `npm run check:structure` 通过（仅既有大文件 warning）。
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

推荐任务：
- `TASK-SLICE-102`。

#### TASK-SLICE-102

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role4PoisonChainSystem.ts`，完成 `mbyj` 正式 MP、动作门禁、面向侧 500 范围数组顺序首目标、源码移动时长和最多八次落点。
- 每次落点叠加 7 秒 Role4 毒层，并以包含边界的 78% 概率施加 0.42 秒专属眩晕；链本身保持零直接伤害。
- 后续选敌按源码只排除刚命中的目标，不伪造全链去重，因此保留 A→B→A 回跳；目标移动超过 66 落点容差时立即清理。
- 新增 `Role4Bullet6` 占位 projectile 与无目标 1 秒淡出生命周期，并接入 Role4 场景桥接、Monster30 眩晕状态和 P1/P2 独立运行时。
- 新增 `role4-poison-chain-tests.ts`，覆盖数组顺序、面向/距离、八跳与隔跳返回、正式 MP、概率边界、7 秒毒层、零伤害、落点失效、无目标淡出及双玩家隔离。

更新文件：
- `src/systems/Role4PoisonChainSystem.ts`
- `src/systems/Role4PoisonSkillSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/Monster30System.ts`
- `src/systems/ProjectileTypes.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole4SkillBridge.ts`
- `tools/system-tests/role4-poison-chain-tests.ts`
- `tools/system-tests.ts`
- Role4 逆向索引、机制表、切片表、任务看板和任务历史。

验证：
- `npm run check:structure` 通过（仅既有大文件 warning）。
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

推荐任务：
- `TASK-SLICE-103`。

#### TASK-SLICE-103

完成时间：
- 2026-06-22

完成内容：
- 新增 `Role4MobilitySkillSystem.ts`，完成 `qlj/tkj/dzj` 正式等级 MP、统一动作门禁、铲/弓六种分支和 P1/P2 独立运行时。
- 保留 `qlj` 只检查动态费用、随后额外扣 15 MP 并由底层口径钳到 0 的原版双扣；没有把怪癖“修正”为总费用预检。
- 按源码帧表复现 `qlj` 弓形短促反向跃进、`tkj` 铲形后段/弓形前段上升、`dzj` 铲形前段突进，以及动作结束后的速度和重力恢复。
- 新增九类 Role4 占位 projectile，锁定两形态伤害段数 `1/1、1/5、5/1`、击退、跟随/定点差异和延迟结算；通用 `activeAfterMs` 防止视觉出现后过早命中怪物、Boss 或巫毒娃娃。
- 新增 `role4-mobility-skill-tests.ts`，以三技能乘两形态矩阵覆盖 MP、伤害/段数、projectile、跟随、位移阶段、恢复、动作门禁和双玩家隔离。

更新文件：
- `src/systems/Role4MobilitySkillSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/ProjectileTypes.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole4SkillBridge.ts`
- `src/scenes/test-scene/TestSceneHeroSkillPipeline.ts`
- `src/scenes/test-scene/TestSceneWorldBridge.ts`
- `src/scenes/test-scene/TestSceneRole4DollCombatBridge.ts`
- `tools/system-tests/role4-mobility-skill-tests.ts`
- `tools/system-tests.ts`
- Role4 机制表、切片表、任务看板和任务历史。

验证：
- `npm run check:structure` 通过（仅既有大文件 warning）。
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。
- `npm run check:workflow` 通过。

推荐任务：
- `TASK-SLICE-104`。

#### TASK-SLICE-104

完成时间：
- 2026-06-23

完成内容：
- 新增 `Role4FinisherSkillSystem.ts`，完成 `lybj` 首次最大 MP 1.5% 放置 10 秒标记、二次消耗首次费用 10% 并传送、离屏销毁不传送与超时清理。
- 完成 `mmw` 铲形 3.4 秒 `Role4Bullet12` 前方多段终结技，以及弓形 `Role4BulletArrow12_1/2/3` 前置、跟随伤害和三波各 10 枚环阵 projectile。
- 接入 Role4 场景桥接、HeroSkill runtime、Projectile variant、AssetManifest 占位 key；保留真素材缺失事实，不伪造原版资源。
- 在 `HeroCombatSystem` 增加 Role4 `hit12` 专属抗硬直/抗击退口径：技能期间受伤仍扣 HP，但不进入受击硬直、不设置受击无敌窗、不产生击退。
- 新增 `role4-finisher-skill-tests.ts`，覆盖标记生命周期、MP、传送/离屏拒绝、两终结形态、30 枚环阵、免击退不免伤和 P1/P2 隔离。

更新文件：
- `src/systems/Role4FinisherSkillSystem.ts`
- `src/systems/HeroSkillSystem.ts`
- `src/systems/HeroCombatSystem.ts`
- `src/systems/ProjectileTypes.ts`
- `src/assets/AssetManifest.ts`
- `src/scenes/test-scene/TestSceneRole4SkillBridge.ts`
- `tools/system-tests/role4-finisher-skill-tests.ts`
- `tools/system-tests.ts`
- Role4 机制表、切片表、任务看板和任务历史。

验证：
- `npm run check:structure` 通过（仅既有大文件 warning）。
- `npm run test:systems` 通过。
- `npm run build` 通过；Vite 仍提示既有 chunk 超过 500 kB。

推荐任务：
- 恢复 `TASK-SLICE-096`，或按机制表生成 Role5 逆向任务。
