# TASK-SETTINGS-201：宠物战斗 HUD 动态头像细粒度真值

## 范围与结论

- 原版：RegiMA 1.1，940×590，正式 `RoleInfo -> ShowPetInfo`。
- 目标：`pet1.swf` character 657；character 662 仅提供 `headmc` 的 depth 12、矩阵、黑色 Glow 与 P1/P2 父级投影。
- 状态：`pet-animation-corpus.json` 声明的 35 个实际物种/形态，全部生成 P1/P2 投影，共 70 个可见状态；另有 P1/P2 无出战与休息共 4 个负状态。
- 时间语义：只执行 `ShowPetInfo.show()` 的 `headmc.gotoAndStop(pif.getPetChinaName())`；不进入 `gotoAndPlay`。
- 真值：`truthId=task-settings-201.pet-combat-hud-head`，路径 `docs/reverse-engineering/ground-truth/manifests/task-settings-201-pet-combat-hud-head.json`，`status=verified`，`unresolved=[]`。
- 全面性：`docs/reverse-engineering/ground-truth/reports/task-settings-201-pet-combat-hud-head-completeness.json`。声明集来自 corpus + `PetInfo.transPetChinaName()`，提取集来自恢复 SWF 的 FFDec XML/SVG/PNG，不由同一份 extracted 列表复制 expected。

## 状态来源与显示列表

`PetInfo.transPetChinaName()` 把 pet key 转成中文名；`ShowPetInfo.show()` 把中文名作为 character 657 的帧标签。生成器解释 657 的 `PlaceObject2/RemoveObject2/ShowFrame` 时间线，在每个目标帧递归展开实际可见列表。35 个声明 fixture 的目标 child 全是终端 `DefineShape`，因此递归在下一层有证据地结束，不存在被静默跳过的嵌套 MovieClip、动态文本、mask 或 clip。

显示链固定为：

`GameInfo P1/P2 RoleInfo transform -> RoleInfo petHead(y=94) -> character 662 -> headmc character 657(depth=12, tx=7.8, ty=-11.3, Glow) -> 中文目标帧 -> 单个终端 shape`

character 657 的目标帧内 matrix 均由 XML 提取，并与逐帧 SVG 的 child/matrix 交叉确认。shape twip bounds 与 SVG 矢量宽高交叉确认，PNG alpha 边缘允许 1.6 px 的 Flash 细描边/抗锯齿扩张。P2 由 `GameInfo.refreshRoleInfo()` 的 `x=920` 与根水平镜像计算，不对头像另造现代坐标。

## 35 个 fixture 清单

完整 P1/P2 placement、注册偏移、local/parent/stage/visible/clip bounds、颜色/透明度、滤镜与 baseline hash 位于 manifest。下表是从独立全面性报告生成的目标帧摘要。

| pet key | 中文名 | frame | child | depth | XML local bounds |
| --- | --- | ---: | ---: | ---: | --- |
| monkey1 | 火丸 | 4 | 618 | 5 | `(2.95, 15.5, 44.75, 37.2)` |
| monkey2 | 灵猴 | 5 | 619 | 4 | `(0.45, 12.85, 46.75, 40)` |
| monkey3 | 火猿 | 6 | 620 | 4 | `(0.35, 8.1, 50.2, 45.3)` |
| monkey4 | 烈焰金刚 | 22 | 636 | 5 | `(-8.8, 3.6, 61.45, 52.25)` |
| horse1 | 雪球 | 1 | 615 | 8 | `(4.25, 17.05, 51.95, 34.8)` |
| horse2 | 雪马 | 2 | 616 | 6 | `(0, 4.45, 57.45, 51.75)` |
| horse3 | 寒野 | 3 | 617 | 3 | `(3.2, 12, 64.5, 44.9)` |
| horse4 | 极寒天马 | 23 | 637 | 7 | `(-4.1, 6.15, 88.5, 46.45)` |
| ufo1 | 小飞 | 7 | 621 | 5 | `(1.7, 6.5, 47.4, 45.7)` |
| ufo2 | 裂云 | 8 | 622 | 4 | `(8.95, 8.9, 42.15, 45.1)` |
| ufo3 | 冲霄 | 9 | 623 | 4 | `(2.25, 4.05, 47.65, 56.05)` |
| tigress1 | 虎丸 | 10 | 624 | 7 | `(0.25, 10.15, 49.4, 42.85)` |
| tigress2 | 白灵虎 | 11 | 625 | 8 | `(0.85, 7.55, 53, 45.55)` |
| tigress3 | 白虎将军 | 12 | 626 | 9 | `(0, 8.4, 53.55, 45.15)` |
| tigress4 | 白虎战神 | 24 | 638 | 8 | `(-3.85, 5.7, 59.3, 51.95)` |
| turtle1 | 龟布 | 13 | 627 | 3 | `(6.55, 11.9, 46.45, 40.75)` |
| turtle2 | 墨玄龟 | 14 | 628 | 4 | `(1.75, 9.65, 50.5, 43.05)` |
| turtle3 | 玄武将军 | 15 | 629 | 5 | `(-2.25, -1, 59.05, 55.55)` |
| turtle4 | 玄武大帝 | 25 | 639 | 9 | `(-10.15, 6.1, 63.35, 52.65)` |
| phoenix1 | 雀蛋 | 16 | 630 | 2 | `(2.7, 9.65, 50.4, 43.55)` |
| phoenix2 | 炎皇雀 | 17 | 631 | 7 | `(2.8, 8.6, 58.35, 56.35)` |
| phoenix3 | 朱雀将军 | 18 | 632 | 6 | `(-4.1, 8.55, 68.3, 66.8)` |
| phoenix4 | 朱雀女皇 | 26 | 640 | 6 | `(-4.1, 6.45, 57.45, 66.4)` |
| dragon1 | 龙仔 | 19 | 633 | 6 | `(2.7, 11.6, 50.85, 46.95)` |
| dragon2 | 绿英龙 | 20 | 634 | 5 | `(2.9, 12.15, 53.15, 51.8)` |
| dragon3 | 青龙将军 | 21 | 635 | 8 | `(-0.5, -2.6, 53.6, 74.6)` |
| dragon4 | 青龙妖圣 | 27 | 641 | 9 | `(-3.3, -6.45, 61.8, 63.25)` |
| rabbit1 | 月兔 | 28 | 642 | 6 | `(8.8, 14.35, 42.2, 42.5)` |
| rabbit2 | 疾风兔 | 29 | 643 | 5 | `(6, 10.9, 49.1, 47.55)` |
| rabbit3 | 寒冰玉兔 | 30 | 644 | 8 | `(5, 11.05, 54.8, 59.8)` |
| rabbit4 | 冰霜月神 | 31 | 645 | 11 | `(0.4, 6.3, 55.2, 58.75)` |
| mouse1 | 子鼠元帅 | 34 | 648 | 7 | `(-2.5, 9.25, 56.25, 47.6)` |
| mouse2 | 子鼠元帅 | 34 | 648 | 7 | `(-2.5, 9.25, 56.25, 47.6)` |
| mouse3 | 子鼠元帅 | 34 | 648 | 7 | `(-2.5, 9.25, 56.25, 47.6)` |
| mouse4 | 子鼠大元帅 | 35 | 649 | 8 | `(-19.3, 4.6, 72.8, 58.3)` |

mouse1/2/3 共享中文名“子鼠元帅”，因此原版确定性地选择同一个 frame 34 / character 648；这不是缺失 fixture。其余声明 fixture 均是一对一中文帧标签。

## 灵猴反证与视觉基准

灵猴 `monkey2` 必须解析为 frame 5、character 619、depth 4。其 XML local bounds 为 `46.75×40`；P1 stage bounds 为 `(8.25, 95.55, 46.75, 40)`，P2 镜像后为 `(865, 95.55, 46.75, 40)`。旧 191 的 `104.8×93.6` 是 character 657 全时间轴联合画布，不是灵猴单帧头像。

差异叠图：`docs/tasks/evidence/TASK-SETTINGS-201/monkey2-character-619-vs-657-union.svg`。逐 fixture 原版 baseline 位于 `docs/tasks/evidence/TASK-SETTINGS-201/head/`；每条 baseline 在 manifest 中绑定 pet key、中文名、target frame、crop 与 SHA-256，不复用未注入状态的 662 静态壳体。

## 对 191/192B 的有界裁决

- 保留：`task-settings-191.pet-combat-hud` 的 character 605 壳体、610/614 各 25 帧条、659/660/661 文本和 character 662 父级投影事实。
- 取代：191 的 `pet-combat-hud-root.headmc` 中 `104.8×93.6` character 657 联合 bounds。旧 manifest 已通过机器字段 `supersededBy.truthId=task-settings-201.pet-combat-hud-head` 标出替代关系。
- 否定：192B 以宠物身体 atlas 代替目标帧 child 并拉伸到联合 bounds 的头像投影。身体 atlas 属于战斗实体动作语料，不是 `ShowPetInfo.headmc.gotoAndStop()` 的显示 child。
- 不外推：本裁决不批量降级其他 verified manifest，也不改现代 `src/`；正式 HUD 修复只属于 `TASK-SLICE-202`。

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| pet key → 中文目标帧 | `PetInfo.transPetChinaName()` | `ShowPetInfo.show()` 调用 `gotoAndStop(getPetChinaName())` | 657 的 42 个 `FrameLabelTag`；35 fixture 在报告中逐项对账 | 交叉确认 | corpus 增删物种或 AS3 映射变化会令生成检查失败 | generator `--check` + expected/extracted 报告 |
| 目标帧递归 child | 657 的 `PlaceObject/RemoveObject/ShowFrame` | character 662 的 `headmc` 实例指向 657 | 每 fixture 一个终端 DefineShape，记录 child/depth/matrix/bounds | 交叉确认 | 目标 child 缺失、变成不支持的嵌套类型即阻止 verified | self-test 删除 child/篡改 frame 必失败 |
| P1/P2 投影 | `RoleInfo.addPetHead()` 的 `y=94` | `GameInfo.refreshRoleInfo()` 的 P2 `x=920` + 根镜像 | XML `headmc tx=7.8,ty=-11.3` 与 662 SVG 一致；70 个 stage placements | 交叉确认 | 父级矩阵变化或 P2 不再镜像会令 XML/SVG/AS3 对账失败 | self-test 篡改关键 matrix 必失败 |
| 注册与可见边界 | target DefineShape `shapeBounds` | 不适用：静态 `gotoAndStop` 无运行更新 | XML twip bounds、SVG child/size、PNG alpha edge 三源对账；manifest 保留 local/parent/stage/visible/clip | 交叉确认 | PNG alpha 超出 1.6 px 抗锯齿容差即失败 | 35 baseline hash/crop + Schema |
| mask/filter/裁切 | 662 `headmc` 的 `GLOWFILTER` | RoleInfo/GameInfo 父级显示链 | Glow `blur=5,strength=3.546875,passes=1`；无 mask，舞台 clip 940×590，alpha/color transform 显式记录 | 确认事实 | 新 mask、filter、color transform 或未知 SWF tag 必须进入 unresolved | XML/SVG filter 对照 + manifest Schema |
| 无出战/休息 | `RoleInfo.removePetHead()` | 宠物切换事件触发 `addPetHead/removePetHead` | character 662/657 子树不可见，P1/P2 各两状态 | 确认事实 | 若原版改为保留空头像则负状态基准失效 | 4 个 0-visible-object 状态 |
| 现代映射 | 本 task 不适用 | 后续 202 直接消费新 truth | 禁止身体 atlas/联合 bounds 回填 | 现代设计选择 | 202 尚未执行，不能宣称正式画面已修复 | 202 变异测试与正式 940×590 差异 |

## 验收记录

- 生成器：`tools/generate-pet-combat-hud-head-ground-truth.mjs`。
- 稳定性：生成后执行 `--check` 字节级对账；再次生成产物稳定。
- 变异：缺失 target child、错误 frame、关键 head matrix 三类自测均必须被拒绝。
- Schema：兼容扩展仅新增 placement 的 `parentBounds/visibleBounds/clipBounds/alpha/colorTransform` 和 display object 的 `supersededBy`；旧 manifest 继续合法。
- 未解项：无。完整 Flash 虚拟机、`gotoAndPlay`、现代 HUD 修改与其他 manifest 审计均不在本 task。
