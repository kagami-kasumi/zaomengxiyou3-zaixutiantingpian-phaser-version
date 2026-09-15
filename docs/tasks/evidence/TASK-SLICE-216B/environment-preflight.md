# 216B 环境承伤预检

2026-09-14。216B1修复了怪物→英雄与TestScene转嫁，但没有改环境直接扣血。继续216B时沿真实消费者发现第二个既存结算冲突，命中216B“修改既有伤害公式先拆解除项”规则。216B暂Blocked，216B2唯一Ready；不是源215/A/B1验收的反证。

## 当前执行证据

`tools/incoming-environment-preflight.ts` 调用真实 `createHeroPartyRuntimeModel` 与 `applyHeroPartyEnvironmentHits`，结果见 [environment-preflight.json](environment-preflight.json)。正常模式保存历史结果；`--verify`不覆盖JSON且退出1。

| 输入 | 原版结算期望（初始HP200） | 当前实际 |
| --- | --- | --- |
| 冰刺16.5 | int16，HP184 | HP183.5 |
| 火刺46.5 | int46，HP154 | HP153.5 |
| 冰刺16.5，盾100 | HP200，盾84 | HP183.5，盾100 |
| 火刺46.5，盾30 | HP184，盾0 | HP153.5，盾30 |
| 冰刺16.5，sd8，无flatdef | int16→int14，HP186 | HP183.5 |

这是当前共享环境消费者的真实函数执行，尚不是整场景、原版运行或视觉对账。源期望独立来自215冻结AS3调用与int参数语义；不修改原真值、失败数据或既有公式来让probe通过。

## 源与现代链

原版AS3均在 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`：

- `export/mapObject/IceThron.as:68..87`、`FireThron.as:65..87`：重复attack排除→`!isYourFather()`→像素碰撞→`reduceHp(randomDamage,true)`→setAttackBack→记录attack→beAttackDoing。
- `base/BaseHero.as:795..865`：int形参；盾先返回/溢出再入；已有转嫁；HP与producer；param2为true且非零才hurt。没有普通怪物受击保护时间判定。
- `export/hero/Role3.as:1201..1222`：int形参先接调用值，override比例再int赋回，盾/hit12时param2改false。
- `base/BaseObject.as:1140..1143` 的isYourFather是专用保护属性，不能未经证实直接等同现代 `invulnerableUntilMs` 普通受击间隔。`BaseHero.beAttackDoing:1571..1595` 多次受击才设置原版father，当前未实现的计量器不在解除项补造。

现代真实消费者：

- `Stage21IceHazardSystem.updateStage21IceHazards` 有hazardId/attackId与命中去重，生成10+random×10，但target没有保护字段。
- `Stage22FireHazardSystem.updateStage22FireHazards` 有isYourFather gate与hazardId/attackId，生成40+random×10；正式 `Stage22GameplayBridge` 和DEV桥却传固定false。
- `Stage21GameplayBridge:368`、`Stage22GameplayBridge:361`、`Stage22DevGameplayBridge:99` 把命中转为环境hit，丢掉source/attack身份。
- `HeroPartyRuntimeSystem.applyHeroPartyEnvironmentHits:267..282` 直接浮点扣HP和移动，绕开已有Role3/盾；这是上述5行失败的执行owner。

不得因子agent初查只搜资源名称而把冰/火刺判不存在；根agent已沿实际调用更正。当前特殊持续毒火目标是monster，不等同这里的环境冰/火刺。TestScene老宠物路径与GXP等仍由216B后续精确矩阵核对，不凭符号缺失推断不适用。

## 解除边界

216B2修复现有环境直接承伤：在同一共享hero HP结算内保留int入参、现有减伤与盾/溢出；按直接调用语义处理hurt，不照搬怪物碰撞保护。桥继续保留来源、attack、target和既有位移/死亡归属；当前已存在显式无敌状态需映射至环境门控且在消费attack ID前拒绝。保留modern flatdef一次扣除的已披露边界，不新增原版未实现能力。

以真实冰/火hazard和共享环境消费者、两个owner、连续不同来源/相同attack、保护解除后可命中、fraction/int次序、full/exact/overflow shield及Role3/nohurt测试和变异证明；正式/DEV桥均需核对。不接pnum、不改像素碰撞算法/资源、不新增受击计量器/GXP/家族或存档。216B2完成后恢复216B全部producer/正式运行合同。

```powershell
node -e "import('esbuild').then(e=>e.build({entryPoints:['tools/incoming-environment-preflight.ts'],bundle:true,platform:'node',format:'esm',outfile:'.tmp/incoming-environment-preflight.mjs'}))"
node .tmp/incoming-environment-preflight.mjs --verify
```
