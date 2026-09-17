"""Bind effects canonical-origin inputs to the independently re-executed observer."""
import json
from run import ROOT, BASE, OUT, sha
from pack import encoded


def main():
    old=BASE/'effects';work=BASE/'effects-replay'
    replay=json.loads((OUT/'effects-replay.json').read_text());assert replay['status']=='passed'
    log=(work/'stdout.log').read_text(errors='replace')+(work/'stderr.log').read_text(errors='replace')
    observed=[json.loads(line[6:]) for line in log.splitlines() if line.startswith('STATE ')]
    original=json.loads((old/'measurement.json').read_text())['states']
    assert observed==original,'Source states changed during replay'
    count=0
    for state in original:
        for baseline in state['baselines']:
            assert sha(old/baseline['path'])==sha(work/baseline['path'])
            count+=1
    assert count==2440
    paths=[OUT/'effects-replay.json',old/'measurement.json',work/'stdout.log',work/'stderr.log',ROOT/'tools/turtle-projection/verify_replay_stages.py']
    (OUT/'effects-replay-stages.json').write_bytes(encoded(dict(status='passed',states=count,sourceTraceUnchanged=True,inputSha256={p.relative_to(ROOT).as_posix():sha(p) for p in paths})))
    print('Effects replay canonical-origin inputs:2440 captures byte-identical;source trace unchanged')


if __name__=='__main__':main()
