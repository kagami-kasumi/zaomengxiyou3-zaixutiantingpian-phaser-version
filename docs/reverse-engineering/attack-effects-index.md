# 角色普攻特效资源索引

本文只回答 `normalHit()` 直接带出的普攻表现问题：每段普攻会不会额外生成命中对象、这些对象叫什么、角色本体动画还依赖哪些资源、当前导出结果能不能直接拿来用。技能特效不在本文范围内。

## 证据入口

- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/hero/Role1.as` 至 `Role5.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseBullet.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/base/BaseBitmapDataPool.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/bullet/SpecialEffectBullet.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/bullet/FollowBaseObjectBullet.as`
- `extracted_flash/resources_by_swf/[172845].swf/scripts/export/bullet/EnemyMoveBullet.as`
- `extracted_flash/resources_by_swf/[172845].swf/symbolClass/symbols.csv`
- `extracted_flash/resources_by_swf/[172845].swf/images/`

`BaseBullet` 构造函数直接用 `AUtils.getNewObj(resourceName)` 取显示对象；`BaseBitmapDataPool` 则负责把角色 MovieClip 或 BitmapData 缓存成位图帧数组。因此，普攻的“可见资源”分成两类：

- `Role1` 至 `Role4`：角色本体动画之外，再额外实例化 `FollowBaseObjectBullet` 或 `SpecialEffectBullet`。
- `Role5`：普攻本体本身就切到独立的 ZM4 动作资源，同时还会补额外命中对象。

## 五角色普攻映射

| 角色 | 普攻动作 | 直接附属对象 | 资源/类名 | 结论 |
| --- | --- | --- | --- | --- |
| Role1 悟空 | `hit1`、`hit2` | `FollowBaseObjectBullet` | `Role1Bullet1` | `hit2` 复用 `hit1` 的附属对象 |
| Role1 悟空 | `hit3` | `FollowBaseObjectBullet` | `Role1Bullet3` | 空中普攻也走同一资源 |
| Role1 悟空 | `hit4` | `FollowBaseObjectBullet` | `Role1Bullet4` | 有独立附属对象 |
| Role1 悟空 | `hit5` | `FollowBaseObjectBullet` | `Role1Bullet5` | 有独立附属对象 |
| Role2 唐僧 | `hit1` | `SpecialEffectBullet` | `Role2Bullet1` | 当前推荐首切片也不是纯身体攻击 |
| Role2 唐僧 | `hit1` 的蓄力分支 | `SpecialEffectBullet` | `Role2Bullet2` | `blb` 条件满足时从同一普攻入口升级，不算新的基础连段 |
| Role3 八戒 | `hit1` | `FollowBaseObjectBullet` | `Role3Bullet1` | 地面第二段、空中普攻都可触发 |
| Role3 八戒 | `hit2` | `FollowBaseObjectBullet` | `Role3Bullet2` | 地面第一段 |
| Role3 八戒 | `hit3` | `FollowBaseObjectBullet` | `Role3Bullet3` | 地面第三段 |
| Role4 沙僧，铲形态 | `hit1` | `FollowBaseObjectBullet` | `Role4Bullet1` | 铲系第一段 |
| Role4 沙僧，铲形态 | `hit2` | `FollowBaseObjectBullet` | `Role4Bullet2` | 铲系第二段 |
| Role4 沙僧，铲形态 | `hit3` | `FollowBaseObjectBullet` | `Role4Bullet3` | 铲系第三段 |
| Role4 沙僧，弓形态 | `hit1`、`hit2` | `SpecialEffectBullet` | `Role4BulletArrow1` | 两段复用同一箭系附属对象 |
| Role4 沙僧，弓形态 | `hit3` | `SpecialEffectBullet` | `Role4BulletArrow2` | 箭系第三段 |
| Role5 白龙，枪形态 | `hit1` 至 `hit4`、`hit5`、`hit114` | 本体动作资源；另有未恢复 helper | `attack1_spear` 至 `attack4_spear`、`jumpattack_spear`、`runattack_spear`；`hit114` 另建 `Role5runattack` | `Role5.as` 明确调用 `doSingleHit(...)`，但当前 AS3 反编译稿未恢复该 helper 定义，枪系额外命中对象名仍是缺口 |
| Role5 白龙，剑形态 | `hit18` 至 `hit21`、`hit22`、`hit114_1` | 本体动作资源 + `FollowBaseObjectBullet`/`EnemyMoveBullet` | `attack1_sword` 至 `attack4_sword`、`jumpattack_sword`、`runattack_sword`；`swordhit1` 至 `swordhit5`、长剑态 `swordhit1_1` 至 `swordhit5_1`、跑攻 `swordhit6`/`swordhit6_1` | 剑系映射完整，长剑 buff 下前三段会改走飞行弹体分支 |

补充观察：

- `Role1`、`Role3`、`Role4` 的 `FollowBaseObjectBullet` 会跟随角色移动和翻面，不是纯静态斩击贴图。
- `Role2 hit1` 用的是 `SpecialEffectBullet`，不是跟随身体的近战贴片；`BaseBullet` 还对 `Role2Bullet1` 有“最大命中数耗尽时不立即销毁”的特判。
- `Role4` 的动作名在两种武器形态之间复用，但附属对象完全不同，不能只靠 `hit1/hit2/hit3` 三个状态名推导资源。
- `Role5` 的 ZM4 资源经 `BaseBitmapDataPool.loadZm4RoleResources(...)` 动态装入角色本体位图，不属于前四名角色那套 `ROLE*_...` 总表式资源。

## 当前导出资源可用性

当前主包导出结果还不足以直接复现这些普攻资源：

- `extracted_flash/resources_by_swf/[172845].swf/symbolClass/symbols.csv` 只有 88 条映射，未出现 `Role1Bullet1`、`Role2Bullet1`、`Role3Bullet1`、`Role4Bullet1`、`Role4BulletArrow1`、`attack1_spear`、`attack1_sword` 等任一普攻关键名。
- `extracted_flash/resources_by_swf/[172845].swf/images/` 当前只有 69 个已导出图片文件，名称主要是数字和少量 `qpjy/fbqpj` 相关文件，未见上述普攻资源名。
- 在 `extracted_flash/resources_by_swf` 全目录按这些符号名检索，也未找到匹配项。

因此，现阶段能确认“代码需要什么”，但还不能从当前已导出的主包图片中直接拿到它们。

## 明确缺口

若后续需要用户补提取，至少要补以下资源或其等价 MovieClip/位图序列：

| 角色 | 需要补提取的符号/资源名 |
| --- | --- |
| Role1 | `Role1Bullet1`、`Role1Bullet3`、`Role1Bullet4`、`Role1Bullet5` |
| Role2 | `Role2Bullet1`，以及想覆盖普攻蓄力分支时的 `Role2Bullet2` |
| Role3 | `Role3Bullet1`、`Role3Bullet2`、`Role3Bullet3` |
| Role4 | `Role4Bullet1`、`Role4Bullet2`、`Role4Bullet3`、`Role4BulletArrow1`、`Role4BulletArrow2` |
| Role5 本体动作 | `attack1_spear`、`attack2_spear`、`attack3_spear`、`attack4_spear`、`jumpattack_spear`、`runattack_spear`、`attack1_sword`、`attack2_sword`、`attack3_sword`、`attack4_sword`、`jumpattack_sword`、`runattack_sword` |
| Role5 附属对象 | `Role5runattack`、`swordhit1` 至 `swordhit6`、`swordhit1_1` 至 `swordhit6_1`；枪形态 `doSingleHit(...)` 的实际资源名还需从 P-code、原 SWF 或重新提取结果继续确认 |

## `TASK-SLICE-001` 临时占位策略

在真实资源未补齐前，五角色普攻仍可先按原版行为关系实现，但要显式区分“动作占位”和“附属特效占位”：

1. `Role1` 至 `Role4` 的附属对象先统一用可见的短寿命斩击/光效占位，保留每个 `hit*` 的独立 key、生成时机、朝向和跟随类型。
2. `Role4` 至少保留铲形态与弓形态两套占位资源 key，避免后续真实资源接入时把两种武器表现又混回一套。
3. `Role5` 先把本体动作 key 直接按 `attack*/jumpattack/runattack` 分开建表；剑形态附属 bullet 再单独占位；枪形态的 `doSingleHit(...)` 先以“未知命中附属对象”占位，不凭空命名。
4. 所有占位都要走现代资源 manifest 的稳定 key，后续只替换贴图/动画源，不改普攻状态机和命中时序。

## 仍未完全闭合的点

- `Role5.doSingleHit(...)` 在当前 `Role5.as` 反编译结果中只见调用、未见定义；这很像 FFDec 反编译缺口。若后续要把白龙枪形态也做到资源级准确，需要继续看 P-code、备用 SWF 或重新提取素材。
- 当前主包导出图片不足以判断这些符号到底在同包时间轴里、外部资源包里，还是只是 FFDec 当前导出参数漏掉；这部分应由后续 `TASK-ARCH-002` 的真实资源索引继续接手。


