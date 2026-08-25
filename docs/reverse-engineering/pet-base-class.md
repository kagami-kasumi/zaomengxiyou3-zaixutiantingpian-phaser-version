# 原版 `BasePet` 专项逆向

任务：`TASK-SETTINGS-205`  
范围：`pet-animation-corpus.json` 冻结的 9 物种、35 个当前形态  
状态：代码行为证据已闭合；不代表现代宠物公共类已经完成

## 结论摘要

- `确认事实`：原版公共继承链是 `MovieClip -> BaseObject -> BasePet -> 具体宠物类`。35 个当前形态中，33 个直接继承 `BasePet`；只有 `PetMouse2`、`PetMouse3` 继承 `PetMouse1`，且两者只有构造器，没有新增字段或覆写。没有猴、马、龙等物种级中间基类。
- `确认事实`：`PetInfo` 持有可持久化宠物数据与数值，`BaseHero` 持有当前战斗实体引用和创建/替换生命周期，`BasePet` 持有单次出战会话的 owner、目标、冷却、自动 buff 计数、表现对象和 projectile 列表。具体类主要通过钩子覆写表达差异。
- `确认事实`：原版索敌不是“最近目标”，而是依 `gc.obbsiteArray` 顺序选择首个距离不超过 `1200` 的对象；当前目标死亡或距离达到 `1200` 后才清空。
- `确认事实`：只有当前出战并已实例化的宠物由所属 `BaseHero.updatePet()` 每帧推进；冷却、被动恢复、AI、表现与 projectile 同属这条活动实体链。原版没有让背包内所有宠物同时递减技能冷却。
- `交叉确认`：距离主人 `>= 1000` 且不处于攻击/受击时，宠物 root 直接瞬移到 `(owner.x, owner.y - 30)`；没有独立 `warp` 动作。猴/马 verified 真值与 AS3 调用链一致。
- `确认事实`：死亡不是 `hp <= 0` 后立即卸载。先把 HP 归零并进入 `dead` 动作；具体类在 dead 行播放结束后调用 `destroy()`，再销毁 BBDC/效果/projectile、清除 `BaseHero.myPet` 并淡出移除。龙族还覆写 `destroy()` 清理分身。
- `现代设计裁决输入`：当前 `PetCombatRuntime / PetBehavior / Registry` 的总体分工有部分原版职责证据支持，但 `nearestTarget`、全 roster 冷却、`hp <= 0` 立即卸载以及过窄的 Behavior 钩子与证据冲突或不完整。不得直接恢复 204B；必须先由后续现代设计 task 修订或明确收窄这些角色。

## 范围与证据定位

以下前缀用于表格中的 locator：

- `A/`：`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`
- `B/`：`local-resources/regima/legacy-extraction/resources_by_swf/[25034429].swf/scripts/`
- 主公共类：`A/base/BaseObject.as`、`A/base/BasePet.as`、`A/base/BaseHero.as`、`A/petInfo/PetInfo.as`
- 具体类：`A/export/pet/Pet*.as`
- 交叉副本：`B/base/*.as`、`B/export/pet/Pet*.as`
- 当前 35 形态范围：`docs/reverse-engineering/pet-animation-corpus.json:/species`
- 猴系视觉/空间交叉证据：`docs/reverse-engineering/evidence/TASK-SETTINGS-193A-pet-monkey-animation.md:24-75`；真值 `docs/reverse-engineering/ground-truth/manifests/task-settings-193a-pet-monkey-animation.json`
- 马系视觉/空间交叉证据：`docs/reverse-engineering/evidence/TASK-SETTINGS-193C-pet-horse-animation.md:24-69`；真值 `docs/reverse-engineering/ground-truth/manifests/task-settings-193c-pet-horse-animation.json`

`B/` 是同一游戏的混淆标识符副本，不能用可读方法名逐字比较；但 35 个类的 `extends`、`override` 数量和 `function` 数量逐类与 `A/` 一致。公共三类也一致：`BaseObject` 为 `MovieClip / 0 override / 88 function`，`BasePet` 为 `BaseObject / 13 / 55`，`BaseHero` 为 `BaseObject / 21 / 90`。因此 `A/` 用于可读 locator，`B/` 用于结构和常量交叉确认。

复核命令使用固定 35 类数组，分别统计：

```powershell
[regex]::Match($text,'class\s+\w+\s+extends\s+(\w+)')
[regex]::Matches($text,'\boverride\s+')
[regex]::Matches($text,'\bfunction\s+')
```

结果：35/35 的继承父类、override 数量和 function 数量在 `A/`、`B/` 间一致；未发现当前范围类缺失。

## 精确继承树与创建映射

公共链：

```text
flash.display.MovieClip
└─ base.BaseObject
   └─ base.BasePet
      ├─ 33 个直接具体类
      └─ export.pet.PetMouse1
         ├─ export.pet.PetMouse2
         └─ export.pet.PetMouse3
```

`BaseHero.addPetByPi()` 在 `A/base/BaseHero.as:448-713` 按 `PetInfo.getPetName()` 创建具体类。当前 35 项精确映射如下。

| 物种 | 运行 id -> AS3 类 | 继承 | 声明 locator |
| --- | --- | --- | --- |
| monkey | `monkey1..4 -> PetMonkey1..4` | 全部 `BasePet` | `PetMonkey1.as:9`、`2.as:9`、`3.as:9`、`4.as:9` |
| horse | `horse1..4 -> PetHorse1..4` | 全部 `BasePet` | `PetHorse1.as:9`、`2.as:9`、`3.as:9`、`4.as:10` |
| ufo | `ufo1..3 -> PetKabu1..3` | 全部 `BasePet` | `PetKabu1.as:9`、`2.as:9`、`3.as:10` |
| tigress | `tigress1..4 -> PetTiger1..4` | 全部 `BasePet` | `PetTiger1..4.as:9` |
| turtle | `turtle1..4 -> PetTurtle1..4` | 全部 `BasePet` | `PetTurtle1.as:9`、`2.as:9`、`3.as:9`、`4.as:11` |
| phoenix | `phoenix1..4 -> PetPhoenix1..4` | 全部 `BasePet` | `PetPhoenix1.as:9`、`2.as:9`、`3.as:10`、`4.as:10` |
| dragon | `dragon1..4 -> PetDragon1..4` | 全部 `BasePet` | `PetDragon1..4.as:10` |
| rabbit | `rabbit1..4 -> PetRabbit1..4` | 全部 `BasePet` | `PetRabbit1..4.as:9` |
| mouse | `mouse1 -> PetMouse1`；`mouse2/3 -> PetMouse2/3`；`mouse4 -> PetMouse4` | `Mouse1/4 -> BasePet`；`Mouse2/3 -> Mouse1` | `PetMouse1.as:9`、`2.as:6`、`3.as:6`、`4.as:9` |

`确认事实`：`BaseHero.addPetByPi()` 还包含房间坐骑、年兽、活动宠物等分支，但它们不在本 task 的 corpus 范围，不能改变上述 35 项结论。

## 数据与 owner 边界

### `PetInfo`：宠物持久数据 owner

`A/petInfo/PetInfo.as:11-33` 声明名称、出战标记、技能、回调与加密数值容器；`:33-101` 初始化 HP/MP/攻击/防御/资质/寿命/恢复/闪避/魔防/暴击/移动速度；`:2283-2353` 序列化和恢复 26 字段；`:2356-2586` 提供战斗数值 getter/setter。

- `确认事实`：HP、MP、最大值、攻击、防御、魔防、闪避、暴击、移速、寿命、等级、经验、资质和技能由 `PetInfo` 持有；`BasePet` 只保存引用，不复制第二份数值。
- `确认事实`：`PetInfo.upPassive()`（`:102-107`）按等级更新每周期 HP/MP 恢复值；`BasePet.doPassive()` 消费这些值。
- `确认事实`：等级/形态变化通过 `setDoWhenLevelUp`、`setDoWhenChangeState`（`:2627-2634`）回调 `BaseHero`；形态变化会重建战斗实体，不在旧实例上原地改类。

### `BaseHero`：玩家与活动实体 owner

- `A/base/BaseHero.as:395-427`：本地英雄从自己的 `Player.findCurrentPet()` 取 `PetInfo`；远端英雄从自己的 `MutiUser` 重建临时 `PetInfo`；注册回调并创建具体实体。
- `A/base/BaseHero.as:423-426`：新实体初始位置为 `(hero.x, hero.y - 100)`，随后加入 `gc.gameSence`。
- `A/base/BaseHero.as:982-992`：每个英雄只推进自己的 `myPet.step()`；`clearPet()` 只清当前英雄引用。
- `A/base/BaseHero.as:2561-2591`：换宠先 destroy 旧实体，再 `initPet()`；联机时只同步该英雄对应的 petName/HP/MP。

`确认事实`：P1/P2 是两个独立 `BaseHero -> Player -> PetInfo -> BasePet` owner 链，不是一个共享宠物实体配两套视图。

### `BasePet` 字段/初值/读写矩阵

| 字段 | 声明/有效初值 | owner 与写入 | 主要读取者 | 销毁/未知 |
| --- | --- | --- | --- | --- |
| `sourceRole` | `BaseHero`，`:30`；构造 `:96` | `BasePet` 会话绑定所属英雄；构造写一次 | 跟随、owner 权威判断、主人 buff、网络 role id、经验/伤害回溯；具体类技能也读取 | `destroy():1184-1188` 调 `clearPet()` 后置 null |
| `hpSlip` | `Sprite`，`:32`；`:1088-1129` 创建/绘制 | 纯表现 owner，受伤时显示 | `reduceHp()`、`cureHp()` 后的 HP 可见反馈 | 随根显示对象移除；不属于持久数据 |
| `_petInfo` / `petInfo` | `PetInfo`，`:34`、`:95`、`:127-135` | 外部 `Player` roster 持有对象；实体持引用 | 全部数值、技能门禁、恢复、死亡、保存和 projectile 伤害 | 不在 `destroy()` 中销毁；换宠/重建仍由 roster 持有 |
| `attackRate` | 声明 `0.8`；构造连续赋值最终有效值 `0.7`，`:36`、`:76-89` | 基类；兔疾风和少数具体类临时改写 | 每秒普攻随机门禁 `:356-370` | 重建实例复位；重复赋值是反编译可见事实，最终值为 0.7 |
| `attackRange` | `150`，`:38`；多数具体构造器覆盖 | 单实体配置 | AI 判断普攻/追击 `:356`，具体技能另有独立距离门禁 | 不持久化 |
| `searchRange` | `1200`，`:40` | 基类；35 类未发现写入 | `searchTarget():1075-1086` | 不持久化 |
| `followRange` | `640`，`:42` | 基类；35 类未发现写入 | `followSource():1023-1043` | 不等于 warp 阈值 1000 |
| `curAttackTarget` | null，`:44` | `searchTarget()` 或受击 `beMagicAttack():619-620` 写入；死亡/距离 `>=1200` 清空 | face/follow、技能门禁、普通攻击与具体类 | 目标是活动会话状态，不持久化 |
| `lastBeAttackedTarget` | null，`:46` | `beMagicAttack():619` 写入 | 当前 35 类和 `BasePet` 未发现后续读取 | `确认事实`：当前范围为 write-only 遗留字段；不得据此发明行为 |
| `skillCD1..4` | `[-1,30]`，`:48-54`、`:90-93` | 具体类构造器写初始/间隔；AI 施放后写间隔；`countSkillCD()` 递减 | `myIntelligence()` 按 1→4 读取 | 只属于活动实例；未出战宠物不推进 |
| `timeCount` | `0`，`:56` | `step():157-166` 每帧递增，59999 回绕 | 每秒 AI、GXP 闪烁、部分具体类状态 | 不持久化 |
| `sxkb/fsnl/smjc/mfjc/gjjc/fyjcCount` | 各 `300`，`:58-68` | `checkBuffSkill():405-539` 递减；成功后写 `4320/5400` | 六个自动 buff 门禁 | 活动实例重建即复位 |
| `testCount` | `96`，`:70` | `checkBuffSkill():431-433` 只递减 | 未发现其他读取 | `确认事实`：当前范围没有可观察结果 |
| `tCount` | `0`，`:72` | `step():153-157` 计满 `gc.frameClips` 后清零 | 每周期 `doPassive()` | 活动实例重建即复位 |
| `PET_MONKEY/PET_HORSE` | `0/1`，`:26-28` | 静态常量 | 全 corpus 搜索未发现读取 | 遗留常量，不是现代分类依据 |

`BasePet` 还消费 `BaseObject` 的 `body/colipse/bbdc`、`speed`、`curAction`、`magicBulletArray`、`attackBackInfoDict`、`curAddEffect`、`isGXP`、`lastHit`、`sid` 等运行字段。它们由 `BaseObject` 在 `A/base/BaseObject.as:20-111` 声明并在 `:113-133` 初始化。

## 构造、每帧、受击、死亡与销毁顺序

### 构造与加入场景

1. `BaseHero.initPet()` 选择该英雄自己的 `PetInfo`，注册升级/形态回调。
2. `BaseHero.addPetByPi()` 依据完整 pet id 创建具体类。
3. 具体类先调用 `super(owner, petInfo)`。
4. `BasePet` 初始化通用字段和四个 CD，然后调用 `BaseObject()`。
5. `BaseObject()` 创建数组/物理状态/`body`，再动态调用具体类的 `newColipse()` 与 `initBBDC()`（`A/base/BaseObject.as:113-149`）。因此表现/碰撞对象在 `BasePet` 返回前已存在。
6. 回到 `BasePet` 后绑定 `petInfo/sourceRole`、创建 HP 条、设置跳跃力与 `BaseAddEffect`、朝右、添加 father 状态，并从 `PetInfo` 读取移速（`A/base/BasePet.as:74-106`）。
7. 回到具体类构造器后写攻击字典、攻击范围、初始动作、四个技能 CD 和形态私有状态。
8. `BaseHero` 把实体置于 `(hero.x, hero.y - 100)` 并加入场景；`BasePet.__added()` 对 221/222/223 特殊关卡登记船体交互（`:110-125`）。

### 每帧顺序

`BaseHero.updatePet()` -> `BasePet.step()` 的确定顺序是：

1. 推进 `magicBulletArray` 中每个 projectile 的 `step2()`，收集 ready-to-destroy 对象并从数组移除（`:141-152`、`:217-231`）。
2. 每约 `gc.frameClips` 帧执行 `doPassive()`，按 `PetInfo.ehp/emp` 恢复 HP/MP（`:153-157`、`:399-403`）。
3. 执行 `myIntelligence()`：权威判断、索敌、跟随、技能/普攻、自动 buff、垂直移动（`:305-397`）。
4. 执行 `PetInfo.upPassive()`，再递减四个技能 CD（`:158-159`、`:185-214`）。这意味着本帧选择动作发生在本帧 CD 递减之前。
5. 递增/回绕 `timeCount`，处理 GXP 闪烁（`:160-172`）。
6. 若与 owner 距离 `>=1000` 且双方均非攻击/受击，直接把 root 改到 `(owner.x, owner.y - 30)`（`:173-181`）。
7. 最后调用 `BaseObject.step()` 推进 BBDC、速度、碰撞/物理、效果等公共对象逻辑（`A/base/BaseObject.as:165-257`）。

### AI 与动作选择

- stun 存在时 `myIntelligence()` 立即返回。
- 只有 `gc.sid == sourceRole.sid` 或单机模式运行 AI；远端实例由网络回放驱动。
- 无目标时先 `searchTarget()`，然后每秒按 owner 距离进入 follow/wait。
- 当前目标死亡或距离 `>=1200` 时清空；本帧不立即重新搜索第二个目标。
- 空闲且未受击时按 `skill1 -> skill2 -> skill3 -> skill4` 调用 `beforeSkillNStart()` 与 `releSkillN()`。
- 四技能均不触发时，每秒按 `attackRange`、`attackRate` 决定普攻、wait 或追击。
- `searchTarget()` 按 `gc.obbsiteArray` 当前顺序取第一个 `distance <= 1200` 的对象，不排序、不比较最近距离（`:1075-1086`）。

### 受击、死亡与销毁

- `beMagicAttack()`（`:566-746`）依次处理无敌、碰撞、兔疾风闪避、命中/必杀、攻击回退与 addEffect、伤害类型/防御、吸血/怪物特例、`reduceHp()` 和联机伤害消息。
- `reduceHp()`（`:865-934`）先写 `PetInfo.hp`、伤害数字与联机 HP；HP `<=0` 时归零并进入 `dead`。单机还把 lifetime 减 1；未死亡且允许受击表现时才进入 `qlfj` 反击或 `hurt`。
- 每个直接具体类的 `scriptFrameOverFunc()` 都定义 dead 行结束后的 `destroy()`；猴/马逐帧持帧已由 193A/193C verified 真值交叉确认。其余七族的具体行/持帧仍由各自视觉真值 task 证明，不能由本代码 task外推。
- `BasePet.destroy()`（`:1150-1189`）先销毁 BBDC/当前效果，标记 ready，启动 1 秒淡出并最终从 parent 移除；随后 destroy 全部 projectile、清空数组、调用 owner `clearPet()`、置空 `sourceRole` 并清 protected property。
- `PetDragon1..4.destroy()` 额外负责分身数组生命周期；这是具体类清理钩子，不是 BasePet 通用分身职责。

## 公共方法与钩子

| 类别 | `BasePet` 默认 | 具体类使用方式 | 行为意义 |
| --- | --- | --- | --- |
| 表现创建 | `initBBDC()` 为空；碰撞来自 `BaseObject.newColipse()` 空钩子 | 33 个直接类均覆写 `initBBDC/newColipse` | 每形态 BBDC、碰撞和 frame callback；属于表现/碰撞证据，不等于现代类必须继承 |
| 技能门禁 | `beforeSkill1..4Start()` 全返回 false | 对已拥有的形态技能逐个覆写 | MP、已学技能、距离、受击触发、组合态等门禁 |
| 技能执行 | `releSkill1..4()` 全为空 | 具体类逐个覆写 | 扣 MP、转向、动作、网络消息、组合/持续态 |
| AI | `myIntelligence()` 提供通用选择顺序 | 所有直接类覆写后调用/扩展通用逻辑 | 形态技能状态与特殊移动会扩展公共 AI；不能把差异缩成纯“选一个技能 key” |
| 普攻/伤害 | `normalHit()` 只进入 `hit1`；`getRealPower()` 是不可用兜底 | 具体类覆写动作、伤害公式和 projectile | `getRealPower()` 的具体覆写覆盖当前 35 形态 |
| 时间轴命中 | 来自 `BaseObject` 空 frame hooks | 具体类覆写 `enterFrameFunc/exitFrameFunc/scriptFrameOverFunc` | 伤害/projectile 在特定动画帧生成；动作结束回 wait/hurt reset/dead destroy |
| 联机回放 | `setOtherAction()` 处理 wait/jump/左右/下落 | 各直接类覆写 `setOtherAttack()` | 远端只回放权威端已选动作/攻击，不再次运行完整本地 AI |
| 受击 | BasePet 处理通用命中、闪避、HP、反击、hurt/dead | 所有直接类覆写 `reduceHp()`；部分再覆写 `setAttackBack` | 受击可解锁技能、触发涅槃/链接/奥义状态或改变动作免疫 |
| 移动能力 | BasePet stun、follow、warp、jump/fall | 少数类覆写 `move/turnLeft/turnRight/isCanMoveWhenAttack/isCannotMoveWhenAttack/isAttacking` | 冲刺、升空、奥义或攻击中移动不是纯技能函数副作用 |
| 自动效果 | `checkBuffSkill()` 统一六个自动 buff | 龙 1..4 覆写扩展分身/持续态 | 公共 buff 与种类持续效果需要明确组合顺序 |
| 销毁 | BasePet 清 BBDC/effect/projectile/owner/显示根 | 龙 1..4 覆写 | 形态私有实体必须在公共销毁链前后清理 |

## 35 形态覆写矩阵

除 `PetMouse2/3` 外，所有直接具体类都有以下共同覆写组 `C`：

`initBBDC, newColipse, setAction, scriptFrameOverFunc, enterFrameFunc, reduceHp, setOtherAttack, normalHit, getRealPower, exitFrameFunc, myIntelligence, isCannotMoveWhenAttackOnFloor`

表中只列 `C` 之外的钩子；`B1..B4` 表示 `beforeSkillNStart`，`R1..R4` 表示 `releSkillN`。这仍是完整矩阵：`C + 表内增量` 等于该类全部 override。

| 类 | 父类 | 私有/新增字段 | 技能钩子 | `C` 外其他覆写 | 覆写数 | 分类与 locator |
| --- | --- | --- | --- | --- | --- | --- |
| PetMonkey1 | BasePet | `skill1Release` | B1/R1 | — | 14 | 受击解锁献祭；`:12-343` |
| PetMonkey2 | BasePet | `skill2Release` | B1-2/R1-2 | — | 16 | 连击+受击献祭；`:12-464` |
| PetMonkey3 | BasePet | `skill3Release` | B1-3/R1-3 | `isAttacking` | 19 | 三技能+复合攻击态；`:12-555` |
| PetMonkey4 | BasePet | `hit5Const, hit5Times, skill3Release` | B1-4/R1-4 | `move,isAttacking` | 22 | 组合奥义、hit5、移动锁；`:12-720` |
| PetHorse1 | BasePet | — | B1/R1 | — | 14 | 水泡；`:12-364` |
| PetHorse2 | BasePet | `skill1Release` | B1-2/R1-2 | — | 16 | 受击冰冻；`:12-455` |
| PetHorse3 | BasePet | `skill1Release` | B1-3/R1-3 | `isAttacking` | 19 | 冰锥+复合攻击态；`:12-547` |
| PetHorse4 | BasePet | `skill1Release` | B1-4/R1-4 | `isAttacking` | 21 | 天马奥义；`:13-735` |
| PetKabu1 | BasePet | — | B1/R1 | — | 14 | 魔破杀；`:12-330` |
| PetKabu2 | BasePet | — | B1-2/R1-2 | — | 16 | 瞬闪；`:12-401` |
| PetKabu3 | BasePet | — | B1-3/R1-3 | `isCannotMoveWhenAttack` | 19 | 升空/攻击移动限制；`:13-531` |
| PetTiger1 | BasePet | — | B1/R1 | — | 14 | 虎跃；`:12-325` |
| PetTiger2 | BasePet | — | B1-2/R1-2 | — | 16 | 嗜血虎爪；`:12-496` |
| PetTiger3 | BasePet | — | B1-3/R1-3 | `isAttacking` | 19 | 咆哮+复合攻击态；`:12-623` |
| PetTiger4 | BasePet | `aoyiStep,isAtkUp` | B1-4/R1-4 | `isAttacking` | 21 | 奥义步骤/攻击增益；`:12-941` |
| PetTurtle1 | BasePet | — | B1/R1 | — | 14 | 水疗盾；`:12-332` |
| PetTurtle2 | BasePet | — | B1-2/R1-2 | — | 16 | 同心链接；`:12-386` |
| PetTurtle3 | BasePet | — | B1-3/R1-3 | — | 18 | 水湮八荒；`:12-476` |
| PetTurtle4 | BasePet | `isAoyi` | B1-4/R1-4 | `setAttackBack,move,turnLeft,turnRight` | 24 | 奥义期间移动/转向/击退特例；`:14-618` |
| PetPhoenix1 | BasePet | — | B1/R1 | `setAttackBack` | 15 | 涅槃受击特例；`:12-362` |
| PetPhoenix2 | BasePet | — | B1-2/R1-2 | `setAttackBack` | 17 | 火鸟+涅槃；`:12-460` |
| PetPhoenix3 | BasePet | — | B1-3/R1-3 | `setAttackBack,isAttacking` | 20 | 地火+复合攻击态；`:13-581` |
| PetPhoenix4 | BasePet | `isAoyi` | B1-4/R1-4 | `setAttackBack,isCanMoveWhenAttack,isAttacking` | 23 | 奥义起止、移动与受击免疫；`:13-867` |
| PetDragon1 | BasePet | `continueCount,totalHurt,type,fenshenArray` | B1/R1 | `checkBuffSkill,destroy` | 16 | 分身/持续伤害/私有清理；`:13-423` |
| PetDragon2 | BasePet | 同 Dragon1 | B1-2/R1-2 | `checkBuffSkill,isCanMoveWhenAttack,destroy` | 19 | 冲刺/治疗/分身；`:13-517` |
| PetDragon3 | BasePet | 同 Dragon1 | B1-3/R1-3 | `checkBuffSkill,isCanMoveWhenAttack,isAttacking,destroy` | 22 | 多段技能/复合攻击态；`:13-647` |
| PetDragon4 | BasePet | Dragon1 字段 + `isAoyi` | B1-4/R1-4 | `checkBuffSkill,isCanMoveWhenAttack,isAttacking,destroy` | 24 | 分身组合奥义与私有清理；`:13-941` |
| PetRabbit1 | BasePet | — | R1 | — | 13 | 月光由攻击/命中链触发，无 B1；`:12-302` |
| PetRabbit2 | BasePet | — | B1/R1 | — | 14 | 疾风；`:12-322` |
| PetRabbit3 | BasePet | — | B1-2/R1-2 | `isCanMoveWhenAttack` | 17 | 冰霜升空/攻击中移动；`:12-476` |
| PetRabbit4 | BasePet | — | B1-3/R1-3 | `isCanMoveWhenAttack` | 19 | 月神奥义；`:12-510` |
| PetMouse1 | BasePet | — | B1/R1 | `isCanMoveWhenAttack` | 15 | 鼠窜；`:12-368` |
| PetMouse2 | PetMouse1 | — | 继承 Mouse1 | 无 | 0 | 空子类，仅构造 `super`；`:6-12` |
| PetMouse3 | PetMouse1 | — | 继承 Mouse1 | 无 | 0 | 空子类，仅构造 `super`；`:6-12` |
| PetMouse4 | BasePet | `_aoyiStep` | B1-3/R1-3 | `isCanMoveWhenAttack` | 19 | 回旋飞镖/紫鼠奥义步骤；`:12-621` |

覆写矩阵说明：

- `确认事实`：物种/形态差异不只属于“选择哪个技能”。它同时落在动画帧命中、受击触发、移动许可、攻击态判断、自动效果、网络回放和销毁清理。
- `确认事实`：类之间存在大量拷贝式共同 override，但这不能反推现代代码必须使用深继承。现代架构只需保留其可观察合同和差异接缝。
- `确认事实`：`PetMouse2/3` 是唯一真实形态复用继承证据；不能把这个少数例外外推为九物种统一继承层级。

## 架构无关行为合同

| 合同 | 输入/状态 | 触发与顺序 | 玩家可观察结果 | 证据等级 | 反证条件 |
| --- | --- | --- | --- | --- | --- |
| 单 hero 单活动实体 | hero 自己的 roster/current pet | 创建/换宠/休息均由该 hero 发起 | P1/P2 宠物互不串号，可同时存在 | 交叉确认 | 发现共享 `myPet` 或跨 hero 写入 |
| 数据不复制 | `PetInfo` | 实体读写同一 PetInfo | 页面、HUD、战斗 HP/MP/成长一致 | 确认事实 | BasePet 存在独立持久数值副本 |
| 活动实例时钟 | 当前 `myPet` | `BaseHero.updatePet()` 每帧只调用当前实体 | 只有出战宠物推进 CD、恢复、AI、projectile | 确认事实 | 未出战 PetInfo 有独立 step 入口 |
| 目标选择 | 有序 opponent 集合、searchRange 1200 | 首个范围内对象；当前目标死/越界才清空 | 目标受集合顺序影响，不保证最近 | 确认事实 | 运行态证明集合本身已按距离排序；这不会把 BasePet 算法改成 nearest，只会改变上游输入语义 |
| 动作优先级 | 目标、受击/攻击态、技能门禁、CD | skill1→2→3→4；否则每秒普攻/wait/follow | 高优先技能先释放；同帧最多选一个主动动作 | 确认事实 | 具体类覆写不调用公共顺序并完全替代；矩阵已记录差异类 |
| 冷却时序 | 活动实例四组 `[remaining, interval]` | 先 AI 选择，再在本帧末递减 | 初始延迟与重触发按活动帧推进 | 确认事实 | 运行宿主跳帧/暂停改变实际 host tick；需现代统一 clock 映射 |
| 跟随与 warp | owner/target 距离、动作态 | 每秒 follow；root 距离 `>=1000` 且空闲时瞬移 | 宠物追随主人，过远无 warp 动画直接回身边 | 猴/马交叉确认；其余代码确认 | 其他族视觉真值发现独立 warp 行/对象 |
| 普攻/技能命中时刻 | 动作时间轴和 frame callback | 具体 `enterFrameFunc` 在指定帧生成 hit/projectile | 伤害对象与动画出手时刻绑定 | 猴/马交叉确认；其余待族真值 | 其他族实现为非时间轴立即伤害 |
| 受击与反击 | damage、命中类型、PetInfo、effect | 通用防御/闪避后写 HP；存活时再 hurt/qlfj/具体反应 | 受击、miss、反击、HP 条和特效可见 | 确认事实 | 具体类完全绕过 `super.reduceHp`；矩阵未发现当前 35 类如此做 |
| 死亡延迟销毁 | HP、dead 动作 | HP 归零→dead→frame over→destroy | dead 动作完整播放后实体淡出/移除 | 猴/马交叉确认；其余代码确认 | 族真值证明 dead 回调不是 destroy |
| 形态替换 | PetInfo 形态变化回调 | destroy 旧实体→按新 id 创建新类 | 形态变化重建表现、碰撞、CD 与私有状态 | 确认事实 | 原地切换类/资源路径存在 |
| owner 权威/回放 | single/room、sourceRole.sid | owner 端运行 AI并发 action/attack/hurt/dead；远端 setOther* 回放 | 联机双方看到同一宠物动作和数值 | 确认事实 | 网络协议另有权威纠正；现代本地双人不需要照搬传输层 |
| 销毁清理 | BBDC/effect/projectile/私有召唤物/hero ref | 具体私有清理 + 公共清理，重复调用预期不得残留 | 换宠/死亡/离场无孤儿对象 | 确认事实；幂等性为现代要求 | 原版 `destroy()` 本身未显式 guard，故“原版幂等”未知 |

## 视觉与空间适用性裁决

- 本 task 不新增 UI、HUD、动画或空间机器真值，因此 UI ground-truth Schema 不适用。
- `follow/warp/action/hurt/dead` 涉及可见/空间事实，不能只由人工转抄坐标证明。猴/马部分直接引用 193A/193C verified manifest：二者都确认 warp 只改 root world position、hurt/dead 使用各自 BBDC 行、dead frame-over 后销毁。
- 原版 root 构造初始位置 `(hero.x, hero.y-100)` 与 warp 位置 `(hero.x, hero.y-30)` 是 AS3 world-position 行为合同，不是图像左上角或脚底坐标；现代视觉投影仍必须消费各族 manifest 的 registration/matrix/visible bounds。
- 其余七族的 BBDC 行、注册点、持帧、命中对象和 dead 可见边界保持“待各族 verified 真值”；本 task 只确认它们的 AS3 状态机/回调入口，未把猴/马视觉外推。

## 六段证据矩阵

| 行为合同项 | 局部 AS3 | 共享调用链 | 几何/坐标 | 架构无关结论 | 现代映射 | 验证与等级 |
| --- | --- | --- | --- | --- | --- | --- |
| 创建/继承 | 35 个类声明；`BaseHero.as:448-713` | `PetInfo -> BaseHero.initPet -> addPetByPi` | 不适用：类/数据事实 | exact id 创建 exact concrete behavior | Registry 可承接 exact key；类继承不必照搬 | A/B 35/35 结构计数一致；交叉确认 |
| owner/P1/P2 | `BasePet.as:30,95-96` | `BaseHero.as:395-427,982-992,2561-2591` | world root 归各 hero | 每 slot 独立 roster、owner、活动实体 | `PetCombatFrame.owner + roster` 有支持 | AS3 两端 + 既有 P2 文档；交叉确认 |
| 每帧生命周期 | `BasePet.as:141-183` | `BaseHero.updatePet():982-988`、`BaseObject.step():165+` | host frame clock | 只推进活动实体，固定公共顺序 | Runtime Context 有支持；当前全 roster CD 冲突 | 确定性源码顺序；确认事实 |
| 索敌/跟随 | `BasePet.as:305-397,1009-1086` | `gc.obbsiteArray`、owner/target | 距离在 world root 空间；warp root `(x,y-30)` | ordered-first target、640 follow、1000 warp | Targeting nearest 冲突；warp 部分一致 | AS3 + 193A/C warp；交叉确认 |
| 技能/普攻 | 35 类 B/R/normal/frame hooks | BasePet skill1→4 与 projectile owner | 出手帧/对象矩阵按族真值 | 动作选择与时间轴命中须可组合 | Behavior seam 有支持但当前能力口过窄 | 覆写矩阵 + 193A/C；部分交叉确认 |
| 受击/死亡 | `BasePet.as:566-934` + 35 类 reduceHp/frame-over | PetInfo HP/lifetime、网络同步、BaseObject | hurt/dead 行需族真值 | HP 归零先 dead，结束后 destroy | 当前 hp<=0 立即 release 冲突 | AS3 + 193A/C；交叉确认 |
| 销毁 | `BasePet.as:1150-1189`、Dragon destroy | BaseHero.clearPet、projectile/effect | 1 秒 alpha fade；具体可见边界由真值 | 公共和种类私有资源都须清理 | Runtime destroy 方向有支持，缺 view/projectile/private cleanup 合同 | 源码两端；确认事实 |
| 联机 | 具体类 `setOtherAttack`、BasePet `setOtherAction` | `BaseMutiLevelListenering.as:963-1055`、Config sendPet* | action 坐标为 world root | owner 端决策、远端回放 | 本地 P1/P2可不复制网络实现；owner 边界必须保留 | 发送/接收两端；交叉确认 |

## 原版职责 -> 当前现代 owner 审计

裁决标签只描述证据支持度，不在本 task 选择新方案。

| 原版职责 | 当前现代 owner | 裁决 | 证据与缺口 |
| --- | --- | --- | --- |
| PetInfo 持久数据与出战选择 | `PetState / PetRoster` | `证据支持` | 同一 roster 对象由页面/战斗消费符合 PetInfo owner；不得在 Runtime/Behavior 复制数值 |
| hero/slot 绑定活动宠物 | `PetCombatRuntime.synchronizePet(frame.roster, frame.owner)` | `证据支持` | exact owner + active pet 会话成立；Registry 解析前先释放旧会话符合换宠重建方向 |
| 公共每帧协调 | `PetCombatRuntime.update()` | `证据支持 + 缺口` | Context 统一顺序有证据；但当前顺序缺 projectile/passive/buff/受击/dead/physics，并与原版 CD 顺序不同 |
| 跟随/warp | `PetRuntimeSystem.updatePetRuntime()` 由 Runtime 调用 | `部分支持 / 现代设计选择` | `warpDistance=1000`、`warpOffsetY=-30` 有证据；`followMinDistance=64`、`followOffsetX=58`、`followOffsetY=18`、`moveSpeed*90` 不是本专项原版事实，且原版 follow 门槛为 640 |
| 技能 CD | `PetSkillTickSystem.updatePetSkillState(frame.roster)` | `与证据冲突` | 原版只推进活动实体且 AI 选择发生在本帧递减前；现代对 roster 全宠递减并在选择前递减 |
| 目标过滤 | `PetCombatTargeting.livingTargets()` | `证据支持` | 死目标不能继续作为有效动作目标；但原版先清当前目标，后续帧再重搜 |
| 目标选择 | `PetCombatTargeting.nearestTarget()` | `与证据冲突` | 原版按 `gc.obbsiteArray` 顺序取首个范围内对象，不计算 nearest；当前还没有 1200 searchRange 门禁 |
| distance/facing 纯函数 | `PetCombatTargeting.distance/facing()` | `证据支持` | 原版大量使用距离和左右朝向；抽纯服务是现代设计选择，但结果语义受支持 |
| exact 形态映射 | `PetBehaviorRegistry(species + form)` | `证据支持 + 现代设计选择` | `BaseHero.addPetByPi` 证明 exact id 映射；Registry/Factory 形式由现代架构决定。当前仅 8/35，不能宣称全集 |
| 形态差异注入 | `PetBehavior` | `证据支持 + 能力缺口` | Strategy seam 合理；原版差异还覆盖受击、移动、攻击态、frame hit、自动效果、网络回放、私有销毁，当前四方法不足以表达完整合同 |
| 猴/马动作选择 | `MonkeyPetBehavior / HorsePetBehavior` | `部分支持` | 现有 select/cast 复用技能 owner；`updateEffects/destroy` 为空，未覆盖普攻、受击反应、动作帧命中或具体清理 |
| projectile/伤害数值 | `PetSystem request*` 与各 `Pet*SkillSystem`、`ProjectileSystem` | `证据支持 + 待迁移` | 继续保留单一数值/伤害 owner正确；Runtime/Behavior 只应发能力请求，不复制算法 |
| 普攻 fallback | 尚无完整公共 owner | `未知/缺口` | 原版每秒 attackRate/follow/wait 分支和 normalHit 时间轴命中未进入当前 Runtime 合同 |
| 自动恢复/六 buff/qlfj | `PetAutoBuffSystem`、skill systems；未完整接 Runtime | `证据支持 + 缺口` | 独立纯系统有事实基础，但当前 Runtime 更新未按原版活动实例顺序组合 |
| hurt/dead/死亡帧 | view/animation bridge + roster HP；Runtime 当前立即 release | `与证据冲突 / owner 未定` | 必须先保留 dead 会话直到表现完成，再清理行为/视图；后续设计需指定状态与完成事件 owner |
| 私有持续态/召唤物清理 | Behavior `updateEffects/destroy` 预留 | `现代设计选择 + 缺口` | 接口方向可用，但龙分身、龟/凤/兔/鼠奥义等尚无完整生命周期合同 |
| 网络 action/attack replay | 当前范围无现代网络 owner | `未知但不阻塞本地双人` | 原版事实已记录；现代当前目标是本地 P1/P2，不要求复刻传输层，但不得混淆 owner |
| 只读 snapshot/event 与幂等 destroy | `PetCombatRuntime` | `现代设计选择` | 有利于现代消费者和清理安全；原版没有只读事件模型，也未证明 destroy 本身幂等 |
| 正式消费者 | `PetCombatRuntime` | `缺口` | LSP 对类引用仅返回声明；仓库搜索只发现专项测试和 gate，尚无正式 Scene/关卡消费者 |

### 设计裁决结论

现有方案不能简单判为“全部错误”，也不能原样继续扩展：

- 可以保留的证据方向：每 slot 一个公共 runtime、exact 形态 Registry、以差异对象/能力组合代替把 AS3 深继承照搬进 TypeScript、数值和 projectile 继续由现有纯系统持有。
- 必须修订或明确收窄：Targeting 的 ordered-first/1200 语义、只推进活动宠物的 CD 与原版更新顺序、dead 完成前不释放会话、普攻 fallback、被动/buff/受击/移动/动画命中/私有销毁的 owner 与扩展点。
- 必须由后续设计 task 作唯一方案裁决：是扩展 `PetBehavior` 为有界能力集合，还是把受击/移动/表现事件拆成独立组合角色；本逆向文档不替用户选择模式，也不修改现有设计。

## 未知项与反证条件

1. `未知`：其余七族的逐帧动作行、注册点、持帧、命中对象和 dead 可见边界。本 task 只确认 AS3 hook；由 193E/G/I/K/M/O/Q 的 verified 真值关闭。
2. `未知`：`gc.obbsiteArray` 上游是否在所有关卡稳定按距离排序。即便排序，BasePet 本身仍是 ordered-first；现代若要复现最终目标结果，必须审计上游集合顺序或显式冻结输入合同。
3. `未知`：原版 `destroy()` 被重复调用时的实际容错。源码无 guard；现代幂等销毁可保留为工程选择，但不能标作原版事实。
4. `未知`：网络高延迟下 action/HP 回放的纠错细节。当前本地 P1/P2范围不阻塞，未来网络 task 必须重开。
5. `确认无行为`：`testCount` 仅递减、`lastBeAttackedTarget` 当前范围只写不读、`PET_MONKEY/PET_HORSE` 无消费者。发现新增读取者时重开对应合同。
6. 反证条件：若恢复源/运行态证明某族存在独立 warp label、死亡未等 frame-over、或具体类不调用公共 `super.reduceHp`，只降级该族结论，不批量推翻已闭合公共链。

## 验证结果

- 35/35 当前形态在 `A/` 和 `B/` 中均存在；继承父类、override 数量、function 数量逐类一致。
- 当前形态继承入口全部解释：33 个直接 `BasePet`，2 个空子类 `PetMouse2/3 -> PetMouse1`，无其他中间基类。
- `BasePet` 关键链由局部类与 `BaseHero/PetInfo/具体类/BaseMutiLevelListenering` 两端交叉确认。
- 猴/马的 follow/warp、hurt/dead、frame-over destroy 与 193A/193C verified 真值一致；未向其他族外推视觉细节。
- 本 task 没有修改 `src/`、恢复 SWF、legacy 原始提取、真值 manifest、玩法数值、roster 或存档。

