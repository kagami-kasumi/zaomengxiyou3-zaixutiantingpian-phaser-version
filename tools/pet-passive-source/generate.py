"""235 bounded behavior handoff; visual symbols are located, never promoted."""
import hashlib
import json
import re
import runpy
from capture import ROOT, SRC, OUT, old
from verify import verify

trace=json.loads((OUT/'baseline/trace.json').read_text(encoding='utf-8'))
assert verify(trace)==720
checks=json.loads((OUT/'verification.json').read_text(encoding='utf-8'))
assert checks['status']=='passed' and len(checks['sourceMutations'])==10 and len(checks['damagedReports'])==4
assert checks['baselineSha256']==hashlib.sha256((OUT/'baseline/trace.json').read_bytes()).hexdigest()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
inventory=[]
for p in sorted((SRC/'export/pet').glob('Pet*.as')):
    if not re.fullmatch(r'Pet[A-Za-z]+[1-5]',p.stem):continue
    text=p.read_text(encoding='utf-8')
    match=re.search(r'class '+p.stem+r' extends (\w+)',text)
    if not match:continue
    methods={}
    for name in ['step','doPassive','myIntelligence','checkBuffSkill']:
        if not re.search(r'function '+name+r'\(',text):continue
        body=old.method(text,name)
        methods[name]=dict(line=text[:text.index(body)].count('\n')+1,methodSha256=hashlib.sha256(body.encode()).hexdigest(),
                           callsSuper=('super.'+name+'(') in body, invokesSharedCheck='this.checkBuffSkill(' in body)
    inventory.append(dict(className=p.stem,base=match[1],path=p.relative_to(ROOT).as_posix(),sha256=sha(p),overrides=methods))
assert len(inventory)==46,len(inventory)
symbols=runpy.run_path(str(ROOT/'tools/turtle-visual/symbol_scripts.py'))['symbols']
pet=ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf'
visual={str(cid):name for cid,name in symbols(pet).items() if name in ['buff_'+n for n in ['sxkb','fsnl','smjc','mfjc','gjjc','fyjc']]}
assert len(visual)==6
static=[]
for path,names in [('base/BaseHero.as',['step','stepOther','initPet','changePet','destroy']),('base/BaseObject.as',['step']),('base/BaseAddEffect.as',['destroy','isAnyThingElseStun','isCannotContrlSkill','show_sxkb','show_fsnl','show_smjc','show_mfjc','show_gjjc','show_fyjc']),('petInfo/PetInfo.as',['gettechnique','getwarpower'])]:
    p=SRC/path;text=p.read_text(encoding='utf-8')
    for name in names:
        code=old.method(text,name)
        static.append(dict(path=p.relative_to(ROOT).as_posix(),method=name,line=text[:text.index(code)].count('\n')+1,fileSha256=sha(p),methodSha256=hashlib.sha256(code.encode()).hexdigest(),classification='static-source'))
contract=dict(schemaVersion=1,contractId='task-settings-235.pet-passive-auto-buff',status='verified-bounded-behavior',
 scope='Local BasePet passive and six automatic buffs; source methods/selected fragments, 720 controlled native cases. Full game, visual callbacks and unrelated hero buffs excluded.',
 contracts={
 'PB-01':'One selected live session, counters belong to BasePet instance; default 300, replacement resets, resting roster does not tick.',
 'PB-02':'Passive postincrement >= frameClips: period fps+1; heal HP then MP using prior upPassive values, refresh after AI.',
 'PB-03':'upPassive int(level/5): HP 3x quotient, MP quotient; HP cure skips dead, MP cure does not.',
 'PB-04':'Stun skips AI and automatic counters, not preceding passive; host pause skips steps entirely.',
 'PB-05':'Six ordered independent checks sxkb/fsnl/smjc/mfjc/gjjc/fyjc; learned and >=20 MP; sequential debit permits multiple in one step.',
 'PB-06':'sxkb reset4320, others5400 original calls, not fps-normalized seconds; uint duration before multiplication by fps.',
 'PB-07':'sxkb/fsnl on pet; four stat buffs on source hero; source harm first gets final1.05, old value survives same-name refresh.',
 'PB-08':'Hero effect step -> hero integer property add/remove -> pet step; zero-left property removal precedes next effect nulling.',
 'PB-09':'Pet destroy clears pet effect and owner link but does not remove already enrolled hero effects; replacing resets pet timers.',
 'PB-10':'Dragon private type1 skips checkBuffSkill; all46 extracted class override inventory retained, no generic all-roster or all-private-entity tick.'},
 runtime=trace['runtime'],runtimeDllSha256=sha(ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll'),sources=trace['sources'],staticSources=static,inheritanceInventory=inventory,
 sourceFragments={'BaseAddEffect.step':'first/startTime and expiration/null removal/count++ for six names; visual callbacks omitted',
 'BaseAddEffect.remove':'original indexOf/null assignment; visual hide callbacks omitted',
 'BaseRoleProperies.step':'four PET stat-buff checks only; own regen/input/other buffs omitted',
 'BaseRoleProperies.addBuff/removeBuff':'four PET cases plus original guards/storage; other buffs omitted',
 'BasePet.destroy':'verbatim caller; BBDC/Tween/network/protection/child visualization are sinks',
 'Info':'controlled integer stat storage and skill lookup; original upPassive/harm/cost executed; no full PetInfo constructor'},
 expectedCases=trace['cases'],verification=checks,
 visual=dict(status='located-not-visual-verified',path=pet.relative_to(ROOT).as_posix(),sha256=sha(pet),symbols=visual,requiredFollowup='independent display/timeline truth and production projection before visual closure'),
 modern=dict(diagnostic='docs/tasks/evidence/TASK-SETTINGS-235/actual-party-preflight.json',status='pending',nextTask='TASK-SLICE-242',formalEntry='src/scenes/HeroPartyRuntimeBridge.ts:updatePets',
 timerOwner='existing PetCombatEntitySession original host tick; no second clock',
 slotStatsOwner='same party hero combat/skill/baseStats',
 retainedContracts='docs/reverse-engineering/evidence/TASK-SLICE-226-contract-coverage.md'))
destination=ROOT/'docs/reverse-engineering/reference/pet-passive-auto-buff-contract.json'
destination.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('235 handoff:720 native cases,46 extracted classes,6 located visual symbols; production pending')
