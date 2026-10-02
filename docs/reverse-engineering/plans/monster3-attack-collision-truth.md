# Monster3 两攻击视觉与命中真值方案

本方案仅供TASK-SETTINGS-248实例化。它补247已明确的空间/像素缺口，不重写行为或进入现代实现。

## 有限范围与来源

恢复`assets/1.swf`的Monster3Bullet1/2及依赖闭包，5/10帧、双方向，共30个攻击状态；目标限定原BaseHero/BasePet实际使用的colipse。优先核对241已有profile适用性与构造SHA；以当前task列明的profile全集为合同。原版身体Bitmap本体不是本次重提取对象。

## 提取与状态冻结

1. 先列源SymbolClass、character id、依赖闭包、攻击状态及目标profile，不按现代输出结果删状态。
2. 源XML独立递归提取display list、depth、matrix、color/alpha、mask/filter、注册原点和嵌套帧；与恢复SWF实际运行树交叉核对。静态深度清单不能替代原生动态树。
3. 为30态记录940×590舞台基准及必要的完整局部ROI；舞台裁切外的攻击有效像素另有明确处理。两方向使用源setDirect的变换，而不是猜测图片flip。
4. 247实时ENTER/EXIT已有首次第1帧和末帧检测合同；把本次绘制/碰撞phase绑定其真实序列，并检查pause/resume。大场景显式gotoAndStop样本只作受控分支输入。

## 原版独立命中oracle

执行原HitTest和BaseHero/BasePet所需前置快速相交判断，目标采用真实colipse及实际构造缩放/父链。采样包含已命中内部、非命中、外边界/透明孔洞、双方向、源可达分数坐标和真正检测帧；输入域在运行前冻结。

独立现代候选只能消费提取结果，不用现代结果生成原expected。记录布尔与像素数量/ROI差异；命中布尔必须精确，视觉抗锯齿例外不能转为伤害容差。对错误帧、方向、偏移、profile、矩阵、遗漏child和提前首次查询实施反证；分清源变异与JSON损坏。

## 真值、完整性与交接

生成符合`ground-truth/schema/ui-ground-truth.schema.json`的视觉/空间manifest，若行为phase单独存放则引用247行为reference，不把纯行为硬塞UI字段。保留truthId、源SHA、精确locator、原生baseline、对象/状态/父子计数及独立完整性结果；unresolved影响实现时保持draft/blocked。

完整大manifest/原PNG按Git交付规则留本地；精简索引、生成入口与消费路径可提交。不得把未来游戏运行必需数据放在被忽略evidence目录。重复生成与原版基准不变后，交给TestScene Boss和Stage13普通Monster3两条owner；任何一个consumer尚缺合同都不能称全Monster3完成。
