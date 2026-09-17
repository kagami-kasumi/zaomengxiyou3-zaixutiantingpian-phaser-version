"""Materialize the reviewed bounded successor drafts without activating them."""
from run import ROOT,OUT

UI='''
UI 原生化合同：
- 显示列表清单：父222内嵌222A的displayObjects及states，保留13符号递归child、depth、注册点、矩阵、mask/filter和原始命中区。
- 原版机器真值 JSON：`task-settings-222.pet-turtle-family`，`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`，pet-family-ground-truth Schema；未verified阻塞执行。资源层/Canvas直接消费派生且可回溯状态ID，不另造事实表。
- 原版视觉基准：222A原生24fps、940×590未裁切RGBA与动态host-tick基准；来源/哈希及重放入口见222A/B handoff。
- 允许的现代视觉例外：空。222B批准的20案例70碰撞像素仅属有限采样，不是视觉例外。
- 逐状态验收：本批全部声明动作/cell、方向、P1/P2、递归相位、进入/退出与适用技能组合；hover/pressed无对应战斗对象，记N/A。
- 差异证据：原版/现代同态叠图、像素与可见对象差异、原注册点还原；不得以零console或HP变化替代视觉验收。
'''
COMMON='''
任务类型：
- `TASK-SLICE`

任务模型：
- `常规任务`

功能条线：
- `LINE-PRE-STAGE-2-3-PRESENTATION`（Active）

目标机制/切片：
- `M-032`、`M-034`、`M-035`、`M-042`、`VS-012`、`VS-067`

规模预算：
- 主工作包：2
- 预计上下文压缩：0
- 独立验收批次：2

拆分触发：
- 新资料族、第三运行时owner或第三独立验收批次须执行前拆分；保留全部32合同及后续联合核销，不缩成单技能完成。

协作计划：
- 模式：主 agent + subagent
- 模型分工：主agent唯一写入；Luna只读核对完整消费者/独立验收
- 并行工作包：主agent实现时，子agent核对本批合同及负例
- 写入 owner：主 agent
- 归并检查点：实现前、验收前
- 方法观测：无

具体系统设计：
- `docs/architecture/system-designs/pet.md`；沿用当前唯一Runtime/EntitySession/Registry/bridge，不新增平行时钟、目标、HP、CD、朝向或移动owner。按设计验收协议执行，本批通过不能退出完整宠物设计。

禁止范围：
- 不修改原始提取/恢复SWF、其他家族或存档格式，不提前进入194，不以旧版1009异常制造现代错误。
'''

def main():
    folder=ROOT/'docs/tasks/task-definitions'
    resource=(OUT/'successor-resource-draft.md').read_text(encoding='utf-8').replace('# TASK-SLICE-223（接续定义草稿，父222核销后登记）','# TASK-SLICE-223')
    docs={'TASK-SLICE-223':resource+UI}
    source=(OUT/'successor-implementation-draft.md').read_text(encoding='utf-8')
    parts=source.split('\n## ')[1:]
    for part,gate in zip(parts,['P1TA','P1TB','P1T']):
        title,body=part.split('\n',1);task=title.split('：')[0]
        body=body.replace('输入：','输入资料：').replace('输出：','输出产物：').replace('完成定义与验收：','完成定义：\n\n验收标准：').replace('状态更新与下一步：','状态更新：\n\n推荐后续任务：')
        docs[task]='# '+task+'\n'+COMMON+body+UI+f'\n设计验收命令：\n- `npm run check:system-design -- pet {gate}`。本批实现并注册该有界gate；独立语义/变异/生产trace支撑，非零阻塞结项。P1TA/P1TB只证明各批，P1T必须联合全部32合同；不降低既有P1R/P1H/P1G。\n'
    for task,text in docs.items():
        path=folder/(task+'.md');assert not path.exists(),task
        path.write_text(text,encoding='utf-8',newline='')
    board=ROOT/'docs/tasks/task-board.md';text=board.read_text(encoding='utf-8')
    rows=[]
    for task,goal,next_task in [('TASK-SLICE-223','玄龟完整视觉与碰撞资源准备','TASK-SLICE-224A'),('TASK-SLICE-224A','玄龟公共入口/普攻/SLD/TXLJ','TASK-SLICE-224B'),('TASK-SLICE-224B','玄龟SYBH/奥义/受伤结算','TASK-SLICE-224C'),('TASK-SLICE-224C','玄龟全32合同与正式五关联合验收','按覆盖台账生成下一家族')]:
        rows.append(f'| {task} | Planned | LINE-PRE-STAGE-2-3-PRESENTATION | 玄龟有界接续 | {goal} | M-032、M-034、M-035、M-042、VS-012、VS-067 | 全族合同保留与本批独立交接 | {next_task} | [定义](task-definitions/{task}.md) |')
    marker='| TASK-SLICE-194 |';pos=text.index(marker)
    board.write_text(text[:pos]+'\n'.join(rows)+'\n'+text[pos:],encoding='utf-8')
    print('Registered four Planned successors; 222B remains unique Ready')

if __name__=='__main__':main()
