# 217 六段证据与差异

恢复主包与五个level源SHA、提取locator见manifest.provenance和source-contract.json；下表行号指本批恢复脚本，相同路径位于 `local-resources/regima/task-outputs/task-settings-217/shared-source/scripts/`。

| 行为/空间合同 | 局部证据 | 共享调用 | 几何/等级 | 现代映射与反证 | 验证 |
| --- | --- | --- | --- | --- | --- |
| 五关wall全集 | 各slNN的DefineSprite第一帧；43个实例及原depth | BaseGameSence.as:28-33→PhysicsWorld.as:176-213按marker注册 | 确认事实；binary实际marker集合与类集合一致 | 现有平台表不等于墙全集 | 独立binary枚举、134递归对象、漏侧墙变异 |
| 完整墙bounds/嵌套变换 | wall子shape及空命名marker | BaseObject.as:438/447/535/540/549调用完整getBounds | 交叉确认；XML→manifest，独立binary递归几何＋SVG直接wall矩阵/尺寸包络 | 禁止猜bottom或丢innerMatrix；空间事实来自源而非Layout | bottom、innerMatrix变异；源SVG基准和PNG目视检查 |
| 碰撞顺序 | 原root按depth的child顺序 | PhysicsWorld.as:182-184旋转isWall unshift，其余push | 确认事实；6个90°侧墙，其他0° | 环境提供collisionOrder，不按距离重排 | 顺序与旋转/axisAligned字段逐项检查；顺序/斜坡误标变异 |
| 通行标记与class | 四类wall的实际子标记 | BaseObject.as:558/562/578区分class和marker | 确认事实 | through、throughUp、throughDown与isThroughWallClass分列 | 三类标记逐墙核对；混并through变异 |
| 初始static与容差 | 五关root初始化脚本；Wall.as:11-13,230-232 | Wall子类无实例速度覆写；BaseObject.as:553-555容差加max速度 | 确认事实，限初始及直接消费路径 | FallDownWhenStandingWall不是动态下落墙；实际未知外部状态不得泛化 | root脚本与源哈希；五关StageListener窄查无wall速度/增删；43单帧子树 |
| owner根/出生/warp | 现有207碰撞源StageCommon/ObjectBaseSprite；BaseHero.as:423-426 | BaseObject.as:565/572,894-896；BasePet.as:174-179 | 交叉确认；仿射尺寸、导出profile、现代注册点精度分别记录 | 不能以footY直接充owner根；不改既有视觉profile | binary碰撞形状核对、导出twip包络、P1/P2公式fixture与foot-as-root变异 |

双重验证边界：确定性几何/源条件验证已通过；五张未修改的恢复源SVG及FFDec PNG已作源基准和整体目视检查。没有运行现代宠物，也没有逐像素声称现代与Flash一致；217只关闭源环境输入，C3运行trace和C5正式视觉仍未完成。

允许例外：没有新增现代可见例外。SVG记录原始浮点尺寸，PNG预览带FFDec边缘填充；SVG尺寸包络允许小于0.1px的整数twip/格式化差，binary↔XML边界误差门禁为0.002px，直接SVG MATRIX门禁为0.00011；这些是源导出比较精度，不是授权改变玩法数值。

独立复核修正：原class白名单共同漏项风险改为真实marker集合交叉枚举；新增axisAligned/旋转分支断言与负向变异；promotion改为先暂存并通过Schema再写verified。生成器不会无条件自报verified，验证器不宣称完整PNG像素等价。未修改PG-017既有方案，只记录本任务适用验证样本。
