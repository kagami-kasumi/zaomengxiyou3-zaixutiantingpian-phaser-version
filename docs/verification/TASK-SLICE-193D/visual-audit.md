# TASK-SLICE-193D 视觉验收

## 范围与基准

- 原版机器真值：`task-settings-193c.pet-horse-animation`，716 states / 20 display objects / 716 baselines，`unresolved=[]`。
- 原版基准来源：`local-resources/regima/task-outputs/task-settings-193c-pet-horse-animation/` 中由恢复 SWF 选择性导出的 atlas、MovieClip frame 与 nested subframe；现代截图不作为原版事实来源。
- 现代运行基准：940×590、正式双人存档 4、地图进入 Stage 1-1；P1/P2 当前均为 horse1。
- 对照图：`original-modern-horse1-p1-p2-comparison.png`；完整现代截图：`modern-stage11-p1-p2-horse1-940x590.png`。

## 显示列表与现代映射

| 可见对象族 | 原版对象 | 现代唯一映射 | 状态 |
| --- | --- | --- | --- |
| P1/P2 本体 | `PetHorseBmd1..4` | `PetHorseAnimationView` 直接消费真值行、cell、hold、注册点 | 已接入 |
| 普攻对象 | `PetHorse1Bullet1`、`PetHorse2Bullet1`、`PetHorse3Bullet1` | `combat-common` 注册真序列；当前现代宠物 AI 无通用普攻触发入口 | 已注册，触发不在本 task |
| `sp/bd/bz` | `PetHorse1Bullet2`、`PetHorse2Bullet2`、`PetHorse3Bullet2/3/4` | `TestScenePetProjectileVisualBridge` 按 stable key 消费真序列 | 已接入 |
| `tmaoyi` | `PetHorseBmd4` row 8、`PetHorse4Bullet5` nested 8 subframes、30 帧爆炸 | 本体 action + falling/explode 两对象；门禁仍由既有 Projectile/Pet owner 持有 | 已接入 |
| 共享冰效 | StageCommon character 40 `PetHorseIceEffect` | 只读投影既有 `magicSnowIce`，60×80 fixture、同对象去重、状态清除即销毁 | 已接入 |

## 逐状态差异

| 状态 | 自动证据 | 940×590 观察 | 差异/例外 |
| --- | --- | --- | --- |
| wait / follow / walk | 四形态动作行、逐格 hold、20/24/30 host clock 专项通过 | P1/P2 horse1 真本体在正式 Stage 1-1 同时可见 | 无现代可见替代层 |
| hurt / dead | HP 转移和非循环结束回归覆盖 | 本次正式运行未人为杀死宠物 | 无批准例外；由确定性专项承载 |
| `sp/bd/bz` | stable key→原对象、帧数、注册点、bundle owner 专项通过 | 当前存档只提供 horse1，运行观察覆盖本体与正式双 owner | 其他形态由专项承载，不伪称本次截图覆盖 |
| `tmaoyi` | body hit5、8 subframes、30-frame explode、既有组合门禁专项通过 | 当前存档未提供 horse4 | 无现代面板/几何/文字替代 |
| 共享冰效 | character 40 asset、60×80 投影和状态清除接缝专项通过 | 当前运行未稳定捕获命中时刻 | 无第二状态 owner |

## 结论

- 正式 P1/P2 马系本体不再进入几何 placeholder；五关均经 `createHeroPartyRuntime` 使用同一正式 horse bridge。
- `combat-common` 是四本体与 185 帧对象的唯一 bundle owner。
- 玩法伤害、冷却、AI、P1/P2 roster、当前存档 schema 均未修改。
- 浏览器 console warning/error 为 0。未批准任何现代可见例外。
