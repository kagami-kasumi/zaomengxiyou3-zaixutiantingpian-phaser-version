# 资源索引与加载策略

本文记录 `TASK-ARCH-002` 的资源事实：当前导出目录里已经有什么、Flash 运行时按什么名字取资源、首批现代复现应怎样组织 manifest，以及哪些素材仍然只是“代码可见、文件未到手”。

## 证据入口

- `local-resources/regima/legacy-extraction/resources_by_swf`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/loader/AssetsLoader.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseBitmapDataPool.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BaseGameSence.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/World/PhysicsWorld.as`
- `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/my/MainGame.as`
- `docs/reverse-engineering/roles-index.md`
- `docs/reverse-engineering/attack-effects-index.md`
- `src/assets/AssetManifest.ts`

## 当前导出状态

> 2026-07-15：`TASK-ASSET-002` 已将 `WuKong.swf` 的 `Role1Bullet1/3/4/5` 共 27 帧透明 PNG 接入现代工程。这是首个 `ready` 真战斗资源族；其余条目仍按下文恢复语料库与选择性导出策略处理。

> 2026-07-15 补充：本节描述的是只读旧提取集 `local-resources/regima/legacy-extraction/`。`TASK-ASSET-003` 已通过 RegiMA 流程恢复 EVB 原始目录和 174 个可解析 SWF，现位于 `local-resources/regima/source/restored-swfs/`，详见 [`evb-extraction-report.md`](evb-extraction-report.md)。角色、怪物、关卡和 UI 源包已取得；视觉资源是否存在必须先检索该恢复语料库，不能由旧提取集单独下结论。

当前 `local-resources/regima/legacy-extraction/resources_by_swf` 是“可核对资料”，还不是能直接拷进现代工程的完整素材库：

| 范围 | 当前观察 | 结论 |
| --- | --- | --- |
| 全目录 | 76 个 SWF 导出目录；只有 7 个目录带 `symbolClass/symbols.csv` | 绝大多数包没有现成符号映射可用 |
| 主参考包 `[172845].swf` | 69 张图片、1 份 `symbols.csv` | 有部分 UI/场景对象线索，但不是角色/关卡完整资源包 |
| 备用包 `[25034429].swf` | 同样 69 张图片、1 份 `symbols.csv`，与主包高度相似 | 可用于对照，不补当前缺口 |
| 其余已导出图片 | 少量单图 JPG/PNG | 更像零散资源，不足以支撑首个战斗切片 |
| 现代工程 `public/assets` | 目前只有 `scaffold/player-placeholder.svg` | 现阶段唯一可直接加载的是占位资源 |

`[172845].swf` 的 `symbols.csv` 里能看到 `qpjThunder`、`PetLevelUpMc`、`RoleLevelUpMc`、`WoodThron*` 等符号，但没有 `ROLE1_*`、`Role2Bullet1`、`Monster30`、`sl11`、`bg11` 这批首切片真正需要的名字。`images/` 文件也以数字名和少量 UI 相关名称为主，不能从当前结果直接还原五角色普攻、首怪或 `1-1` 场景。

## Flash 侧命名线索

### 原版加载分层

原版并不是一次性把所有内容塞进主 SWF：

- `AssetsLoader.loadByName(stage, level, after)` 会按关卡加载额外 SWF。
- `getAssetsMap(stage, level)` 返回 `levels/level<stage><level>`。
- `getRolesAndPetsAssets()` 会按选角追加 `WuKong`、`TangSeng`、`BaJie`、`ShaShen`、`bailongSword`。
- `mustLoadAsset` 还会追加 `Role1Effect` 和一组装备资源包。

这说明角色、关卡和特效资源原本就分散在多个包里。当前导出目录只证明主包和少量候选包已经被导出，不能据此假定首批玩法素材都已经到位。

### 角色资源族

| 角色/范围 | 运行时命名 |
| --- | --- |
| Role1 悟空 | `ROLE1_<clothId>`、`ROLE1_EQUIP_<weaponId>`；同一角色表内 `walk` 与 `run` 分属不同帧行 |
| Role2 唐僧 | `ROLE2_<clothId>`、`ROLE2_EQUIP_<weaponId>`；同一角色表内 `walk` 与 `run` 分属不同帧行 |
| Role3 八戒 | `ROLE3_<clothId>`、`ROLE3_EQUIP_<weaponId>`；同一角色表内 `walk` 与 `run` 分属不同帧行 |
| Role4 沙僧 | `ROLE4_SHOVEL_<clothId>`、`ROLE4_ARROW_<clothId>`、`ROLE4_EQUIP_<weaponId>`；同一角色表内 `walk` 与 `run` 分属不同帧行 |
| Role5 白龙 | `idle_*`、`walk_*`、`run_*`、`attack*_spear/sword`、`jumpattack_*`、`runattack_*` |

前四名角色通过 `BaseBitmapDataPool.getBitmapDataArrayByName(...)` 读取 `ROLE*_...` 族；白龙走 `build/loadZm4RoleResources(...)`，本体动作本来就是另一套资源路径。

### 角色移动动作合同

后续上角色 CG 时，`walk` 与 `run` 必须当作两个独立动作键处理：

- `Role1` 至 `Role4` 的 `setAction()` 都把 `walk` 映射到第 `2` 行、`run` 映射到第 `3` 行。
- `Role5` 则直接使用独立资源名 `walk_spear/walk_sword` 与 `run_spear/run_sword`。
- 这意味着现代 manifest、atlas 切片和动画注册都要显式保留 `walk` 与 `run`；占位阶段可以临时复用视觉，但真素材接入时不得把两者合并成一套“移动 CG”。

### 首批战斗与场景线索

| 目标 | 运行时命名 | 证据 |
| --- | --- | --- |
| Role1 至 Role4 普攻附属对象 | `Role1Bullet*`、`Role2Bullet*`、`Role3Bullet*`、`Role4Bullet*`、`Role4BulletArrow*` | `attack-effects-index.md`、`Role*.as` |
| Role5 普攻本体/附属对象 | `attack*_spear/sword`、`jumpattack_*`、`runattack_*`、`Role5runattack`、`swordhit*` | `attack-effects-index.md`、`Role5.as` |
| 首怪 | `Monster30`、`Monster30Bullet1` | `Monster30.as` |
| 首关 | `export.gameSence.sl11`、`bg11`、`floorBg1`、`StageListener11` | `MainGame.as`、`BaseGameSence.as`、`PhysicsWorld.as` |

场景链路很明确：

1. `MainGame.newGame()` 创建 `export.gameSence.sl<stage><level>`。
2. `BaseGameSence` 在构造时读取 `bg<stage><level>`。
3. `MainGame.createFloorBg()` 读取 `floorBg<stage>`。
4. `PhysicsWorld.pWorldInit()` 读取 `StageListener<stage><level>`。

这给后续资源补提取提供了稳定的搜寻目标，即便当前图片文件还没有落到导出目录里。

### 技能 projectile 资源族

`TASK-SETTINGS-009` 对技能/弹体素材做了补查，结论和普攻资源一致：AS3 源码能指认运行时名字，但当前导出的 `resources/` 还没有对应真素材。

已查证：

- 主包 `[172845].swf` 的 `symbols.csv` 只列出 `export.bullet.ThroughWallBullet` 这个 bullet 类符号，没有 `Role2Bullet5`、`Role2Bullet*` 或 `Role2_hit5`。
- 主包 `[172845].swf/images/` 与备用包 `[25034429].swf/images/` 只有数字名、UI 和零散对象图，未出现 `Role2Bullet5`、`Role2_hit5`、`TangSeng`、`ROLE2` 或 `Role2Bullet*` 路径。
- 全 `local-resources/regima/legacy-extraction/resources_by_swf` 路径/文本检索未命中 `Role2Bullet5`、`Role2_hit5`、`Role2Bullet*`。
- `AssetsLoader.getRoleNameByID(2)` 说明 Role2 资源运行时从 `TangSeng` 或 `SpecialUI/TangSeng` 角色包加载；这类源 SWF 当前没有以原始包名出现在导出资源目录里。

当前技能 projectile 资源状态：

| 稳定 key / 资源族 | AS3 运行时名 | 当前状态 | 后续接入方向 |
| --- | --- | --- | --- |
| `skill-projectile.role2.sgq.hit5` | `Role2Bullet5` + `Role2_hit5` | `missing-original`；现代侧已有占位 key | 补导出 `TangSeng` / `SpecialUI/TangSeng` 后替换为真实动画和音效 |
| `skill-projectile.role2.xbz.hit3` | `Role2Bullet3` + `Role2_hit3` | `missing-original`；AS3 映射已确认 | 可作为第二个固定范围技能占位 key |
| `skill-projectile.role2.smb.hit4_1` | `Role2Bullet4_1`，运行中实例名被设为 `Role1Bullet4_1` | `missing-original`；现代侧已有占位 key | 已作为移动 projectile 切片实现，继续保留异常实例名兼容 |
| `skill-projectile.role2.smb.hit4_2` | `Role2Bullet4_2` + `Role2_hit4` | `missing-original`；现代侧已有占位 key | 已作为 `hit4_1` 二段占位扩展实现，真素材仍待 `TangSeng`/`SpecialUI/TangSeng` 补导出 |
| `skill-projectile.role2.myhc.hit6` | `Role2Bullet6` + `Role2_hit6` | `missing-original`；AS3 映射已确认 | 治疗/队友目标规则后再接 |
| `skill-projectile.role2.jgz.hit7` | `Role2Bullet7` + `Role2_hit7` | `missing-original`；AS3 映射已确认 | 控制/拉拽规则后再接 |
| `skill-projectile.role2.tjgl.hit8` | `Role2Bullet8` + `Role2_hit8` | `missing-original`；AS3 映射已确认 | 治疗/护盾规则后再接 |
| `skill-projectile.role2.jhsj.hit9` | `Role2Bullet9_1`、`Role2Bullet9_2` + `Role2_hit9` | `missing-original`；AS3 映射已确认 | 多段技能链后再接 |

目前没有任何角色技能 projectile 真资源可以直接从当前导出目录接入现代运行时。资源任务的下一步应是补角色包导出；实现任务的下一步可继续使用稳定 key 和占位图推进 `ProjectileSystem` 的运动类型。

## 当前可用性结论

当前导出资源 **不足以** 直接支持五角色普攻特效，也不足以直接支持首怪与 `1-1` 的真实美术：

- `attack-effects-index.md` 已确认五角色普攻需要大量独立符号，但当前主包导出结果一个也没有。
- `projectiles-index.md` 已确认 `Role2Bullet5`、`Role2_hit5` 以及 `Role2Bullet*` 技能资源当前都没有真素材导出。
- `Monster30`、`Monster30Bullet1`、`sl11`、`bg11`、`floorBg1` 在当前 `resources/` 检索结果中均未命中。
- 因此现阶段可以写现代代码和稳定 manifest key，但不能把“真实素材已齐”写进工程假设。

若后续要由用户手工补提取，首批最值得优先补的是：

1. 角色普攻附属对象与白龙普攻动作资源，见 `attack-effects-index.md` 的缺口表。
2. 角色技能 projectile 包，优先 `TangSeng` / `SpecialUI/TangSeng` 里的 `Role2Bullet5`、`Role2_hit5` 和 `Role2Bullet3/4/6/7/8/9_*`。
3. `Monster30` 与 `Monster30Bullet1`。
4. `sl11`、`bg11`、`floorBg1`，以及能保留地图标记的关卡时间轴/符号数据。

## 现代加载策略

现代实现不照搬 Flash 的全局 `ApplicationDomain` 和 `BitmapDataPool`，但保留它透露出的“按域拆包”思想。

### 1. 稳定 key 与来源名分离

- 现代代码只引用稳定 key，例如 `player-placeholder`。
- AS3 符号名只保留在 manifest 或文档元数据中，用于追踪来源和后续替换。
- 这样以后把占位图换成真素材时，不需要重写角色状态机。

### 2. 显式记录资源状态

首批 manifest 采用三种状态：

- `ready`：已可直接加载的现代资源。
- `placeholder`：现代工程已有、但明确只是临时占位。
- `missing-original`：AS3 已能指认，当前工作区还没有真实素材。

这种区分比“先写空路径以后再说”更诚实，也能让后续任务一眼看出缺口。

### 3. 以 bundle 组织加载，而不是一次性全量加载

建议首批 bundle：

| bundle | 目标 |
| --- | --- |
| `scaffold` | 当前测试场景必需的占位资源 |
| `hero-role2` | 后续首个角色移动切片需要的 Role2 本体资源 |
| `combat-normal-attacks` | 五角色普攻附属对象与白龙动作资源 |
| `monster30` | 首怪本体与攻击附属对象 |
| `stage-1-1` | `sl11/bg11/floorBg1` 与地图标记相关资源 |

当前代码里只真正开放 `scaffold`，其余先作为来源族登记，等素材补齐后再扩成可加载 bundle。

其中 `hero-role2` 以及后续所有英雄本体 bundle 都必须至少区分 `wait`、`walk`、`run`、`jump1`、`jump2`、`jump3` 等动作键；`walk` 与 `run` 不是一个可合并项。

### 4. 用现代资源形态承接原版表现

- 角色和怪物动作后续优先整理成 atlas 或 spritesheet，不继续维持 MovieClip 逐帧对象。
- 关卡地图优先拆成可读的背景、碰撞/标记数据和交互对象，不把 Flash 时间轴当作现代运行时模板。
- 需要镜像时由渲染层或 atlas 配置解决，不复制原版 `BaseBitmapDataPool` 的左右帧缓存策略。

## `AssetManifest.ts` 当前约定

当前 manifest 只落三件事：

1. 已可加载的 `scaffoldAssets`。
2. 已知但缺真实文件的 `sourceAssetFamilies`。
3. 已经可以执行的 `assetBundles.scaffold`。

这正好匹配当前项目阶段：先把资源边界讲清楚，再接下一批角色移动、普攻或关卡任务。

## VS-007 关卡资源缺口确认

本节由 `TASK-SETTINGS-012` 补充。已确认以下 VS-007 所需资源不在当前 `local-resources/regima/legacy-extraction/resources_by_swf` 导出中：

| 目标 | AS3 运行时名 | 当前状态 | 补提取方向 |
| --- | --- | --- | --- |
| 1-1 场景 SWF | `export.gameSence.sl11` | `missing-original`；含 `bgContainer`、墙体/传送门标记子节点 | 需提取原版 `levels/level11` 或等效场景包 |
| 1-1 背景 | `bg11` | `missing-original`；`BaseGameSence` 构造时加载 | 同上 |
| 1-1 地板 | `floorBg1` + `export.FloorBg` | `missing-original`；`FloorBg` 符号已在主包 `symbols.csv`（143），但具体 `floorBg1` 资源未导出 | 需提取关卡 floor 资源包 |
| Boss 位图 | `Monster3`（`BaseBitmapDataPool` 池名） | `missing-original` | 需提取 `Monster3` 所在怪物资源包 |
| Boss 子弹 | `Monster3Bullet1`、`Monster3Bullet2` | `missing-original` | 同上 |
| 传送门视觉 | SWF 场景 `isTransferDoor` 标记子节点 | `missing-original` | 需 `sl11` 场景 SWF 才能定位 |

已检索范围：
- `local-resources/regima/legacy-extraction/resources_by_swf` 全部 76 个 SWF 导出目录的 `symbolClass/symbols.csv`
- 全目录文件名/路径文本搜索 `sl11`、`bg11`、`floorBg`、`StageListener`、`Monster3`
- 全部 `.swf` 和图像文件

结论：VS-007 实现不应等待真实关卡资源。首个关卡闭环切片应使用手工参数（地面 y、平台、传送门坐标、背景纯色占位）和占位图形推进。

## Stage 1-2 恢复资源定位

`TASK-SETTINGS-051` 已从 RegiMA 恢复语料库确认 Stage 1-2 不存在原始素材缺失：

| stable key | 源包 / character | 类型与时间轴 | 当前状态 |
| --- | --- | --- | --- |
| `stage.stage1-2.layout` | `assets/levels/level12.swf` / 53；前景 25 | character 53 为 1 帧 `DefineSprite` tag 39；前景 25 为 `DefineShape2` tag 22 | 调查 SVG 已在 `task-settings-051-stage12/`，实现时选择性转换并接入 |
| `stage.stage1-2.background` | `assets/1.swf` / 135 | 1 帧 `DefineSprite` tag 39，包裹 character 134 `DefineShape2` | 4889.65×595.8 调查 SVG 已就绪 |
| `stage.stage1-2.fb-enter` | `assets/levels/level12.swf` / 22 | 30 帧 `DefineSprite` tag 39，含 `colipse` | 30 帧调查 SVG 已就绪 |
| `stage.stage1-2.transfer-door` | 同包 / 52；子时间轴 48/51 | 外层 1 帧；子时间轴分别 20/19 帧 | 外层及两套子时间轴调查 SVG 已就绪 |

Stage 1 公共 `stage.stage1.floor` 已由 Stage 1-1 任务接入，1-2 直接复用 character 1 / `floorBg1`，不得复制第二个 stable key。完整组合层级、坐标和标记见 `levels-index.md`；标注见 `asset-annotation/annotations/stage12.csv`。

## 后续建议

- 技能 projectile 真素材接入前，不要继续重复检索当前 `[172845].swf`/`[25034429].swf` 导出目录；应补 `TangSeng` / `SpecialUI/TangSeng` 等角色包。
- 真素材接入时，不要先搬全量资源；按 `hero-role2`、`combat-normal-attacks`、`skill-projectiles-role2`、`monster30`、`stage-1-1` 五个窄 bundle 分批补。
- 若用户愿意继续补提取，优先从原版角色包、`Role1Effect`、首关地图包和 `Monster30` 所在包入手，而不是再次扫主包。

## TASK-ASSET-001 五角色战斗资源缺口盘点

本节由 `TASK-ASSET-001` 补充。详细清单见 `docs/reverse-engineering/combat-assets-gap-plan.md`。

已按现代侧实际占位 key 复核 Role1、Role4、Role5 战斗资源族：

- Role1：普攻 `Role1Bullet1/3/4/5`，技能 `Role1Bullet6/7/8_1/8_2/9/10_2/10_4/11_1/11_2/12/12_1_1/13/14_1/14_2`，以及 `ROLE1_SHALLDOW`。
- Role4：普攻 `Role4Bullet1/2/3`、`Role4BulletArrow1/2`，技能 `Role4Bullet4/5/6/7_1/7_2/8/9_1/9_2/10/11/12`、`Role4BulletArrow4/8_1/8_2/9_1/9_2/10_1/10_2/12_1/12_2/12_3`，以及 `Role4Hit5`。
- Role5：枪/剑本体动作 `attack*_spear/sword`、`jumpattack_*`、`runattack_*`，普攻附属 `Role5runattack`、`swordhit1..6` 与长剑态 `_1` 变体，技能 `sword_xlc`、`sword_lxuanj1/2`、`sword_xkjz`、`Role5Bullet9`、`role5_tlj`、`swordskill2_*`、`swordqhskill2_1`、`swordskill4`、`sword_mlsz1..5`、`swordskill5_2/3`、`sword_jrjlsf`、`sword_jrjljq`。

检索结论：这些资源名在当前 `local-resources/regima/legacy-extraction/resources_by_swf` 中均不可直接接入；白龙枪形态 `doSingleHit(...)` 附属对象仍是反编译缺口。后续需要用户手工补提供或补提取 `WuKong` / `Role1Effect`、`ShaShen`、`bailongSword` 或对应 `SpecialUI/*` 资源包，再拆一个最小真资源接入切片。


