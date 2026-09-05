# 宠物地面环境空间真值批次

任务：TASK-SETTINGS-217。目标仅是既有五关wall对象和宠物owner根；排除敌人、刷怪、关卡结果、宠物可见图片及Stage2-3。不需要人工材料。

已从恢复level11/12/13/21/22的root第一帧选择性派生SVG/PNG基准及XML，得到43个wall和134个递归对象；对应既有stage11/12/13/21/22 layout标注行原位追加217真值引用，不新增重复stableKey或现代asset owner。

source-contract和独立binary/SVG验证结果见 `docs/tasks/evidence/TASK-SETTINGS-217/`。本批不是完整关卡视觉重新关闭；现有layout可见资源status不升级。全部原始提取集保持只读。
