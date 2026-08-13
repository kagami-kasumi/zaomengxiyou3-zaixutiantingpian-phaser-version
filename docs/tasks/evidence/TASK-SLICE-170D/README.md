# TASK-SLICE-170D 全装备正式 UI 校准证据

## 真值直连

- 权威输入：`truthId=task-settings-170b1.equipment-page`，状态 `verified`，63 个对象、9 个状态、`unresolved=[]`。
- 运行投影：`src/generated/EquipmentPageTruth.generated.ts` 由 `tools/generate-equipment-page-runtime-truth.mjs` 从权威 manifest 可重复生成，并绑定源 SHA-256 `3a9fa7e63254e80f709c318827a61f9a4774682f1fae38b25114fae2cf194aa0`。
- 正式页面：`FormalInventoryPageView` 通过 `EquipmentPageTruthSystem` 按对象 ID 读取 stage/local matrix、bounds、命中尺寸、父子/depth 与逐状态可见性，不再维护页签、25 格、六槽、字段、按钮或操作层的第二份坐标表。
- 回测：`test:equipment-page-truth` 校验 Schema/hash/63 对象/9 状态/父子链/计数；`test:equipment-page-runtime-truth` 防止精简投影漂移；`test:formal-inventory` 验证正式消费者。

## 逐状态运行证据

- `p2-role4-arrow-940x590.png`：P2、Role4 箭分支、六槽与独立 owner。
- `p1-role4-role4-shovel-940x590.png`：Role4 铲分支。
- `p1-role5-role5-frame-940x590.png`：Role5 动态 frame。
- `p1-role1-character-520-940x590.png`、`p1-role1-character-521-940x590.png`：跨包 character 520/521。
- `p1-role1-title-940x590.png`：13 个正常称号中的代表 overlay。
- `p1-page-2-940x590.png`、`p1-equipment-operation-layer-940x590.png`：分页与 610 操作层。
- `page-closed-940x590.png`、`page-reentered-940x590.png`：关闭销毁与再入。
- 全部图片以原舞台 `940×590` 保存；运行矩阵 console warning/error 为 0。

五角色、P1/P2、空/已穿戴、穿上/卸下、时装显示/隐藏、page 1/2、610/358、关闭/再入由 URL QA fixture 与自动测试共同覆盖。164 身份、111 character、Role4/Role5、520/521、13 个正常称号、37 个 `no-head-preview-change` 项以及 `fmtstx/mksddf` 原缺陷由 `test:equipment-preview` 与 `test:equipment-page-qa` 全集回归，不以代表截图代替数量证明。

## 原版/现代差异

- `original-modern-side-by-side.png`：170B1 原版 304 稳定根与正常称号现代态并排。
- `original-modern-overlay-50.png`：同尺寸 50% 叠图。
- 字体栅格、浏览器抗锯齿与动态 fixture 数值不作像素相等要求；固定根、对象几何、资源身份、可见状态和操作生命周期按真值/目录比较。
- 可见对象差异：63 个 scope 对象均由原资源或原动态字段投影；允许的现代可见例外为空。
- 原缺陷：`fmtstx` 背包图标查找与 `mksddf` 称号 overlay 继续保留，不增加替代层。

