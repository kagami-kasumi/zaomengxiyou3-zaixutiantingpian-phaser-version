# TASK-SLICE-214C3 公共地面移动交接

日期：2026-09-05。结论：本批公共移动接入通过；青龙真实战斗、可见投影与完整家族尚未完成。下一项214C4；父214C2/214C保持Split，214C5承担正式可见与全量P1GC。

## 实现与来源

| 六段证据 | 本批落点 |
| --- | --- |
| 局部源码 | 213/214A青龙碰撞与倒计时；PetDragon1 normal/fs只wait、hurt static完成条件 |
| 共享调用 | 217恢复BasePet AI:305-395、follow:1009-1044、jump:1133-1143；BaseObject step:165-181、碰撞/积分:535-610、落地:922-936、static:1088-1092 |
| 资源空间 | 217 verified 43墙/134对象、完整bounds/源顺序/独立类和marker属性；角色根公式与导出精度分列，未改原始提取物 |
| 冻结条件 | 新search帧仍followSource；失效只清目标；640/1000/1200边界；方向0保留vx、hurt跳过整个setSpeed；动画完成→物理同tick；jump/drop及落地动作 |
| 现代owner | 唯一PetCombatRuntime下的EntitySession持有PetGroundSessionMovement；Behavior只提供形状/动作差异。关卡仅传PetGroundEnvironment，P1/P2各自runtime，无Scene物理或第二活动owner |
| 双重验证 | 主/subagent独立源复核；生产Runtime/Session trace、从正式桥原文提取并仅擦除TS的updatePets闭包动态P1/P2测试；217 binary/SVG/source独立复验及7类变异。不是Flash运行截图或正式视觉验收 |

只读复核找到的实际差异已修：followSource与随机static分支中的`gc.sendPetAction('wait')`不是本地切动画。直接调用目标`Config.as:559-568`仅发送网络消息，故本地仅static，动画等待自身完成/落地。新增近owner normal/fs/hurt回归可阻止提前取消；原preflight中“static+wait”简写以本交接精化为准。

## 消费接缝

- `PetBehavior.groundMovement()`返回碰撞、gravity、jumpPower、attackRate及攻击/地面禁止移动动作列表；必须同时提供活动动画时钟。只提供事实，不复制AI、CD或碰撞算法。
- `PetCombatFrame.groundEnvironment`由五关正式/TestScene入口提供。`PetGroundEnvironmentAssets`只从217唯一几何manifest与属性表读取墙；保留源碰撞顺序。Stage11只加现有世界偏移2370一次，不加SVG裁切偏移。范围限已验证static/轴对齐墙，未支持移动墙、斜坡、额外外力。
- owner外部输入仍是现代hero脚点，Session只为ground能力用217 `existingProfileGroundRootOffsetY=-50.075`映射一次。其区别于未舍入仿射落地根和现代视觉registration，不声称三者相等。出生root y−100，warp root y−30；私有实体显式位置不再叠出生偏移。
- Session顺序：伤害/旧事件→sticky AI与动作→effects/子会话/CD→计数→warp→动画即时事件及完成→速度/碰撞/积分/重力。子会话在父动画前推进，故动画发射新实体不在出生tick额外走一步。所有实体共享同一实现。
- groundMotion快照公开每实体速度、方向和standingOn供证据/消费者读取；不写PetState或存档。旧猴马仍走既有移动策略，P1GS保持回归。
- 现有大文件warning只涉及HeroPartyRuntimeBridge的12个system依赖；本批只加只读环境转发及索引，不新增system依赖或业务owner，故保留局部修改。其余8项原warning未触及。

## 验证

以下命令本批退出0：

```text
node tools/run-system-tests.mjs pet-ground-movement-tests pet-ground-session-tests pet-animation-session-tests pet-dragon1-clock-tests hero-party-runtime-tests
npm run check:system-design -- pet P1GS
node tools/run-system-tests.mjs level-lifecycle-tests level-result-tests playable-level-runtime-tests formal-game-loop-journey-tests
python tools/verify-pet-ground-environment.py
npm run build
npm run check:structure
```

`movement-traces.json`来自真实生产Runtime/Session的Strategy探针，覆盖20/24/30fps主子运动/动作完成、根/子hurt、出生与warp、新目标和距离边界；探针不伪称已实现dragon1战斗。测试另外执行正式updatePets生产函数、真实P1/P2 Runtime，各自消费level12/21墙并断言不同standingOn；五关入口均有完整输入守卫。半帧、长帧、子出生时序与旧死亡/清理合同由原会话测试共同覆盖。

最终`npm run check:workflow`、`npm run audit:problems`和`git diff --check`均退出0；31未完成定义/287历史定义与唯一Ready C4一致，1250标注和关卡架构通过。归档校验曾因C4定义CRLF不匹配标题失败，恢复LF后全链通过。结构0 error/原9 warnings，build保留既有大chunk提醒。本批没有启动preview或更改可见层，不能用本批绿灯提升UI/完整家族复现状态。

## 原样交接给C4/C5

C4注册真实dragon1 Behavior，消费本接缝/213查询，不复写通用AI。普通攻击的本地faceToTarget须连同持久移动方向核对：原等x分支与followTarget不同，不只改视觉facingX。C4仍须实现真实普通弹碰撞/来源伤害、自身命中治疗、fs独立数值/CD/普攻、自然到期治疗与提前死亡清理，保留全部父级HP/MP/source/lifecycle反例。需要窄朝向端口时在既有Session/context职责内补齐，不引入第二移动owner。

C4必须重跑本交接两组宠物目标测试与P1GS。C5仍须全量P1GC、正式/TestScene真投影、P1/P2真实运行与离场/重进等生命周期；通过全部父级标准后才归档214C2/214C并激活214D。MO-003不增加第三家族成功样本。

## 完成审计

本批逐项核对：源条件与精度合同见上表；求解器已由主/子Session调用，五关入口消费217完整墙并动态验证正式P1/P2转发；20/24/30fps trace及normal/fs/受击、出生/warp、jump/drop、目标边界和旧时钟/生命周期回归均通过；P1GS、build、structure、workflow、problem audit和diff证据齐全。未新增UI或可见资源，完整P1GC/真实青龙战斗明确属于保留的C4/C5合同。本批C3已归档，唯一Ready C4；本次goal不跨入C4。无运行检查/服务或Git提交。
