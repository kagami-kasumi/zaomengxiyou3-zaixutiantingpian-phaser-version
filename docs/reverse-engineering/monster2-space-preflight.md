# Monster2 空间与聚拢输入预检

2026-10-04，`TASK-SETTINGS-257`。结论：命中父合同的公共英雄坐标机制拆分条件，257改为 `Split`，257A唯一 `Ready`，257B `Planned`。本次没有完成三对象空间真值、实际命中或聚拢轨迹，不创建或晋升 `monster2-attack-space.json`，不修改 `src/`、`public/`、256真值或原语料。

## 证据与拆分理由

AS3根为 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。源文件、提取方法、原ABC及支架哈希见本地 `docs/tasks/evidence/TASK-SETTINGS-257/coordinate-preflight.json`；目标源哈希与构造复核见同目录 `profile-preflight.json`。

| 六段证据 | 本次证据与等级 | 边界和后续 |
| --- | --- | --- |
| 局部入口 | `export/monster/Monster2.as:267` 原 `doHi2` 创建裸MC，再 `TweenMax.to(hero,1,{x:source.x,y:source.y-50})`。确认事实；原方法原文进入试验，仅把private改为public | 裸MC在试验中为空MovieClip服务，不据此宣称原显示或EXIT已复验；256原结论保持 |
| 共享调用 | `base/BaseHero.as:1941` 原 `move` 直接写同一 `x/y`；`step:1679`另有舞台边界修正。`com/greensock/TweenLite.as:139/211`独立ENTER_FRAME与getTimer根时间线，`my/MainGame.as:820/826`负责世界调度。确认事实 | 实际注册顺序、自然时钟、移动/墙体/屏幕修正与Tween组合尚未证明；不是把已有单一坐标轨迹接到显示对象即可 |
| 几何与坐标 | `assets/1.swf`三对象identity沿用256，未进行逐帧空间采样；241实际colipse的40构造/4profile及StageCommon哈希重新检查通过。构造来源确认 | 两普攻仍需自己的原HitTest oracle；241/248攻击场与碰撞残差许可完全不转移 |
| 可观察合同 | 原包Tween ABC与原英雄move组合：20/24/30时间分档、P1/P2、仅Tween/先move后Tween/先Tween后move，共18组462态。148对非初始态均因顺序产生差异；末点仅Tween为(400,250)，先Tween后move为P1(405,252)、P2(395,252)。交叉确认的是受控顺序敏感性 | 不证明哪种顺序是原版世界顺序，不把受控renderTime称为真实host时钟或正式轨迹；不得生成无阻塞实现任务 |
| 现代映射 | 256列出的Stage12/Stage1Combat/HeroParty位置消费者仍待实际输入闭合 | 本次未改生产位置owner；未来实现必须先消费257A/B以及任何真实HP补证，不能凭现代activeAttack或默认ease猜补 |
| 双重验证 | AIR 51.1.1.5执行原包ABC，SDK51.3.4编译/启动；两次462态完全一致，抹平更新顺序的报告负例被拒绝 | 该负例是数据损坏检查，不是编译源变异；未做现代浏览器或完整原游戏人工验收，不能宣称复现完成 |

该公共坐标缺口由原源与实际运行反例共同支持，不以状态数、命令数或上下文量作为拆分理由。原库可直接执行，**没有**触发“原库不能执行而需重建”分支。复用230的保留原DoABC标签方法；不反编译修复库，不手写ease。

## 支架约束与独立复核

`tools/monster2-space-preflight/run.py`逐字提取 `BaseHero.move`、`Monster2.doHi2` 方法体，保留 `1_MainLoad__main1.swf` 原ABC，生成物只写本task本地目录。fixture固定无海水、无buff/墙体、重力0、移动门允许，速度P1=(5,2)/P2=(-5,2)，源=(400,300)，英雄初始P1=(100,300)/P2=(700,300)。`renderTime`固定采样并同时暂停自然Tween，故结果是竞争写入见证，而非实际ENTER_FRAME调度复刻。

Luna只读核对256未知、241/248目标输入及MainGame/Tween共享调用；主agent检查源方法并实际运行两份预检。归并采纳“构造可复用、攻击必须重测”和公共坐标拆分结论；没有把旧碰撞case数或子agent静态判断作为Monster2空间完成证据。`profiles.py`重新解析继承构造并核对40类型、公共源和StageCommon哈希，不覆写241/248。

## 完整合同去向

- `TASK-SETTINGS-257A`：三对象14/20/14帧、双向递归显示/屏外完整性、实际两普攻目标profile像素、256真实相位与生命周期映射。输出父约定的 `monster2-attack-space-contract.md` 和 `monster2-attack-space.json`，范围仅空间/显示/命中；不能以A完成覆盖Tween。
- `TASK-SETTINGS-257B`：独立代码补证，原库默认ease/量化与真实英雄坐标调度、暂停恢复、重复聚拢、移动/死亡、源销毁和Scene退出。输出纯行为sidecar与合同，引用A的几何而不重建一份空间表。完成B时联合核销父257；若实际HP或其他必要输入未闭合，生成同线补证而非实现。
- 256的M2-01..09及真实HP未知保持；裸MC暂停继续/EXIT、自身无伤害producer的合同不能丢弃。父257、204/all/194/VS-067和整线均未完成，当前功能线仍Active。

## 复验与保存

```text
python tools/monster2-space-preflight/run.py
python tools/monster2-space-preflight/profiles.py
```

本次两命令通过。`npm run check:structure`：0 errors、8既有warning，目标新增工具不涉及警告文件。最终workflow/audit结果见本地 `docs/tasks/evidence/TASK-SETTINGS-257/project-checks.json`。没有生成视觉manifest，所以当前不适用新的真值Schema检查；A必须执行其空间Schema验证。编辑器Python LSP缺少basedpyright，未安装依赖；Python实际执行和AIR编译/运行作为本批工具检查。

原生源码副本、SWF和两次日志保存在 `local-resources/regima/task-outputs/TASK-SETTINGS-257/preflight/`；两份精简结果保存在上述evidence目录。它们用于257B回查坐标反例，保留到父257及正式消费后再评估；不承诺仅拉取Git即可原生复验。Git交付工具与本合同/调度文档，游戏运行不依赖这些ignored文件。无批量图像或无消费者中间产物，本次未删除历史证据。
