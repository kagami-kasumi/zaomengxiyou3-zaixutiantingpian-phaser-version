# 214D 二三阶青龙输入预检

日期：2026-09-13。结论：碰撞输入阻塞，214D 未完成；没有新增 src 实现、修改生产资源或原始提取。

## 已确认事实与缺口

- 213/214A 已提供 dragon2/3 本体及四个效果的视觉资源；`collision-preflight.json` 保存所读文件哈希和逐对象检查：PetDragon2Bullet1 15 帧、PetDragon2Bullet2 30 帧、PetDragon3Bullet1 21 帧、PetDragon3Bullet3 10 帧，76/76 生产文件存在。不是资源缺失。
- 218 `collision-contract.json /scope/bullet` 仅为 PetDragon1Bullet1。其 handoff「C4消费边界」第5项明确采样合同仅覆盖单位缩放、轴对齐初阶普通弹，扩大适用条件须补实测。目标侧三个Sprite/12类映射仍可复用。
- `PetDragonCollisionSystem.ts` 的 `getDragonBulletCollisionBounds` 只查询218的11帧，`sampleDragonCollision` 要求固定mask尺寸并用68计算反向采样。`PetProjectileCombatBridge.ts` 仅读取各symbol第1帧纹理。四个新对象存在不同帧尺寸、crop和透明帧，不能直接照搬这组条件。
- `generate-pet-dragon-family-ground-truth.mjs:155–169` 的 `spriteFrames` 从SVG根宽高和首个g矩阵建立视觉投影。213的这些字段没有提供四个对象的原版HitTest buffer/颜色绘制采样oracle；视觉PNG像素一致不能替代碰撞采样等价。
- AS3 `BaseBullet.step2:105–134` 在末帧销毁前执行step；`FollowBaseObjectBullet.step2:26–51` 先调用super再跟随源对象的位置/方向。补证必须保留这个顺序，不用绘制后的当前位置反推本次碰撞位置。

未知：四对象逐帧的源显示树、BitmapData.draw与现有裁边PNG之间的碰撞采样映射，以及非整数根位置/左右边缘的实际HitTest结果。没有据此判废213已有动作、数值、owner或214A视觉资源，也没有发现初阶218合同失效。

## 范围裁决与交接

214D 已声明两个工作包：战斗链实现、同源消费者与验收。补齐上述源运行空间oracle是额外独立逆向工作包，命中本task「新增逆向资料族、第三独立工作包」拆分条件；按agent-protocol与task-generation，本次只登记同线补证并交接。

- `TASK-SLICE-214D` 改为Blocked，原 dragon2/3 normal/fs/sdcc/ltwj、九对象时序、P1GD、正式双人/清理验收完整保留。
- 新增唯一Ready `TASK-SETTINGS-219`，仅补四对象碰撞空间/采样；通过后恢复214D。214E及215/216保持Planned。
- P1GD没有实施或通过，不运行普通构建来替代其验收；本次文档与调度检查不证明战斗可用。
- 工作区原有 `tools/pet-dragon1-consumer-tests.ts` 和 `docs/tasks/evidence/TASK-SLICE-214C5/consumer-traces.json` 修改原样保留，未纳入本批完成证据。

协作：Luna只读核对213/AS3二三阶合同，主agent检查生产消费者和218适用边界；唯一写入owner为主agent。MO-003只记录输入范围差异，不计第三完整家族成功。

归并结果：子agent确认PetDragon2.as:326–369、PetDragon3.as:354–466的发射入口没有显式缩放/旋转，BaseBullet.as:469–475只调用水平翻转；但这不能证明嵌套显示树或采样映射。采用其“manifest没有显式child集合/HitTest字段”的核对，未把无旋转误写成可直接复用218的证明。

收尾验证：`npm run check:structure`退出0（9个既有warning）；`npm run generate:harness`和`npm run check:workflow`退出0（16个harness测试、28个未完成定义、唯一Ready219、1250条annotations和level architecture通过；保留既有PlayerSlot命名warning）；`npm run audit:problems`退出0，PG-004/017已集中记录并回写017范围缺口；`git diff --check`退出0。未运行build/P1GD或浏览器战斗验收，因为本批没有实现变更且输入尚未闭合。没有commit/push。
