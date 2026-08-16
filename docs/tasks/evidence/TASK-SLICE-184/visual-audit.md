# TASK-SLICE-184 商城页运行差异证据

## 权威输入

- truthId：`task-settings-175f.shop-page`
- manifest SHA-256：`5952494093f2a16ab7b1ac69277bc2968042f344fdd0bee253eaee2aa56b293a`
- 完整性：132 个对象、31 个状态、`unresolved=[]`
- 现代消费者：`src/scenes/shop/FormalShopPageTruth.ts` → `src/scenes/ShopScene.ts`

`ShopScene` 不再持有分类、九卡、字段、按钮和 624 确认层的第二套坐标表。页面启动先断言
truthId/status/对象数/状态数/完整性，再按 manifest 对象 ID 读取 stage bounds；商品目录、灵魂、背包、
P1/P2 和当前存档仍由原有 system 持有。

## 逐状态覆盖

| 状态族 | manifest 状态 | 运行证据 / 自动证据 | 结果 |
| --- | --- | --- | --- |
| 默认与分类 | `normal-p1-all-page1`、五分类 selected、`category-all-hover/pressed` | `modern-normal-*`、fashion/pet 5/8 卡截图；`formal-shop-tests.ts` 校验 49 项顺序和分类页数 | 通过 |
| 卡与按钮 | `card-buy-hover/pressed`、数量上下 hover/pressed | manifest 16 个按钮状态由同一 asset family 投影；浏览器 pointer 旅程与专项静态门禁 | 通过 |
| 分页 | middle/last/prev-boundary/next-boundary | `modern-page-all-last-*`、`modern-page-prev-hover-*`；专项闭合 6/3/2/1 页与边界夹取 | 通过 |
| 数量 | zero-refused、99、100 | `modern-quantity-99/100-*`；专项闭合 0 拒绝、99 手输、100 箭头上限 | 通过 |
| 确认 | dialog、OK/cancel hover/pressed | `modern-confirm-dialog-*`、`modern-confirm-cancel-hover-*`；专项闭合取消原子性 | 通过 |
| 购买 | refused-soul、success | `modern-purchase-refused-soul-*`；专项闭合成功、灵魂不足、堆叠上限、即时存档 | 通过 |
| owner | P1、P2 selected | P1 正式浏览器；专项闭合合法双人 P1/P2 灵魂、库存与存档隔离 | 通过 |
| 返回 | back hover/pressed、closed-return、重开 | `modern-back-hover-*`、`modern-closed-return-*`、`modern-reopened-*` | 通过 |

## 同尺寸差异

`generate-shop-page-runtime-evidence.py` 对默认、时装、宠物、全部末页和确认弹层生成：

- `comparison-*-1880x590.png`：原版/现代并排；
- `overlay-50-*-940x590.png`：50% 叠图；
- `difference-*-940x590.png`：逐像素差异。

原版结构基准刻意保留 fixture 驱动字段和动态图标为空；现代图中的商品名、价格、数量和 49 项真图标
是 manifest 声明的运行时 child，不是额外可见层。其余已解释差异只有字体栅格化/抗锯齿、943.15→940
裁切，以及用户批准的共享灵魂余额。页面没有现代标题、面板、通用按钮或第二货币 owner。

## 正式运行

- 视口：940×590；现有正式槽 → 天庭地图 → 商城。
- 验收：默认、分类、分页、数量、确认、拒绝、返回、重开。
- console：warning 0，error 0。
