# 216B结算预检：当前公式与215冲突

2026-09-14：216B Blocked，216B1唯一Ready。215 verified与216A显示结果不变，本批不修改src或宣称incoming数字已接入。

## 当前已证明的问题

| 情况 | 215源要求 | 实际现代结果 | 出处 |
| --- | --- | --- | --- |
| 101转嫁 | hero95、pet6 | hero96、pet6 | BaseHero.as:814..821的int赋回；PetTurtleSkillSystem.ts:332..333；system-tests.ts:4125..4131还断言96 |
| TestScene无敌拒绝 | hero/pet HP不变 | applyHeroDamage返回false，但pet200→194 | TestSceneCombatBridge.ts:195..224 / TestSceneBossArena.ts:175..197先转嫁再判保护 |
| TestScene满盾 | 先盾短路，不转嫁 | hero200不变，但pet200→194 | BaseHero.as:802..813；同两个现代caller |
| 既有Role3整数赋回 | sd1、101输入在override变为99，hero200→101 | hero200→100.01 | Role3.as:1201..1222；HeroCombatSystem.ts:135..142 |

源AS3路径相对 `local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/`。原215 sourceChecks/native整数测量为expected，当前导出的实际函数为actual。输入fixture与输出见 `tools/incoming-settlement-preflight.ts` 和 [settlement-preflight.json](settlement-preflight.json)。

预检执行：

```powershell
node -e "import('esbuild').then(e=>e.build({entryPoints:['tools/incoming-settlement-preflight.ts'],bundle:true,platform:'node',format:'esm',outfile:'.tmp/incoming-settlement-preflight.mjs'}))"
node .tmp/incoming-settlement-preflight.mjs --verify
```

后者退出1，在101→96而非95断言失败；JSON保留四个实际差异。该probe对顺序使用精确标记的当前TestScene调用顺序，证明真实结算边界的副作用，不冒称浏览器游戏trace；修复后必须由216B1的新共享入口测试直接消费生产caller，不以继续模拟旧顺序作为通过标准。

## 范围裁决

216B明确禁止修改既有公式，并要求遇到冲突拆同线解除项，故不能在数字view里显示95而继续扣96，也不能把现有玄龟link列为“不适用”。216B1只修当前整数/保护/盾/转嫁顺序，已有Role3数值边界一并闭合；不顺带完成未实现角色buff或整个玄龟家族。盾overflow/已存在override重入必须按源定位后验证。

只读子agent独立确认了101取整、两个TestScene caller、满盾/无敌和旧96断言；主agent运行实际函数探针并补Role3整数边界。没有退回原215真值或216A资源，降级的是既存现代结算边界的正确性假设。

父216原始范围、216B实际producer/正式五关/TestScene/可见运行验收、216C本地QA入口均保留；216B1完成后恢复216B，不切家族、不切功能线。

收尾验证：负向数值probe按预期退出1；check:structure通过（9项既存warning）；generate:harness与check:workflow通过（16项调度测试、7活跃PG合同、1250标注及关卡架构），唯一Ready为216B1；audit:problems已扫描并集中记录PG-004/017，PG-017反证已回写；git diff --check通过。本批只新增诊断与合同，不重复运行216A输入未变的渲染/build，不把文档门禁通过当结算修复。下一动作是216B1共享结算修复，不需要用户补材料或安装软件。
