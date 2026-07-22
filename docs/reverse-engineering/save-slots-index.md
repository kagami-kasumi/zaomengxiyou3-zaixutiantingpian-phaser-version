# 启动与存档槽逆向索引

本页是 `TASK-SETTINGS-056` 的实现输入，范围为 EXE 启动、六槽展示、新建/读取/覆盖、异常边界与后续地图路由。原版没有删档入口；正式现代流程要求的删除与损坏反馈属于明确的现代设计选择。

## 待证明的可观察问题

1. EXE 完成加载后先出现什么页面，新游戏与继续游戏各走什么顺序？
2. 存档槽有几个，空槽、有效槽和读取失败分别显示什么？
3. 新建、读取、覆盖和删除各自何时改变持久化数据？
4. 原版存了哪些玩家、关卡和时间字段，如何写入磁盘？
5. 读档后如何选择天庭地图；新游戏如何进入开场流程？
6. 现代 V1/V2/V3 与损坏 JSON 应如何映射到正式多槽页面？

## 六段证据矩阵

| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |
| --- | --- | --- | --- | --- | --- | --- |
| 启动页 | `GMain.as:517-530,611` 创建 `export.GameMenu`；`GameMenu.as:135-151` 暴露“继续游戏/新的开始” | 加载完成调用 `switchSence("GameMenu")`；新游戏重置全局数据，继续游戏创建读档 `SaveInter` | `OtherMat1.swf` character 1149，单帧导出含 940×590 左侧主菜单；右侧 1P/2P 子菜单在同一 1574.8×591 导出边界内 | 交叉确认 | 启动广告/加载器动画不属于本切片；若 EXE 运行录像显示其他中间页则补链 | 源码顺序测试 + 真资源运行观察 |
| 六槽与三种槽态 | `SaveInter.as:55-92,132-206` 固定 `btn_0..btn_5`，先写“空存档”，成功解码后写角色名、等级、P2 和 `saveDate`；异常被 `catch` 吞掉 | 每槽读取 `gameData/<0..5>.sav`，解密、最多十次解压、`decXml` 后消费 | `Common1.swf` character 69，单帧 940×590；槽面板约位于 x=204..728、y=172..471，2 列×3 行 | 交叉确认 | 原版把损坏槽留成“空存档”，无法区分空槽；现代必须显示损坏态 | 枚举/解析专项测试 + 三种槽态截图 |
| 读取 | `SaveInter.as:207-246` 仅非空槽可读，调用 `storageValue(0,data)` 并记录 `saveId` | `MemoryClass.storageValue():164-167` 设 `opening=true`；`GameMenu.showAndHide():188-196` 调 `getStorage()` 后进入角色选择完成链 | 点击区域就是六个槽按钮；无额外坐标换算 | 确认事实 | 外部 `FileReference` 导入不纳入正式槽页 | 槽隔离测试 + 重启恢复运行观察 |
| 新建/覆盖 | `SaveInter.as:217-265,302-305` 空槽立即保存；有效槽打开 `IsCover`，确认后覆盖 | `MapMenu.as:209-223` 首次保存打开 `SaveInter(state=save)`，已有槽则直接 `memory.saveGame(saveId)`；`MemoryClass.saveGame():183-216` 压缩/加密并写同一槽文件 | `Common1.swf` character 18 为 940×590 单帧覆盖确认层，中心对话框约 x=322..647、y=253..354 | 交叉确认 | 原版新游戏并非启动即选槽；现代槽优先创建是产品流程选择 | 空槽/有效槽写入与取消覆盖测试 + 对话运行观察 |
| 删除 | `SaveInter`、`GameMenu`、`MapMenu` 未找到删除按钮或删除文件调用 | 原版共享存储链只发现读取、写入与外部导入 | 不适用：恢复的槽页与覆盖框无删除控件 | 现代设计选择 | 新证据若定位到独立删档工具则重新分级；当前不得称为原版行为 | 删除确认/取消/槽隔离专项测试 |
| 数据与版本 | `User.getSaveObj():628+` 保存角色、等级经验、技能、装备、宠物、任务、日期等；`MemoryClass.setStorage():124-161` 保存 P1/P2、关卡和全局旗标，版本固定 1 | `MemoryClass.getStorage()` 恢复全局与两个玩家；版本不等于 1 时关闭原生窗口 | 不适用：序列化字段没有坐标语义 | 确认事实 | 原版没有现代 JSON V1/V2/V3；浏览器 storage key 不是原版文件名 | V1/V2/V3 迁移与字段清洗测试 |
| 后续路由 | `GMain.SelectRoleOver():409-432`：读档 `opening=true` 时按 `whichlastworld` 进入对应地图；新游戏进入开场动画 | `GameMenu.selectNum()`：新游戏触发 `StartSelectRole`，读档触发 `SelectOver`；`storageValue` 是两路分界 | 场景路由，不适用几何 | 交叉确认 | 正式天庭地图仍由 `TASK-SETTINGS-057/TASK-SLICE-133` 闭合；本切片暂路由现有 Stage 1 入口 | 路由合同测试 + 启动到入口运行观察 |

## 原版可观察合同

- EXE 加载完成后显示 `GameMenu`。
- “新的开始”先清空当前会话并选择 1P/2P，再选择角色；第一次真正保存通常从地图菜单打开六槽保存页。
- “继续游戏”直接打开六槽读取页。槽索引为 0..5，画面编号为 1..6。
- 有效槽至少展示角色名、等级与保存日期；双人档追加 P2 信息。读取/解码失败被静默捕获，画面仍保持“空存档”。
- 空槽保存立即写入；覆盖有效槽必须经 `IsCover` 确认。原版没有已证实的删档入口。
- 读档将 `opening` 置真，恢复全局和玩家后按上次世界进入地图；新游戏走角色选择和开场动画。

## 正式现代状态机

```text
Boot
  -> SlotSelect
       empty --create--> CreateProfile --confirm--> write(slot) -> Stage1Entry
       valid --load--> parse/migrate -> select(slot) -> Stage1Entry
       corrupt --inspect--> CorruptFeedback --delete confirm--> empty
       valid --delete--> DeleteConfirm --confirm--> remove(slot) -> empty
                                      --cancel--> valid
```

现代合同：

- 保留原版六槽数量与 1..6 的玩家可见编号；内部 id 为 0..5。
- 页面扫描必须区分 `empty | valid | corrupt`。损坏数据绝不自动当空槽覆盖，必须给出可见反馈，只允许显式删除后重建。
- 新建只在选定空槽写入默认 V4；所有运行时保存始终写回当前槽，槽间 key 完全隔离。
- V1/V2/V3 读取后返回 V4，并把迁移后的 V4 原位写回；V4 也经过 sanitizer。旧档保持已有 P1 与双方宠物，缺失的库存和 P2 成长/技能/装备使用安全空默认；未知版本归为 `corrupt`。
- 兼容既有单槽 key `zaixu-tianding.save.v1`：仅当六槽全空且旧 key 可解析时，一次性导入槽 0；导入成功后删除旧 key。旧 key 损坏时保留并报告，不静默删除。
- `TASK-SLICE-132` 暂把成功新建/读取路由到现有 `Stage11EntryScene`；天庭地图属于下一组任务，不能在本切片宣称闭合。

## 现代持久化映射

| 原版概念 | 现代 owner | 映射 |
| --- | --- | --- |
| `gameData/<slot>.sav` | `SaveSlotSystem` | `zaixu-tianding.save.slot.<0..5>` 六个独立 key |
| `saveId` | 当前槽选择 | sessionStorage/内存中的 slot id；所有 `SaveSystem` 调用按当前槽解析 key |
| `player1_obj/player2_obj` | `GameSaveV4.player1/player2` | 双方同构保存成长、技能、库存/装备、宠物；只存稳定 id/数量，不复制 AS3 或 runtime 对象 |
| `saveDate` | `savedAt` | ISO 时间；页面格式化展示，非法时间仍可安全展示占位 |
| 版本 1 | V1/V2/V3 → V4 迁移器 | 原版版本号与现代 schema 版本无数值等价关系 |
| 静默损坏为空 | `corrupt` 槽态 | 显式反馈与确认删除，拒绝误覆盖 |

## 真资源与坐标语义

- `assets/OtherMat1.swf` character 1149：`export.GameMenu`，源注册坐标按 940×590 舞台；组合导出包含主菜单与被移到右侧的模式选择控件，现代页只裁取/复用主菜单可见区。
- `assets/Common1.swf` character 69：`export.saveInterface.SaveInter`，940×590 单帧组合层，黑色毛边遮罩、六槽面板和关闭按钮均保持源舞台坐标。
- `assets/Common1.swf` character 18：`IsCover`，940×590 单帧透明叠层，中心覆盖确认框保持舞台坐标。
- SymbolClass 与 SVG/PNG 选择性派生证据位于 `local-resources/regima/task-outputs/task-settings-056-save-slots/`；源 SWF 未修改。

## 未知、排除和实现验收

- 未知：原版是否存在主 UI 之外的隐藏删档工具。当前代码与恢复视觉均无证据，不影响现代显式删除合同。
- 排除：云存档、账号同步、外部 `.sav` 导入、加密/随机压缩复刻、完整天庭地图和角色选择页。
- 确定性验证已通过：六槽扫描、空/有效/损坏、槽隔离、新建/读取/显式删除、V1/V2/V3 → V4、双 owner 功能域、未知库存定义清洗、旧单槽导入、当前槽写回和正式路由均有专项测试。
- 运行时验证已通过：940×590 下启动/六槽页、空槽创建、有效槽读取、损坏拒读、删除确认与删除后空槽恢复可见，真资源未遮挡交互文本。浏览器安全策略阻止自动刷新；重新实例化后的持久化恢复由专项测试覆盖，不将该限制冒充人工刷新样本。
