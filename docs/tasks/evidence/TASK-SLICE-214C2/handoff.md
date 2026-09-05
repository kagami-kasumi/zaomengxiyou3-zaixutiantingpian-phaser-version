# 214C2 第二次 compact 安全交接

2026-09-05。本对话已使用第二次 compact，停止新增实现。C2/C 未完成，C2 为 Split；唯一 Ready 是 214C3，之后 B（真实战斗）→C（正式投影/P1GC）→214D。用户已授权修正移动速度和必要公共接口；不得再次以 agent 自拟的“禁止改变公共设计”阻止既有职责内修复。未执行 commit/push，未启动 dev/preview，无 live subagent。

## 已有代码与验证范围

- C1 已归档：每槽单 Runtime，EntitySession 复用主/私有实体步骤和来源/token/cleanup，P1GS 含猴马回归与 10 类实现 mutation。见 C1 handoff，不重做。
- PetRuntimeSystem：速度由 moveSpeed×hostFps 换算，默认 30；正式与 TestScene P1/P2 传 targetFps。仍为旧二维归一 follow/chase，未接原版地面物理。每宠物 moveSpeed 独立；本次核对的原版 horizenSpeed 均为 5，未证明物种间不同。
- PetAnimationClock：公共同步 enter 事件先于 countdown/frameOver，逻辑 keyFrameIndex 与物理 column 分离；同 row wait/walk 换 state 保留物理 cursor，重置逻辑计数。PetDragonAnimationClock 只由生产真值构造 dragon1 定义。
- Session 可选时钟按 host tick 重采样整套公共更新，缓存半帧主/子事件、同步事件、延迟新子实体首次 step、死亡完成清理；旧猴马仍无此时钟。hostTick 每帧末递增模 59999，传 context。尚无生产 dragon1 Behavior 注册。
- PetGroundMovementSystem 仅未接入的静态轴对齐非飞行求解器：注册点预测 bounds、原版半尺寸 snap、地面攻击停横移、重力尾加、through 标志。目标测试已通过。没有斜坡/移动墙/enforceSpeed/场景适配，不得视作完整物理。
- 默认系统测试新增 pet-movement-clock-tests、pet-dragon1-clock-tests、pet-animation-session-tests；pet-ground-movement-tests 目前须显式执行。

## 源事实与纠正

- 213 attackRate 先前使用字段初值 0.8；恢复主包 BasePet 可执行 pcode 为九次 0.8 后五次 0.7。新 tools/pet-dragon-attack-rate-source.mjs 独立导出/读取常量赋值序列，拒绝分支和非字面量、核对 BaseObject/dragon1..4 无直接覆写，生成器用最终 0.7 并拒绝旧 0.8 变异。
- 证据 attack-rate-bytecode.json；恢复源 1_MainLoad__main1.swf SHA256 f8e6f937350d4c6121119119bbebf2b6744ba1422b9fb238764849123d62f734。pcode 输出仅 local-resources/regima/task-outputs/task-slice-214c2-source-check；原 legacy-extraction 未改。只证明常量顺序，不是完整 combat replay。
- 同批 test:pet-dragon-family-truth 与 test:pet-dragon-assets 通过：345 基准、44 合同、11 对象保留，无视觉基准改动。PG-017 记录方案不充分/V2.2，不宣称关闭。

## A 的精确未完成边界

- 原 BasePet AI 在 BaseObject.step 前；BaseObject 先动画，再 setSpeed，再碰撞/移动。现有 Session 步骤未完全按此复现，须核对后调整既有 owner。
- 原方向标志持久；turnLeft/Right 不自动设 walk；setAction 不清方向，setStatic 清方向与 vx。地面 normal/fs 禁横移，空中攻击保留横移。normal completion 只 wait，同 tick 可恢复横移；hurt completion static+wait。
- 原范围 150/chase 判断只在 timeCount%frameClips==0；已有目标分支每 tick 查技能；新 search 目标本帧不能攻击。无目标每秒 owner 距离>640 才跟随；死目标或>=1200 本帧清除不重选。
- 瞬移距 owner>=1000 且非攻/伤，sourceRole 根 (x,y-30)。现代 owner 当前为 hero 脚点，projectHeroVisualRootY=footY-50，但 body visual offsets 不可直接认作逻辑根；原初始出生调用点尚未验证，不能猜。
- 地面每 tick x+=vx,y+=vy 后 vy+=1.5；实际注册点 bounds 与 snap 半宽高不同。墙条件见已读 BaseObject nearToWall551..596、move601..610；飞行 x20..920 是飞行分支，不可套地面 hero travel bounds。
- 现代 HeroPartyFrame.environmentFor 给 MovementPlatform（无 bottom）与 HeroMovementBounds；HeroPartyRuntimeBridge.updatePets 尚未转发环境。TestScene 两桥亦需同源输入。Stage12Layout 有原 wall markers 全矩阵，Stage12TraversalSystem 当前只有单地面平台；五正式场景不能复制 pet 物理。

## B/C 必须保留的战斗合同

- 普攻发射 tick7、normal16tick，fs tick17/总18，hurt8、dead16；长 render 帧不得丢 hit。normal 弹 11 个视觉帧，碰撞先于末帧销毁；attackCount==10 检查在递增前，第11检查换 ID；max99 为单 projectile 总有效命中数，每 ID 对目标去重。
- 伤害走正式 pet-source 链，(atk+magicAdd)×crit×GXP；命中治疗攻击者自己 floor(SHp*.018+atk*.18+level*2)，分身也如此。不能走现有 basic attack 的 monkey fallback。
- fs 20MP，初始 CD2.5s/后续10s，仅有效既存目标 AI 分支。分身复制 root 当时 HP→maxHP、扣费后 MP→maxMP、atk/def/level；其余技能/crit/extras 等遵循原 PetInfo 默认，不整对象复制。分身仍需完整被动 step。
- 分身出生 root x±random150,y-50；自己的10秒到期 tick 先完整 step/末弹命中，再 root 检查清理并治疗 root .036*SHp；提前 HP 死亡不能到期治疗。根销毁级联，分身不清根 owner slot。
- dragon1 注册、真实伤害/治疗/fs 到期、正式/TestScene 同源视图和 940×590 P1/P2 全部未完成；P1GC 尚不存在，C 批必须落地且 0。C2/C 所有原验收保持，214E 最后仍需整族 44 合同/P1G。

## 验证与运行提醒

- 速度/时钟最终批此前完整 build、test:systems、P1GS（10 mutations）、workflow/structure 为 0。结构原 9 warnings、构建原大 chunk 提示保留。
- 新求解器仅 targeted tests=0；本次最后增量检查结果在下方补录。
- system-tests runner 共享 .tmp/system-tests 清理，不能并行运行两个系统/gate 测试。build 与文档检查可独立并行。
- 后续从 A 的独立合同和当前文件窄读恢复，不能将本次已有工作当作 clean baseline。建议新对话接手；完成当前检查点后可提交保存，但不表示 C2/C 完成。

最终增量检查：build、pet-ground-movement-tests、check:structure、check:workflow（含 annotations/关卡架构）、audit:problems、git diff --check 均退出 0。首次文档检查发现嵌套后缀不符合现有 task ID 语法，已改用未占用的 214C3/214C4/214C5，Split 预算归零后 workflow 复跑通过。原 9 结构 warning、PlayerSlot 命名 warning 和大 chunk 提示保留。当前全部检查已退出，无待轮询进程。
