# 阶段 1：现代项目脚手架说明

本阶段建立 Phaser 3 + TypeScript 最小工程，只验证现代运行环境、场景、资源加载和键盘输入，不迁移战斗、装备、存档等系统。

## 已创建文件

- `package.json`：开发、构建、预览命令和依赖声明。
- `vite.config.ts`：Vite 开发服务器配置。
- `tsconfig.json`：TypeScript 严格模式配置。
- `index.html`：游戏挂载入口。
- `public/assets/scaffold/player-placeholder.svg`：临时占位角色资源。
- `src/main.ts`：Phaser 游戏实例入口。
- `src/scenes/BootScene.ts`：加载占位资源。
- `src/scenes/TestScene.ts`：测试场景、显示对象、键盘移动验证。
- `src/systems/InputSystem.ts`：输入读取系统。
- `src/assets/AssetManifest.ts`：现代资源 key 和路径索引。
- `src/core/GameSettings.ts`：最小场景常量。

## 设计原则

- 不照搬原版 `GMain`、`Config`、`BaseObject` 的大类结构。
- AS3 只作为行为参考，现代代码优先使用清晰的 scene/system/data 分层。
- 资源通过 manifest 管理，不直接修改或复制 `local-resources/regima/legacy-extraction/`。
- 当前 SVG 是临时占位资源，后续 TASK-003 再索引原版导出资源。

## 验证方式

安装完成后运行：

```powershell
npm run dev
```

浏览器打开 Vite 输出地址，默认通常是：

```text
http://127.0.0.1:5173/
```

验收：

- 能看到 940 x 590 的测试场景。
- 能看到一个占位角色。
- 按 `A/D` 或方向键左右移动。
- 按 `J` 时状态文本显示 `attack`。
