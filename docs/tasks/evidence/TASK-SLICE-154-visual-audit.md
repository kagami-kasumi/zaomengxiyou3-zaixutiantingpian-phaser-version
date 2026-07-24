# TASK-SLICE-154 技能页反馈整改视觉审计

## 反馈与结论

2026-07-24 用户运行反馈构成本次反证基准：

- 首次打开技能页需要 3–5 秒。
- 主动技能和被动技能文字重叠。
- 不同角色可见上仍像共同使用“斩系/火系”。
- 双人场景需要炼丹炉风格的 `P1技能/P2技能`。
- 右下灵魂随 owner 切换并作为存档参数持久化。

复核确认：`skill-active.svg` 和 `skill-passive.svg` 的扁平帧仍携带 AS3 运行时本应动态创建的默认 child，`FormalSkillPageView` 又创建一次对应 child，因此视觉重复；单一 `feature-ui` bundle 还会在首次进入时加载所有功能页和五角色 150 个技能图标帧。

## 显示列表差异

| 对象 | 整改前 | 整改后 | 分类 |
| --- | --- | --- | --- |
| 250 的 240/244/248 | 扁平基底与运行时按钮各一份 | 基底只保留 236；运行时复用原按钮三态一次 | 原资源复用 |
| 868 的 597/608/865/866/867、580 | 默认悟空动态 child 残留在基底，再叠加当前角色 child | 基底只保留静态 576/577/581/584；当前角色 865、图标、按钮、等级、成本和两心法名只创建一次 | 等价动态重建 |
| 213 的五个 212 行 | 基底五行与运行时五行重复 | 基底只保留 198，五个 212 行与动态字段只创建一次 | 原资源复用 |
| 双 owner | 只有角色 selector，P1/P2 身份不够明确 | 增加炼丹炉同样式 `P1技能/P2技能` | 用户批准的现代例外 |
| 灵魂 | 当前 owner 数值位于 249 槽 | 保持 249 右下槽，文字样式与炼丹炉 owner UI 同系；数据仍来自 V5 `player*.skillLearning.soulCount` | 等价动态字段 |

没有新增面板、暗罩、通用按钮或替代技能图标。

## 角色与状态验收

- 白龙单人：显示 `千刀万刃 / 龙魂的夜宴`，五个技能为白龙专属，右下灵魂为当前槽 P1 的 `20000`。
- 唐僧 P1：显示 `愈系心法 / 水系心法`，顶部 `P1技能` selected。
- 白龙 P2：切换后显示白龙两心法与图标，顶部 `P2技能` selected，右下灵魂切换到 P2 的独立值。
- 被动页：五个 212 行、当前等级、当前效果、下一级效果、升级按钮和成本各出现一次，无文字交叠。
- V5 round-trip：`formal-skill-tests.ts` 与 `formal-game-loop-journey-tests.ts` 覆盖 P1/P2 `soulCount` 独立保存/重载；本次不升级 schema。

证据：

- `TASK-SLICE-154-role2-p1-940x590.png`
- `TASK-SLICE-154-role5-p2-940x590.png`
- `TASK-SLICE-154-passive-no-overlap-940x590.png`

## 加载边界

`feature-ui` 现在仅是空 host bundle；页面资源分别归属 backpack、pets、workshop、magic-weapon、skills-common。技能图标再按 hero 1..5 分成五个 bundle，每个恰好 30 帧并依赖公共技能 bundle。

浏览器同一 preview 运行：

- 冷首次进入唐僧技能页，在 900ms 稳定等待后完成截图，调用总历时约 1201ms。
- 首次从 P1 唐僧切到 P2 白龙，在 700ms 稳定等待后完成截图，调用总历时约 992ms。
- 两次均低于用户反馈的 3–5 秒；计时包含固定截图稳定等待，因此不作为纯网络/解码基准。

自动门禁证明进入技能页不依赖工坊、背包、宠物或法宝 bundle，且当前角色 bundle仅含自己的 30 个技能图标帧。

## 验证

- `npm run test:systems`
- `npm run build`
- `npm run check:structure`
- `npm run check:workflow`
- `git diff --check`
- 940×590 正式地图 → 技能页，白龙单人、唐僧/白龙双人 P1/P2、被动页运行观察
- 浏览器 console warning/error：0
