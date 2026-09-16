"""Cross-check observed native children against original timeline placements."""
import copy
import gzip
import hashlib
import json
from pathlib import Path

from verify_effects import compare

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'


def fields(node,cid,source,failures,identity):
    frames=source['timelines'].get(str(cid))
    if frames is None:return
    if not isinstance(node.get('frame'),int) or not 1<=node['frame']<=len(frames):return
    for expected,child in zip(frames[node['frame']-1],node['children']):
        label=identity+':'+child['path']
        # SWF clipDepth masks are separate from the native DisplayObject.mask accessor.
        if child['mask'] is not None:failures.append((label,'unexpected-dynamic-mask'))
        if not child['visible']:failures.append((label,'visibility'))
        if child['blendMode']!='normal' or expected['blendMode'] not in (0,1):failures.append((label,'blend'))
        color=expected['colorTransform'] or {}
        for channel in ('red','green','blue','alpha'):
            multiplier=int(color.get(channel+'MultTerm',256))/256 if color.get('hasMultTerms')=='true' else 1
            offset=int(color.get(channel+'AddTerm',0)) if color.get('hasAddTerms')=='true' else 0
            if abs(child['colorTransform'][channel+'Multiplier']-multiplier)>1e-7:failures.append((label,channel+'Multiplier'))
            if child['colorTransform'][channel+'Offset']!=offset:failures.append((label,channel+'Offset'))
        filters=expected['filters']
        if len(filters)!=len(child['filters']):failures.append((label,'filter-count'))
        else:
            for original,native in zip(filters,child['filters']):
                assert original['attributes']['type']=='COLORMATRIXFILTER'
                matrix=[float(item['item']['text']) for item in original['children'][0]['matrix']['children']]
                if native['type']!='flash.filters::ColorMatrixFilter' or native['matrix']!=matrix:failures.append((label,'filter-matrix'))
        fields(child,expected['characterId'],source,failures,identity)


def main():
    sources=json.loads((OUT/'source-definitions.json').read_text(encoding='utf-8'))['sources']
    symbols={name:(s,cid) for s in sources for name,cid in s['symbols'].items() if 'Bmd' not in name}
    failures=[];counts={'effects':0,'dynamic':0}
    selected=None
    def validate(node,identity,corpus):
        nonlocal selected
        if node['type'] in symbols:
            source,cid=symbols[node['type']]
            compare(node,cid,source,failures,identity);fields(node,cid,source,failures,identity);counts[corpus]+=1
            if selected is None and node['children']:selected=(node,source,cid)
            return
        for child in node.get('children',[]):validate(child,identity,corpus)
    # Synthetic effects roots have generic class names; symbol identity is external.
    effects=json.loads(gzip.decompress((OUT/'effects-native.json.gz').read_bytes()))
    for state in effects['states']:
        node=state['tree'];source,cid=symbols[state['symbol']]
        compare(node,cid,source,failures,state['symbol']);fields(node,cid,source,failures,state['symbol']);counts['effects']+=1
    dynamic=json.loads((ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/dynamic-air/measurement.json').read_text(encoding='utf-8'))
    for row in dynamic['rows']:validate(row['display'],row['id']+':'+str(row['tick']),'dynamic')
    node,source,cid=selected;mutant=copy.deepcopy(node);mutant['children'][0]['mask']='mutated-mask';detected=[];fields(mutant,cid,source,detected,'mask')
    report=dict(status='passed-bounded-check' if not failures else 'failed',nativeSymbolStates=counts,failures=failures[:30],failureCount=len(failures),mutationRejected={'nativeMaskAccessor':bool(detected)},
                maskSemantics='Original SWF clipDepth is retained in source-definitions timelines. Native mask accessor is separately observed null; it does not represent timeline mask absence.',
                relatedChecks=['mask-mutations.json'],unresolved=['Full expected/extracted state identity and Schema promotion.'])
    (OUT/'display-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps(report));assert not failures and detected


if __name__=='__main__':main()
