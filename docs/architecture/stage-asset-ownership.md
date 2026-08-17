# 关卡资源目录与所有权

本合同规定现代 `public/assets/stages/` 的物理目录与运行时 bundle owner 如何对应。目录表达现代资源 ownership，不复刻 SWF 打包结构；原始 provenance 继续由 `AssetManifest.ts` 的 source package、Symbol、character id 和资源标注记录。

## 目录合同

```text
public/assets/stages/
├─ shared/
│  └─ floors/
│     ├─ floor-bg-1.png
│     └─ floor-bg-2.png
├─ stage-1-1/{scene,objects,hazards}
├─ stage-1-2/{scene,objects,hazards}
├─ stage-1-3/{scene,objects,hazards}
├─ stage-2-1/{scene,objects,hazards}
└─ stage-2-2/{scene,objects,hazards}
```

- `shared/<资源族>/`：只放具有稳定领域语义、无法归给某一关卡的跨关资源；子目录必须使用 `floors` 这类资源族名，禁止使用 `stage-1`、`stage-2` 这类数字分桶。
- `stage-N-M/`：只拥有该关卡的场景、机关、场景对象和其他真正随关卡变化的视觉族；怪物不是关卡资源，不以首次出现关卡决定 owner。
- `scene/`：背景、中景、前景等世界图层。
- `objects/`：传送门、特殊入口等具名场景对象；同一对象的 base/child/timeline 必须嵌套在同一对象目录。
- `hazards/`：冰刺、火刺等机关时间轴。
`public/assets/stages/**/monsters/` 是禁止路径。怪物定义、图集、攻击视觉、几何数据和 bundle owner 遵循 [monster-asset-ownership.md](monster-asset-ownership.md)；关卡只通过 monster id 和出怪编排引用。

## 光门示例

- Stage 1-1 character 45 是 41/44 child 合成后的 20 帧序列，位于 `objects/transfer-door/frames/`。
- Stage 1-2 character 52 保留 `base.png`，48/51 child 分别位于同一对象下的 `primary/`、`accent/`。
- Stage 1-3、2-1、2-2 当前只有各自外层单帧，统一命名为 `objects/transfer-door/base.*`。

这些差异来自源 Symbol 和当前接入粒度，不允许因为文件名相似就跨关删除或合并。

## 帧序列与死资源判定

哈希相同不等于死资源。Flash 时间轴中的停帧、循环段和透明等待帧必须保留其序号，否则会改变攻击、机关或门的可观察时序。删除资源至少需要同时证明：

1. 不在任何运行时 bundle 展开结果中；
2. 不被动态路径生成器覆盖；
3. 不承担已登记时间轴的帧序号/持续时间；
4. 删除后专项、全系统和构建通过。

## 自动门禁

`npm run test:stage-assets` 必须验证：

- 磁盘文件与展开后的 runtime path 双向一一对应；
- 每个物理路径只有一个 bundle 声明；
- bundle 只能持有其 ownership 前缀内的文件；
- `shared/` 下只能出现具名资源族，禁止数字关卡桶；
- 旧 `stage/`、`stage1/`、`stage21/`、`stage22/` 根不会复活；
- `public/assets/stages/` 下不存在 `monsters/`，关卡 bundle 不声明怪物文件；
- 关键光门组件仍位于同一对象目录并保留原帧数。
