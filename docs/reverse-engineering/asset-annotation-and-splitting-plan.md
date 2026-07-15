# 资源标注工程入口（已迁移）

资源标注与选择性帧拆分已经重构为独立目录：

- 总入口：[`asset-annotation/README.md`](asset-annotation/README.md)
- 人工与 Agent 协作流程：[`asset-annotation/workflow.md`](asset-annotation/workflow.md)
- 标注字段与状态规范：[`asset-annotation/annotation-schema.md`](asset-annotation/annotation-schema.md)
- 拆分必要性判定：[`asset-annotation/splitting-policy.md`](asset-annotation/splitting-policy.md)
- 单批工作模板：[`asset-annotation/batch-template.md`](asset-annotation/batch-template.md)

保留本文件是为了兼容旧链接。后续不要在这里继续追加标注规则或执行记录。

一句话说明“人要做什么”：人工不需要给所有数字资源逐个命名；只需要在 Agent 无法从仓库证据确定含义时提供原版画面或判断，在需要 FFDec 等复杂工具时手工操作，并审批高感知资源的视觉验收标准。

一句话说明“Agent 能做什么”：Agent 可以完成资源盘点、AS3/SymbolClass 证据追踪、候选标注、稳定 key 设计、缺口登记、批次文档维护和拆分建议；但不能在没有证据时猜用途，也不能替代人工判断“看起来是否像原版”。
