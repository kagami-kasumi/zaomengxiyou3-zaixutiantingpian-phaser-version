# TASK-ARCH-177A

任务类型：

- `TASK-ARCH`

功能条线：

- `LINE-RELEASE-RUNTIME-LOAD`（Planned）

目标机制/切片：

- `M-035`、`VS-000`

规模预算：

- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：

- 若测量需要引入新的分析软件、修改运行时代码或同时治理图片转码/纹理淘汰，立即停止并把额外范围留给后续 task。

协作计划：

- 模式：单 agent
- 并行工作包：无
- 写入 owner：主 agent
- 归并检查点：不适用
- 方法观测：无

输入资料：

- `TASK_OUTLINE.md` 发布优化阶段、`M-035`、`main.ts`、Vite 配置、场景路由、`SceneAssetBundles.ts`、`AssetManifest.ts` 和运行时目录消费者。
- 复评确认项 H4、M16；M17 只作为瘦目录生成链的验收加固，不独立扩张。

输出产物：

- 记录生产构建入口、vendor、各场景、目录 JSON/TS 和动态资源投影的可重复体积基线及首屏实际依赖图。
- 冻结场景动态 import、Phaser/vendor chunk、运行时瘦目录投影、生成器 `--check`/schema/hash 与回退/错误处理合同。
- 给出首屏与场景 chunk 预算、缓存边界、测试矩阵和 177B 的精确文件/消费者清单。

完成定义：

- 5MB 结论由当前生产构建复测支持；“图片懒加载”和“JS/目录懒加载”分开计量。
- 177B 不需要重新调查消费者即可实施，且不会把全量机器真值 provenance 从仓库权威输入中删除。

验收标准：

- 可重复构建报告覆盖 raw/gzip、入口依赖和各目录贡献；预算和失败阈值落盘。
- `npm run build`、`npm run check:workflow` 和 `git diff --check` 通过。

禁止范围：

- 不在审计 task 中修改运行时代码，不删除权威机器真值或资源 provenance。
- 不引入需要从 GitHub 安装的复杂软件，不把图片转码/纹理淘汰并入本线。

状态更新：

- 更新 `LINE-RELEASE-RUNTIME-LOAD` 覆盖台账、task-board/task-history 与 `M-035`。

推荐后续任务：

- `TASK-ARCH-177B`：按本 task 的依赖图和预算实现运行时拆包与瘦目录生成链。
