"""Exact inherited creation sites; never infer shared HUD coverage from a task title."""
import hashlib
import json
from generate import method
from ui_truth import ROOT,OUT,sha,read


def main():
    source=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
    pet=source/'base/BasePet.as';text=pet.read_text(encoding='utf-8')
    def locator(name):
        code=method(text,name)
        return dict(path=pet.relative_to(ROOT).as_posix(),method=name,line=text[:text.index(code)].count('\n')+1,fileSha256=sha(pet),sliceSha256=hashlib.sha256(code.encode()).hexdigest())
    monkey=[]
    for form in range(1,5):
        path=source/f'export/pet/PetMonkey{form}.as';code=path.read_text(encoding='utf-8')
        assert 'addAoyiBuff(' not in code
        monkey.append(dict(path=path.relative_to(ROOT).as_posix(),sha256=sha(path)))
    assert text.count('addAoyiBuff(')==1
    number=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json'
    for name in ['hurt-natural','hurt-geometry','inherited-display']:
        report=read(OUT/(name+'-verification.json'));assert report['status'].startswith('passed') and not report.get('failures')
    entries=[
        dict(name='HeroBeHurt',source=locator('addBeAttackEffect'),relation='Direct child on accepted pet hit; original hue=100 filter and colipse offset.',
             evidence=['hurt-natural-verification.json','hurt-geometry-verification.json']),
        dict(name='miss',source=locator('addMissMc'),relation='Scene-level miss bitmap with upward/fade tween.',
             evidence='inherited-display-verification.json; original StageCommon char8 decoded bitmap',
             priorReuseRejected='211 miss-p1 has zero objects; its title alone does not establish this bitmap.'),
        dict(name='hpSlip',source=[locator(n) for n in ['newHpSlip','drawPetHp','showHpSlip']],relation='Persistent pet child; source vector HP bar plus two-second fade.',
             evidence='inherited-display-verification.json; source vector grammar, directions, negative/zero/half/full/overfull HP and source easeOut',
             priorReuseRejected='191 does not contain hpSlip; original four methods are measured in this task instead.'),
        dict(name='pnum',source=locator('addMonHurtMc'),relation='Scene-level incoming damage digits; independent of principal projectile geometry.',
             reuse=dict(path=number.relative_to(ROOT).as_posix(),sha256=sha(number),pointer='/visualTruth')),
        dict(name='AoyiBuff',source=locator('addAoyiBuff'),relation='BasePet helper, no caller in Monkey1..4 or BasePet; excluded from monkey active display inventory.',
             noMonkeyCallerSources=monkey,horseFollowup='Already explicitly required by TASK-SETTINGS-229; not monkey4 jgaoyi.')]
    result=dict(status='verified-mapped',entries=entries,
                scope='Main-agent checked inherited creation sites; native hurt timeline, bounded source HP/miss geometry/tween clock, and genuine 215 numeric feedback reuse. No full game or TweenMax scheduler claim.')
    (OUT/'hurt-inventory.json').write_text(json.dumps(result,indent=2)+'\n')
    print('228 inherited inventory: 5 entries reconciled; monkey AoyiBuff excluded by callers')


if __name__=='__main__':main()
