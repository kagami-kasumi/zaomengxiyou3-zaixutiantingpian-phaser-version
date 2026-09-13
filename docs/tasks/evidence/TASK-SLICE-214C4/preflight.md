# 214C4 真实命中消费预检

2026-09-06。结论：未完成；缺少目标碰撞真值，214C4 转 Blocked，同线 TASK-SETTINGS-218 为唯一 Ready。本轮 compact 0 次。

## 独立源核对与边界

AS3 路径均相对 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。

| 六段证据 | 本次结果 |
| --- | --- |
| 局部来源 | `export/pet/PetDragon1.as:181-200,246-292,338-412`：normal tick7/16，fs tick17/18；生成tick复制当时HP/MP为上限及atk/def/level；命中治疗发弹者自己，到期治疗root |
| 共享链 | `base/BaseMonster.as:870-904`同时要求bounds粗筛和`HitTest.complexHitTestObject`；保护/Dodge拒绝命中，Dodge消耗attackId但不治疗。`my/HitTest.as:14-65`执行BitmapData.draw、DIFFERENCE和颜色交集，不等于中心点或AABB测试 |
| 空间/资源 | 214A的11张普通弹PNG只裁全透明边，RGBA可以直接消费，无需重提取。第1帧67×53包含1598个透明像素、1953个非透明像素。213的visibleBounds来自SVG画布，不能代替逐帧绘制交集；其collisionProfiles仅含宠物3/4，未覆盖怪物1/2/7 |
| 行为合同 | `base/BaseBullet.as:280-325,427-458,485-497`：第11检查换ID，末帧先碰撞；setRole只设source/id，setAction初始化伤害缓存，成功命中后刷新供下一次使用，失败不刷新。不可每次碰撞前重算当前伤害 |
| 现代映射 | 正式12类MonsterDefinitionCatalog尚无对应colipse几何/世界root消费；现有猴马target点测试不能证明青龙复杂像素命中。待218冻结目标几何和独立oracle后，由现有Runtime/Projectile/正式伤害owner消费，不新增场景战斗owner |
| 双重验证 | 主agent窄读一手链并用现有PNG做哈希/alpha检查，subagent只读核对并指出缺口。`collision-preflight.json`只证明源条件和已有资产覆盖，未运行Flash像素重放、生产战斗或正式视觉验收 |

确认事实：目标通过各自newColipse创建独立Sprite，不是身体动画轮廓。只读核对的有限集合为ObjectBaseSprite（Monster2/3/4/7/8/9/10/19）、ObjectBaseSprite2（5/6/16）、ObjectBaseSprite7（30）；218必须从恢复源独立核对这些映射、包归属、形状和矩阵，不能直接把此手写集合当extracted。

未知：三个目标Sprite是否可严格等价为实心矩形；原版像素采样/矩阵舍入与现有PNG采样是否等价；目标root到现代坐标的精确映射。此处不把alpha>0直接宣布为Flash的完整碰撞算法。

## C4恢复后必须保留

- 正常伤害为`(atk+uint(magicAdd))*crit*GXP`，BaseBullet的`_hurt:int`截断；GXP为运行时状态，不可把`skills.includes('gxp')`当作已证触发。clone不继承root技能/crit/extras/buff/GXP。
- `PetInfo.as:33-66,110-114`、`BasePet.as:141-161,399-403`：每实体已有弹→被动→AI→upPassive→CD；clone也有等级被动，首次恢复为fps+1 tick。默认0不等于永久不恢复。
- `BasePet.as:1058-1074`的faceToTarget等x向左并更新持久方向；治疗整数截断、封顶、不复活。
- 20MP/初始2.5s/后续10s；有效既存目标才fs，search当tick不释放；生成tick读取HP/MP；最后tick旧弹照常step；提前死亡/休息/替换/销毁不能到期治疗；root/clone/P1/P2来源隔离。
- 214C4全部原验收仍在，P1GS回归必须保持；214C5仍负责正式/TestScene投影、P1/P2全生命周期及P1GC，未通过前不归档父C2/C、不激活214D。

## 安全交接

本轮先尝试了54行公共端口/时序接入；独立核对揭示输入缺口后，已精确撤回本轮7个src文件的全部试改，当前src无diff。未留下半成品、未改原始提取、未启动服务、未提交或push。

本次由214C4声明的“新资料族/资源派生”边界及agent-protocol规模规则进入补证调度，不是缺少用户权限，不需要再次确认。218只补3个碰撞Sprite/12条映射及普通弹有限命中fixture；不扩大成全怪物行为逆向。本次不跨入218执行。

可重跑：`python tools/check-dragon1-collision-preflight.py`。退出0表示成功复现阻塞证据，不表示战斗通过。MO-003保留已归档采纳结论，本轮实际差异只记录于此，不计第三家族成功。

最终检查：预检、generate:harness、check:workflow（含15个harness测试、1250标注和关卡架构）、audit:problems、check:structure、git diff --check、git diff --exit-code -- src均退出0。structure保留9个既有warning，workflow保留既有PlayerSlot命名warning。首次workflow发现阻塞原因字段和逆向协议引用缺失，补齐后重跑通过。32个未完成定义与唯一Ready 218一致；PG-017已回写V2.3和集中审计，未归档任何游戏task。

未运行build、生产战斗测试、P1GS/P1GC或浏览器验收：最终无游戏代码/资源变更，输入缺口尚未解除，不能以这些门禁替代218。所有检查已退出，无待轮询进程。
