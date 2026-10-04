"""257 preflight only: original hero move vs original Monster2 Tween request.

Controlled competing orders demonstrate an input gap, NOT actual world order.
The original Tween ABC executes; no hand-written ease or game implementation.
"""
from pathlib import Path
import hashlib
import json
import re
import struct
import subprocess
import zlib

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SRC = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-257/preflight'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-257'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def method(relative, name, records):
    path = SRC / relative
    text = path.read_text(encoding='utf-8')
    match = re.search(r'(?:override )?(?:private|protected|public) function ' + name + r'\(', text)
    assert match, (relative, name)
    start = text.index('{', match.end())
    depth, end = 1, start + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}')
        end += 1
    body = text[match.start():end]
    records.append(dict(path=path.relative_to(ROOT).as_posix(), line=text[:match.start()].count('\n') + 1,
                        method=name, fileSha256=digest(path), methodSha256=hashlib.sha256(body.encode()).hexdigest()))
    return body


def prepare():
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    def put(name, text):
        path = WORK / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
    move = method('base/BaseHero.as', 'move', records).replace('override protected function', 'protected function', 1)
    request = method('export/monster/Monster2.as', 'doHi2', records).replace('private function', 'public function', 1)
    put('BaseHero.as', '''package {import flash.display.*;import flash.geom.*;
public class BaseHero extends Sprite {
public var speed:Point=new Point(),enforceSpeed:Point=new Point(),graity:Number=0;
public var curAddEffect:Object=null,standInObj:Object=null;
public var gc:Object={isInSea:function():Boolean{return false;}};
public function isCanMoveByStage():Boolean{return true;}
public function isWaiting():Boolean{return false;}
public function runMove():void{move();}
''' + move + '}}')
    put('MonsterProbe.as', 'package {import flash.display.*;import com.greensock.TweenMax;public class MonsterProbe extends Sprite {public var gc:Object;' + request + '}}')
    put('Wall.as', 'package {public class Wall {public var speedX:Number=0;}}')
    put('BaseAddEffect.as', 'package {public class BaseAddEffect {public static const MONSTER47SLOW:String="slow47",MONSTER115SLOW:String="slow115",SPEEDUP:String="speedup";}}')
    put('AUtils.as', 'package {import flash.display.*;public class AUtils {public static function getNewObj(n:String):Object{return new MovieClip();}public static function flipHorizontal(o:DisplayObject,s:Number):void{o.scaleX=s;}}}')
    put('com/greensock/TweenMax.as', 'package com.greensock {public class TweenMax {public static var backend:Class,last:Object;public static function to(o:Object,t:Number,p:Object):void{last=backend.to(o,t,p);}}}')
    # Same tag-only library technique as task230: preserve original ABC bytes.
    source = ROOT / 'local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf'
    data = source.read_bytes()
    assert data[:3] in (b'CWS', b'FWS')
    body = zlib.decompress(data[8:]) if data[:3] == b'CWS' else data[8:]
    start = (5 + 4 * (body[0] >> 3) + 7) // 8 + 4
    pos, chunks, abc = start, [], []
    while pos < len(body):
        at = pos
        value = struct.unpack_from('<H', body, pos)[0]; pos += 2
        code, length = value >> 6, value & 63
        if length == 63:
            length = struct.unpack_from('<I', body, pos)[0]; pos += 4
        pos += length
        if code in (69, 82):
            chunks.append(body[at:pos])
        if code == 82:
            abc.append(hashlib.sha256(body[at:pos]).hexdigest())
        if code == 0:
            break
    assert abc
    payload = body[:start] + b''.join(chunks) + b'\x40\x00\x00\x00'
    (WORK / 'main-library.swf').write_bytes(b'FWS' + data[3:4] + struct.pack('<I', 8 + len(payload)) + payload)
    records.append(dict(path=source.relative_to(ROOT).as_posix(), fileSha256=digest(source), retainedAbcTagHashes=abc))
    put('Probe.as', (HERE / 'Probe.as').read_text(encoding='utf-8'))
    put('application.xml', '<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task257.preflight</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
    return records


def execute(label):
    commands = [
        ['java', '-Dflexlib=' + str(SDK / 'frameworks'), '-jar', str(SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'],
        [str(SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'), str(WORK / 'application.xml'), str(WORK)],
    ]
    for kind, command in zip(['compile', 'run'], commands):
        result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
        log = (result.stdout + result.stderr).decode(errors='replace')
        (WORK / f'{label}-{kind}.log').write_text(log, encoding='utf-8')
        assert result.returncode == 0, log[-4000:]
    assert '51,1,1,5' in log and 'COMPLETE 462' in log
    rows = [json.loads(line[4:]) for line in log.splitlines() if line.startswith('ROW ')]
    assert len(rows) == 462
    return rows, commands


def verify(rows):
    lookup = {(r['fps'], r['owner'], r['order'], r['tick']): r for r in rows}
    assert len(lookup) == 462
    differences = 0
    for fps in (20, 24, 30):
        for owner in (1, 2):
            dx = 5 if owner == 1 else -5
            for tick in range(1, fps + 1):
                only = lookup[fps, owner, 'tween-only', tick]
                before = lookup[fps, owner, 'move-then-tween', tick]
                after = lookup[fps, owner, 'tween-then-move', tick]
                assert before['x'] == only['x'] and before['y'] == only['y']
                assert abs(after['x'] - before['x'] - dx) < 1e-8
                assert abs(after['y'] - before['y'] - 2) < 1e-8
                differences += 1
            end = lookup[fps, owner, 'tween-only', fps]
            assert (end['x'], end['y']) == (400, 250)
    return differences


def main():
    records = prepare()
    rows, commands = execute('normal')
    differences = verify(rows)
    repeated, _ = execute('repeat')
    assert rows == repeated
    # The witness must reject a claimed order-independent coordinate result.
    damaged = json.loads(json.dumps(rows))
    for row in damaged:
        if row['order'] == 'tween-then-move' and row['tick']:
            row['x'] -= 5 if row['owner'] == 1 else -5
            row['y'] -= 2
    try:
        verify(damaged)
    except AssertionError:
        pass
    else:
        raise AssertionError('Order-erasure negative control was accepted')
    result = dict(status='verified-preflight-gap-only', runtime='AIR 51.1.1.5', sources=records,
                  commands=commands, states=len(rows), orderSensitivePairs=differences,
                  repeatEqual=True, orderErasureRejected=True, rows=rows,
                  probeSha256=digest(HERE / 'Probe.as'), runnerSha256=digest(Path(__file__)),
                  generatedHashes={p.relative_to(WORK).as_posix(): digest(p) for p in WORK.rglob('*.as')},
                  librarySha256=digest(WORK / 'main-library.swf'),
                  limitations=['Controlled renderTime ordering is not actual ENTER_FRAME order.',
                               'Hero stage gate=true, no effects/walls/sea/gravity; original move body preserved.',
                               'Blank raw clip is a service; no visual or collision truth claim.',
                               'No natural clock, pause/overwrite/death/exit, real HP or production acceptance.'])
    (OUT / 'coordinate-preflight.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: result[k] for k in ['status', 'states', 'orderSensitivePairs', 'repeatEqual', 'orderErasureRejected']}))


if __name__ == '__main__':
    main()
