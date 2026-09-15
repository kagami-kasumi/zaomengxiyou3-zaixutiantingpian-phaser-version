# TASK-SLICE-216A → TASK-SLICE-216B

216A只完成原版pnum资源与生产显示API。未接入英雄/宠物/环境伤害producer，未修改伤害公式、宠物行为或QA存档，不能据此宣称VS-072或父216完成。

## 生产入口与来源

- `tools/generate-incoming-feedback-assets.py` 从215 verified manifest派生十个pnum资源与精简 `src/assets/IncomingDamageFeedbackProjection.json`。原AIR导出的十PNG先逐像素核对恢复OtherMat1.swf的SymbolClass/DefineBitsLossless2与源hash，再原字节保留到 `public/assets/ui/combat-feedback/incoming/`。不写原始提取目录或215基准。
- `src/assets/IncomingDamageFeedbackAssets.ts` 断言truthId/status/完整性/十字形身份，SceneAssetBundles只由combat-common加载。projection的源manifest hash由可再生检查和独立测试验证；没有把完整109态原始测量塞入运行包。
- `createIncomingDamageFeedbackView(scene)` 返回show/update(deltaMs)/destroyEvent/destroy；每scene独立会话，shutdown自动清理，销毁幂等。输入 `IncomingDamageFeedbackDisplay` 携带eventId、targetId/kind、ownerSlot、displayValue、worldAnchor。视图不结算伤害、不读HP、不增加连击，也不使用怪物反馈队列。
- 216B必须在实际结算时提供正确的target world root与source/producer ordinal复合id。同eventId在本scene生命周期内只显示一次，显式/自然销毁后仍拒绝重放；新scene可复用id。seen集合只在scene销毁时释放，与现有战斗反馈会话去重一致，未做跨场景持久去重或时间窗假设。
- worldAnchor加真值offset后按源 `ANumber.aNumImage(param3:int,param4:int)` 转AS3 int；并非保持任意浮点坐标。displayValue要求有符号32位整数；负值“-”显示为0仅保留源API边界，不授权负伤害玩法。

## 显示列表与差异

原版基准唯一来自215 `native/measurement.json` 与 `native/images`；truthId `task-settings-215.player-pet-incoming-damage-feedback`。原sprite/bitmap根与child、注册点、位距、锚点、scale/alpha、30×30字形、normal blend、无filter/mask、无翻字和直接销毁均有对应生产对象。无新增现代可见例外。

生产动画消费truth的4倍→1倍、0.2秒pop、0.25秒delay、1秒Quad上浮淡出、1.25秒销毁。原队列API不存在当前incoming调用者，216A不新建队列；子agent建议的queue额外运行测试不适用本批直接显示入口。

Phaser Canvas默认roundPixels会把每个bitmap目的尺寸增加0.5 local pixel；WebGL mediump在1.75倍缩放的最近邻边界与AIR择取不同像素。专用 `IncomingDamageBitmapSampling.ts` 仅在该bitmap渲染期间关闭相机舍入并施加0.01屏幕像素的采样相位偏置，finally恢复相机和父矩阵（含异常路径）。这是为匹配独立原版图的渲染适配，不是真值坐标或新的可见布局；逻辑root/child bounds不变。固定声明态的逐像素门禁验证该选择，未宣称任意缩放/旋转/硬件上的Flash全空间等价。

- 32个原版测量态：hero/pet×P1/P2×七时刻、-12/0/10/1234567890；另测多producer输入、重放、自然/显式/shutdown清理、小数/int边界与采样异常恢复。
- 真实Phaser WebGL/Canvas各34输入，共68态：上述32态、显式销毁、带相机平移的P2态；940×590。实际对象trace独立对账，所有基准态通过，console warning/error为0。
- 几何容差0.051px对应源twip取整、scale 0.0001、alpha 1/255。合成后像素最大通道差2/255，仅预乘alpha/透明度取整；字形替换/错位或采样边缘改变不能通过。不是零像素差结论。
- [逐态结果](display-verification.json)、[实际生产变异](implementation-mutations.json)、[采样变异](sampling-mutation.json)、[原版/生产并排](display-comparison.png)。13项生产配置/身份/owner/清理变异、13项verifier对象变异与1项真实浏览器采样变异均被拒绝；负运行不改正常报告。

## 复验

```powershell
python tools/generate-incoming-number-truth.py --check --self-test
npm run test:incoming-feedback-display
npm run test:combat-feedback
npm run build
npm run preview
npm run test:incoming-feedback-browser
npm run check:structure
npm run check:annotations
npm run check:workflow
npm run audit:problems
git diff --check
```

preview已运行时复用4174，不重复启动。browser命令在ignored dist中生成专用测试页，启动独立无用户存档的headless Edge；测量的是实际生产显示类，不是战斗执行trace。浏览器异常/找不到执行文件会直接失败，不下载软件。mutation结束后的测试页是负样本，不能作为人工正常预览；重新运行browser主脚本恢复正常页，或收尾移除该临时页。

## 后续必须完成

216B按父216/215逐条接实际英雄/宠物/环境及TestScene转嫁producer，生产数字不能由HP快照差猜出；owner和ordinal的来源正确性必须在结算trace证明。216A传入owner的元数据正确不等于已证明该owner来自真实目标。正式五关/TestScene的伤害/HP/数字/清理和已有怪物反馈不回归仍需B验收，5173默认全宠物QA入口仍需C。

原版109张基准和源语料保持为后续输入。68张现代截图、负样本截图和临时浏览器页可由上述命令再生，不作为后续不可替代输入；长期只保留十字形、projection、测试代码、精简报告与一张代表并排图。

收尾状态：全部上述216A必需检查及asset-bundles回归通过；9项既存结构warning、PlayerSlot词汇warning和Vite大chunk提示保留。PG-004/013/017语义审计通过并集中记录，长期关闭条件不足不归档。216A已移入task-history，216B唯一Ready；未提交或上传Git。

清理例外：2026-09-14已核对绝对路径位于当前workspace/.tmp，待清理 `.tmp/verification-images/TASK-SLICE-216A/browser` 与 `browser-no-sampling` 合计138文件/2,459,808字节，及 `.tmp/incoming-display-mutations` 13文件/65,642,260字节；前者由browser测试再生，后者由内存变异runner再生，没有后续不可替代消费者。执行删除被自动审批以“blocked by policy”拒绝（含精确LiteralPath重试），未改用其他工具绕过，暂保留ignored临时文件。最后一次build已自动移除dist临时probe页面；4174 preview可继续复用。
