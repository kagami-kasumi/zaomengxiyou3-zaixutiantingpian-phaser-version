"""Reproducible, byte-preserving source extraction for TASK-SETTINGS-244.

This is deliberately a source task only.  It reads the restored pet1.swf,
locates the six real SymbolClass entries, follows raw MovieClip placements,
and writes a small SWF containing the complete reachable definition closure.
The JSON records binary facts and unresolved parser fields; it does not claim
runtime or verified visual truth.
"""
import hashlib
import json
import re
import struct
import subprocess
import xml.etree.ElementTree as ET
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'local-resources/regima/source/restored-swfs/assets/pet1.swf'
LOCAL = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-244/source'
EVIDENCE = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-244'
FFDEC = Path('C:/Program Files (x86)/FFDec/ffdec-cli.exe')
JAVA_FFDEC = Path('C:/Program Files (x86)/FFDec/ffdec.jar')
TARGETS = {
    'sxkb': 806, 'fsnl': 713, 'smjc': 805,
    'mfjc': 778, 'gjjc': 761, 'fyjc': 738,
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def swf_tags(path):
    raw = path.read_bytes()
    if raw[:3] not in (b'FWS', b'CWS'):
        raise ValueError('not a SWF: ' + str(path))
    data = zlib.decompress(raw[8:]) if raw[:3] == b'CWS' else raw[8:]
    pos = (5 + (data[0] >> 3) * 4 + 7) // 8 + 4
    tags = []
    while pos + 2 <= len(data):
        start = pos
        header = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        code, size = header >> 6, header & 63
        header_size = 2
        if size == 63:
            size = struct.unpack_from('<I', data, pos)[0]
            pos += 4
            header_size += 4
        body = data[pos:pos + size]
        pos += size
        tags.append(dict(code=code, body=body, sourceOffset=start,
                         encodedHeaderSize=header_size, bodyLength=size))
        if code == 0:
            break
    return raw, data, tags


def symbol_class(tags):
    result = {}
    for tag in tags:
        if tag['code'] != 76:
            continue
        body = tag['body']
        count = struct.unpack_from('<H', body)[0]
        pos = 2
        for _ in range(count):
            cid = struct.unpack_from('<H', body, pos)[0]
            pos += 2
            end = body.index(0, pos)
            result[cid] = body[pos:end].decode('utf-8', 'replace')
            pos = end + 1
    return result


def definitions(tags):
    result = {}
    for order, tag in enumerate(tags):
        if tag['code'] in (2, 6, 20, 21, 22, 32, 35, 36, 39, 83, 90):
            cid = struct.unpack_from('<H', tag['body'])[0]
            result[cid] = dict(tag=tag, order=order)
    return result


def iter_tags(body, start=0):
    pos = start
    while pos + 2 <= len(body):
        header = struct.unpack_from('<H', body, pos)[0]
        pos += 2
        code, size = header >> 6, header & 63
        if size == 63:
            size = struct.unpack_from('<I', body, pos)[0]
            pos += 4
        child = body[pos:pos + size]
        pos += size
        yield code, child
        if code == 0:
            return


def placement_fact(code, body, locator):
    flags = body[0] if body else None
    pos = 1
    if code == 70:
        extra = body[1] if len(body) > 1 else 0
        pos += 1
    else:
        extra = None
    depth = struct.unpack_from('<H', body, pos)[0] if len(body) >= pos + 2 else None
    pos += 2
    character = None
    if flags is not None and flags & 2 and len(body) >= pos + 2:
        character = struct.unpack_from('<H', body, pos)[0]
        pos += 2
    # Matrix, color transform, filters and clip actions are variable bit/record
    # structures. Preserve their exact bytes and expose the presence flags; the
    # native/runtime pass owns semantic decoding of these fields.
    known = {
        'hasCharacter': bool(flags is not None and flags & 2),
        'hasMatrix': bool(flags is not None and flags & 4),
        'hasColorTransform': bool(flags is not None and flags & 8),
        'hasRatio': bool(flags is not None and flags & 16),
        'hasName': bool(flags is not None and flags & 32),
        'hasClipDepth': bool(flags is not None and flags & 64),
        'hasClipActions': bool(flags is not None and flags & 128),
    }
    if code == 70:
        known.update({
            'hasFilterList': bool(extra is not None and extra & 1),
            'hasBlendMode': bool(extra is not None and extra & 2),
            'hasCacheAsBitmap': bool(extra is not None and extra & 4),
            'hasClassName': bool(extra is not None and extra & 8),
            'hasImage': bool(extra is not None and extra & 16),
            'hasVisible': bool(extra is not None and extra & 32),
        })
    return dict(locator=locator, code=code, flags=flags, extraFlags=extra,
                depth=depth, characterId=character, **known,
                rawBodySha256=hashlib.sha256(body).hexdigest(),
                rawBodyLength=len(body),
                unresolvedTailSha256=hashlib.sha256(body[pos:]).hexdigest(),
                unresolvedTailLength=max(0, len(body) - pos))


def timeline_fact(cid, definition):
    code, body = definition['tag']['code'], definition['tag']['body']
    if code != 39:
        return None
    frame_count = struct.unpack_from('<H', body, 2)[0]
    frames = []
    current = {}
    sub_index = 0
    for child_code, child in iter_tags(body, 4):
        locator = f'DefineSprite/{cid}/subTags/{sub_index}'
        sub_index += 1
        if child_code in (26, 70):
            fact = placement_fact(child_code, child, locator)
            if fact['depth'] is not None and fact['hasCharacter']:
                current[fact['depth']] = fact
            elif fact['depth'] is not None and fact['depth'] in current:
                # Preserve the update record while retaining the prior object.
                current[fact['depth']] = dict(current[fact['depth']], update=fact)
        elif child_code == 28:
            depth = struct.unpack_from('<H', child, 0)[0] if len(child) >= 2 else None
            current.pop(depth, None)
        elif child_code == 1:
            frames.append([current[d] for d in sorted(current)])
    return dict(frameCount=frame_count, observedShowFrames=len(frames),
                frames=frames, unresolvedFrameTagCount=max(0, frame_count - len(frames)))


def direct_sprite_refs(defs, cid):
    item = defs[cid]
    if item['tag']['code'] != 39:
        return []
    refs = []
    for code, body in iter_tags(item['tag']['body'], 4):
        if code in (26, 70):
            fact = placement_fact(code, body, 'closure-scan')
            if fact['characterId'] is not None:
                refs.append(fact['characterId'])
    return refs


def closure(defs):
    used = set(TARGETS.values())
    pending = list(used)
    unresolved = []
    while pending:
        cid = pending.pop()
        if cid not in defs:
            unresolved.append(cid)
            continue
        for ref in direct_sprite_refs(defs, cid):
            if ref not in used:
                used.add(ref)
                pending.append(ref)
    return used, sorted(set(unresolved))


def write_subset(tags, defs, used):
    # The closure is ordered as in the original SWF. Keep header metadata and
    # the exact definition bodies; SymbolClass is intentionally retained too.
    chunks = []
    for tag in tags:
        if tag['code'] in (8, 69, 76) or (tag['code'] in (2, 6, 20, 21, 22, 32, 35, 36, 39, 83, 90)
                                      and struct.unpack_from('<H', tag['body'])[0] in used):
            body = tag['body']
            n = len(body)
            header = struct.pack('<H', tag['code'] << 6 | (63 if n >= 63 else n))
            chunks.append(header + (struct.pack('<I', n) if n >= 63 else b'') + body)
    # A minimal 940x590 RECT, 24 fps, one frame. This fixture is source-only.
    rect = b'\x78\x00\x00\x00\x00'  # overwritten below with a valid 0..18800 RECT
    values = [0, 18800, 0, 11800]
    bits = max(abs(v).bit_length() + 1 for v in values)
    bitstr = format(bits, '05b') + ''.join(format(v & ((1 << bits) - 1), f'0{bits}b') for v in values)
    bitstr += '0' * (-len(bitstr) % 8)
    rect = int(bitstr, 2).to_bytes(len(bitstr) // 8, 'big')
    body = rect + struct.pack('<HH', 24 * 256, 1) + b''.join(chunks)
    return b'FWS' + bytes([10]) + struct.pack('<I', 8 + len(body)) + body


def script_audit(symbols, used):
    names = [symbols[cid] for cid in sorted(used) if cid in symbols]
    if not names or not FFDEC.exists():
        return dict(status='unavailable', command=None, records=[], unresolved=[
            'FFDec CLI unavailable or closure contains no SymbolClass entries'])
    dest = LOCAL / 'symbol-scripts'
    command = [str(FFDEC), '-selectclass', ','.join(names), '-export', 'script',
               str(dest), str(SOURCE)]
    try:
        result = subprocess.run(command, capture_output=True, timeout=90)
    except Exception as exc:
        return dict(status='unresolved', command=command, records=[], unresolved=[repr(exc)])
    (LOCAL / 'symbol-scripts.log').write_bytes(result.stdout + result.stderr)
    records, unresolved = [], []
    for cid in sorted(used):
        if cid not in symbols:
            continue
        name = symbols[cid]
        path = dest / 'scripts' / Path(name.replace('.', '/') + '.as')
        record = dict(characterId=cid, symbol=name, path=path.relative_to(ROOT).as_posix(),
                      exists=path.exists())
        if path.exists():
            text = path.read_text(encoding='utf-8', errors='replace')
            record['sha256'] = sha(path)
            record['functionCount'] = len(re.findall(r'\bfunction\b', text))
            record['nontrivial'] = record['functionCount'] > 1 or not re.search(
                r'\bsuper\s*\([^;]*\);', text)
            if record['nontrivial']:
                unresolved.append(dict(characterId=cid, symbol=name,
                                       reason='nontrivial source script in display closure'))
        records.append(record)
    return dict(status='unresolved' if unresolved or result.returncode else 'passed',
                command=command, records=records, unresolved=unresolved,
                returnCode=result.returncode)


def ffdec_xml_facts(subset):
    """Ask the installed FFDec parser for decoded shape/filter/mask facts.

    The raw SWF remains authoritative and is always retained.  XML parsing is
    an additional structured view; failures are reported as unresolved.
    """
    xml_path = LOCAL / 'pet1-closure.xml'
    command = None
    if FFDEC.exists():
        command = [str(FFDEC), '-swf2xml', str(subset), str(xml_path)]
    elif JAVA_FFDEC.exists():
        command = ['java', '-Xmx2g', '-jar', str(JAVA_FFDEC), '-swf2xml',
                   str(subset), str(xml_path)]
    if command is None:
        return dict(status='unavailable', command=None, path=None, definitions={},
                    unresolved=['FFDec CLI/JAR unavailable'])
    try:
        result = subprocess.run(command, capture_output=True, timeout=90)
    except Exception as exc:
        return dict(status='unresolved', command=command, path=None, definitions={},
                    unresolved=[repr(exc)])
    (LOCAL / 'closure-xml.log').write_bytes(result.stdout + result.stderr)
    if result.returncode or not xml_path.exists() or not xml_path.stat().st_size:
        return dict(status='unresolved', command=command,
                    path=xml_path.relative_to(ROOT).as_posix(), definitions={},
                    unresolved=['FFDec swf2xml failed', f'returnCode={result.returncode}'])
    root = ET.parse(xml_path).getroot()
    facts = {}
    for node in root.iter():
        key = node.get('spriteId') or node.get('shapeId') or node.get('characterID')
        if key is None or not key.isdigit() or key in facts:
            continue
        def tree(element):
            # Keep all structural attributes including matrices, filters and
            # clip/mask fields, but omit binary image payload attributes.
            attrs = {k: v for k, v in element.attrib.items()
                     if k not in ('imageData', 'bitmapAlphaData', 'zlibBitmapData')}
            return dict(tag=element.tag, attributes=attrs,
                        children=[tree(child) for child in element],
                        text=(element.text.strip() if element.text and element.text.strip() else None))
        facts[key] = tree(node)
    return dict(status='passed', command=command,
                path=xml_path.relative_to(ROOT).as_posix(), definitions=facts,
                unresolved=[])


def decoded_bitmap_refs(xml_facts):
    refs = set()
    def walk(node):
        for key, value in node.get('attributes', {}).items():
            if key == 'bitmapId' and str(value).isdigit():
                refs.add(int(value))
        for child in node.get('children', []):
            walk(child)
    for node in xml_facts.get('definitions', {}).values():
        walk(node)
    return refs


def main():
    LOCAL.mkdir(parents=True, exist_ok=True)
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    raw, data, tags = swf_tags(SOURCE)
    defs = definitions(tags)
    symbols = symbol_class(tags)
    used, unresolved = closure(defs)
    subset = LOCAL / 'pet1-closure.swf'
    subset.write_bytes(write_subset(tags, defs, used))
    xml_facts = ffdec_xml_facts(subset)
    # Shape fills point at bitmap definitions which are not visible through
    # PlaceObject character references. Add those IDs and regenerate the
    # fixture so its byte closure is renderable and independently inspectable.
    bitmap_refs = decoded_bitmap_refs(xml_facts)
    missing_bitmap_defs = sorted(bitmap_refs - set(defs))
    used.update(bitmap_refs & set(defs))
    if bitmap_refs & set(defs):
        subset.write_bytes(write_subset(tags, defs, used))
        xml_facts = ffdec_xml_facts(subset)
        bitmap_refs.update(decoded_bitmap_refs(xml_facts))
        missing_bitmap_defs = sorted(bitmap_refs - set(defs))
    timelines = {str(cid): timeline_fact(cid, defs[cid]) for cid in sorted(used)
                 if cid in defs and defs[cid]['tag']['code'] == 39}
    summaries = {}
    for cid in sorted(used):
        if cid not in defs:
            continue
        tag = defs[cid]['tag']
        summaries[str(cid)] = dict(tagCode=tag['code'], byteLength=len(tag['body']),
                                   tagBodySha256=hashlib.sha256(tag['body']).hexdigest(),
                                   sourceOrder=defs[cid]['order'],
                                   symbolClass=symbols.get(cid),
                                   timeline=timelines.get(str(cid)),
                                   rawBodyHexPrefix=tag['body'][:32].hex(),
                                   decodedStructure=xml_facts['definitions'].get(str(cid)),
                                   geometryOrBitmapSemantics=('decoded by FFDec XML' if str(cid) in xml_facts['definitions']
                                                              else 'unresolved; raw definition retained'),
                                   filterMaskSemantics=('decoded attributes/children retained where present'
                                                        if str(cid) in xml_facts['definitions']
                                                        else 'unresolved; placement tail bytes retained'))
    scripts = script_audit(symbols, used)
    report = dict(taskId='TASK-SETTINGS-244', status='extracted-not-promoted',
                  sourcePath=SOURCE.relative_to(ROOT).as_posix(), sourceSha256=sha(SOURCE),
                  stageSize={'width': 940, 'height': 590},
                  aliases=TARGETS,
                  symbolClass={str(cid): name for cid, name in symbols.items()
                               if cid in TARGETS.values()},
                  closureCharacterIds=sorted(used), unresolvedCharacterIds=unresolved,
                  bitmapDependencies=sorted(bitmap_refs),
                  missingBitmapDefinitions=missing_bitmap_defs,
                  closurePath=subset.relative_to(ROOT).as_posix(), closureSha256=sha(subset),
                  xmlFacts=dict(status=xml_facts['status'], command=xml_facts['command'],
                                path=xml_facts['path'], unresolved=xml_facts['unresolved'],
                                definitionCount=len(xml_facts['definitions'])),
                  definitions=summaries, scriptAudit=scripts,
                  note='Raw source closure and timeline placement facts only. Runtime frame progression, owner projection, and visual promotion remain unresolved.')
    (EVIDENCE / 'source-definitions.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print('TASK-SETTINGS-244 source:', len(used), 'definitions;',
          len(timelines), 'timelines;', 'script risk:', len(scripts['unresolved']))


if __name__ == '__main__':
    main()
