# TASK-SLICE-214A 资源交接

状态：资源准备完成；青龙正式战斗未完成，下一执行项 TASK-SLICE-214B。

## 产物与来源

- `src/assets/PetDragonAnimationAssets.ts` 直接消费修复后的213 verified manifest与bodyTimelines/bodyClock。
- `src/assets/PetDragonAssetFiles.json` 只记录153文件的路径、尺寸、源/目标SHA、透明裁边偏移与SWF owner；它不成为几何或时序第二真值。
- 四套body atlas、六个青龙effect（135帧）在 `public/assets/pets/dragon/`，共享AoyiBuff（14帧）在 `public/assets/pets/shared/AoyiBuff/`；总11显示对象、149 effect帧、153文件。
- 全部由 `SceneAssetBundles.ts` 的combat-common唯一加载；碰撞直接引用213 collisionProfiles，不新增可见碰撞图。

## 214B 消费接缝

- `getPetDragonBodyAsset(form)`：spritesheet key、cell尺寸、columns、source offset、完整timeline和clock。
- `getPetDragonBodyAction(form, action)`：接受现代动作名或原hitN，返回逐cell时序、入口保持规则与completion routes。不要把正常循环结束当作一次新攻击。
- `getPetDragonBodyFrame(form, action, elapsedTicks)`：从新动作起点的零基elapsed tick查询frame/remainingHoldCount；loops取模、非循环末帧保持并显式complete。B负责同row入口保持cursor和有条件转移，不能每个token都强制reset。
- `getPetDragonBodyPlacement` / `getPetDragonEffectPlacement`：返回原尺寸图片左上角与flipX，Phaser对象使用origin(0,0)，位置按完整精度投影；PNG对账使用整数像素采样。
- `getPetDragonEffectFrame(symbol, frame)`：1基源MovieClip帧，原geometry/depth和裁边后文件。不能拿裁边尺寸拉伸回原联合画布；placement已用source registration减crop偏移。
- `getPetDragonCollision(form)`：原宽高/注册点，只作碰撞输入。
- bodyClock是enter callback→递减或换帧/结束→exit。qlaoyi首回调生成trigger，分身elapsed tick1/13/25/37；同族全部伤害/命中/治疗/分身生命周期仍由B实现。

## 可复验命令

- `npm run generate:pet-dragon-assets`：源哈希核对后只派生现代资源与文件元数据，旧原始提取只读。
- `node tools/run-system-tests.mjs pet-dragon-animation-assets-tests asset-bundle-tests`：153文件/owner、627 host ticks、345个生产查询投影。
- `python tools/verify-pet-dragon-asset-projections.py`：从生产投影数据渲染，更新逐状态对账；不复用原版生成器。
- `npm run test:pet-dragon-assets`：重复生成一致性、资源/查询/bundle检查和全部345状态零像素差、4类视觉变异。
- `npm run test:pet-dragon-family-truth`：213A的来源/完整性/15类反证门禁，保持正式实现前置。

## 结果与限制

345状态零像素差，位置、alpha、frame、九对象数量4种变异均被拒绝。contact-sheet.png已人工查看，visual-diff.json与projections/保存完整逐状态证据。627host-tick查询覆盖所有31本体动作的完整时钟及循环/结束边界。

透明技能画布经全透明边缘裁切，解码RGBA从842.9MiB降至61.17MiB，磁盘约11.52MiB；源哈希和cropX/cropY留存，345原版舞台像素未变。本体atlas保持原布局，空白effect仍保留帧号。

本项未创建Dragon Behavior、分身Runtime、伤害/治疗入口或正式场景视图；没有运行P1G，没有把此对象投影证据宣称为940×590正式双人战斗观察。B需完成父214全部44项合同与完整正式生命周期，并在父任务归档时维护213handoff的合同读取位置。
