# TASK-SLICE-159 940×590 正式旅程验收

日期：2026-08-03

## 范围与边界

- 浏览器：Codex 内置浏览器，固定视口 `940×590`，production preview。
- 使用隔离的 `http://localhost:4174` origin 新建临时槽 6：2P、P1 唐僧、P2 白龙；验收后通过启动页二次确认删除，仅保留既有槽 1。
- 本任务不新增 V7，不检查或持久化动画帧、攻击阶段、冷却等单局临时状态；设置继续使用独立全局 `zaixu-global-settings-v1`，其余数据使用六槽 V6。
- 页面视觉沿用 066A..D、067、069A..E 与 155A..D、156A..C、158A..E 已归档显示列表/原版基准；本次只做正式旅程回归，不新增可见对象或现代视觉例外。

## 运行证据

| 状态 | 证据 | 观察结果 |
| --- | --- | --- |
| 设置跨重启 | `restart-settings.png` | 天庭地图把难度从“普通”切为“困难”；刷新回启动页、重新读取槽 6 后仍显示“困难”。 |
| 丹药页 | `immortality.png` | 正式地图入口进入原生丹药页，双 owner selector 与 25 格可见。 |
| 商城页 | `shop.png` | 正式地图入口进入原生商城，分类、九卡、数量/购买、P1/P2 与灵魂区可见。 |
| 任务页 | `tasks.png` | 正式地图入口进入日常任务页，五行、详情、奖励、分页与领取区可见。 |
| 双人进关 | `stage11-role2-role5.png` | 重启读取的唐僧/白龙进入 Stage 1-1；两套真 body/HUD、Stage 1 怪物按关资源与脚底投影正常。 |
| 关卡功能页 | `stage11-p2-backpack.png` | P2 pointer 从战斗打开原生背包，owner 为 P2，关闭返回同一关卡。五入口/P1/P2/门禁由专项旅程覆盖。 |
| 清理 | `temporary-slot-cleanup.png` | 槽 6 经二次确认删除并恢复为空槽；既有槽未修改。 |

所有上述状态及重载、进入 Stage 1-1、打开 P2 背包后的浏览器 console `warning/error` 均为 0。

## 自动旅程对应

`tools/pre-stage23-save-journey-tests.ts` 在单一连续场景中覆盖：

- 六槽 V6 新建/选中与新 storage 实例重启；
- 丹药 P1 服用、P2 炼制，商城 P1/P2 购买，双方技能事务与共享任务领取；
- 关卡内设置/背包/技能/法宝/宠物五入口和 combat-origin 返回；
- Stage 1-1 结果提交、1-2 解锁与地图读取；
- 全局设置独立持久化，V6 不混入动画/攻击阶段/冷却字段；
- 损坏槽可见、拒绝选中/覆盖，且不改变活动有效槽。

角色资源分包、Stage 1 怪物按实际关卡拆包、脚底/root、普攻挂点/注册点/方向与共享普攻视觉生命周期继续由 `asset-bundle-tests`、`five-stage-monster-visual-regression-tests`、`hero-combat-visual-coordinate-tests`、`remote-normal-attack-tests`、五角色视觉专项及全系统门禁承载。
