# TASK-SLICE-155A 丹药页视觉与运行验收

## 基准与环境

- 原版基准：`original-root-940x590.png`、`original-exchange-940x590.png`，来源为
  restored `assets/OtherMat1.swf` character 990/1006 的既有只读派生物。
- 现代运行：Vite production preview，Phaser 画布逻辑尺寸与浏览器验收尺寸均为
  940×590。
- 现代截图：`modern-normal-940x590.png`、`modern-exchange.png`、
  `modern-reject-material.png`、`modern-owner-p1-selected.png`、
  `modern-hover-back.png`、`modern-return-map.png`。
- 冷启动复验：`modern-fresh-load.png`；最终共享 25 丹药图标 bundle 复验见
  `modern-shared-bundle-load.png`，冷进入约 1.35 秒，console error/warning 为 0。

## 逐状态结论

| 状态 | 结果 | 证据 |
| --- | --- | --- |
| normal | 通过 | 原 940×590 背景、五行五列、加成栏、灵魂栏、返回和炼制入口均保留 |
| hover / pressed | 通过 | 四类按钮直接使用 character 968/973/989/997 的 up/over/down 派生帧；`modern-hover-back.png` 记录返回 hover，专项测试验证三态资源存在 |
| selected | 通过 | 双人存档按原顺序默认 P2；`modern-owner-p1-selected.png` 证明点击后 P1 frame 2、P2 frame 1 |
| 已服用 / 可服用 / 锁定 | 通过 | 根资源移除静态导出中构造期会隐藏的 25 个 `eatbtn`；运行时只按连续前缀、持有物品和已服用标志添加按钮或真丹药图 |
| 炼制弹窗 | 通过 | `modern-exchange.png`；全舞台阻挡、五配方、五按钮和关闭按钮来自 character 1006/989/997 |
| 拒绝提示 | 通过 | `modern-reject-material.png`；按原 `Infomation` 黑字、白色 glow、居中上浮边界显示“道具不足” |
| 双 owner | 通过 | P1/P2 选择器直接使用各职业 frame 1/2；专项测试证明灵魂、背包、5×5 标志互不串写 |
| 返回 | 通过 | `modern-return-map.png`；返回 character 973 回到同一正式 HeavenMapScene |

## 稳定区域差异

- `stable-region-diff.png` 使用每通道合计差异阈值 48；排除 25 个动态格、五个效果
  TextField、P1/P2 selector 和灵魂字段。
- 稳定像素 321,000；超阈值像素 24,560（7.651%）；平均每通道差异 4.84。
- 超阈值像素集中在浏览器 SVG/JPEG 与 Flash PNG 的文字、斜线和图像边缘抗锯齿。
  差异图未显示整体位移、错误缩放、缺失静态对象或现代覆盖面板。

## 可见对象差异清单

| 对象 | 处理 | 差异 |
| --- | --- | --- |
| character 990 根静态层 | 原资源复用 | 仅机械移除构造期隐藏的 `eatbtn` 与运行时 TextField |
| character 968/973/989/997 | 原资源复用 | 无 |
| character 218/223/228/233/871 | 原资源复用 | owner 内部身份改用稳定 `PlayerSlot`，可见帧不变 |
| 25 个丹药格 | 原格底 + 原物品真图标动态组合 | 无现代占位 |
| 灵魂与五项加成 | 等价 TextField 重建 | 浏览器字体栅格化存在容差 |
| `Infomation` 提示 | 等价 TextField 重建 | Phaser stroke 近似 Flash GlowFilter 的栅格边缘 |
| 即时保存 | 现代可靠性选择 | 无额外可见层；成功事务立即写活动槽 |

允许的现代视觉例外仍为零；上表后两项是既有动态文字的等价重建与已批准的持久化时机
差异，不是新增现代页面。

## Goal 规模记录

- 实际保持两个主工作包和两个验收批次。
- 首次 compact 发生时实现、资源、浏览器逐状态证据、专项、全系统与 build 已完成；
  compact 后只做文档归档、治理反馈和既定检查，按 PG-008 记为受控收尾。
