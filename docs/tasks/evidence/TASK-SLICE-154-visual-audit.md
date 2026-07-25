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

## 2026-07-24 心法选择器图片反馈修正

用户复验指出五角色的两棵心法均没有左侧选择器图片。复核显示列表后确认：

- character 597 `xf1mc` 与 character 608 `xf2mc` 各有 5 帧，分别对应悟空、唐僧、八戒、沙僧、白龙；
- 既有实现只创建了 `(57.65,151)` / `(57.65,351)` 两个透明点击区和心法名称，未导出、加载或渲染 597/608；
- 本次从只读 `assets/OtherMat1.swf` 选择性导出 597/608 共 10 个 SVG，按当前角色帧接入技能公共 bundle，并在原注册坐标渲染；
- 右侧 50 个技能图标、技能规则、存档和 owner 合同未改变。

自动门禁逐项断言 597/608 frame 1..5 均归属技能公共 bundle。940×590 正式地图 → 悟空技能页确认“斩 / 火”两张心法图可见，console warning/error 为 0；证据为 `TASK-SLICE-154-heart-method-selectors-940x590.png`。

## 2026-07-24 跨功能灵魂余额反馈修正

用户复验指出技能页与炼丹炉右下角灵魂数目不一致。复核显示列表与运行时后确认：

- 工坊 `container.png` 把原动态数字槽扁平化为 `1234567890`，旧 view 没有在该位置投影当前余额；
- 技能页独立绘制当前余额，两个页面没有共享可见组件；
- `FeatureUiScene` 跨页继续保留目标页面旧 model，消费后返回页面存在显示旧余额及旧快照回写风险。

本次新增 `FormalSoulBalanceView` 并让跨页目标 model 从当前 V6 存档重建。首轮以不透明黑底覆盖工坊占位数字，但用户继续复验指出黑底侵入技能页“灵魂”标签且数值不像原版，因此该现代例外判断作废。

重新从恢复源调查确认：

- 技能 character 250 的 `txtlh` 为 character 249，舞台矩形 `(805.95,544,135×31.7)`；
- 工坊 character 119 的 `txtlh` 为 character 103，考虑根 `x=-0.45` 后舞台矩形 `(801.55,550.15,135×31.05)`；
- 两个字段都使用 `FZCuYuan-M03`、白色、无描边、右对齐数值，不含不透明底板。用户再次复验指出仅声明字体名仍会回退到浏览器系统字体，Canvas 字号和基线也不等于 Flash。

最终从只读 `assets/backpack1.swf` 选择性派生 character 119 SVG，只移除动态 `txtlh` 实例后接入 `container-native.svg`；技能基底此前已用同样规则移除 `txtlh`。共享组件不再使用浏览器文字，而是直接复用 DefineEditText 103 嵌入的 0–9 矢量轮廓，保留原版 `0.0244` 缩放、22px 基线、逐字 advance 与 135px 字段右对齐；两个页面只保留各自源实例坐标差异。

自动专项覆盖共享组件、源几何/样式、工坊底图无 `txtlh`、跨页五类 model 重建与跨功能消费重载。940×590 运行证据：

- `FORMAL-SOUL-BALANCE-skills-original-ui.png`
- `FORMAL-SOUL-BALANCE-workshop-original-ui.png`

两页均显示 14900；技能“灵魂”标签完整，工坊无 `1234567890` 残留，两页均无黑条，console warning/error 为 0。
