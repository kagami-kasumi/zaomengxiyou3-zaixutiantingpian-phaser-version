# TASK-ARCH-177B

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-RELEASE-RUNTIME-LOAD`（Planned；依赖 `TASK-ARCH-177A`）

目标机制/切片：

- `M-035`、`VS-000`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：

- 若场景拆包和瘦目录生成任一工作包需要迁移超过 8 个独立消费者，或需要新增第三个运行旅程，立即按 177A 的依赖图拆成 177B1/177B2。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `TASK-ARCH-177A` 的生产体积基线、依赖图、预算和消费者清单。
- Vite 官方拆包合同、场景路由、资源 bundle coordinator、目录生成器与运行时投影消费者。

输出产物：

- 按路由延迟加载非首屏场景并稳定拆出 Phaser/vendor；加载失败有明确可恢复路径，预加载和正式路由语义不变。
- 生成运行时瘦目录投影，权威全量 JSON 继续用于生成/校验而不整包内联；生成器支持 `--check`、schema/hash 和 npm 门禁。
- 增加首屏不含后续场景/全量目录的静态门禁、chunk 预算、路由/重载/缓存与正式 1P/2P 回归。

完成定义：

- 生产入口和场景 chunk 满足 177A 预算，首屏不再静态包含全部 17 场景和全量目录。
- 真值目录仍可追溯、可重复生成并由 CI/check 检出漂移；运行时只消费声明的窄投影。

验收标准：

- 修改前运行 `npm run check:structure`；生成器 check、生产 bundle budget、路由专项、`npm run test:systems`、`npm run build`、`npm run check:workflow`、`npm run audit:problems` 和 `git diff --check` 通过。
- 940×590 从启动到地图、功能页和代表关卡首入/重入，网络 chunk 无 404，console 无 warning/error。

禁止范围：

- 不删除全量机器真值，不牺牲离线可玩或把加载错误静默吞掉。
- 不顺带做图片转码、纹理淘汰、Service Worker 或发布平台迁移。

状态更新：

- 更新本线覆盖台账、task-board/task-history、`M-035` 和生产体积证据。

推荐后续任务：

- 若预算全部满足则关闭 `LINE-RELEASE-RUNTIME-LOAD`；否则仅依据 177A/177B 的测量生成同线窄优化 task。
