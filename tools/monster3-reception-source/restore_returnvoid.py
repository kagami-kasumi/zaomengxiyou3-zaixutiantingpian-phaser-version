"""Restore two original AVM2 returnvoid instructions after AS3 compilation.
Only generated fixture SWFs are modified. Original SWF/pcode remain read-only.
"""
import hashlib,json,re,subprocess,xml.etree.ElementTree as ET
from source import ROOT
FFDEC='C:/Program Files (x86)/FFDec/ffdec-cli.exe'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def u30(n):
 result=[]
 while n>127:result.append((n&127)|128);n>>=7
 return bytes(result+[n]).hex()
def command(args,log):
 r=subprocess.run([FFDEC]+list(map(str,args)),capture_output=True,timeout=60)
 log.write_bytes(r.stdout+r.stderr)
 assert r.returncode==0,(log,r.returncode)
def restore(work):
 original=ROOT/'local-resources/regima/legacy-extraction/swfs/[172845].swf'
 folder=work/'original-pcode'
 command(['-selectclass','base.BasePet','-format','script:pcode','-export','script',folder,original],work/'original-pcode.log')
 p=folder/'scripts/base/BasePet.pcode';original_text=p.read_text(encoding='utf-8')
 start=original_text.index('"isBingo"',original_text.index('name "base:BasePet/beMagicAttack"'))
 end=original_text.index('"lastBeAttackedTarget"',start)
 branch=original_text[start:end];assert len(re.findall(r'\breturnvoid\b',branch))==2
 text=(work/'BasePet.as').read_text(encoding='utf-8');start=text.index('if(param1.isBingo)');end=text.index('this.lastBeAttackedTarget',start)
 lines=[text[:m.start()].count('\n')+1 for m in re.finditer(r'return false;',text) if start<m.start()<end]
 assert len(lines)==2,lines
 xml=work/'compiled.xml';command(['-swf2xml',work/'Probe.swf',xml],work/'swf2xml.log')
 tree=ET.parse(xml);patterns=['f0'+u30(n)+'2748' for n in lines]
 candidates=[e for e in tree.iter() if e.get('type')=='MethodBody' and all(p in e.get('codeBytes','') for p in patterns)]
 assert len(candidates)==1
 body=candidates[0];code=body.get('codeBytes');before=code
 for pattern in patterns:
  assert code.count(pattern)==1
  code=code.replace(pattern,pattern[:-4]+'0247') # nop; returnvoid keeps all branch offsets stable.
 body.set('codeBytes',code);patched=work/'patched.xml';tree.write(patched,encoding='utf-8',xml_declaration=True)
 output=work/'Probe-patched.swf';command(['-xml2swf',patched,output],work/'xml2swf.log')
 check=work/'recheck-pcode';command(['-selectclass','BasePet','-format','script:pcode','-export','script',check,output],work/'recheck-pcode.log')
 s=(check/'scripts/BasePet.pcode').read_text(encoding='utf-8');a=s.index('"isBingo"');b=s.index('"lastBeAttackedTarget"',a)
 assert s[a:b].count('returnvoid')==2
 record=dict(originalSwfSha256=sha(original),originalPcodeSha256=sha(p),originalBranch=branch,
  methodBodyIndex=body.get('method_info'),generatedReturnLines=lines,beforeCodeSha256=hashlib.sha256(bytes.fromhex(before)).hexdigest(),
  afterCodeSha256=hashlib.sha256(bytes.fromhex(code)).hexdigest(),patchedSwfSha256=sha(output),
  meaning='Restore source returnvoid; caller Boolean conversion, not assumed false at receiver return.')
 (work/'returnvoid-proof.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
 return output
