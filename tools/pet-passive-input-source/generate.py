"""Serialize independently verified native observations, preserving 235 byte-for-byte."""
import hashlib,json
from capture import ROOT,OUT
from verify import verify
report=json.loads((OUT/'baseline/trace.json').read_text(encoding='utf-8'));assert verify(report)==997
checks=json.loads((OUT/'verification.json').read_text(encoding='utf-8'));assert checks['status']=='passed'
old=ROOT/'docs/reverse-engineering/reference/pet-passive-auto-buff-contract.json'
assert hashlib.sha256(old.read_bytes()).hexdigest()==checks['original235Sha256']
contract=dict(schemaVersion=1,contractId='task-settings-243.pet-passive-input',status='verified-bounded-behavior',
 scope='0..8 integer technique x warpower, four forms, 20/24/30fps; six source buff enrollment and local effect/property lifecycle. 8 raw getter and 8 uint setter boundary probes; nine effect refresh combinations.',
 runtime=report['runtime'],runtimeDllSha256=hashlib.sha256((ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll').read_bytes()).hexdigest(),
 sourceFragments='Reuse 235 explicit source-fragment and visual/network/movement sink boundaries; original PetInfo get/set technique/warpower added. No full original game/constructor/save loader. Controlled hero effect then property then pet effect loop.',
 sources=report['sources'],expectedCases=report['cases'],verification=checks,
 previousContract=dict(path=old.relative_to(ROOT).as_posix(),sha256=checks['original235Sha256'],cases=720),
 productionDomain=dict(normalGrowthIntegerRange=[0,8],codec='Modern decoder accepts nonnegative fractions and >8 from external payloads; raw getter and uint setter probes are distinct, not a claim of normal gameplay reachability.',evidence='docs/tasks/evidence/TASK-SETTINGS-243/production-domain.json'),
 visualStatus='not-in-scope; six symbols remain unverified visually',modernStatus='pending TASK-SLICE-242B production consumption')
output=ROOT/'docs/reverse-engineering/reference/pet-passive-input-contract.json'
output.write_text(json.dumps(contract,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print('243 independent sidecar',len(report['cases']),'cases',output.stat().st_size,'bytes')
