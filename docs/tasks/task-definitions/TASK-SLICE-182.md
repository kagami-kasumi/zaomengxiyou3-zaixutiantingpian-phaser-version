# TASK-SLICE-182

任务类型：
- `TASK-SLICE`
功能条线：
- `LINE-CORE-PROGRESSION-COMPLETION`（Active；Planned）
目标机制/切片：
- `M-016`、`M-035`、`M-052`、`VS-060`
规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2
拆分触发：
- 若需同时整改宠物/法宝/技能/背包的页内显示列表，立即拆回各页实现 task，本任务只持有宿主边界。
协作计划：
- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无
输入资料：
- `task-settings-175c.stage-feature-host` verified manifest、`TASK-SETTINGS-175C-stage-feature-host.md`、`stage-feature-entry-index.md`。
输出产物：
- 战斗态单页宿主直出/返回合同、地图态共享 chrome 删除、原门禁/暂停/owner/Escape 回归与逐状态视觉证据。
UI 原生化合同：
- 显示列表清单：直接消费 175C 的 574/371/444 对象、按钮帧、命中区和负向 host 状态。
- 原版机器真值 JSON：不复制坐标；实现或可重复投影必须以 `task-settings-175c-stage-feature-host.json` 为唯一原版源。
- 原版视觉基准：使用 175C 的 42 张 940×590 scoped 基准，不用现代页面回推原版。
- 允许的现代视觉例外：全局设置跨应用重启和非可见键盘可访问性；其余为空。
- 必须删除：暗层、金色边框、“正式功能页面主机”/Arial 标题、通用跨页按钮、workshop 宿主页和通用关闭。
- 逐状态验收：P1/P2 五 pointer、特殊关卡/死亡/未装备法宝/宠物不拦截、单页互斥、同键关闭、Escape 只切设置、371/444 返回路由。
- 差异证据：保留原版/现代同尺寸并排/叠图、逐对象清单和地图态零 chrome 负向回测。
组件化合同：
- 组件家族：不新建通用可见组件；只复用既有入口 router、单页 session 与关闭生命周期接缝。
- 权威 owner：router/session 持有输入、暂停和返回生命周期；各页 system 继续持有业务，页面 composition 持有原 Symbol/几何。
- 共享行为：键盘/pointer 入口、单页互斥、暂停/恢复、返回路由和 listener 销毁；不共享现代皮肤。
- 页面保留项：574/371/444 与各外部页根的原按钮帧、矩阵、命中区、字段、流程和 owner 非对称性。
- 消费者迁移矩阵：本 task 只处理共享 host 和现有五个战斗入口；各页内显示列表保留给 180/181 及 175D..I 后续生成的单页 task。
- 防复发门禁：禁止新的 `GenericButton/GenericPanel`、页面私有路由/关闭 owner、从整页截图裁按钮，以及用共享行为接缝覆盖页面原几何。
完成定义：
- 宿主不再创建原版不存在的可见 chrome；各页根和 owner 由原入口直出，不改页内业务。
验收标准：
- 真值直接消费/投影检查、宿主行为专项、五关共享 owner、940×590 并排/叠图、零 console、structure/build/workflow/problem audit/diff check 通过。
禁止范围：
- 不在本任务重做宠物 932、法宝 596、技能 250/868/417/213 或背包 304 页内视图。
- 不保留无用户批准的可见便利层。
状态更新：
- 175A..I 真值批次完成后，与 180/181 及后续逐页实现任务统一排序；不抢占当前 175D Ready。
推荐后续任务：
- 依 175A..I 完整批次的实现排序继续。
