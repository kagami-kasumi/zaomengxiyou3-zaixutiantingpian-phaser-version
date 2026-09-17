"""Exact user-approved tuples, never a channel tolerance or state-wide exemption."""
import numpy as np
from run import ROOT, OUT, sha
from verify_pixels import load


def approved():
    approval=load(OUT/'visual-exception-approval.json')
    assert approval['status']=='user-approved'
    table=ROOT/approval['table'];assert sha(table)==approval['tableSha256']
    data=load(table)
    assert data['differentStates']==approval['states']==28 and data['differentPixels']==approval['pixels']==308
    rows={r['id']:r for r in data['results']}
    assert len(rows)==28 and sum(len(r['pixels']) for r in rows.values())==308
    return rows


def matches(identity,baseline_sha,expected,candidate,rows):
    a,b=np.asarray(expected),np.asarray(candidate)
    if a.shape!=b.shape:return False
    coords=np.argwhere(np.any(a!=b,axis=2))
    if not len(coords):return True
    row=rows.get(identity)
    if row is None or row['baselineSha256']!=baseline_sha:return False
    actual=[dict(x=int(x),y=int(y),original=a[y,x].tolist(),candidate=b[y,x].tolist()) for y,x in coords]
    return actual==row['pixels']
