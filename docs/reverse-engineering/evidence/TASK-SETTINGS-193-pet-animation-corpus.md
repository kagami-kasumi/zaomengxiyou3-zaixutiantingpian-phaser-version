# TASK-SETTINGS-193 宠物动画 corpus 证据

## 待证明问题

1. 现代九物种/35 形态的本体与已实现技能对象是否能在恢复 SWF 精确定位。
2. `pet1` 与补丁包重复 SymbolClass 的 owner 如何分区，哪些结论仍需运行时负载顺序反证。
3. 当前现代 key 是真资源、占位还是根本未渲染，是否每一缺口都有独立后续批次。

## 六段证据链

| 合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| 物种/形态范围 | `PetRosterSystem.createSeedPetRoster`、`BaseHero.addPetByPi`、`pets-index.md` | `PetRoster -> PetRuntimeModel -> TestScenePetViewBridge` | 本 task 不提取帧；只登记本体 SymbolClass | 交叉确认 | roster 或原类映射变化时重开 | generator 与源码双向搜索 |
| 恢复源定位 | 五个恢复 SWF 的 SymbolClass 76 标签与 SHA-256 | `Aloader.urls/next()` 补丁加载顺序 | character id 仅证明资源身份，不冒充注册点/边界 | 确认事实 | ApplicationDomain 重名选择与推定顺序冲突时重开 owner | `npm run test:pet-animation-corpus` |
| 技能对象语义 | `Pet*.as` 创建名、`pets-index.md` 技能链 | 现代 Pet*SkillSystem/ProjectileSystem stableKey/variant | 精确时间轴与释放矩阵留给分族 task | 交叉确认 | 原技能实际复用其他对象或 body 行时更新同一 stableKey | annotations + diff check |
| 现代映射 | `AssetManifest.PetSkillEffectKeys`、各技能系统字符串 key、`TestScenePetViewBridge` | 正式五关共享 TestScene runtime | 几何 body/ear/label 与 projectile fallback 是现代占位 | 确认事实 | 后续 task 接入真 bundle 后转为 ready | 源码搜索与运行专项由实现 task承担 |

## 裁决

- 9/9 物种、35/35 实际形态、38/38 技能视觉映射均已分区，预期符号未定位数为 0。
- 本体/技能标注分别转为 9 条与 38 条 `export-ready`；没有把 projectile 占位写成真视觉。
- 运行 owner 对重复符号保留精确重开条件；配对证据 task 在选择性导出前必须确认该条件。
- 视觉/空间机器真值在本 task 不适用为“已验证产物”：193 没有读取或派生帧。每个 193A..Q 证据 task 必须生成 Schema-valid、`verified`、`unresolved=[]` 的逐动作/逐帧真值和原版基准，配对实现 task 才能 Ready。
