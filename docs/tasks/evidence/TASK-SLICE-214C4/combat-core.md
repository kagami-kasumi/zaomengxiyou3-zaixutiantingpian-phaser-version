# C4 碰撞与伤害消费进度

状态：实现已接入生产 Runtime 与正式 updatePets，C4合同审计与归档已完成；本文件记录已验证范围，不能据此关闭 C5 或父级完整链。

- `PetDragonCollisionSystem.ts`消费218 verified contract，按monster实例bounds和弹当前帧转换世界坐标，使用已校准的左右向像素采样。原版AIR的861个输入逐项比较接受结果及cyanPixels，总计970153个非透明交集像素一致；此数不同于218比较的全部buffer像素数。
- `PetDragonDamageSystem.ts`保留hurt与atk分别int截断、两次启用暴击的getRealPower调用、成功后刷新再回调、拒绝不刷新，以及物防相等时伤害0。
- `Stage1CombatSystem.resolveStage1PetHit`新增显式sourceBullet输入，复用原有HP、来源、反馈和audit owner；支持保护拒绝不消耗ID、Dodge拒绝消耗ID、接受0伤害返回event。既有调用未提供该参数时保持旧路径。Dodge概率/保护状态必须由后续实际消费者提供，不能把接口存在等同于原版状态已接入。
- 默认注册器已注册 Dragon1PetBehavior；真实 Runtime 驱动 normal/fs、逐 host tick 弹体、生成时复制数值的私有实体、命中自疗、自然到期 root 治疗与提前死亡清理。弹体仍存于公共 ProjectileSystem，带 petHostTick 的弹体由实体效果步骤推进，通用更新与通用碰撞跳过以避免重复处理。
- runtime-traces.json 来自生产 Runtime/Session/Behavior/Combat：20/24/30fps 普攻时序，P1/P2 分身来源与到期，生成时数值、独立被动、提前死亡、零伤害接受、保护/闪避拒绝、GXP hurt 条件、末帧碰撞与长渲染帧一致性。damage 单测另核对旧缓存消费→刷新→治疗顺序与整数伤害。
- 新增测试直接执行 HeroPartyRuntimeBridge 的 updatePets 生产闭包，只擦除 TypeScript 类型；两个真实青龙共用弹体存储、敌人模型和 Combat，各造成97伤害、各自HP从500升至538，来源分别为p1-dragon/p2-dragon，最后命中归p2。此测试不覆盖 Phaser 画面。
- coordinate-runtime.json 保存实际编译的 AS3 字节内容及 SHA256、描述文件、SWF SHA256、运行命令和原包 AIR 输出。15个正负小数样本证明 Sprite 坐标朝零截断至1/20像素，生产碰撞入口与发射/分身坐标据此转换；没有重跑输入未变的218采样。
- 结构 warning 文件只作窄接线：ProjectileSystem 跳过私有 host 时钟弹体，TestSceneWorldBridge 跳过同类弹体的通用命中，HeroPartyRuntimeBridge 传入共用 Combat 与实际敌人。青龙算法保留于独立 systems/Behavior，不向大文件增加家族实现。

可重跑：

```powershell
node tools/run-system-tests.mjs pet-dragon-collision-tests pet-dragon-damage-tests pet-dragon1-runtime-tests pet-dragon1-mutation-tests stage1-combat-tests pet-dragon1-clock-tests
npm run check:system-design -- pet P1GS
```

已通过：上述碰撞、伤害、生产 Runtime 与双人接线测试；P1GS保持猴马及公共实体接缝回归。最终检查与合同审计见handoff.md。C5继续承担正式可见层、TestScene实际敌人适配、完整生命周期逐状态验收与P1GC；当前不宣称这些已完成。敌人 sourceHitProtection 接口支持实际瞬态状态，但尚不证明所有怪物原版保护技能已实现。不要重跑输入未变的AIR采样；复用218独立源证据。
