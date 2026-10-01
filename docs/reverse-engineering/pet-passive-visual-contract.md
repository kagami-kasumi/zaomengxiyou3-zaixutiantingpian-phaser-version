# 六公共增益视觉合同

任务：`TASK-SETTINGS-244`。原生视觉在以下有限入口完成核验；现代投影仍待后续消费。最终状态及哈希以本地 `docs/tasks/evidence/TASK-SETTINGS-244/acceptance.json` 和 manifest 为准。

## 权威输入与范围

- 真值：`ground-truth/manifests/task-settings-244-pet-passive-effects.json`，`truthId=task-settings-244.pet-passive-effects`。状态集 `/states`、递归对象与矩阵 `/displayObjects`、独立原生 PNG `/baselines`、核对 `/completeness`。
- 完整 manifest 约 204 MB，仅本地保留；生成入口 [`tools/pet-passive-visual/README.md`](../../tools/pet-passive-visual/README.md)。它不参与游戏启动，禁止把忽略目录作为未来生产依赖。后续运行资源必须进入正式目录。
- 恢复 `assets/pet1.swf` SHA-256：`0699a5d3a49ea8024d3635b18c6349f5d7f7cf5f1db869dd18a0a5ee6de60644`。六个真实名称均有 `buff_` 前缀；244 原任务中的短名是效果键，不是另一个符号。
- 107 个原字节定义：50 Shape、50 Bitmap、7 MovieClip；296 个静态时间轴帧。两个 ColorMatrixFilter 放置，无 mask、按钮、文本、scale9 或裁切脚本；50 位图依赖全部保留。符号/placement 的原始 depth、矩阵、颜色、滤镜来自 SWF/XML，实际当前帧显示列表来自完整原 SWF 的 AIR 实例。
- 原游戏包 AIR 51.1.1.5、940×590、24fps。`StageCommon.swf` 只复用已知宿主 colipse 输入，未研究其余资源；直接实例化 ObjectBaseSprite/3/4，避免用旧 SVG 包围盒代替运行时 width/height。
- 384 个 fixture、65,280 个状态：每个效果的首次添加/完整播放与数值到期、早刷新/100帧后刷新、到期后重加、短时长/零时长、移动/BBDC转向/独立root翻转、受伤、效果销毁、宿主销毁、暂停恢复；代表生命周期覆盖 P1/P2、双朝向，完整周期另覆盖猴马各四形态和五英雄尺寸。数值输入只用作受控状态驱动，不重做235/243公式。

## 六段证据与行为合同

| 合同 | 对象局部与共享调用链 | SWF/运行证据 | 分级、反证与消费要求 |
| --- | --- | --- | --- |
| PV-01 首次与刷新 | BasePet.checkBuffSkill→宠物/主人BaseAddEffect.add；step首次分支393..415；add1087起 | 六真实SymbolClass；`added-before-step`、`first-owner-step`及refresh/late-refresh/readd | 交叉确认：add仅入数值，首次owner step创建视觉；同名刷新改time/startTime，保留value且不再show。不得根据每次成功触发重播 |
| PV-02 宠物子层 | BaseAddEffect.show_fsnl1962/show_sxkb1992、对应hide | 713/806根100帧，嵌套712独立6帧；两个原ABC frame100脚本 | 交叉确认：按colipse尺寸挂宠物root，不随BBDC内部朝向翻转。第100帧自行removeChild并stop，数值仍可活跃；晚刷新不重建已消失对象 |
| PV-03 主人场景层 | show_fyjc1842/gjjc1861/mfjc1924/smjc1943→FollowBaseObjectBullet→BaseBullet.step2 | 738/761各25帧，778/805各20帧；原show位置/尺寸/方向/scene addChild/数组 | 交叉确认：四项不挂hero子层；先注册到主人magicBulletArray，再由世界bullet-before-owner相位推进。末帧进入step2即销毁，故常规EXIT基准不再显示该末帧；不等数值到期 |
| PV-04 方向与跟随 | FollowBaseObjectBullet.setRole/step2；BaseBullet.setDirect469；AUtils.flipHorizontal287；BBDC.setDirect641 | move状态先只改BBDC direct，再显式翻root.a，含分数位移 | 交叉确认局部读口：出生读BBDC direct；后续读root.a变化并跟随x/y。二者独立，不能每次角色转身都翻现存效果。root翻转是明确受控边界，未声称正常角色每次转身会翻root |
| PV-05 期限与零时长 | BaseAddEffect.step首次show在expiry582前；remove1454..1476 | zero、short、cycle、refresh独立原生树与PNG | 交叉确认：零时长先show后remove；sxkb/fsnl同一step已移除，四主人bullet因hide为空仍完整播放。数值到期不能作为统一视觉销毁条件 |
| PV-06 暂停 | MainGame.stopGame621/continueGame674→移除world ENTER_FRAME；只显式stop/start英雄与怪物magicBulletArray | world-pause tick3..40停止受控owner调度，执行原stop/continue方法，AIR display仍推进 | 交叉确认有界调用：主人四bullet停播；宠物两个子效果继续播放，效果count冻结。不能拿BaseBullet内部isStopGame分支当完整world暂停证据 |
| PV-07 清理与淡出 | BaseHero.clearAllBullets2366/destroy2413；BasePet.destroy1150；BaseAddEffect.destroy1636；PhysicsWorld.clearWaitFromParentArray453 | host-destroy、effect-destroy、自然终止；原数组清理与TweenLite.renderTime319/easeOut | 交叉确认：英雄清弹并立即离场；宠物destroy不hide这两个子效果，随root一秒淡出后离场。只destroy效果容器仍可留下原视觉。所有ready弹体按原算法同相清出数组 |
| PV-08 显示结构/尺寸 | 原show的width/height赋值与宿主colipse；source字节/XML递归placement | 65280态源递归对象数、矩阵、ColorTransform、ColorMatrixFilter、当前嵌套帧；原生PNG | 交叉确认：尺寸来自Flash属性赋值后的实际矩阵，不从手抄近似值推导；后续资源需保留注册点、滤镜和逐帧，不能用一个圆环占位 |

精确源路径、方法起始行、文件SHA及提取片段SHA在本地 `baseline-native.json.gz /sources`；原SWF定义与脚本定位在 `source-definitions.json`。完整原 pet1 加载保留两段 frame100 ABC，未用剥除脚本的 closure 当最终动态基准。

## 入口与替身边界

原六项show/hide/add及step/remove有限分支、完整FollowBaseObjectBullet、BaseBullet视觉/销毁方法、原MainGame暂停方法在隔离命名空间执行。宿主类保留真实Sprite API、原宿主销毁相关片段和原数组清理；BBDC方向、位置、效果输入由fixture驱动。没有运行完整关卡、AI、物理、伤害或真实角色身体；这些不属于本任务视觉证据。MainGame方法加受控scheduler不是完整MainGame→PhysicsWorld端到端运行。

宠物淡出用原TweenLite.easeOut与renderTime的 `start + ratio * change`，在确定elapsed下执行；源alpha经Flash 1/256量化。无pause与销毁重叠Tween组合，本批不将其扩大为完整Tween运行时。原24fps显示时钟与235/243的host计数分开，现代帧率适配仍须消费者验证。

原生ENTER前已推进当前MovieClip帧，EXIT记录业务后的可见树；在ENTER中新增对象保留frame1到下一原生帧。早期把“原生帧推进”和“宿主step”混成先后表的验证器被反证后修正。完整帧序列以机器记录为准。

各PNG是原生draw后按几何包围盒加2px边界裁切，保留stage原点和尺寸；alpha边界验证防止裁掉滤镜或图形。舞台仍为940×590，裁切不是把现代图反投成原版。代表图见本地 `contact-sheet.png`，仅供阅读，原始逐态PNG才是基准。

## 验收与差异

- 来源hash、Schema、状态集合、逐对象源XML核对、父子与数组清理分别验证，不用Schema成功替代语义。
- 两次原生65,280态的帧、矩阵、颜色、滤镜、crop及PNG字节一致；只归一化JSON键序和自动instance名。源definition重复生成同哈希。
- 七类运行变体：错误方向/父级/注册点、刷新重复对象、销毁残留、冻结、提前播放；十类独立显示树字段变异全部拒绝。
- 无新增现代视觉例外；没有现代画面像素一致声明，也不扩大任何旧碰撞/视觉许可。XML浮点核对限1e-7，宿主alpha比较限原Flash量化级，并非玩法容差。
- 已保留失败：初版closure漏位图依赖已补50项；探针缺ready数组清理已补；Tween ratio误用已纠正；提前播放反证首次触发额外EXIT事件，改为监听前受控提前一帧；缺显式Schema路由已补。失败产物和更正原因在本地preflight/fade报告，不计成功样本。

## 现代映射与后续

现有242A主人效果owner、242B PetPassiveSession和共同slot host继续拥有数值。后续用同一效果身份驱动独立显示生命周期，由共同presenter消费原素材/注册点；四个主人场景层效果必须能在原宠休息后继续完成，不能绑死宠物view销毁。资源转换与现代渲染逐态对比属于同线后续任务；未经验证不可把缩放图片当作等价Flash投影。

本项只关闭六效果的上述原版输入。源内六项同时叠放的完整战斗场景、各家族专属技能、未声明宿主profile、完整怪物/人偶组合、204/all/194/VS-067及整条功能线仍未关闭。下一个task必须保留这些边界，不以此文代替真实五关消费者验收。
