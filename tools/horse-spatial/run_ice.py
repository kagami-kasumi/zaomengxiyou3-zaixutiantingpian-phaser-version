"""Natural host execution for original horse ice attachment and bounded expiry."""
import json
import shutil
import subprocess
import sys
from prepare_ice import ROOT,WORK,OUT
from run_lifecycle import SDK,sha

def main():
    fps=int(sys.argv[1]) if len(sys.argv)>1 else 24
    source=ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf';probe=ROOT/'tools/horse-spatial/IceProbe.as'
    shutil.copyfile(probe,WORK/probe.name)
    (WORK/'fixtures.json').write_text(json.dumps(dict(fps=fps,source=str(source))))
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task229.ice</id><versionNumber>1.0.0</versionNumber><filename>IceProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>IceProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=IceProbe.swf','IceProbe.as']
    r=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(r.stdout+r.stderr)
    assert r.returncode==0,(r.stdout+r.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    with (WORK/'stdout.log').open('wb') as stdout,(WORK/'stderr.log').open('wb') as stderr:r=subprocess.run(command,cwd=WORK,stdout=stdout,stderr=stderr,timeout=90)
    lines=((WORK/'stdout.log').read_bytes()+(WORK/'stderr.log').read_bytes()).decode(errors='replace').splitlines()
    assert r.returncode==0 and any(l.startswith('COMPLETE ') for l in lines),'\n'.join(lines[-10:])
    rows=json.loads((WORK/'rows.json').read_text());assert len(rows)==60*(fps*5+1)
    report=dict(status='measured-not-promoted',fps=fps,rows=rows,environment=[json.loads(l[4:]) for l in lines if l.startswith('ENV ')],sourceSha256=sha(source),probeSha256=sha(probe),compiledSha256=sha(WORK/'IceProbe.swf'),methodsSha256=sha(OUT/'ice-methods.json'),scope='Native host and original ice/buff methods with explicit ice-only step projection. Hero input services observed via sinks; actual target death caller not executed.')
    (WORK/f'measurement-{fps}.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    print('229 ice:',fps,'fps',len(rows),'states')

if __name__=='__main__':main()
