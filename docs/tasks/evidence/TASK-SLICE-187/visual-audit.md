# TASK-SLICE-187 建档/选角运行视觉审计

## 结论

`SavePartyCreationView` 已直接消费 `task-settings-175i.party-creation` 的 20 对象、30 状态 verified 真值；运行时不再持有 `RoleImageX`、`RoleRegistrationX`、`RoleHitBounds` 或角色状态坐标表。940×590 运行验收覆盖人数页、1P hover、P1 selected → P2 hover、Escape 取消、双人完成与重载，浏览器 console warning/error 为 0，额外现代可见层为 0。

## 基准生成纠错

首次像素对照发现 `tools/generate-party-creation-baselines.ps1` 使用 GDI+ `DrawImageUnscaled` 合成带 alpha 的角色/marker PNG 时错误填充透明 padding，造成旧基准色块覆盖相邻卡片。运行态 Phaser 正确尊重 PNG alpha；本 task 将基准生成改为显式 source/destination rectangle 的 `DrawImage(..., GraphicsUnit.Pixel)`，重生成 30 张基准，并由 `generate-party-creation-ground-truth.mjs` 更新 manifest 中的基准 SHA-256。该修正没有改变 restored SWF 派生资产、显示列表、状态集或现代页面业务。

## 差异证据

- 对象级报告：`visual-diff.json`。每个状态按 manifest `stageBounds` 列出可见对象 RGBA 差异；对象几何与命中仍由运行时 truth adapter 读取，不复制坐标表。
- 人数 normal：`side-by-side-number-normal.png`、`overlay-number-normal.png`。
- Role1 P1 hover：`side-by-side-role1-hover-p1.png`、`overlay-role1-hover-p1.png`。
- 双人 P1 Role1 selected / P2 Role2 hover：`side-by-side-two-player-p1-role1-selected-p2-role2-hover.png`、`overlay-two-player-p1-role1-selected-p2-role2-hover.png`。

浏览器截图与 System.Drawing 基准的全舞台平均 RGBA 通道差依次为 `2.27`、`3.80`、`4.10`；高比例非零像素来自浏览器合成/颜色取整，不对应几何漂移。并排和 50% 叠图确认根、五列、角色状态与 84×84 owner marker 无可见位移，透明边缘外没有额外图层。

## 行为与 owner

- 1P 五角色与 2P 20 个有序不同组合由 `save-party-flow-tests.ts` 全量回放；P2 不能重复 P1 角色。
- 人数返回与角色 Escape 均不写槽；最终角色点击仍只调用既有原子建槽链路。
- 当前单 schema、六槽、损坏拒绝、路由和存档 owner 未修改。
- 浏览器旅程使用空槽 5 做取消回归，结束后槽 5 仍为空；双人完成/重载使用槽 4，保留为本次可复查的本地验收样本。
