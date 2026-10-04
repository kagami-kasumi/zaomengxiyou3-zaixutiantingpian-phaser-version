"""Compact independently specified contract and boundary witness projection."""
import json
from evidence import OUT, digest
from fixtures import generate
from effects import cases
from verify_effects import expected

SPEC = {'status': 'verified', 'task': 'TASK-SETTINGS-252', 'scope': 'PetInfo miss/mDef and rabbit2/3/4 current Jifeng receiver gate only; not modern Scene or visual completion', 'units': {'miss': 'fraction', 'mDef': 'fraction', 'time': 'effect step ticks'}, 'rules': {'initial': {'miss': 0, 'mDef': 0}, 'growth': {'minimumNewLevel': 60, 'maxPetLevel': 90, 'randomOrder': ['miss', 'mDef', 'crit'], 'miss': 'previous + 0.01 * floor(r0 * 2)', 'mDef': 'previous + 0.01 + 0.01 * floor(r1 * 1)', 'crit': 'previous + 0.01 + 0.01 * floor(r2 * 2)', 'clampOnGrowth': False, 'scope': 'perception=0 suppresses independent skill-learning draws in upgrade fixtures'}, 'save': {'mDefIndex': 10, 'missIndex': 12, 'loadUpperCaps': {'mDef': 0.36, 'miss': 0.48}, 'lowerClamp': False, 'blankNumericField': 0, 'nonNumericField': 'NaN', 'truncatedBeforeSkillField': 'throws 1009 after partial mutation; invalid save'}, 'reset': {'returnToChildRetainsReceptionAttributes': True, 'reinitializeExistingPetRetainsReceptionAttributes': True}, 'jifeng': {'requiredSkill': 'jf', 'mpCost': 20, 'secondsByForm': {'2': 5, '3': 10, '4': 10}, 'activeImmediatelyAfterAdd': True, 'firstStepSetsStart': True, 'expiration': 'count - startTime >= duration before count increment', 'refresh': 'time replaced; startTime=count; isFirst retained', 'pause': 'no step, no elapsed ticks', 'destroy': 'clear array; count=0; sourceRole=null', 'cooldownIsNotActiveGate': True}}, 'modernUnknowns': {'legacyModernMissingFields': 'Historical random unavailable; retain missing provenance; no original value can be inferred from level', 'policy': 'Modern fallback requires separate explicit migration decision; not an AS3 fact'}, 'formalSceneVerified': False}


def build():
    report=json.loads((OUT/'verification.json').read_text(encoding='utf-8'))
    witnesses=[]
    for case in cases():
        row=expected(case)
        states=row.pop('states')
        indices={0,len(states)-1}
        for i,state in enumerate(states):
            if i and (any(state[k]!=states[i-1][k] for k in ['active','start','duration','source']) or state['count']!=states[i-1]['count']+1):
                indices.update(j for j in [i-1,i,i+1] if 0<=j<len(states))
        row.update(fixture=case,stateCount=len(states),witnesses=[dict(index=i,**states[i]) for i in sorted(indices)])
        witnesses.append(row)
    return dict(SPEC, attributeCases=generate(),effectBoundaryCases=witnesses,
                coverage=report['coverage'],evidence=dict(path='docs/tasks/evidence/TASK-SETTINGS-252/verification.json',sha256=digest(OUT/'verification.json')),
                sourceFiles=json.loads((OUT/'attribute-sources.json').read_text(encoding='utf-8')))
