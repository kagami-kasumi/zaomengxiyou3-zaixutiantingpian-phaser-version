# 218 → 214C4：原版目标碰撞输入

218补证已通过。交付三目标Sprite、12类映射、普通弹11帧双向空间与采样合同；**不声明C4真实战斗或整个青龙家族完成**。src、214A生产PNG、恢复SWF和旧提取集未修改。

## 权威产物

- [空间manifest](../../../reverse-engineering/ground-truth/manifests/task-settings-218-dragon1-target-collision.json)：25态、53对象，保留内部colipseRect实例名，适用UI Schema。
- [collision-contract.json](collision-contract.json)：12映射、runtimeBounds、root输入、采样和214A alpha投影；适用[碰撞Schema](../../../reverse-engineering/ground-truth/schema/dragon-target-collision.schema.json)。
- [air-original/measurement.json](air-original/measurement.json)：原版游戏自带AIR51.1.1.5执行未改动HitTest的861项结果；[air-verification.json](air-verification.json)记录1,604,322像素核对、25张基准和采样变异。
- [verification.json](verification.json)、[hit-fixtures.json](hit-fixtures.json)、[zero-owner-fixture.json](zero-owner-fixture.json)：源几何/显示列表、源级缓存顺序、零伤害和来源隔离fixture。

## 六段证据链

| 合同 | 局部/共享证据 | 独立核对与消费 |
| --- | --- | --- |
| 三Sprite/12映射 | 恢复StageCommon的53/94/95/104/105/106/107，12个newColipse和BaseMonster构造scaleX乘2 | XML与SWF二进制独立核对，AIR实测bounds；symbols/monsterMappings |
| 帧/方向 | pet1的bitmap540/shape541/sprite542与BaseBullet.setDirect | 11帧两向完整枚举；22个整帧接触case各1953命中像素，25个940×590源runtime基准 |
| 像素命中 | my/HitTest.as原样编译，由原版AIR调用complexHitTestObject | 861个布尔结果与buffer一致；独立二进制alpha/采样模型逐像素对账，新AIR51.3.4结果及PNG哈希完全一致 |
| root语义 | 三源runtimeBounds中心均为(0,0)；现代物理用y±height/2，registry传physics.y给combat.y | C4按中心输入root={x:combat.x,y:combat.y}，直接使用runtimeBounds，不再缩放/附加脚点offset |
| 缓存/拒绝/去重 | BaseBullet:105–134、303–325、434–458；BaseMonster的Dodge与返回路径 | 源级参考fixture覆盖末帧先检查、成功后刷新、拒绝不治疗/刷新、Dodge耗ID及dedup；生产trace仍属C4 |
| 零伤害/owner | BaseMonster:1387–1400防御相等可为0；PetDragon1:251–264绑定实际攻击实体 | accepted但HP delta=0仍治疗；clone只治疗该clone。源fixture不代替生产业务执行 |

路径/hash/locator见contract和measurement。原版DLL位于local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll，SHA-256与2026-07-15的unpacked-manifest.json一致。SDK ADL通过-runtime加载它，原版实测不是新版AIR推断。

## C4消费边界

1. 三类实例最终runtimeBounds分别为[-50,-50,100,100]、[-60,-65,120,130]、[-57,-21,114,42]。数学fixed16仿射值、FFDec导出尺寸、AIR运行bounds分开保存，碰撞查询消费runtimeBounds。
2. 使用当前帧matrix、方向与源69×56 shape，不能用323.95的全时间轴联合宽度。
3. 保留bounds粗筛、交集宽/高至少1、buffer尺寸int化、局部原点和精确cyan语义。透明padding实测false，bitmap矩形不是实心命中区。
4. 原bitmap有1953个非零alpha像素。214A的11张67×53 PNG alpha与源bitmap左上区域逐字节一致，右2列/下3行透明；投影见collision.assetMaskProjection。旧crop=[255,0]等属于联合导出画布，不能当成bitmap源内偏移。
5. collision.sampling是原版runtime校准的有限算法：accuracy1、轴对齐、普通弹单位缩放±1、源twip坐标。861项包含目标x/y的20×20相位及双向；不宣称任意缩放/旋转/accuracy的通用Flash算法。扩大适用条件须补实测。独立检查拒绝bitmap矩形、错误翻转、普通pixel-center和floor-origin四种替代。
6. rootMapping保证给定现代中心时放置正确源形状；不声称现代height100物理与原版height130/42的落点/轨迹一致，也未修复怪物物理。中心输入合同不能混入共脚点offset。
7. 治疗由accepted驱动，不由HP decrease>0驱动；缓存成功后刷新，source是实际root/clone。生产伤害、命中预算、生命周期与P1/P2黑盒验收完整留给C4。

## 重跑

已有输入和运行环境未变时：

```powershell
python tools/verify-dragon-target-collision.py --require-verified
```

从有界源重建（输入/fixture/环境变化时）：

```powershell
python tools/generate-dragon-target-collision.py --prepare-only
python tools/run-air-collision-probe.py --original-runtime
python tools/run-air-collision-probe.py
python tools/verify-air-collision-probe.py
python tools/generate-dragon-target-collision.py
python tools/verify-dragon-target-collision.py --promote --require-verified
npm exec --yes --package ajv-cli -- ajv validate --spec=draft2020 --strict=false -s docs/reverse-engineering/ground-truth/schema/dragon-target-collision.schema.json -d docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json
```

生成器先产draft，独立检查通过才能promote。AIR调用有超时、退出码和COMPLETE计数检查；本机trace实际位于stderr，两个输出流均保存。基准为原版runtime的离屏BitmapData源对象投影，不是完整游戏截图。按需调用规则见[工具合同](../../../workflow/air-runtime-verification.md)。

## 历史反例与纠正

FFDec局部1×56画布无cyan，放大画布后出现57个cyan，不能充当原HitTest的oracle；历史raster探针保留，可用--ffdec-diagnostic单独复现。原版AIR透明padding两种平移均不命中。

此前只检查系统安装位置，遗漏unpacked已有AIR51.1.1.5。新增SDK提供ADL/编译入口，现在优先加载原版组件，无需再下载Flash Player。原始资源全程只读。

下一执行项为TASK-SLICE-214C4，消费上述输入完成真实战斗链；218不提高整族或正式可见战斗完成度。

收尾验证：218独立门禁为0，15类源/参考变异拒绝；UI与碰撞Schema通过；213回归234 cells/345基准/15变异、214A 345态零像素差/4变异通过。structure为0 error/9个既有warning；workflow通过（归档后31未完成/288已完成、15个harness测试），仅既有PlayerSlot命名warning。problem audit已集中记录PG-004/017；Python编译、diff检查通过，src无diff。未执行commit或push。
