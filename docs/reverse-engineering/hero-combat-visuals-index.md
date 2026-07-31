# 五角色战斗视觉索引

本文是 `TASK-SETTINGS-069` 在规模门禁触发后留下的共享证据合同。它只冻结五个逐角色调查必须填写的字段、显示列表门禁和资源族边界；不把包名相似、现有占位行为或逻辑测试当作真动画完成证据。

## 拆分结论

恢复语料库中的角色视觉不是一个可机械枚举的单目录族：

| 角色 | 已存在的候选恢复包 | 本轮能确认的范围 | 必须由子任务继续确认 |
| --- | --- | --- | --- |
| Role1 悟空 | `assets/WuKong.swf`、`assets/Role1Effect.swf`、`assets/SpecialUI/WuKong.swf` | 三个独立包均存在；Role1 普攻已有部分现代接入 | 每个本体/装备/技能/附属对象的 Symbol、时间轴和包 owner |
| Role2 唐僧 | `assets/TangSeng.swf`、`assets/TangSeng1.swf`、`assets/SpecialUI/TangSeng.swf` | 三个独立包均存在 | 两个本体候选包的职责、Shadow 与全部技能对象归属 |
| Role3 八戒 | `assets/BaJie.swf`、`assets/SpecialUI/BaJie.swf` | 两个独立包均存在 | 本体、装备、盾/拉拽/追踪对象与 UI 的符号边界 |
| Role4 沙僧 | `assets/ShaShen.swf`、`assets/SpecialUI/ShaShen.swf` | 两个独立包均存在 | 铲/弓双形态、装备层、攻击对象与 UI 的符号边界 |
| Role5 白龙 | `assets/bailong.swf`、`assets/bailongSword.swf` | 枪/剑候选包分离存在 | 双形态本体、武器层、技能附属对象与战斗 UI 来源 |

以上仅是 `确认事实` 级的包存在性清单，不是 Symbol 映射。由于角色至少跨本体、特效、SpecialUI、武器四种包形态，命中 `TASK-SETTINGS-069` 的拆分触发：父任务保持 `Split`，调查固定拆为 `069A..E`，实现父任务固定拆为 `158A..E`。

## 待证明的可观察问题

每个 `069A..E` 都必须逐项回答，不能以“行为已实现”跳过：

1. 本体 `idle/walk/run/jump/attack/hit/death` 的实际 Symbol、帧序、hold tick、循环和结束状态是什么？
2. 衣装、武器、影分身或形态层如何与本体组成；父子 depth、局部矩阵、遮罩、滤镜和朝向规则是什么？
3. 每段普攻和每个已实现主动技能创建哪些附属对象；何时创建、命中、循环、隐藏、消散或自移除？
4. 可见动画帧、AS3 触发计数和现代伤害窗口如何对应；哪些对象纯视觉，哪些参与命中？
5. 角色上 UI、头顶动态状态、HUD 头像/HP/MP/经验/五技能槽分别来自哪个显示对象，P1/P2 如何镜像或切换 owner？
6. 单人五角色及至少一个合法双人组合需要哪些原版基准帧；哪些差异仍无法由 SWF 渲染或运行证据消除？

## 逐动作与逐对象矩阵模板

子任务必须为本体动作、普攻对象、技能对象、分身/附属对象分别建立一行；一个 stable key 对应多个 Symbol 时必须解释组合关系。

| 字段 | 必填内容 |
| --- | --- |
| 角色/形态 | `Role1..5`，并记录衣装、武器、枪/剑、铲/弓等适用形态 |
| 行为与 AS3 入口 | 动作名/技能代号、创建函数、精确文件与行号 |
| source package / Symbol | 恢复 SWF 相对路径、SymbolClass/MovieClip、character id；未知不得猜 |
| timeline | 总帧、独立视觉帧、hold/循环、关键触发 tick、结束/销毁条件 |
| display geometry | 注册点、可见 bounds、嵌套矩阵、local/world/screen 坐标和现代 origin 映射 |
| direction | 原始朝向、水平镜像轴、附属对象相对偏移 |
| combat relation | 伤害窗口、命中对象、纯视觉/玩法对象归属和生命周期 owner |
| modern status | 未接、占位、部分真资源、已接；行为与视觉分列 |
| evidence grade | `确认事实/交叉确认/推断/未知/现代设计选择` 与反证条件 |
| validation | 确定性时间轴/资源测试与 940×590 逐状态基准 |

## UI 显示列表模板

逐角色文档必须记录根 Symbol/character id、舞台尺寸及以下 child 清单：

| 区域 | 必查 child 与状态 |
| --- | --- |
| 角色本体动态层 | 身体、衣装、武器、影分身/形态层的 parent、depth、矩阵、mask/filter/alpha |
| 头顶状态 | 玩家标记、血/蓝或 buff 图标、文字字段、创建与移除调用链 |
| HUD 固定层 | 头像、HP/MP/经验/等级、五技能槽、键位字形、冷却/禁用/选中动态层 |
| 输入与命中区 | HUD pointer/button 的 up/over/down/hit、P1/P2 owner 与镜像 |

原版基准必须来自恢复 SWF 渲染、可追溯 Flash 运行态或用户提供画面，记录 940×590 入口、角色/队伍、动作与裁切。现代截图不能反向充当原版基准。允许的现代可见例外当前为空。

## 六段证据与关闭门禁

| 证据段 | 子任务最低交付 |
| --- | --- |
| 局部证据 | 对应 `Role*.as`、Shadow/附属对象类及现代消费者的精确引用 |
| 共享调用链 | `BaseRoleProperies/User/输入/技能槽/伤害/Projectile/HUD` 的实际消费路径 |
| SWF 几何 | 恢复包 Symbol、时间轴、嵌套矩阵、注册点、bounds 与朝向 |
| 可观察合同 | 起手、持续、命中、结束、朝向、P1/P2、HUD 更新及未知项 |
| 现代映射 | stable key、bundle/atlas owner、animation/view bridge；原版类结构不决定现代架构 |
| 双重验证 | 确定性资源/时序测试计划 + 940×590 原版/现代逐状态并排或叠图计划 |

逐角色子任务只有在影响实现的 `未知` 为零、现有标注行已原位更新、实现子任务合同可独立验收时才能归档。五个角色证据与 `158A..E` 实现全部完成前，`VS-062` 继续保持待机制，M-034/M-047 继续保持部分复现。

