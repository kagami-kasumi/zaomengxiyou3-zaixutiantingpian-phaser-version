"""Archive the completed evidence tasks after accepted full-family promotion."""
import json
from run import ROOT,OUT,sha

def write(path,text):path.write_text(text,encoding='utf-8',newline='')

def main():
    acceptance=json.loads((OUT/'family-acceptance.json').read_text(encoding='utf-8'))
    manifest=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json'
    assert acceptance['status']=='accepted' and acceptance['manifestSha256']==sha(manifest)
    summary='2026-09-17 TASK-SETTINGS-222B及父222完成：完整家族真值verified，保留222A全部13符号视觉与221全部32行为合同；94,656静态、31,344绘制后及31,704攻击入口碰撞案例，命中布尔全部一致。静态20案例70像素仅按用户批准的精确列表接受，动态像素零差异。223资源准备唯一Ready，224A/B/C Planned；玄龟现代实现、204、VS-067及功能线仍未完成。见 `docs/tasks/evidence/TASK-SETTINGS-222B/handoff.md`。'
    history=ROOT/'docs/tasks/task-history.md';text=history.read_text(encoding='utf-8')
    definitions=[];table=[]
    for task,title in [('TASK-SETTINGS-222B','玄龟碰撞真值与父合同核销'),('TASK-SETTINGS-222','玄龟完整家族视觉/碰撞真值')]:
        path=ROOT/f'docs/tasks/task-definitions/{task}.md';body=path.read_text(encoding='utf-8')
        assert '\n### '+task+'\n' not in text
        definitions.append('### '+task+'\n'+body.split('\n',1)[1]+'\n完成记录：'+summary+'\n')
        table.append(f'| {task} | {title} | 完整32合同与原生视觉/有限碰撞联合交接 | M-032、M-034、M-035、M-042、VS-012、VS-067 | [交接](evidence/TASK-SETTINGS-222B/handoff.md)；223 Ready，现代家族待实现 |')
    marker='| --- | --- | --- | --- | --- |';position=text.index(marker)+len(marker)
    text=text[:position]+'\n'+'\n'.join(table)+text[position:]
    write(history,text+'\n\n'+'\n\n'.join(definitions))
    board=ROOT/'docs/tasks/task-board.md';lines=board.read_text(encoding='utf-8').splitlines()
    lines=[line for line in lines if not line.startswith('| TASK-SETTINGS-222 |') and not line.startswith('| TASK-SETTINGS-222B |')]
    write(board,'\n'.join(line.replace('| TASK-SLICE-223 | Planned |','| TASK-SLICE-223 | Ready |') for line in lines)+'\n')
    for task in ['TASK-SETTINGS-222','TASK-SETTINGS-222B']:
        (ROOT/f'docs/tasks/task-definitions/{task}.md').unlink()
    for relative in ['docs/tasks/feature-line-coverage/LINE-PRE-STAGE-2-3-PRESENTATION.md','docs/reverse-engineering/mechanics-index.md','docs/tasks/vertical-slices.md','docs/reverse-engineering/pet-turtle-family-index.md']:
        path=ROOT/relative;text=path.read_text(encoding='utf-8');heading,rest=text.split('\n',1)
        write(path,heading+'\n\n'+summary+'\n'+rest)
    path=ROOT/'docs/tasks/feature-lines.md';text=path.read_text(encoding='utf-8')
    lines=text.splitlines()
    for i,line in enumerate(lines):
        if line.startswith('| LINE-PRE-STAGE-2-3-PRESENTATION | Active |'):
            lines[i]=line.replace('TASK-SETTINGS-222B','TASK-SLICE-223').replace('222A完整视觉verified；222B碰撞与父合同联合核销仍待','222全族视觉/有限碰撞verified；223资源准备及224A/B/C正式实现待')
    write(path,'\n'.join(lines)+'\n\n'+summary+'\n')
    parent=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222/handoff.md'
    write(parent,'# TASK-SETTINGS-222 完整交接\n\n'+summary+'\n\n完整manifest：`docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json`。机器核销、原生归档、32合同矩阵与精确残差许可见222B evidence；222A原版视觉基准原样保留。\n')
    draft=OUT/'family-draft.json'
    if draft.exists():draft.unlink()
    print('Archived 222/222B; activated resource task 223 only')

if __name__=='__main__':main()
