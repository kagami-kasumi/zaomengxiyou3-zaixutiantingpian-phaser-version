# 宠物地面环境空间真值方案

适用任务：TASK-SETTINGS-217。只处理214C3明确缺失的碰撞环境输入，不重做关卡内容或角色视觉。

1. 从任务给出的五个恢复level SWF枚举wall显示对象，保留SymbolClass、character、depth、父子链、局部矩阵与嵌套矩阵；记录源SHA。读取现有Layout对应行作为交叉对照，不能把现代值当expected。
2. 沿主包BaseObject.nearToWall与各实际墙类初始化/step核定through、throughUp、throughDown、Wall容差、站立后的状态改变。区分静态几何与动态行为；没有移动/斜坡证据时不要补造，也不能把实际非静态墙悄悄降为静态AABB。
3. 角色根优先复用已有verified ObjectBaseSprite碰撞profile并核对BaseHero/Role调用。记录现代footY到原逻辑根的公式及0.1间隙；出生/warp来源用精确AS3 locator，不重新派生角色图片。
4. 按ui-ground-truth.schema.json生成空间对象manifest；行为合同单独保存在source evidence，不滥用UI字段。五关初始wall状态必须有源渲染几何基准；实际动态墙状态由源码条件实例化有限fixture，记录与恢复源几何的关系。P1/P2仅核对owner坐标转换，不开展整场战斗旅程。
5. 独立核对源对象计数、矩阵/注册点/边界、标记继承、场景offset；对漏侧墙、错bottom、漏innerMatrix、混淆through类和脚点直当根设计负向变异。仅Schema合法不能通过。影响接入的unresolved必须归零后才能verified。
6. 向C3交付生产适配矩阵：现有环境owner/入口、可复用字段、必须扩展的窄字段、求解器适用与不适用条件、可重跑命令。不得要求Scene持有第二套宠物物理或复制每关算法。

范围/预算以217定义为准；出现超出明确五关wall或共享碰撞类的新资料族，先记录再按任务生成规则拆分，不顺带实现。
