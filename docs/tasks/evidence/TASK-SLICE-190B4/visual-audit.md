# TASK-SLICE-190B4 视觉验收

- 视口：940×590；入口：localhost-only `qaEquipmentPage=workshop&qaEquipmentCase=making-tooltip`，正式 workshop model/view。
- 原版基准：189 tooltip source replay、167 making verified manifest、175F 商城 verified manifest；现代视觉例外为空。
- P1 成功：放入 `whgzzs` 制作书与 `sms1` 宝石后提交，灵魂 1000→800；`makeObj` 悬停显示当前“尾火棍”实例的品质、类型、生命、攻击、防御、说明与价值。
- P2 成功：独立 owner 同流程通过，产物实例属性按本次随机结果显示，灵魂 1000→800。
- 排除：制作书、需求材料、三个宝石槽、空产物和 0 灵魂拒绝后的 `makeObj` 均无 tooltip；右侧 grid 仍只对 equipment entry 启用 hover。
- 生命周期：pointerout 清除；返回销毁页面，C 重开后无陈旧产物/tooltip，已暂存制作书按既有事务返回。
- 商城负合同：`FormalShopItems.length === 49` 且与 `AuthoritativeEquipmentCatalog` 交集为空；`ShopScene` 不依赖/创建 equipment tooltip，189 `shop-fashion-disabled` 状态继续为 0 面板。
- fresh console warning/error：0；临时 viewport 已在验收后 reset。
