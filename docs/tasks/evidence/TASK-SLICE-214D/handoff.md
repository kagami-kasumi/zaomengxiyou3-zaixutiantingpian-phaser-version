# 214D 二三阶青龙战斗交接

用户后续验收偏好（2026-09-13）：用户实际观察后认可当前效果，明确表示“无需严格坐标对齐了”。后续视觉工作以可见效果和玩法体验为验收重点，不再仅为逐像素/严格坐标一致追加大量补证；已有精度差异记录保留，不把近似改写成原版精确事实。

本批完成 dragon2/3 的 normal、fs、sdcc 与九对象 ltwj。沿用单个 PetCombatRuntime 内的 EntitySession、Behavior、公共地面移动、共享弹体存储/伤害端口与同一个生产 presenter；四阶及全44项家族关闭由214E承担。

## 实现与可重跑证据

| 合同 | 生产入口与证据 |
| --- | --- |
| 二三阶时钟 | PetDragonAnimationClock按动作ID消费213；normal第7/5 host tick、fs第17、sdcc第7、ltwj第15触发；20/24/30fps runtime-traces与独立source-contracts |
| 继承普攻/fs | Dragon1PetBehavior按form复用；真实同形态私有实体，出生复制当时HP/MP/atk/def/level，独立伤害/被动/CD，10秒到期治疗与早死/离场释放沿用C4合同 |
| sdcc | 3秒初始CD、3.6秒后续CD、20MP、300范围；body hit3 / bullet hit2，30帧、8tick重置命中，物理伤害和命中自疗；公共地面Session消费动作速度10，碰撞→末帧/受伤清理→主人位移及朝向追随 |
| ltwj | 5秒CD、20MP、500范围；body hit4 / bullet hit3，捕获初始世界点和朝向，0/200/400/600/800ms生成1+2+2+2+2对象；各10帧、魔法伤害、独立命中自疗，延迟对象生成时读当前数值 |
| 数值 | PetDragonDamageSystem保留先消费缓存、接受后刷新两次crit读取，再回调治疗；MonsterDefinitionCatalog补当前早期关卡出生魔防0.2，Monster6为0.25；Stage1真实结算测试normal97、sdcc336、ltwj624，不用最终HP下降替代公式 |
| 碰撞 | 219四效果76帧/152方向、54场/505平面，经纯生产采样器重跑6448原版case；全部命中布尔一致，仅104个已批准像素残差。blank先返回；不读首帧PNG代替逐帧场 |
| 正式/TestScene | consumer-traces执行真实updatePets闭包、双slot Session、Stage1Combat与真实Monster30读写adapter；12组form×入口×离场原因，真实HP/hurt/owner、私有实体、休息/换宠/另一slot保留及释放 |
| 可见投影 | 同一presenter174状态940×590对原版基准零像素差，5种视觉变异拒绝；view-projections、visual-diff、projections与contact-sheet。浏览器证据见runtime-audit.md |
| 防回归 | P1GD复用P1GC/P1GS及猴马门禁；增加6448原版碰撞、独立时钟/数值/波次、9种实现变异、真实双人消费者与174状态投影 |

## 源事实修正及明确边界

- 用户2026-09-13明确批准“允许记录近似后实现”。这仅允许219四效果碰撞近似，不改变美术、数值、动作时钟或来源。exact AIR内部采样仍未建模，219 strict仍不能通过；不得把6,448有限样本当作普遍像素等价证明。
- 213的左向nine-object-wave基准原来把世界偏移也翻转，改变对象重叠顺序；本批按PetDragon3.doHit4原顺序修正这一张基准及索引哈希，345总状态不变，源图和生产资源均未修改。174态与插入顺序反例拒绝形成补强。
- BaseBullet继承MovieClip，构造函数设置imcName而未覆盖自动实例name；getAttackId使用实例name+owner攻击号，所以九个对象各自独立命中。没有把效果symbol当共同攻击ID。
- 普通弹及ltwj不因hurt取消；sdcc跟随弹在当帧碰撞后按hurt清理。死亡时共享Session停止行为推进，dead-complete/休息/替换/离场统一销毁私有效果与尚未发出的波次。脱离owner仍保留原Tween回调不属于现代实现；沿用C4既有资源释放边界。
- 魔防仅补当前早期关卡默认出生定义；stage9、困难模式附加防御、endless不在现有消费者范围。瞬态保护继续使用既有sourceHitProtection端口，不宣称所有怪物保护技能已实现。
- TestScene旧手动路径对form1..3退出，同一Runtime接管；form4留给214E。视图不持计时/技能/伤害，也未修改存档schema或公共设计。
- Luna只读审计提供源定位；其“坐标被放大”和“九对象同名去重”判断经精确函数/构造源码复核不成立，未据此改动。最终以原版oracle、源隔离数值与实际生产trace裁决。

## 重跑

```powershell
npm run check:system-design -- pet P1GD
npm run test:pet-dragon-family-truth
npm run test:pet-dragon-assets
npm run test:systems
npm run build
npm run check:structure
npm run check:workflow
npm run audit:problems
python tools/verify-dragon23-contract.py
git diff --check
```

下一执行项214E。先复用本批同源实现和已批准四效果范围，四阶新增效果仍须满足自己的输入合同；不得把批准近似扩大至未批准对象。系统设计保持实施中/未退出，P1G/all未通过，MO-003不增加完整第三家族成功样本。建议完成提交后在新对话执行214E；本次未执行Git提交或上传。
