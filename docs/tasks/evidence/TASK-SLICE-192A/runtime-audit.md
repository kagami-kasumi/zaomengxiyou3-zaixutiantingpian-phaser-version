# TASK-SLICE-192A 正式运行验收

日期：2026-08-17

## 自动旅程

- 当前 schema 双人槽冷启动并重建 storage 实例。
- 天庭地图 route catalog 覆盖 `TestScene`、`Stage12Scene`、`Stage13Scene`、`Stage21Scene`、`Stage22Scene`。
- 每个 Runtime 对 P1/P2 执行宠物入口→932 页面→第二页→selected→出战→休息→放生确认取消→关闭返回→重开；再次重建 storage 后 owner、选中项和 10 宠物 roster 保持。
- bundle、page-assets、render 三阶段失败均断言同一 `feature-ui-failed` payload。

## 940×590 非 QA 运行

- 入口：`http://localhost:4174/`，不带 `qaStage`、`players` 或功能页直达参数；从启动页读取双人存档 4，经天庭地图进入 Stage 1-1。
- P1：左侧 character 573 pointer 打开 932；页面显示小猴、出战态、属性与两个技能。技能图标 hover 显示原生 tooltip，关闭按钮返回原关卡。
- P2：右侧镜像 pointer 打开同一 932；休息、重新出战、放生确认与取消均可见并保持 P1/P2 页面生命周期隔离。
- 重载：关闭页面后整页 reload，重新从存档 4→地图→Stage 1-1，P2 页面仍可打开且事务状态持久。
- console：完整旅程 warning/error 为 0。

## 视觉与差异

- 继续消费 `task-settings-175a.pet-page` 的 74 对象/16 状态 verified 真值和 191 同版本 940×590 基准。
- 可见对象、坐标、皮肤和允许的现代视觉例外均无变化；本 task 的代码增量只有失败信号与自动旅程门禁，因此可见差异为 0。
- character 662 战斗宠物 HUD 仍未在本 task 实现，明确留给 `TASK-SLICE-192B`。
