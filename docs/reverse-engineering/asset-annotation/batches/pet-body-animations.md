# 标注批次：pet-body-animations

- 状态：恢复源已分区，等待逐物种选择性导出
- 关闭日期：2026-08-17

## 范围

- 只覆盖现代当前支持的九物种、35 个实际形态及其本体 atlas SymbolClass。
- `mouse2/3` 继承 `PetMouse1`，所以与 `mouse1` 共用 `PetMouseBmd1`；`mouse4` 使用 `PetMouseBmd2`。
- 标注表：`../annotations/pet-body-animations.csv`。
- 机器可查 corpus：`../../pet-animation-corpus.json`。

## 结论

- 9 条本体资源族均已达到 `export-ready + confirmed + export-selectively`，没有未定位物种。
- 恢复 owner 分布于 `pet1.swf`、`20120203.swf`、`20120808.swf` 与 `mouse.swf`；重复 SymbolClass 的候选、character id、源哈希与重开条件由 corpus 保留。
- 精确动作行、帧数、持帧、注册点、嵌套矩阵、碰撞/可见边界和行为触发仍明确未验证，不能从本批次直接派生现代 atlas。
- 后续严格按物种执行一份证据 task 再执行一份实现 task；不得合并九物种一次接入。

## 人工输入

当前不需要。只有逐物种证据 task 发现两个候选在负载顺序与原版运行画面上仍无法消歧时，才请求最小人工复验。
