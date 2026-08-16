# TASK-SLICE-185 设置页运行差异证据

## 输入与环境

- 原版真值：`task-settings-175g.settings-page`，manifest SHA-256
  `726a7f496cb9052ec00ce87807cb7ad2565480d7e067ba18724bc22363f772bd`，状态 `verified`，
  19 对象、23 状态、`unresolved=[]`。
- 原版基准：`docs/tasks/evidence/TASK-SETTINGS-175G/original-*-940x590.png`。
- 现代运行：2026-08-16，`npm run preview` 的 `http://127.0.0.1:4174/`，浏览器 viewport
  固定为 940×590；从现有 1P 存档进入天庭地图并点击原设置入口。
- 差异生成：`python tools/generate-settings-page-runtime-evidence.py`，为 normal、hover、循环、死控件、
  重开五个代表状态生成 1880×590 并排、50% 叠图、像素差和边缘差图；全部稳定状态保留现代截图。

原版结构基准是未执行构造器的 character 148 帧 1，因此五个 character 145 均显示时间轴占位
“示 例”；现代运行态前四项按 `refreshTxt` 合同显示真实值，第五项仍显示“示 例”。原版 148
面板外是透明全舞台命中面，现代截图则保留真实地图宿主；面板外地图差异不计入 148 稳定区域。

## 23 状态覆盖

| manifest 状态 | 现代证据 | 判定 |
| --- | --- | --- |
| `normal-default` | `modern-normal-default-940x590.png` | 19 对象投影；前四项运行值与第五项死控件正确 |
| `difficulty-hover` | `modern-difficulty-hover-940x590.png` | value 文字黄色，命中仍为 146 的 104×34.1 |
| `difficulty-pressed` | 同 `difficulty-hover` + `formal-settings-tests` 禁止 value `pointerdown` | 原版无独立 pressed，按住继承 hover |
| `difficulty-hard` | `modern-difficulty-hard-940x590.png` | 第一次循环为“困 难” |
| `difficulty-hell` | `modern-difficulty-hell-940x590.png` | 第二次循环为“地 狱” |
| `difficulty-normal-cycle` | `modern-difficulty-normal-cycle-940x590.png` | 第三次回“普 通” |
| `bgm-hover` | `modern-bgm-hover-940x590.png` | value 文字黄色 |
| `bgm-pressed` | 同 `bgm-hover` + 无 value `pointerdown` 门禁 | 原版无独立 pressed |
| `bgm-off` | `modern-bgm-off-940x590.png` | 显示“关 闭” |
| `bgm-on-cycle` | `modern-bgm-on-cycle-940x590.png` | 回到“开 启” |
| `skill-off` | `modern-skill-off-940x590.png` | 显示“关 闭” |
| `skill-on-cycle` | `modern-skill-on-cycle-940x590.png` | 回到“开 启” |
| `quality-medium` | `modern-quality-medium-940x590.png` | 30→24，显示“中” |
| `quality-low` | `modern-quality-low-940x590.png` | 24→20，显示“低” |
| `quality-high-cycle` | `modern-quality-high-cycle-940x590.png` | 20→30，显示“高” |
| `default-volume-hover` | `modern-default-volume-hover-940x590.png` | “示 例”变黄 |
| `default-volume-pressed` | 同 `default-volume-hover` + 无 value `pointerdown` 门禁 | 原版无独立 pressed |
| `default-volume-dead-click` | `modern-default-volume-dead-click-940x590.png` | 只显示原提示，不修改四项或自身文字 |
| `close-hover` | `modern-close-hover-940x590.png` | 144 over 资源投影正确 |
| `close-pressed` | `close-down.svg` 资源态 + `formal-settings-tests` | 144 down 为独立原资源；pointerup 随即关闭，原子点击不伪造静态停留截图 |
| `overlay-blocked` | `modern-overlay-blocked-940x590.png` | 点击底部任务入口后仍只存在设置页，134/133 全舞台命中阻挡有效 |
| `closed` | `modern-closed-return-940x590.png` | 只移除 148，返回原地图实例 |
| `reopened-session` | `modern-reopened-session-940x590.png` | 关闭重开保持困难/BGM 关/技能关/24 FPS |

`modern-reloaded-global-940x590.png` 另证实同一组非默认值在页面重载并重新进入当前槽后仍保留；这是
用户批准的独立全局跨重启现代例外，不属于原版 23 状态对象，不写入玩家 V7 schema。

## 几何、边缘与对象差异

- `FormalSettingsPageTruth` 直接查询 `/displayObjects` 的 root、134/133、五个静态 label、五个 146
  wrapper/145 text 和 144；专项测试对全舞台 940×590、difficulty label、defaultVol wrapper、
  145 局部 `(2,2)`、关闭 `(590,131.95,40,42)` 做零容差断言。
- `FormalSettingsOverlay` 不再持有五行 x/y/width、104×34.1 命中或关闭锚点；字体 family/size/color/
  hoverColor 也由 manifest `render.textStyle` 投影。源码门禁禁止旧坐标回填。
- 五个代表状态的 `edge-difference-*-940x590.png` 保存边缘差；面板与关闭按钮锚点一致。
  动态浏览器字体与原嵌入轮廓存在栅格/字宽差，按合同只作为记录化字体容差，不改变对象边界。
- 面板外像素差来自原版透明 148 覆盖真实地图宿主，`closed` 的原版透明舞台与现代原地图也因此
  不应做整屏像素相等判断。

## 可见对象清单

| 对象族 | 现代映射 | 差异分类 |
| --- | --- | --- |
| 148 根、134/133 面板/命中面 | `root-static.svg` + manifest 全舞台 zone | 原资源复用；命中几何直接消费真值 |
| 136..139、147 静态 label | Phaser text，manifest bounds/textStyle | 等价重建；允许浏览器字体栅格容差 |
| 五组 146/145 动态值 | Phaser text，manifest wrapper/text local matrix/textStyle | 等价重建；行为由既有全局设置 owner 提供 |
| 144 up/over/down/hit | 三份原按钮资源 + manifest anchor/combined bounds | 原资源复用 |
| 设置提示 | 既有共享提示投影 | 原 `Alert.show` 的 host 反馈，不是 148 child |
| 跨重启持久化 | `GlobalSettingsSystem` 独立 global key | 用户批准的现代例外；无新增可见对象 |

未新增现代标题、暗罩、通用按钮、P1/P2 selector、玩家槽字段或“恢复默认”行为。运行全过程 console
warning/error 均为空。
