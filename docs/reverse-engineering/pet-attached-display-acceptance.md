# 宠物附属显示退休接缝

245A的生产入口为`PetAttachedDisplayLifecycle`与两个`FormalPetMonkey/HorseBodyBridge`。Game显示阶段只推进附属显示回调的elapsedMs和退休alpha，不引用PetState、伤害、AI、技能或数值会话。root及body沿用原adapter创建；第一次实际创建身体才建立scene级显示服务。

## 原版映射与消费接口

原版输入仍是244 `task-settings-244.pet-passive-effects`，详见`pet-passive-visual-contract.md`。本项不修改真值，不导出新的六效果正式资源。`BaseBitmapDataClip.destroy`立即移除身体；`BasePet.destroy`使仍在root上的子效果随root一秒easeOut淡出，按Flash的1/256量化。仅销毁BaseAddEffect容器不等于hide已显示的子效果。

- `register(runtimeKey, root, body)`由adapter创建实际身体后调用。同一petId重建Runtime也必须获得新root；P1/P2身份分开。
- B可通过`petAttachedDisplayLifecycle(scene).attach(runtimeKey, effectId, {object, display})`接入原资源。display只接受显示elapsedMs并返回是否仍可见；数值同名刷新不得重复attach或重置elapsedMs。
- 主动hide用`remove`；数值容器destroy不能盲目调用remove。自然第100帧等原clip自移除由B的显示回调返回false。
- adapter休息/替换调用`retire`，立即移除body、冻结旧root世界位置，保持已有附属显示独立推进。一秒后dispose；从未挂载附属显示的空root可立即清理，不留下无用途视觉对象。
- adapter退出释放其所有active/retired root；Scene shutdown释放共享服务及prestep listener，支持同一个Scene实例重启。数值owner按原路径释放，未延长其寿命。
- 原BBDC朝向仍只翻body；root方向保持独立。退休效果不会跟随新宠物的位置或宠物ID查询。

本项只接猴、马现有adapter；其他已迁移家族只有既有profile及入口核对完成后才能复用。主人四种场景层效果、数值自动触发、完整六效果资源及五关正式可见仍由245B承接。

## 验证与边界

`pet-attached-display-tests`：实际生产生命周期与显式Scene/object spy，对账244的32组sxkb/fsnl×P1/P2×双向×cycle/host-destroy/effect-destroy/world-pause，共5,408原状态。frame、父级存续与alpha精确比较；附加双身份、自然动画先结束和退出清理。first-owner-step与首个EXIT都为frame1，退休tick3 alpha1，tick26 alpha0但root仍在，tick27移除。

`pet-attached-mutation-tests`：7个生产源码变体必须因实际断言失败被拒绝，包括立即清除、永久退休、重播、线性alpha、冻结、owner串线、退出残留。只在临时目录编译，不覆盖生产文件。

`node tools/pet-attached-browser.mjs`：真实Phaser Canvas/WebGL与生产猴/马adapter，分别64组、5,312个状态。资源来自已冻结原生cycle PNG；expected是独立host-destroy等原PNG。源PNG逐个核验SHA。主身体加载真实资源，但像素对账时隐藏，因为244原生基准本来不包含身体；通过真实body对象检查退休时立即销毁，不以隐藏替代释放。猴1与马1复用相同ObjectBaseSprite3显示profile，本项不宣称全部家族/形态六效果可见。

浏览器另验证同时双owner、相同petId不同runtimeKey重建、旧位置保留、adapter幂等退出和真实Phaser Scene暂停后重启。原Scene的服务释放、同实例新服务可再次注册。此处是实际Scene生命周期机制测试；不是五关真实结果按钮与六效果自动触发旅程，后者属于B。

允许的现代视觉例外：原生透明PNG经浏览器解码、透明alpha与Phaser再混合产生小幅颜色/alpha舍入；每态记录alpha/预乘可见通道差，门限3/255，实际最大值见本地browser.json。按用户长期轻微颜色舍入授权接受，不称零像素差，不影响数值、碰撞或时序。无现代可见替代层。代表Canvas/WebGL截图仅本地保留。

未证组合：244没有pause+fade重叠采样，本项不把该组合宣称为原版已验证行为。新共享显示服务也不承诺未注册宿主、其他家族专属效果或完整Tween运行时。

## 失败及修正

- 累计1/24秒在0.5秒量化边界产生二进制浮点误差；量化前加1e-9的数值计算补偿，仍按原1/256精确对账，不放宽测试expected。
- 初版浏览器支架在Game创建前调用Canvas兼容修正、可能连接初始化页面，已改postBoot及限定about:blank；长像素循环阻塞CDP任务，改为定期让出浏览器事件队列，不改变手动Game时间或减少比较状态。
- Scene重试断言曾要求全部Game prestep listener为零，错误包含Phaser自身监听器；现在比较测试进入前数量，并同时检查旧生命周期实例清空与新实例重新注册。
- 初次完整gate遇旧projectile-only Scene替身缺少events。生产服务改为实际创建身体时才建立，避免没有附属宿主的路径分配服务；原猴马暂停/延迟显示回归完整保留。

## 复验与交付

运行：`node tools/run-system-tests.mjs pet-attached-display-tests pet-attached-mutation-tests`、`node tools/pet-attached-browser.mjs`；完整设计gate为`npm run check:system-design -- pet P1GS P1R P1H P1G P1T`。具体终态及源码/报告hash由本地`docs/tasks/evidence/TASK-SLICE-245A/handoff.md`记录，未取得gate终态前不视为本批通过。

所有运行逻辑位于src，启动不依赖本地证据；源级复验仍需244原生trace/PNG和本机Edge。`.tmp/pet-attached-browser`复制图与bundle均可再生；原244 PNG保持原位置只读。245B必须完成父245全部合同后才能核销父任务，不关闭204/all/194/VS-067。
