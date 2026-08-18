# 宠物动画恢复源 corpus

`TASK-SETTINGS-193` 只完成资源 owner 与批次分区，不派生帧、不修改 `src/`，也不宣称任一物种真动画已闭合。完整逐符号候选、character id、SHA-256、现代状态与子 task 映射由 [`pet-animation-corpus.json`](pet-animation-corpus.json) 维护，并由 `npm run test:pet-animation-corpus` 防漂移。

## 恢复包

| 恢复包 | SHA-256 | 当前职责 |
| --- | --- | --- |
| `assets/pet1.swf` | `0699A5D3A49EA8024D3635B18C6349F5D7F7CF5F1DB869DD18A0A5EE6DE60644` | 主宠物本体与绝大多数技能对象；也是页面/HUD 来源，但 193 不处理页面/HUD |
| `assets/20120203.swf` | `3383E2F13967CFC33E7A8FD937CF37C407784F769B86BEEBB15694BEFCEFB832` | 猴 1..3、马 1..3、UFO 1..3、虎 1..3 的补丁候选及相应对象 |
| `assets/20120808.swf` | `73DA00CCEA990D642D071DCF70FC1D067706324598699C28814932E09ED76D4C` | 玄龟 4 本体补丁候选 |
| `assets/mouse.swf` | `15FE0D0007734B56D2F5D2D715683DFD89B7BBBAA73F5A4367AD6217ACC25DC0` | 鼠 1..4 的两套本体与三类技能对象 |
| `assets/StageCommon.swf` | `C6FC973D7D606CE4EA177B0AC075844C86A5EE7E493235FA812A029FBE4F29C9` | `PetHorseIceEffect` 的后加载共享候选 |

重复 SymbolClass 先按 `Aloader.urls` 的补丁顺序冻结到后加载候选；每个证据 task 必须用 ApplicationDomain/加载调用链再次确认，若反证成立则重开 corpus owner，不得继续导出错误版本。

## 九物种分区

| 物种 | 实际形态 | 本体恢复源摘要 | 技能对象摘要 | 现代可见状态 | 证据 → 实现 |
| --- | --- | --- | --- | --- | --- |
| monkey | 1..4 | 1..3 优先 `20120203`，4 为 `pet1` | 反击、两段雷击、灵压球、奥义本体动作 | 几何本体 + projectile 占位/未渲染 | 193A → 193B |
| horse | 1..4 | 1..3 优先 `20120203`，4 为 `pet1` | 水泡/冰冻/冰锥、全怪下落与爆炸、共享冰效 | 同上 | 193C → 193D |
| ufo | 1..3 | 优先 `20120203` | 魔破杀、瞬闪本体转移、狂魔闪空 | 同上 | 193E → 193F |
| tigress | 1..4 | 1..3 为 `20120203`，4 为 `pet1` | 虎跃、双段虎爪/咆哮、三段奥义复用 | 同上 | 193G → 193H |
| turtle | 1..4 | 1..3 为 `pet1`，4 优先 `20120808` | 治疗弹、链接 buff、范围弹、奥义本体复用 | 同上 | 193I → 193J |
| phoenix | 1..4 | `pet1` | 涅槃本体/反馈、火鸟、地火、朱雀奥义对象 | 同上 | 193K → 193L |
| dragon | 1..4 | `pet1` | 分身本体、冲锋弹、多段雷霆、青龙奥义对象 | 同上 | 193M → 193N |
| rabbit | 1..4 | `pet1` | 月光、疾风 buff、冰霜、月神奥义场 | 同上 | 193O → 193P |
| mouse | 1..3 共用 Bmd1，4 用 Bmd2 | `mouse.swf` | 鼠窜双对象、三飞镖、奥义复用 | 同上 | 193Q → 193R |

本体动作只冻结为待证明的 `wait/follow、walk/warp、普攻、物种技能、hurt、死亡/0 HP 生命周期` 六类可观察问题。精确动作行、帧时序/持帧、注册点、碰撞/可见边界和行为触发均由各物种证据 task 生成 `verified` 原版机器真值 JSON 后才能进入配对实现 task。

## 现代差异与关闭边界

- `TestScenePetViewBridge.createPetView` 当前仍是几何 body/ear/label；它不是原版本体资源。
- `PetSkillEffectKeys` 只覆盖旧 24 key，虎/凤凰/兔/鼠部分实现直接写字符串 key；两者均未形成可加载真动画 bundle。
- `AssetManifest.sourceAssetFamilies.petSkillProjectiles` 仍写 `missing-original`，已被恢复 SWF 精确命中反证；193 按禁止范围不改 `src/`，由首个配对实现 task 开始按物种移除对应旧声明。
- 193 完成只证明“35 个形态、38 个技能映射均有恢复源 owner 或明确复用关系，且全部进入有界批次”，不证明动作时间轴、真视觉或运行消费完成。

## TASK-SETTINGS-193A 猴系逐帧真值

- `task-settings-193a.pet-monkey-animation` 已达到 `verified`，包含 626 状态、20 显示对象、626 原版基准，`unresolved=[]`。
- `PetMonkeyBmd1..3` 的 owner 已由真实加载时序裁决为 `20120203.swf`；`PetMonkeyBmd4` 使用 `pet1.swf` 唯一候选。猴 2/3 的补丁与基础包图集哈希不同，禁止混用。
- 本体逐行 host-tick 持帧、20/24/30 clock、左右注册点/alpha 可见边界、普攻和 xj/lj/lyq 对象的 80 根帧、生成矩阵与销毁合同已冻结。
- 原版没有独立 warp clip；`>=1000` 距离触发只改写 root 位置。`jgaoyi` 直接使用 monkey4 body `hit5` row8，也没有独立 projectile 视觉。
- 证据矩阵与现代 key 差异见 `evidence/TASK-SETTINGS-193A-pet-monkey-animation.md`；193B 必须直接消费该真值，不能继续使用几何本体或单段/错名 projectile 占位。

## TASK-SETTINGS-193C 马系逐帧真值

- `task-settings-193c.pet-horse-animation` 已达到 `verified`，包含 716 状态、20 显示对象、716 个原版基准，`unresolved=[]`。
- `PetHorseBmd1..3` 和一至三阶普攻/技能对象由 `20120203.swf` 提供；`PetHorseBmd4` 与天马奥义两段来自 `pet1.swf`；共享 `PetHorseIceEffect` 由启动期 `StageCommon.swf` 提供。
- 本体逐行 host-tick 持帧、20/24/30 clock、左右注册点/alpha 边界、普攻与 sp/bd/bz 的 146 个根帧、天马奥义 8 个内嵌 subframe/30 帧爆炸、共享冰效缩放/暂停/恢复合同均已冻结。
- 原版无独立 warp clip；完整 owner、对象、生成、销毁和现代差异见 `evidence/TASK-SETTINGS-193C-pet-horse-animation.md`；193D 必须直接消费该真值。
