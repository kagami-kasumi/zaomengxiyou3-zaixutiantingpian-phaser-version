"""Independent IDs, explicit native/static evidence boundaries and case linkage."""
import json
from prepare import ROOT,SRC,method
from verify import verify_sources
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-221'
IDS='entry.forms ai.priority ai.range ai.owner ai.target ai.follow normal.1 normal.2 normal.3 normal.4 sld.gates sld.release sld.effect sld.link-heal txlj.release txlj.damage txlj.heal sybh.release sybh.effects aoyi.gate aoyi.chain aoyi.damage-window aoyi.hurt aoyi.cleanup damage.power damage.snapshot damage.dedup damage.defense hurt.counter hurt.death lifecycle.destroy lifecycle.replace'.split()
STATIC={'entry.forms','ai.follow','lifecycle.replace'}
def check():
    data=json.loads((OUT/'behavior-contract.json').read_text(encoding='utf-8'))
    assert {c['id'] for c in data['contracts']}==set(IDS) and len(data['contracts'])==len(IDS)
    traces={name:json.loads((OUT/name).read_text(encoding='utf-8')) for name in ['source-trace.json','settlement-trace.json','hit-trace.json']}
    for trace in traces.values():verify_sources(trace)
    report=[]
    for contract in data['contracts']:
        cid=contract['id'];src=contract['source'];verify_sources({'sources':[src]})
        trace_name='settlement-trace.json' if cid in ['txlj.damage','txlj.heal'] else 'hit-trace.json' if cid.startswith('damage.') and cid!='damage.power' else 'source-trace.json'
        trace=traces[trace_name]
        native=cid not in STATIC
        if native:
            assert any(r['path']==src['path'] and (r.get('method')==src['method'] or src['method'] in r.get('startMarker','')) for r in trace['sources']),cid
        selectors=contract['fixtureSelector'].split('|')
        if cid=='ai.target':selectors=['target-']
        if cid=='sld.link-heal':selectors=['linked-sld-']
        if cid=='aoyi.gate':selectors=['aoyi-low-mp','aoyi-enough-mp']
        if trace_name!='source-trace.json':selectors=['']
        cases=[c['id'] for c in trace['cases'] if any(c['id'].startswith(prefix) for prefix in selectors)] if native else []
        assert cases or not native,cid
        report.append(dict(id=cid,sourceValidated=True,sourceKind='AS3-declaration',nativeExecution='controlled-source-slice' if native else 'not-executed-static-call-chain',
            traceFile=trace_name if native else None,caseIds=cases,modernExecution='not-implemented',geometry='222-required',
            scope='Assertions verify selected semantic fields; extra diagnostic event fields are not blanket-verified.'))
    # Inspect actual modern consumer files without claiming they implement turtle.
    for name in {c['modernConsumer'] for c in data['contracts']}:
        assert list((ROOT/'src').rglob(name+'.ts')),name
    result=dict(contracts=report,staticOnly=sorted(STATIC),nativeContractCount=len(IDS)-len(STATIC))
    (OUT/'coverage.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('32 source contracts linked; 29 controlled native, 3 static caller/follow contracts; modern unverified')
if __name__=='__main__':check()
