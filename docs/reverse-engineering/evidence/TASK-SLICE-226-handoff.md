# TASK-SLICE-226 交接

状态：本项专属整改与补验通过，TASK-SLICE-226归档；TASK-SETTINGS-230为下一唯一Ready，公共责任保留。原84合同见[承接矩阵](TASK-SLICE-226-contract-coverage.md)，详细原版证据、失败反例和逐批结果见[进度](TASK-SLICE-226-progress.md)。

## 本项整改

- 公共Session统一完整host帧、连续timeCount、AI→CD/计数、身体回调和私有效果调度；原20/24/30fps、render分片、暂停/恢复和死亡保留行为进入实际消费者。
- 猴马四形态使用原资格、目标顺序、动作门禁、普通攻击两次条件随机、受击反击与地面运动；原spawn右朝向、640跟随/1000传送、collider和Sprite坐标赋值被正式消费。
- 普攻、常规技能与两族奥义改走恢复源真实碰撞/伤害cache/attackID、目标冰火及清理；猴四五步链与插入QLFJ、马四三目标/引用/延迟爆炸有实际HP结算。
- 原帧/注册点和自然显示时钟进入既有共享view；普通暂停、恢复、退休父、死亡/换宠/P1P2保留原生命周期。嵌套页面资源URL修复，避免HTTP200 HTML被当作PNG。

## 验收边界

本项使用实际Session/Behavior/private owner/正式damage port/party closure，以及原生AIR和恢复SWF真值。受控目标/墙/候选表不冒充完整原版Scene；五关/测试场景目标投影验证给定创建流保序，不重新证明整关生成时机。原生被动、伤害或网络sink仅在所声明的探针边界使用，不能代表完整功能。源码变异必须被实际断言拒绝，最终门禁退出非0不准完成。

公共230..235仍未修复：怪物击退消费、死亡奖励归属、怪物身体/攻击/目标效果顺序、Canvas取整、即时捕获ID、被动回复/自动增益。它们是用户允许独立列入任务的跨系统交付，原合同继续带责任；本项完成不等于猴马完整家族、pet all、TASK-ARCH-204、194或VS-067完成。下一项为同线230，先补原共享击退合同，再生成最小正式消费实现。

## 可交付与复验

本次运行投影放在src/assets与public/assets/pets/monkey-horse（197文件、约7MB），未修改原legacy-extraction。既有项目运行所需的精确白名单JSON继续保留；新增运行路径不读被忽略的原始采集/截图/trace。拉取代码、安装npm依赖后可构建运行；源级复验仍需要本地restored-swfs、AS3和已安装AIR，不承诺仅拉取即可复做全部源采集。

普通检查入口为npm run build、node tools/run-system-tests.mjs、npm run check:workflow、npm run audit:problems；关联设计保持实施中/未退出，本项完整扩大门禁为npm run check:system-design -- pet P1R P1H P1G P1T。机器内存受限时可为测试进程临时设置NODE_OPTIONS=--max-old-space-size=8192，完成后恢复；上次4GB堆OOM是失败结果，不能复用为通过。

完整扩大门禁P1R/P1H/P1G/P1T退出0；新增144个正式目标投影用例后的最终P1R/P1H退出0。build退出0，默认全系统清单按通过前缀与修正夹具后的余项全部覆盖，结构检查0错误/8项既有警告。归档后的工作流、问题审计、harness及差异检查均退出0；工作流保留既有PlayerSlot命名警告。命令终态记录于本地docs/tasks/evidence/TASK-SLICE-226/final-checks.json。失败日志仍保留，不用上次OOM或被修正夹具的失败记录冒充通过。
