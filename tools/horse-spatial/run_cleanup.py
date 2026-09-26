"""Native original TweenMax scheduling of the original horse explosion callback."""
import json
import subprocess
import sys
from prepare_cleanup import ROOT,BASE,WORK,OUT
from run_lifecycle import SDK,sha

def main():
    fps=int(sys.argv[1]) if len(sys.argv)>1 else 24
    probe=WORK/'CleanupProbe.as'
    sources=json.loads((OUT/'source-definitions.json').read_text())['sources']
    paths=[str(ROOT/s['path']) for s in sources]+[str(BASE/'body-air/body-source.swf')]
    (WORK/'fixtures.json').write_text(json.dumps(dict(fps=fps,sources=[dict(path=p) for p in paths],bodies=json.loads((OUT/'body-inputs.json').read_text()))))
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task229.cleanup</id><versionNumber>1.0.0</versionNumber><filename>CleanupProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>CleanupProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=CleanupProbe.swf','CleanupProbe.as']
    r=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(r.stdout+r.stderr)
    assert r.returncode==0,(r.stdout+r.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:r=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=90)
    lines=((WORK/'stdout.log').read_bytes()+(WORK/'stderr.log').read_bytes()).decode(errors='replace').splitlines()
    assert r.returncode==0 and any(l.startswith('COMPLETE ') for l in lines),'\n'.join(lines[-12:])
    rows=json.loads((WORK/'rows.json').read_text());delays=json.loads((WORK/'delays.json').read_text())
    assert len(rows)==80*2*(fps*2+15)
    report=dict(status='measured-not-promoted',fps=fps,rows=rows,delays=delays,environment=[json.loads(l[4:]) for l in lines if l.startswith('ENV ')],probeSha256=sha(probe),compiledSha256=sha(WORK/'CleanupProbe.swf'),methodsSha256=sha(OUT/'cleanup-methods.json'),pet1Sha256=sha(ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf'),scope='Exact BasePet.destroy with original TweenMax to/delayedCall; see cleanup-methods for bounded services. Explicit dead/live destroy entry, not HP/death or replacement caller proof.')
    (WORK/f'measurement-{fps}.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    print('229 cleanup',fps,len(rows),'rows',len(delays),'native delays')

if __name__=='__main__':main()
