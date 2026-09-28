# 公共捕获身份与双 owner 隔离验收

`TASK-SLICE-234`，2026-09-28。只关闭捕获身份和其即时消费责任；235公共被动/自动增益、其他怪物公共消费、完整家族、204/all、194与VS-067仍未完成。

## 问题与实现边界

**确认事实（现代反例）**：原 `catchNewPet` 用物种名称与 `roster.pets.length + 1` 生成ID。226保留报告 `docs/tasks/evidence/TASK-SLICE-226/capture-owner-preflight.json`：双方均为 `pet-monkey1-2`；2个弹体在P1释放后变0，P2 Runtime仍活。报告是历史反例，未用修正后运行覆盖。旧诊断工具没有当前必需的地面fixture，不能作为现行验收入口。

**现代设计选择**：每次成功捕获使用 `crypto.getRandomValues` 生成128位随机后缀，脱离roster长度；不消耗捕获概率/战斗的 `Math.random`。`PetRoster.ownerSlot` 是可选运行字段，由 `createPlayerPetRosters` 与存档解码填入。P2捕获沿用既有 `p2-` 命名，P1沿用无前缀命名。身份不因放生、roster长度或页面恢复复用。

存档仍为当前V7；ownerSlot从所属player重新派生，不进入持久字段。既有合法P1 ID不变；无前缀旧P2 ID只加一次前缀；新P2 ID保存重载不变。不去重、丢弃或替换旧宠物记录；历史文件若本来已有同owner重复ID，仍按原解码保留，本项不进行历史身份修复或schema迁移。

`PetCombatEntitySession.release` 已优先用 `experienceSource.runtimeId` 清理，无来源字段才回退到pet ID，本次无需改动。正式通知的roster来自 `createFormalPetPage → restoreGameState`，携带ownerSlot；`syncFormalPetRuntime → FormalPetsUpdatedEvent → HeroPartyRuntimeBridge.syncPets` 保留整个roster，无新增owner/计时器或逐关补丁。只读子agent核对了该兼容路径；任意手写无owner的QA roster不是正式存档入口，公共捕获仍能生成独立随机ID。

## 证据与验收范围

| 合同 | 实际消费者/证据 | 结果 |
| --- | --- | --- |
| 同名双owner捕获 | `requestMagicBottleCapture → resolveMagicBottleCaptureHit → catchNewPet`，实际两个Runtime/Session与共享弹体数组 | 猴马×带/不带来源元数据×释放P1/P2共8组；只删除释放方，另一方原弹体引用、runtimeKey和存活状态保留 |
| 同owner重捕 | P1/P2各自中间放生、同长度重捕、20轮末尾放生重捕；放生重捕发生在两个world update之间 | 旧/存量/新宠身份不同，Runtime新会话与新pet来源正确，存量对象不被替换 |
| 保存兼容 | 真实 `encodePet/serializeGameSave/parseGameSave/restoreGameState` | 三轮重载ID稳定；旧P1不变，旧P2单前缀；记录数/HP保留，恢复后仍可捕获 |
| 正式通知/出战/放生 | 实际页面模型、`deployFormalPet/releaseFormalPet`立即保存、`syncFormalPetRuntime`与生产party事件注册及`updatePets`闭包 | P2页面重载通知保持原会话；P1真实两阶段放生并通知后无活动实体，P2原弹体和Runtime继续 |
| 来源及伤害 | P2存活弹体继续走生产碰撞资产、`createPetProjectileCombatPort → resolveStage1PetHit` | 固定目标从攻击开始保持原坐标；真实HP下降、`lastHitBy=p2`、伤害sourceId与经验目标引用均指向原P2宠物 |
| 反证 | 内存esbuild变异，不改生产文件 | roster长度旧算法、漏捕获前缀、漏解码owner共3种被语义断言拒绝 |

自动入口：`node tools/run-system-tests.mjs pet-capture-identity-tests`（12组，纳入core/full）；`node tools/verify-pet-capture-identity.mjs`（3生产变异）。精简本地报告位于 `docs/tasks/evidence/TASK-SLICE-234/identity-tests.json`、`mutations.json`。测试只使用Git内源码与生产碰撞资源，运行不依赖本地原始语料或忽略的证据文件。

正式party测试执行现有源码中的事件注册与updatePets闭包；渲染/readiness和无关英雄经验绑定为明确sink，真实魔法瓶、页面保存/通知、宠物Runtime、弹体、碰撞和伤害未替换。该测试不是完整Phaser场景截图或原版视觉验收，不据此声称全场景/完整家族闭合。六段源证据链的SWF空间/显示列表部分不适用：本次是现代身份修正，没有修改概率、成长、几何、时序、显示树或视觉资源；沿用原家族空间合同及其既有回归。

## 验证与交接

- `npm run test:systems -- --core pet-combat-session-tests formal-pet-tests formal-pet-journey-tests party-save-tests save-party-flow-tests pet-monkey-family-runtime-tests pet-horse-family-runtime-tests`：22组通过，包含猴马96真实命中/来源/寿命例及既有家族原生相位回归。
- `npm run build`：通过；保留既有大chunk提示。
- `npm run check:structure`：通过；8项既有warning，生产改动的4个目标文件无error/warning。
- LSP目标源文件与新增测试无error；`npm run check:workflow`、`npm run audit:problems`、`git diff --check`全部通过。workflow保留既有PlayerSlot别名提示；7活跃PG集中审计，无满足完整关闭条件的PG。
- 初次测试支架因TypeScript ESM打包、遗漏必需ground fixture失败，已修正后通过；来源断言改为实际 `experienceBinding.target`，不是不存在的AS3同名字段。未用这些基础设施失败充当变异拒绝。

原84责任仅核销“捕获造成的双owner身份/清理串扰”；235及其他公共消费者仍待，不能以本项身份修复宣布完整家族通过。下一项 `TASK-SETTINGS-235`，当前功能线继续Active。
