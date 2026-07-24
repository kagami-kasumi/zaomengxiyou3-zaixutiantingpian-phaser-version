# 存档队伍与直接进关证据索引

本文是 `TASK-SETTINGS-065` 的权威实现输入，闭合“空槽 → 人数 → P1/P2 选角 → 原子建档 → 地图 → 直接进关 → 技能 owner”。原版事实、用户确认的现代流程、旧档迁移和 DEV 例外在本文中分开记录；后续 `TASK-ARCH-011`、`TASK-SLICE-151/152/153` 不得再从当前临时 `playerCount` 或地图 chooser 反推正式队伍。

## 1. 待证明的可观察问题与结论

1. 人数何时确定：原版在 `GameMenu` 点击“新的开始”后、进入角色页前写 `gc.playNum=1|2`。
2. 每位 owner 何时选角：单人只选 P1；双人按 P1→P2 顺序选择，P1 已选卡移除监听，因此两位玩家不能选择同一角色。
3. 取消/确认何时发生：人数页有原生返回；角色页没有独立确认/取消，单人 P1 或双人 P2 的最终角色点击就是确认。原版此时仍未写存档。
4. 原版保存什么：`MemoryClass` 同时保存 `playerNum`、存在的 `player1_obj/player2_obj`；每个 `User` 保存 `controlPlayer` 与 `roleid`。
5. 读档如何恢复：先恢复 `playerNum`，再恢复双方 `User.roleid`；`opening=true` 时跳过选角并进入上次世界地图。
6. 地图如何进关：地图节点只写 `curStage/curLevel` 并派发 `selectStageOver`，不会再次询问人数。
7. 技能页从哪里取 owner/角色：按 `gc.playNum` 创建活动玩家入口，并把对应 `User` 传给技能子页；角色视觉由该 `User.getRoleName()/roleid` 决定。
8. 正式现代合同：用户 2026-07-24 确认在新建空槽时一次性确定队伍；地图直接进关；技能只显示当前存档活动 owner 的当前角色。

## 2. 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 新游戏人数 | `GameMenu.as:144-181`：`newGameClick()` 重置会话并显示 `simpleGame/doubleGame`；`selectNum()` 写 1/2 | `doAfterChangeOut()` 在新游戏分支派发 `StartSelectRole`，`GMain.selectRole()` 进入角色页 | character 1149；运行时 1P/2P 在 `(751.15,197.55)`、`(751.15,250.75)`，返回在 `(800,314.35)` | 交叉确认 | 若对应版本运行态显示额外人数页，须重新分级；当前 Symbol 与 AS3 一致 | AS3 顺序测试 + 940×590 原帧对照 |
| P1/P2 选角 | `SelectRole.as:93-157`：`curSelected` 从 1 开始；单人写 P1 并清 P2；双人先 P1 再 P2 | `Config.createHero():973-1010` 仅按 `player1/2.roleid>0` 创建并绑定控制位 | character 901；五卡 character 877/883/888/894/900，舞台注册 x 为 118.05/306.4/494.2/682/870.2 | 交叉确认 | 无；character 895 是空按钮且与 900 同名，不是第五张可见卡 | 选择顺序/不同角色门禁测试 + 五卡逐态对照 |
| selected 与最终确认 | `onClick()` 先移除当前卡事件，再令 `upState=downState`；单人或双人第二次选择调用 `selectOver()` | `SelectOver` → `GMain.SelectRoleOver()`；新游戏进入 `OpenAnimation`，读档不走本页 | 五卡 up 使用灰度滤镜；over/down 共用彩色对象且无位移；selected 即持久 down | 交叉确认 | 原版没有独立确认按钮；若新增可见确认，必须先获用户批准 | normal/hover/down/selected 状态图 + 最终点击次数测试 |
| 取消与落盘 | `GameMenu.backClick()` 仅把人数页退回主菜单；`SelectRole` 无取消/写盘调用 | 原版新游戏 `saveId=-1`；首次保存晚于选角，由地图保存链处理 | 人数页复用原生返回 character 1136；角色页无返回/取消显示对象 | 确认事实 + 现代设计选择 | 现代角色页可用 Escape 非可见取消；任何新增可见取消控件需用户批准 | draft 取消后槽仍 empty；最终确认只写一次 |
| 原版存档队伍 | `MemoryClass.setStorage():124-161` 保存 `playerNum` 与 roleid>0 的玩家对象；`User.getSaveObj():628-661` 保存 `controlPlayer/roleid` | `getStorage()` 先恢复人数，再恢复双方 User；`storageValue()` 置 `opening=true` | 纯序列化，不适用视觉几何 | 交叉确认 | 无 | 原版字段映射表 + 现代 round-trip |
| 读档/新游戏分流 | `GameMenu.continueClick()/showAndHide()`；`GMain.SelectRoleOver():409-432` | 读档 `opening=true` 按 `whichlastworld` 进地图；新游戏进开场 | 路由行为，不适用几何 | 交叉确认 | 现代用户决定新建确认后直接到地图，不复刻开场前置 | 路由合同测试 |
| 地图直接进关 | `SelectPLace.onSelected():357-365` 解析节点名并派发 `selectStageOver` | `GMain.selectStageOver()` 直接 `switchSence("startFighting")`；战斗 `Config.createHero()` 消费已恢复队伍 | 地图节点几何见 `heaven-map-index.md`，本项无新增坐标 | 交叉确认 | 现有现代 chooser 是已被用户否决的临时设计，不能当原版证据 | 地图点击后无 chooser + 场景队伍快照 |
| 技能 owner/角色 | `BuySkill.as:45-91,121-155` 按 `gc.playNum` 创建玩家入口，按角色名选择原头像，把具体 `User` 传给子页 | `User.roleid` → `getRoleName()` → 角色入口 → `SkillControl/PassiveSkillControl(User)` | 技能总页与角色入口几何见 `skill-ui-native-index.md` | 交叉确认 | 原版同角色歧义被选角页的“已选卡不可再点”消除 | 1P 仅 P1；2P 两 owner；每 owner hero 与技能树一致 |
| 现代旧档迁移 | 当前 V1..V4 没有人数；V4 总有两份玩家数据且 P2 默认 Role1，无法可靠推断旧会话人数 | `parseGameSave()` 与 `migrateLegacySave()` 是统一迁移边界 | 不适用 | 现代设计选择 | 任何基于 P2 是否“像默认值”的启发式都可能误判，禁止使用 | V1..V4 → 新版固定 1P，保留未活动 P2 全量数据 |

影响后续四个实现 task 的未知项：**0**。

实现状态（2026-07-24）：

- `TASK-ARCH-011` 已完成 V5 `PartyConfiguration`、V1..V4/旧单槽迁移、严格校验、原子建槽与 active party 查询。
- `TASK-SLICE-151` 已直接接入 character 1149/901、五角色三态和 P1/P2 marker；人数返回、角色 Escape、最终点击原子确认、1P/2P 读取摘要与零 console 均通过。
- 自动状态与组合证据见 `tools/save-party-flow-tests.ts`，940×590 显示列表/逐状态/可见差异证据见 `docs/tasks/evidence/TASK-SLICE-151-visual-audit.md`。
- 剩余实现边界仍只有 `TASK-SLICE-152` 的技能 owner 收敛和 `TASK-SLICE-153` 的直接进关/跨场景统一消费。

## 3. 原版流程合同

```text
GameMenu
  ├─ 继续游戏 → 六槽读取 → opening=true → 恢复 playerNum + roleid → 上次世界地图
  └─ 新的开始 → 重置进度/saveId=-1
       └─ 1P / 2P
            ├─ 返回 → 主菜单
            └─ SelectRole
                 ├─ 1P：选择 P1 → SelectOver
                 └─ 2P：选择 P1（该卡禁用并 selected）
                          → 选择不同角色 P2 → SelectOver
                              → 新游戏开场 → 地图 → 之后首次保存
```

- `playNum` 是活动本地玩家数，`controlPlayer` 是 P1/P2 控制位，`roleid` 是该控制位当前英雄；三者不是同一个概念。
- 单人选择会显式把 `player2.roleid=0`。双人第二位不能点击 P1 已选角色。
- `username` 是 character 901 内的单个共享 TextField；`SelectRoleOver` 时写入 `gc.myname`，不是 P1/P2 各自名字。它不参与人数或 hero owner 判定。
- 原版最终角色点击只结束选角，不立即写文件；现代“槽优先 + 原子创建”属于用户确认的流程重排。

## 4. 人数页显示列表

源包：`local-resources/regima/source/restored-swfs/assets/OtherMat1.swf`，SHA-256 `97478E1E03A22C7D06197FFB75AB890D98B084377CBDCF394716CBAF27082126`。根为 `export.GameMenu` / character 1149；主程序舞台来自 `1_MainLoad__main1.swf`，为 940×590。

`showSelectNum()` 只移动既有时间轴对象，不创建现代覆盖层：

| depth | character / 实例 | 运行时矩阵 | 状态与命中 |
| ---: | --- | --- | --- |
| 3 | 1111 `simpleGame` | `(751.15,197.55)` | up 1107；over 1110 at y=-2；down 1110 at y=0；hit 515，舞台约 x=510.6..991.7、y=174.2..221.0 |
| 6 | 1115 `doubleGame` | `(751.15,250.75)` | up 1112；over 1113 at y=-2；down 1113 at y=0；hit 1114，110×40 |
| 23 | 1136 `backbtn` | `(800,314.35)` | up/down 1133；over 1134；hit 1135，舞台约 x=750.6..849.3、y=301.5..329.1 |

其余主菜单按钮由 `showSelectNum()` 移到 x=1110；不得在人数状态继续显示。1P/2P 点击立即写人数并进入角色页，没有额外确认态。

## 5. 角色页显示列表与视觉基准

根：`export.SelectRole` / character 901，单帧。恢复源选择性导出基准：

- 根：`local-resources/regima/task-outputs/task-settings-065-save-party/select-role-svg/DefineSprite_901_export.SelectRole/1.png`
- 五卡四态：同 task-output 的 `select-role-children/buttons/`
- P1/P2 标记：同 task-output 的 `player-markers/images/108_2P.png` 与 `115_1P.png`

FFDec 根导出画布为 1081×1067，因为它保留了舞台外 hittest 边界；940×590 原版视觉基准对应根导出的 `x=0..939, y=189..778`，不能把 1081×1067 整幅缩放进现代舞台。

### 5.1 根显示列表

| depth | character / 实例 | 舞台矩阵 | 可观察合同 |
| ---: | --- | --- | --- |
| 1 | 877 `btn1` | x=118.05, y=291.75, scaleX≈1.0038 | 孙悟空 |
| 20 | 878 | x=252.05, y=571.5 | 静态提示“你的名字”；TextField 边界约 x=250.05..354.05、y=569.5..585.55 |
| 21 | 883 `btn2` | x=306.4, y=290.85, scaleX≈1.0038 | 唐僧 |
| 64 | 888 `btn3` | x=494.2, y=290.85, scaleX≈1.0038 | 猪八戒 |
| 94 | 889 `username` | x=386.1, y=539.05 | 输入提示“请输入名字”；边界约 x=399..541、y=537.05..568 |
| 95 | 894 `btn4` | x=682, y=290.75, scaleX≈1.0038 | 沙僧 |
| 124 | 895 `btn5` | x=870.65, y=344.7 | 空 `DefineButton2`，没有可见/命中内容，不作为交互对象 |
| 126 | 900 `btn5` | x=870.2, y=290.75, scaleX≈0.9840 | 白龙；实际第五张可交互卡 |
| 动态顶层 | image 115 `1P` / 108 `2P` | `x=当前卡.x-50, y=40`，84×84 | hover 时按 `curSelected` 显示当前要选的控制位；rollout 移除 |

### 5.2 卡片四态与命中

- 五张可见卡的 up 都使用同一可见对象加灰度滤镜。
- over 与 down 使用同一彩色对象、同一矩阵；没有独立 pressed 位移。
- 点击后 AS3 执行 `upState=downState`，因此 selected 是持久彩色 down，不是新增边框。
- P1 点击后该卡的 click/rollover/rollout 监听均移除；P2 必须选剩余四卡。
- hittest 的主矩形跨越整个舞台高度。裁到 940×590 后五列约为：

| 角色 | 舞台命中列 |
| --- | --- |
| 孙悟空 | x=0.76..188.82，y=0..590 |
| 唐僧 | x=188.71..376.72，y=0..590 |
| 猪八戒 | x=376.51..564.52，y=0..590 |
| 沙僧 | x=564.31..752.32，y=0..590 |
| 白龙 | x=754.82..939.13，y=0..590 |

原版角色页没有独立确认、返回或取消按钮。现代实现不得自行添加可见现代面板、标题、选中框、通用按钮或 P1/P2 文本标签。

## 6. 正式现代原子建档合同

```text
empty slot click
  → in-memory CreateProfileDraft(slotId)
  → choose playerCount
  → choose P1 hero
  → if 2P choose a different P2 hero
  → final role click validates the complete draft
  → one serialization write + set active slot
  → HeavenMapScene
```

- 进入 draft、切换人数、选择 P1、选择 P2、返回或 Escape 都不得写槽 key 或 active-slot key。
- 最终角色点击是确认；验证失败、序列化失败或目标槽不再 empty 时保持原槽不变，不写半成品。
- 人数页“返回”复用原生 1136。角色页允许 Escape 作为不可见输入等价；若要新增可见取消或确认控件，必须先取得用户批准。
- 新建完成后直接进入天庭地图；原版开场动画不在本线确认范围，不得暗中插回正式流程。
- 地图节点确认可路由时直接以当前存档队伍启动关卡，不再创建人数 chooser。

## 7. `PartyConfiguration` 与新版存档 schema

`PartyConfiguration` 是正式运行时唯一队伍事实源：

```ts
type PartyConfiguration =
  | {
      playerCount: 1;
      members: {
        p1: { heroId: HeroId };
      };
    }
  | {
      playerCount: 2;
      members: {
        p1: { heroId: HeroId };
        p2: { heroId: HeroId };
      };
    };
```

新版 `GameSave` 在现有双方完整成长快照之外新增 `party: PartyConfiguration`。约束：

- `HeroId` 只能为 1..5。
- 双人 `p1.heroId !== p2.heroId`，保持原版选择门禁。
- 活动 member 的 heroId 必须与同 owner 玩家快照的 `heroId` 一致；新版数据不一致时拒读为 corrupt，不静默换角色。
- 单人 `party.members` 不含 P2，但仍保留完整 `player2` 快照，保证旧数据和之后可能的队伍编辑不丢失；正式 UI/关卡不得把它当活动 owner。
- 共享原版 `username` 若后续保留，应作为独立 profile metadata，不放入 `PartyConfiguration`，也不得用它判断 owner。

### 7.1 V1/V2/V3/V4 与旧单槽迁移

- 所有缺少 `party` 的现代旧档统一迁移为 1P。
- P1 hero 取已清洗的 `player1.heroId`；若无效则沿既有 sanitizer 使用 Role1 安全默认。
- P2 全量快照原样保留但不活动；禁止根据 P2 是否有宠物、装备、等级或是否“像默认 Role1”猜测旧档曾是 2P。
- 旧单槽先走既有导入与数据迁移，再补同一 1P `party`；只进行一次规范化写回。
- 迁移后槽仍保持原 id、进度、P1/P2 成长、技能、库存、装备和宠物。

## 8. 正式消费者与 DEV 边界

| 消费者 | 正式读取合同 |
| --- | --- |
| `SaveSlotScene/System` | 空槽先建 draft；最终选择后原子写新版 save |
| `HeavenMapScene` | 从 active save 读取 party；功能页 owner 列表由 party 决定；节点直接进关 |
| Stage 正式场景 | 不再信任调用方传入的任意 `playerCount`；从 active save 建立本次不可变 party snapshot |
| HUD / Feature UI | 只遍历活动 members；owner 的 hero 来自 party，并与玩家快照一致 |
| 技能页 | 1P 只显示 P1 当前 hero；2P 可切 P1/P2，但每位只显示自己的当前 hero 技能 |
| 失败重试 / 胜利下一关 / 返回 | 沿用当前 active slot 的 party；不得弹人数选择或退回默认 Role1 |

DEV/测试边界：

- DEV 场景、确定性测试和显式 QA URL 可注入人数/hero，但必须有 `import.meta.env.DEV` 或测试 harness 门禁，不写 active save。
- 正式启动、正式地图、正式 Stage route、重试和功能页禁止消费 URL `players`、临时 scene data 或硬编码 `playerCount:2` 作为最终 owner。

## 9. 后续四个 Goal 的验收输入

### `TASK-ARCH-011`

- 新版 schema、validator、V1..V4/旧单槽迁移、原子 create API、active party 查询和 round-trip。
- 覆盖 1P、2P、重复 hero 拒绝、party/player hero 不一致拒读、单人保留 P2、写入失败不留半槽。

### `TASK-SLICE-151`

- 复用 character 1149 人数态与 character 901 角色态；按本文坐标、四态、P1/P2 marker 和命中列实现。
- 940×590 对照至少包含：人数页；1P 五角色 normal/hover/down；2P P1 selected + P2 marker；最终确认；人数返回；角色 Escape；重载。
- 可见现代例外：**无**。新增可见取消/确认、标题、边框或 P1/P2 文本须先获用户批准。

### `TASK-SLICE-152`

- 技能页 owner 集合来自 party，不再来自临时 `playerCount`。
- 断言 1P 不存在 P2 入口；2P 两 owner 分别使用 party hero；保存/重载/HUD 同步一致。

### `TASK-SLICE-153`

- 删除正式地图人数 chooser；地图、Stage、HUD、功能页、失败重试、胜利/返回统一消费 active party。
- DEV 注入仅在显式 DEV 路径可达；正式路径忽略/拒绝外部人数覆盖。

## 10. 证据读取与排除

已读局部/共享证据：

- `GameMenu.as`、`SelectRole.as`、`GMain.as`、`Config.as`、`User.as`、`MemoryClass.as`
- `SelectPLace.as`、`BuySkill.as`
- `gameplay-index.md`、`controls-index.md`、`save-slots-index.md`、`skill-ui-native-index.md`、`heaven-map-index.md`
- 当前 `SaveSystem/SaveSlotSystem/SaveSlotScene/HeavenMapScene/FormalSkillRuntimeBridge`

恢复视觉只读取 `OtherMat1.swf` 与主加载 SWF；选择性派生只写 Git 忽略的 `local-resources/regima/task-outputs/task-settings-065-save-party/`。未修改 legacy extraction 或恢复源。

排除：现代代码实现、Stage 2-3、技能数值、关卡规则、玩家键位、原版开场动画复现、可见现代确认/取消控件。
