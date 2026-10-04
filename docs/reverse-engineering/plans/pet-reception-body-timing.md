# 宠物受击身体两动作真值方案

本方案仅服务TASK-SETTINGS-254：19个兼容形态的hurt/dead状态；不是完整宠物家族逆向，不使用跨家族技能生成流程。

1. 先从当前Pet定义与原类枚举精确19形态，列出继承与body symbol。由Aloader/AssetsLoader和恢复包SymbolClass确认优先级，保存源hash与locator，不能直接接受corpus候选排序。
2. 只提取initBBDC中的cell/offset/frameCount/frameStopCount、setAction的hurt/dead行及frame-over回调。复用BasePet受击与BaseObject/BaseBitmapDataClip时钟，区分保护倒计时、动作帧、owner释放。
3. 用现有FFDec读取目标恢复包，选择性导出目标BitmapData/显示对象；根fixture为940×590内(470,350)，双方向，默认alpha1。逐可达帧保存原始显示列表、矩阵、注册点与非透明bounds、原版PNG；忽略的尾部atlas格必须记录为不可达而不是添加状态。
4. 原AS3方法或恢复运行时驱动20/24/30fps、首次受击、重复hurt、暂停/恢复与dead结束。保留逐tick动作/帧/保护/ready/source引用trace；独立expected冻结在现代实现之前。原生工具使用既有AIR合同，不安装新软件。
5. 用UI ground-truth Schema序列化实际视觉对象；时间语义以带provenance的合同字段记录。核对19形态、38动作与其全帧/双方向，基准尺寸、父子链、每帧可见对象、hash、生成稳定性。所有影响接入的未知闭合后才verified。
6. 反证分别改动作行、frameCount、持帧、结束动作和选中owner，要求独立trace或像素比较明确失败；工具/编译错误不算。主agent归并只读核对，记录六段证据链和未来实际消费者边界。

现代实现和整Scene旅程属于后续task；本项只交付原版输入，不以静态表或源字符串断言代替运行验证。
