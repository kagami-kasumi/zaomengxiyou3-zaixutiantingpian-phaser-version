# 公共宠物回复与六增益数值验收

242B消费235的720例和243的997例，共1717个独立原生输入；不重写原expected。数值实现由`PetPassiveSession`持有，只附着在已迁移猴、马、青龙、玄龟的EntitySession。四项主人效果进入242A既有Stage1CombatPlayer owner，仍由同一个slot host先推进主人、再推进宠物。

## 实现合同

- 回复使用fps+1周期及上轮缓存；HP只在存活时回复，MP始终夹上限。六计数初值300；按固定顺序独立检查，足够MP可同帧全部释放。冷却4320/5400，时长先uint再乘实际host fps。
- stun只冻结AI内检查，hurt不冻结；暂停无host tick。私有青龙分身只保留原有回复，不检查六增益。死亡沿家族原stepsWhileDying推进，真实释放后停止。
- sxkb/fsnl由实际session context供给伤害消费者；旧PetState fallback仅用于未迁移/独立旧fixture，正式context即使零加值也不读取旧状态。同名刷新保留value，零时长仍扣MP与重置计数。
- 休息/替换销毁宠物效果与计数；已进入主人owner的效果继续到期。新会话从300开始，主人死亡/关卡退出沿原清理入口。没有新增保存字段、独立定时器或逐关算法。

## 分层证据

| 范围 | 入口与边界 |
| --- | --- |
| 原生数值 | `tools/pet-passive-tests.ts`：生产PetPassiveSession/HeroPetBuffSystem逐行消费720+997。整数/状态精确比较；AIR JSON浮点序列化与JS计算差异仅对effect.value允许相对1e-12，不放宽计数或int结果 |
| 真实会话 | `tools/pet-passive-runtime-tests.ts`：猴马×四形态×三fps，双owner默认300、119/120MP、stun/hurt、暂停、休息/再出战、死亡释放、主人到期。当前save producer→serialize→parse→restore再建真实Runtime，逐宠排除临时字段并验证300/空效果。1717例不是全部正式party trace |
| 技能消费 | `tools/pet-passive-consumer-tests.ts`：四已迁移家族×P1/P2真实300tick；猴马各双owner真实技能选择、身体回调、弹体缓存与独立AIR位置的原生碰撞，验证加值/暴击、实际命中及来源。目标位置受控，不宣称原版关卡刷怪复验 |
| 反证 | `tools/pet-passive-mutation-tests.ts`：14个内存生产变体覆盖时序、重复系数、固定fps、立即触发、首项return、刷新换值、输入上限、零时长、接线、stun/hurt、owner、清理、学习门禁 |
| 正式Scene | `node tools/pet-passive-browser/run.mjs`：五入口双owner，实际生产Game scene配受控host clock（停止RAF后调用Game.step）及940×590 Canvas，before/active/expired状态、既有HUD文本、暂停、休息、真实结果按钮重试/返回和旧显示对象释放。运行时注入仅暴露既有party；使用devParty QA入口，不以localStorage空值冒充真实保存 |

本地报告、截图在`docs/tasks/evidence/TASK-SLICE-242B/`；复验原生来源依赖本地语料，运行游戏不依赖这些证据。完整门禁回归青龙/玄龟与原猴马84责任；本批只核销公共数值/会话，不核销六特效显示或全部家族。

## 视觉与差异

本批不新增可见对象。宠物HUD继续消费191壳体/血蓝条与201头像verified真值及既有投影；显示列表仍为shell、hpBar、mpBar、head、levelText、mpText、hpText。布局和原生资源未改。数值变化由生产snapshot与实际可见文本逐状态核对，截图只作为正式消费证据，不是新原版整场景基准。

原基准分别见`ground-truth/manifests/task-settings-191-pet-combat-hud.json`与`task-settings-201-pet-combat-hud-head.json`所指资源。保持已有文本/抗锯齿与投影例外；不声称全画面像素一致。六增益自身图形在本批仍缺，必须由同线后续视觉真值任务补齐，不用现代占位替换。

## 验证中发现并修正

两个旧奥义fixture把MP设1000却保留150上限，公共回复正确夹上限后破坏旧扣蓝断言；现令maxMp=1000、level=0，匹配原body probe排除公共回复的范围，保持扣蓝、原生身体/碰撞/伤害断言。浏览器首次在Game renderer就绪前步进，后在技能资源加载中切场景；现等待renderer及真实loader完成，不屏蔽异常，不修改生产加载生命周期。

浏览器初稿新roster沿用默认宠物ID，TestScene的P2复用了旧会话，导致before时P2已触发；改用唯一fixture身份并断言双方before计数均为1、主人均无效果，保留真实300起点。受控英雄输入同步现有MP镜像，避免before HUD使用旧默认上限；这是fixture修正，未改生产HUD。既有QA/场景说明文字可能与HUD邻近或重叠，未将其当原版视觉，也未修改布局。

最终命令与终态见本地handoff及任务历史；硬gate未通过前不得以局部绿色关闭任务。

完整联合runner一次性import大量bundle，首次完整运行在玄龟11,572态浏览器通过后触及Node默认约4GB堆上限，门禁退出1；该次不计通过。在确认机器可用内存后，复验仅对命令进程设置`NODE_OPTIONS=--max-old-space-size=8192`，不删除检查、不更改游戏或门禁逻辑。最终以重跑终态为准。
