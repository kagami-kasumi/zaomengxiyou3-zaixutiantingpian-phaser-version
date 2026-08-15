# TASK-SLICE-173A2 正式 Runtime 视觉验收

## 显示列表与基准

- 正式显示列表保持单个 `role1-shadow-bitmap`，源身份仍为 `WuKong.swf` character 1 / `ROLE1_SHALLDOW`；`HeroPartyRuntimeBridge` 只复用 `Role1ShadowVisualBridge`，没有新增文字、矩形、占位图或第二套影分身视觉 owner。
- 原版机器真值继续直接消费 `task-settings-173.role1-shadow` 的 `/states` 与 `/displayObjects/0/placements`。
- 原版逐 cell 基准与 940×590 `walk/hit1/hit2/destroy/reentry` 对照继续引用 `docs/tasks/evidence/TASK-SLICE-173A3/` 的 9 张 JPEG；A2 只验证同一投射进入正式关卡后的状态一致性，不复制第二份视觉基准。
- 允许的现代可见例外：无。`qaRole1Shadow=1` 只注入测试 loadout、MP 与不可见的 canvas `data-formal-role1-shadow-qa` 观测；默认正式路由不启用。

## 正式逐状态差异

| 状态 | 正式观测 | verified 对照 | 差异 |
| --- | --- | --- | --- |
| walk | P1 `candidate=1/3` 分别投射 atlas frame `1/3`，source 为 `p1` | 创建时固定 row0 candidate；生命期不轮换 | 无 |
| hit1 | `lyfb` 输入后 `action=hit1, actionTick=3, frame=6`，随后动作末销毁 | row1 仅由 source `lyfb` 可达，10 tick 后销毁 | 无 |
| hit2 | `zz` 输入后 `action=hit2, actionTick=3, frame=11`，派生两段后销毁 | row2 仅由 source `zz` 可达，30 tick 后销毁 | 无 |
| P1/P2 | 自动专项验证双方独立 runtime/serial/source；940×590 双人页以合法 `Role2 + P2 Role1` 队伍加载 | source identity 必须指向创建者 | 无 |
| destroy/reentry | action frame-over、90 tick 与 `HeroPartyRuntime.destroy()` 均清理 model/view/projectile；再入 serial 不串 owner | AS3 `destroy()` 与 source shallowArray 生命周期 | 无 |

## 五关与 console

- 940×590：Stage 1-2 1P、Stage 1-3 2P、Stage 2-1 1P、Stage 2-2 2P、Stage 2-2 dev 1P 均完成加载/再入；最终 fresh console warning/error 为 0。
- Stage 1-2/1-3 的 preview QA 入口原先只接受 `import.meta.env.DEV`，会错误回落到活动存档并因未加载对应英雄 bundle 产生 `__MISSING` frame warning；A2 将本地 QA 许可与既有 Stage 2 入口统一后，目标 dev party 与 bundle 一致，fresh 复验为 0。
- 机器观测见同目录 `runtime-observation.json`；确定性 owner/input/target/projectile/destroy 断言见 `role1-shadow-skill-tests.ts`。
