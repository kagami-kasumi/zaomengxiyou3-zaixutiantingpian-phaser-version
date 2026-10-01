# 公共宠物被动与自动增益源证据

`TASK-SETTINGS-235` 的有界代码逆向入口。原版方法/指定片段执行于游戏包 AIR 51.1.1.5；移动、动画、特效展示、联机、Tween 和属性保护服务为明确替身。完整原版场景与增益视觉不在本批声明范围内。

```powershell
python tools/pet-passive-source/check.py
python tools/pet-passive-source/generate.py
node tools/pet-passive-source/modern-preflight.mjs
```

`check.py` 冻结并校验720个源expected，10种实际编译源变异必须返回不同结果且被拒绝，4种损坏报告必须被拒绝，正常源重复生成必须完全一致。独立预期在 `verify.py`；不导入现代游戏算法。

只复核未变化的已采样输入：`python tools/pet-passive-source/verify.py`。之后 `generate.py` 生成可交接的纯行为sidecar `docs/reverse-engineering/reference/pet-passive-auto-buff-contract.json`；该文件的 `/expectedCases` 可被后续生产测试直接消费。它不套用UI Schema，不晋升六个视觉符号为视觉真值。

本地报告/日志：`docs/tasks/evidence/TASK-SETTINGS-235/`。源壳/编译SWF：`local-resources/regima/task-outputs/TASK-SETTINGS-235/air/`。这些是逆向复验输入，仅本地保留；不参与游戏运行，完整宠物功能收束前保留供消费者复验。原提取结果只读。拉取仓库可构建运行游戏，重采源证据仍需要本地语料、Java和既有AIR SDK；脚本不安装软件。

现代映射、证据矩阵、继承边界、视觉后续与结论见 `docs/reverse-engineering/pet-passive-auto-buff-contract.md`。独立审查返回的TestScene桥与helper顺序遗漏，由主agent精确源阅读纠正，以该文档为准。

`modern-preflight.mjs` 使用既有esbuild重跑96例当前party诊断，补齐现行闭包getActivePet/options与已验证ground fixture输入，不修改旧226报告或生产函数；空敌人世界/ready=0边界仍属诊断。它不用于宣称默认首帧触发或正式运行验收。
