# 怪物定义与资源所有权

本文规定 `PG-013 V2R` 建立的怪物领域 owner。怪物定义、图集、攻击视觉与注册点几何不属于首次出现关卡；关卡只持有 monster id、数量、位置、波次、Boss、停点和触发条件。

## Owner

- `src/systems/MonsterDefinitionCatalog.ts` 是现有 12 类怪物只读战斗定义的唯一 owner；`Stage1CombatSystem` 只保留兼容查询 facade，不再声明定义表。
- `src/assets/MonsterAssetCatalog.ts` 是怪物 id 到资源族、atlas、攻击对象与几何 manifest 的唯一资源 catalog。
- `src/assets/AssetManifest.ts` 保留提取来源、Symbol、character id、帧数与注册点等低层 provenance；它不按关卡组装怪物 bundle。
- `src/assets/SceneAssetBundles.ts` 从怪物 catalog 生成独立 bundle。关卡 bundle 只把所需怪物族列为依赖，不拥有怪物文件。
- 单局可变状态继续由 `MonsterRuntimeRegistry` 持有；只读 catalog 不保存 HP、AI phase、死亡或奖励状态。

## 物理目录

```text
public/assets/monsters/
├─ family-3-30/
├─ family-2-4-7-8/
├─ monster-5/
├─ family-6-9-10-19/
└─ monster-16/
```

资源族只用其包含的 monster id 命名，不含章节或关卡编号。当前族边界来自已经接入且共享同一攻击几何表的提取批次；catalog 显式记录每个 monster id 的唯一族，因此后续跨关复用不改变 owner。拆分几何表必须有新的提取/验证证据，不能仅为目录美观改写机器真值。

## Bundle 与关卡依赖

| Bundle | Monster ids | 当前关卡消费者 |
| --- | --- | --- |
| `monster-family-3-30` | 3、30 | Stage 1-1、1-3 |
| `monster-family-2-4-7-8` | 2、4、7、8 | Stage 1-2、1-3 |
| `monster-5` | 5 | Stage 1-3 |
| `monster-family-6-9-10-19` | 6、9、10、19 | Stage 2-1、2-2 |
| `monster-16` | 16 | Stage 2-2 |

“当前关卡消费者”只描述加载需求，不构成资源归属。新增关卡引用已有 monster id 时只新增依赖/出怪编排，不复制定义或文件。

## 自动门禁

`npm run test:monster-assets` 必须验证：

- 12 个 monster id 在定义 catalog 与资源 catalog 中一一对应；
- 424 个怪物磁盘文件与 runtime 声明双向完全一致，每个物理文件只有一个怪物 bundle owner；
- 怪物物理路径和 bundle id 不含关卡 owner，旧 `stage-*-monsters*` bundle 不会复活；
- `public/assets/stages/**/monsters/` 不存在；
- 五关视觉消费者通过 `MonsterAssetCatalog` 取得 atlas、攻击帧和几何；
- `Stage1CombatSystem` 不重新声明怪物定义表。

视觉帧数、哈希相同文件与 provenance 的处理继续遵循 [stage-asset-ownership.md](stage-asset-ownership.md) 的死资源判定规则。
