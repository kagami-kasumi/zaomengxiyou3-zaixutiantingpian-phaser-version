# 角色/宠物承伤数字：原版证据与实现边界

范围为 TASK-SETTINGS-215、RegiMA 1.1、唯一视觉包 `assets/OtherMat1.swf` 的 `pnum0..9`。不修改现代 `src/`，不闭合治疗、MP、miss、怪物目标数字或连击。原版随包 AIR 51.1.1.5 的隔离原源码 fixture 用于显示列表和时间片采样；这不是完整游戏战斗录像，也不冒称历史 Flash Player 实测。

机器入口：[manifest](ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json)，truthId=`task-settings-215.player-pet-incoming-damage-feedback`。精确字段由 `/glyphs`、`/animation`、`/visualTruth` 和 `/behavior/fixtures` 提供，不再维护人工坐标副本。行为源检查和正负输入见 [fixtures](../tasks/evidence/TASK-SETTINGS-215/behavior-fixtures.json)，后续验收见 [216 handoff](../tasks/evidence/TASK-SETTINGS-215/handoff.md)。

## 六段证据链

下列 AS3 路径均相对 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`；源哈希和逐项行范围写入 manifest 的 sourceChecks。

| 合同项 | 局部与共享链路 | 几何/显示证据 | 等级与反证条件 | 验证 |
| --- | --- | --- | --- | --- |
| 本地承伤 | `base/BaseHero.as:792..955`、`base/BasePet.as:865..940`；角色 override 先裁决参数，再到基类和属性 setter | 两个 `add*HurtMc` 都直接创建 ANumber 并追加到 gameSence；不是队列 | 确认事实；若 caller 或 override 改变须重提取 | fixture 源片段检查；原 ANumber native state |
| HP 与数字分离 | `BaseRoleProperies.setHHP:815..839` 夹到 0；Pet 在显示后夹 0；显示参数不按剩余 HP 夹紧 | `/behavior/fixtures` 致死样本；显示发生在死亡/复活分支前 | 确认事实；禁止以最终 HP delta 反推出所有显示值 | 普通/零值/致死的正负合同 |
| 盾与转嫁 | `BaseHero:802..821` 先伞后 tjgl 再玄龟；`BaseAddEffect:2711..2755` 消耗盾，移除后把溢出递归送回 reduceHp | 满盾不进入基类显示；溢出由重新结算的 producer 显示 | 确认事实；多盾/角色 override 的递归必须保留真实重入顺序，不能只对原始值减盾 | 满盾、溢出、转嫁 fixtures |
| AS3 整数转换 | `param1:int` 的玄龟 `*=0.95` 在赋值时先截断，再 ceil；Role3 显示 `/=2` 同样截断 | `native/measurement.json` 的 numeric 原片段运行结果 | 交叉确认；101 转嫁时 Hero=95、Pet=6；不是对浮点直接 ceil=96 | 原 AS3 片段 + AIR int 实测 |
| Role3 显示特例 | `export/hero/Role3.as:1999..2008`，GXP 时对显示参数除二；自身 reduceHp 减伤是另一阶段 | 同一 pnum 字形与几何，只有显示值不同 | 确认事实；不能再次对最终 HP delta 套全部减伤 | GXP/non-GXP fixture；除二整数片段实测 |
| 入口去重/无敌 | `BaseBullet:301..355` 以目标 attackId 数组限制重复；Hero/Pet `beMagicAttack` 先拒绝保护状态；直接 reduceHp/效果没有统一保护判断 | 未接受碰撞不产生该碰撞的数字；不能把渲染层当伤害去重层 | 确认事实；直接源调用与碰撞命中须分开 | 重复/保护/直接路径 fixture |
| 显式重复 producer | `BaseHero.getHurtByPig8:1197..1201`；`BaseAddEffect:593..619` 的火与毒有显式 addHeroHurtMc | 单机可出现两组同值数字；盾全吸收时也可能保留显式数字 | 确认事实；“HP 没变所以不显示”与“一个伤害永远一个数字”均不成立 | producer 正负 fixture，216按来源区分显示序列 |
| 房间 owner | `BaseMutiLevelListenering.refreshOtherMutiUser:837..920` 比较旧新 HP 后写入；pet 换名不走旧宠物数字；hurtOther/Pet 拒绝 host 收件 | 接收侧显示快照 HP 差，不保证等于发送侧传入伤害；同值重发没有减少差 | 确认事实；协议没有通用序列号去重，不能承诺任意乱序网络恰好一次 | 固定更新序列/未开始/换宠/host负例 |
| 字形身份 | 恢复 SWF 的 SymbolClass 与 DefineBitsLossless2；二进制窄解析，不依赖旧视觉提取结论 | `/glyphs`，原 native BitmapData 与 SWF premultiplied ARGB 逐像素比较 | 交叉确认；alpha必须相等，预乘RGB反解容差1 | 十字形身份、尺寸和像素检查 |
| 显示树与动画 | 原 `my/ANumber.as:38..92` + 原 Greensock；`CureHpQueue:71..84,121..183` | `/visualTruth/displayObjects` 递归保留根/child/depth/matrix/bounds/alpha/filter/mask；原运行图片940×590透明舞台 | 交叉确认；Tween以秒计，队列以step计，不能全改为固定帧数 | 两种owner×目标kind×7时间片、队列与数值边界 |
| 销毁 | 原 ANumber destroy 移除父节点、kill已保存的scale tween；不清child，也不把isUse复位；queue.destroy为空 | 数字自然完成后离开gameSence；显式销毁也移除父节点 | 确认事实；现代场景清理可用其自身生命周期，不得宣称源对象池会复用 | native完成/显式destroy态 |

## 坐标与动态显示列表

进入基类前的角色 override 已窄查：Role1:2306..2331 的 `zxstj` 与 Role2:2197..2211 的 `zxpty` 把int参数乘0.9；Role3:1201..1222 把盾技能（最高8级）、GXP与`zxztk`的减伤加到同一个系数，再乘一次并截断，不能错写为三个倍率相乘；Role4:2226..2242 的`zxqts`系数减0.1后乘一次；Role5:4555..4588 的`hit10_1/2`乘0.75、`hit25_1`乘0.9、`zxttp`再乘0.9，各次int赋值分别截断。相关GXP/技能动作多数只把param2设false，表示不硬直，不能据此判为无伤害。只有Role3的显示override再对已结算显示参数除二；其他这些减伤已发生在基类producer之前。216从当前结算owner读取结果，不在显示层重复应用这些伤害公式。

源 `gameSence` 是数字父容器，调用者的 x/y 在该世界容器坐标下定位；P1/P2 不改变字形规则，使用各自目标根坐标。fixture 把世界容器置于舞台单位矩阵，固定角色/宠物和两个 owner 的输入根，输出940×590透明舞台、无裁切。现代摄像机转换由 216 从世界到舞台映射，不能把 bitmap 左上角当作人物脚底。

ANumber 根先 addChild 到当前 gameSence 的末尾，再按字符串从左至右追加 Bitmap；实际绝对深度取决于当时已有 child，本 fixture 的 depth 只是相同 fixture 内的插入次序。Bitmap 注册点为(0,0)，无mask/filter，normal blend，smoothing=false、pixelSnapping=auto。`visible` 表示显示对象属性；alpha已经归零但尚未到结束时间的对象仍可能保留在显示列表中。

时间采样执行原 TweenMax.renderTime，显式扣掉其所属 timeline 的 delay；不是用 Python 公式生成图片。Python仅用独立二次缓动公式核对测量值，允许 Flash 的 alpha量化和twip量化。完整渲染/像素来源仍为原 AIR。负参数不是合法伤害输入，但原 ANumber 对 `-12` 的兼容性边界已实测为数字 `012`，没有负号字形。

`addHpLose` 是保留API：全主包精确搜索只有定义，没有实际caller。其 stage98 过滤、无容量上限、step等待及大于5时的五路展开是API可观察合同，不应据此把正式角色/宠物直接数字改为队列。队列可混合其他family，但本任务不闭合其他family的数值或外观。

## 现代映射与双重验证边界

当前 HeroCombatSystem.applyHeroDamage、PetCombatEntitySession.consumeDamageEvents 有HP/hurt/dead链路，没有对应incoming数字发布。正式关卡经 HeroPartyRuntimeSystem/Bridge，TestScene 有自身碰撞接入；Stage2-1冰刺与Stage2-2火焰经 applyEnvironmentHits，需在最终数值结算点统一发布来源明确的反馈，不能只在怪物入口补一处。

215完成的是源合同、原运行视觉基准与可执行交接；216才承担现代黑盒trace、正式五关/TestScene P1/P2旅程、并排/叠图、场景清理和localhost5173 QA入口。现有怪物数字与连击不能计入此次incoming反馈。原版特例的两个producer不能被不加区分的event去重吞掉；同一个producer的重放则必须可辨认。

未知与反证：声明的固定输入与显示状态通过检查后无实现影响未解项；未承诺完整联网延迟/丢包体验，未实现其他角色/宠物防御技能或所有原版效果。发现新pnum caller、源hash变化、原运行树/像素差异或现代消费不符合字段时，降级对应合同并复验，不自动扩大本任务范围。
